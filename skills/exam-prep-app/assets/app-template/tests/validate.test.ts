import { describe, expect, it } from 'vitest'
import { answerCues, checkAnswerCues, compileLegacyNames, validateCardFile, validateContent as validateWith, type ContentBundle, type Issue, type ValidateOptions } from '../src/content/validate.ts'
import type { CardFile, Lesson, Question } from '../src/lib/types.ts'
import { code, multi, single, TEST_LEGACY, TEST_OUTLINE } from './fixtures.ts'
import { findOutdatedModels, modelStatus, type ModelLifecycle } from '../src/content/model-currency.ts'

const t = (s: string) => ({ en: s, de: `${s} (de)` })

/** The validator against the fixed test outline and legacy names, not the app's content. */
const validateContent = (bundle: ContentBundle, opts: ValidateOptions = {}) => validateWith(bundle, { outline: TEST_OUTLINE, legacyNames: TEST_LEGACY, ...opts })
const legacy = compileLegacyNames(TEST_LEGACY)

function bundleWith(questions: Question[], lessons: Lesson[] = []): ContentBundle {
  const byModule = new Map<string, Question[]>()
  for (const q of questions) byModule.set(q.module, [...(byModule.get(q.module) ?? []), q])
  return {
    files: [...byModule.entries()].map(([module, qs]) => ({ file: `${module}.json`, data: { module, questions: qs } })),
    cases: [],
    lessons: lessons.map((lesson) => ({ file: `${lesson.module}.ts`, lesson })),
  }
}

const scoped = (qs: Question[], lessons: Lesson[] = []) => validateContent(bundleWith(qs, lessons), { only: [...new Set([...qs.map((q) => q.module), ...lessons.map((l) => l.module)])], today: '2026-11-06' })

function messages(qs: Question[]) {
  return scoped(qs).errors.map((e) => e.message).join('\n')
}

describe('validator — questions', () => {
  it('accepts a well-formed question of every type', () => {
    expect(scoped([single(), multi(), code()]).errors).toEqual([])
  })

  it('fails when a single-choice question has no correct answer', () => {
    const q = single()
    if (q.type === 'single') q.options = q.options.map((o) => ({ ...o, correct: false }))
    expect(messages([q])).toMatch(/exactly one correct option/)
  })

  it('fails when a multiple-select question has fewer than two correct answers', () => {
    const q = multi()
    if (q.type === 'multi') q.options[1] = { ...q.options[1], correct: false }
    expect(messages([q])).toMatch(/at least two correct/)
  })

  it('fails when an option lacks its explanation', () => {
    const q = single()
    if (q.type === 'single') q.options[2] = { ...q.options[2], why: { en: '', de: '' } }
    expect(messages([q])).toMatch(/option c\.why/)
  })

  it('fails without a learn.microsoft.com source', () => {
    expect(messages([single({ sources: [] })])).toMatch(/at least one learn\.microsoft\.com source/)
    expect(messages([single({ sources: ['https://www.examtopics.com/discussions/x'] })])).toMatch(/learn\.microsoft\.com documentation URL/)
  })

  it('fails on a domain/skill mismatch or unknown mapping', () => {
    expect(messages([single({ domain: 'D3', skill: '2.1.1' })])).toMatch(/belongs to D2, not D3/)
    expect(messages([single({ skill: '9.9.9' })])).toMatch(/unknown skill bullet/)
    expect(messages([single({ module: 'not-a-module' })])).toMatch(/unknown module/)
  })

  it('fails when a code template and its blanks disagree', () => {
    const q = code()
    if (q.type === 'code') q.template = q.template.replace('{{b2}}', '{{b9}}')
    const m = messages([q])
    expect(m).toMatch(/placeholder \{\{b9\}\} has no blank/)
    expect(m).toMatch(/blank b2 missing from template/)
  })

  it('rejects outdated product names unless framed as former names', () => {
    expect(messages([single({ stem: t('Open Azure AI Studio and deploy the model to continue.') })])).toMatch(/outdated name/)
    expect(messages([single({ stem: t('Microsoft Foundry (formerly Azure AI Studio) hosts the deployment here.') })])).not.toMatch(/outdated name/)
    expect(messages([single({ explanation: t('Assign the Azure AI User role to the managed identity.') })])).toMatch(/Foundry User/)
  })

  it('rejects future verification dates and duplicate ids', () => {
    expect(messages([single({ lastVerified: '2099-01-01' })])).toMatch(/in the future/)
    const a = single({ id: 'q-dup' })
    const b = single({ id: 'q-dup' })
    expect(validateContent(bundleWith([a, b]), { today: '2026-11-06' }).errors.map((e) => e.message).join('\n')).toMatch(/duplicate question id/)
  })
})

describe('validator — coverage', () => {
  it('fails when skills-outline bullets or modules have no questions or lessons', () => {
    const report = validateContent(bundleWith([single()]), { today: '2026-11-06' })
    const text = report.errors.map((e) => `${e.where}: ${e.message}`).join('\n')
    expect(text).toMatch(/coverage 1\.1\.1: skills-outline bullet has no questions/)
    expect(text).toMatch(/coverage knowledge-mining: module has no questions/)
    expect(text).toMatch(/coverage knowledge-mining: module has no lesson/)
    expect(report.coverage).toHaveLength(TEST_OUTLINE.domains.flatMap((d) => d.groups.flatMap((g) => g.bullets)).length)
    expect(report.coverage.every((r) => r.modules.length > 0)).toBe(true)
  })

  it('reports a missing outline with a helpful message instead of failing', () => {
    const empty = { domains: [], learningPaths: [], modules: [] }
    const report = validateContent({ files: [], cases: [], lessons: [], cards: [] }, { outline: empty, today: '2026-11-06' })
    const text = report.errors.map((e) => `${e.where}: ${e.message}`).join('\n')
    expect(text).toMatch(/src\/content\/domains\.ts: no domains yet/)
    expect(text).toMatch(/src\/content\/course\.ts: no modules yet/)
    expect(report.coverage).toEqual([])
  })

  it('checks that learning paths and modules agree', () => {
    const broken = {
      ...TEST_OUTLINE,
      learningPaths: [{ ...TEST_OUTLINE.learningPaths[0], modules: [...TEST_OUTLINE.learningPaths[0].modules, 'ghost'] }, TEST_OUTLINE.learningPaths[1]],
      modules: [...TEST_OUTLINE.modules, { ...TEST_OUTLINE.modules[0], id: 'orphan' }],
    }
    const text = validateContent(bundleWith([]), { outline: broken, today: '2026-11-06' })
      .errors.map((e) => `${e.where}: ${e.message}`)
      .join('\n')
    expect(text).toMatch(/learning path p1: lists unknown module "ghost"/)
    expect(text).toMatch(/course orphan: module is in no learning path/)
  })

  it('skips global coverage when scoped to modules', () => {
    expect(scoped([single()]).errors).toEqual([])
  })
})

describe('validator — lessons and diagrams', () => {
  const lesson = (): Lesson => ({
    module: 'foundry-chat-app',
    summary: t('A long enough summary that explains what this module is about for learners.'),
    examFocus: t('How the exam asks about this topic in practice.'),
    diagrams: [
      {
        id: 'd1',
        title: t('Diagram'),
        width: 960,
        height: 300,
        nodes: [
          { id: 'a', x: 20, y: 20, w: 160, h: 60, label: 'App', tone: 'app' },
          { id: 'b', x: 300, y: 20, w: 160, h: 60, label: 'Model', tone: 'model' },
        ],
        edges: [{ id: 'e', from: 'a', to: 'b' }],
        steps: [
          { title: t('One'), text: t('The app calls the model directly.'), focus: ['a', 'e'] },
          { title: t('Two'), text: t('The model answers the app call.'), focus: ['b'] },
        ],
      },
    ],
    concepts: [1, 2, 3].map((i) => ({ term: `Term ${i}`, text: t('An explanation that is long enough to be useful.') })),
    code: [{ title: t('Code'), code: 'print("hi")', notes: [] }],
    traps: [t('A trap that is worth knowing.'), t('Another trap that is worth knowing.')],
    takeaways: [t('Takeaway number one.'), t('Takeaway number two.'), t('Takeaway number three.')],
    sources: [{ title: 'Doc', url: 'https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry' }],
  })

  it('accepts a complete lesson', () => {
    expect(validateContent(bundleWith([], [lesson()]), { only: ['foundry-chat-app'], today: '2026-11-06' }).errors).toEqual([])
  })

  it('catches overlapping nodes, unknown step focus and labels that overflow', () => {
    const l = lesson()
    l.diagrams[0].nodes[1] = { ...l.diagrams[0].nodes[1], x: 100 }
    l.diagrams[0].steps[1].focus = ['ghost']
    l.diagrams[0].nodes[0] = { ...l.diagrams[0].nodes[0], label: 'A label that is far too long for this node' }
    const text = validateContent(bundleWith([], [l]), { only: ['foundry-chat-app'], today: '2026-11-06' })
      .errors.map((e) => e.message)
      .join('\n')
    expect(text).toMatch(/overlap/)
    expect(text).toMatch(/unknown id "ghost"/)
    expect(text).toMatch(/label line "A label that is far too long for this node" needs \d+px but only \d+px fit/)
  })

  it('accepts nodes without an icon and rejects icons that are not registered', () => {
    const l = lesson()
    const b = l.diagrams[0].nodes[1]
    l.diagrams[0].nodes[1] = { ...b, icon: 'logo' as unknown as typeof b.icon }
    const text = validateContent(bundleWith([], [l]), { only: ['foundry-chat-app'], today: '2026-11-06' })
      .errors.map((e) => e.message)
      .join('\n')
    expect(text).not.toMatch(/node a/)
    expect(text).toMatch(/node b: icon "logo" is not registered in src\/content\/diagram-icons\.ts/)
  })

  it('flags arrows that run through another node', () => {
    const l = lesson()
    const d = l.diagrams[0]
    d.nodes.push({ id: 'c', x: 600, y: 20, w: 160, h: 60, label: 'Store', tone: 'data' })
    d.nodes.push({ id: 'mid', x: 380, y: 25, w: 120, h: 50, label: 'Middle', tone: 'tool' })
    d.nodes[1] = { ...d.nodes[1], x: 210 }
    d.edges.push({ id: 'long', from: 'a', to: 'c' })
    const report = validateContent(bundleWith([], [l]), { only: ['foundry-chat-app'], today: '2026-11-06' })
    expect(report.errors.map((e) => e.message).join('\n')).toMatch(/edge long \(a → c\) runs through node/)
  })

  it('reports a label that has no free spot on or beside its arrow', () => {
    const l = lesson()
    const d = l.diagrams[0]
    d.width = 700
    d.height = 300
    d.nodes = [
      { id: 'a', x: 20, y: 120, w: 200, h: 60, label: t('Alpha'), tone: 'app' },
      { id: 'b', x: 260, y: 120, w: 200, h: 60, label: t('Beta'), tone: 'model' },
      { id: 'top', x: 150, y: 40, w: 180, h: 74, label: t('Top'), tone: 'data' },
      { id: 'bottom', x: 150, y: 186, w: 180, h: 74, label: t('Bottom'), tone: 'data' },
    ]
    d.groups = []
    d.edges = [{ id: 'ab', from: 'a', to: 'b', label: t('a label that is far too long') }]
    d.steps = [
      { title: t('One'), text: t('The first step of the flow.'), focus: ['a'] },
      { title: t('Two'), text: t('The second step of the flow.'), focus: ['b'] },
    ]
    const text = validateContent(bundleWith([], [l]), { only: ['foundry-chat-app'], today: '2026-11-06' })
      .errors.map((e) => e.message)
      .join('\n')
    expect(text).toMatch(/label "a label that is far too long.*" of edge ab \(a → b\) has no free spot/)
  })
})

describe('validator — Zettelkasten cards', () => {
  const cardLesson = (): Lesson => ({
    module: 'a2a',
    summary: t('A long enough summary that explains what this module is about for learners.'),
    examFocus: t('How the exam asks about this topic in practice.'),
    diagrams: [],
    concepts: [1, 2].map((i) => ({ term: `Term ${i}`, text: t(`Concept ${i} explained in enough words to be useful.`) })),
    code: [],
    traps: [t('A trap that is worth knowing.')],
    takeaways: [t('A takeaway worth keeping.')],
    sources: [],
  })
  const q = (s: string) => ({ en: `${s}?`, de: `${s} (de)?` })
  const mc = (topic: string) =>
    ['a', 'b', 'c', 'd'].map((id, i) => ({
      id,
      text: t(`${topic} option ${id}`),
      correct: i === 0,
      why: t(i === 0 ? `This is what the lesson says about ${topic}.` : `Not what the lesson says about ${topic}.`),
    }))
  const goodCards = (): CardFile => ({
    module: 'a2a',
    cards: [
      { id: 'z-a2a-concept-1', source: { kind: 'concept', index: 0 }, front: q('What is term one'), choices: mc('term one') },
      { id: 'z-a2a-concept-2', source: { kind: 'concept', index: 1 }, front: q('What is term two'), choices: mc('term two') },
      { id: 'z-a2a-trap-1', source: { kind: 'trap', index: 0 }, front: q('Which trap matters'), back: t('The trap that is worth knowing.'), choices: mc('the trap') },
      { id: 'z-a2a-takeaway-1', source: { kind: 'takeaway', index: 0 }, front: q('What do you keep'), back: t('The takeaway worth keeping.'), choices: mc('the takeaway') },
    ],
  })
  const cardErrors = (data: CardFile, lesson = cardLesson()) => {
    const issues: Issue[] = []
    validateCardFile(data, lesson, issues, 'src/content/cards/a2a.json', { legacy })
    return issues.filter((i) => i.level === 'error').map((i) => i.message).join('\n')
  }

  it('accepts one question card per concept, trap and takeaway', () => {
    expect(cardErrors(goodCards())).toBe('')
  })

  it('reports lesson items without a card and cards without a lesson item', () => {
    const data = goodCards()
    data.cards = data.cards.filter((c) => c.id !== 'z-a2a-trap-1')
    data.cards.push({ id: 'z-a2a-takeaway-9', source: { kind: 'takeaway', index: 8 }, front: q('Where is this from'), back: t('Nowhere at all, really.'), choices: mc('nowhere') })
    const text = cardErrors(data)
    expect(text).toMatch(/trap 1 \("A trap that is worth knowing\.…"\) has no card/)
    expect(text).toMatch(/source takeaway 8 does not exist/)
  })

  it('requires questions on the front, answers on trap and takeaway backs, and matching ids', () => {
    const data = goodCards()
    data.cards[0] = { ...data.cards[0], id: 'z-a2a-concept-7', front: t('A statement, not a question') }
    data.cards[2] = { ...data.cards[2], back: undefined }
    const text = cardErrors(data)
    expect(text).toMatch(/id should be "z-a2a-concept-1"/)
    expect(text).toMatch(/front\.en must be a question ending with "\?"/)
    expect(text).toMatch(/back: missing localized text/)
  })

  it('rejects answers that point at the lesson page', () => {
    const lesson = cardLesson()
    lesson.concepts[1].text = t('Levels differ per model (see the table) and per API version.')
    expect(cardErrors(goodCards(), lesson)).toMatch(/points at the lesson page \("see the table"\)/)
    const fixed = goodCards()
    fixed.cards[1] = { ...fixed.cards[1], back: t('Levels differ per model and per API version.') }
    expect(cardErrors(fixed, lesson)).toBe('')
  })

  it('requires four exam-style options with exactly one correct and a reason for each', () => {
    const data = goodCards()
    data.cards[0] = { ...data.cards[0], choices: undefined as never }
    data.cards[1] = { ...data.cards[1], choices: data.cards[1].choices.map((o) => ({ ...o, correct: true })) }
    data.cards[2] = { ...data.cards[2], choices: data.cards[2].choices.slice(0, 3) }
    const c3 = data.cards[3].choices
    data.cards[3] = { ...data.cards[3], choices: [c3[0], { ...c3[1], text: c3[2].text }, c3[2], { ...c3[3], text: t('All of the above'), why: t('x') }] }
    const text = cardErrors(data)
    expect(text).toMatch(/z-a2a-concept-1|needs four multiple-choice options/)
    expect(text).toMatch(/needs exactly one correct option \(has 4\)/)
    expect(text).toMatch(/needs exactly four options \(has 3\)/)
    expect(text).toMatch(/two options have the same en text/)
    expect(text).toMatch(/no "all\/none of the above" options/)
    expect(text).toMatch(/option d why\.en: missing or too short/)
  })

  it('rejects a status tag that only the correct option carries', () => {
    const data = goodCards()
    data.cards[0].choices[0] = { ...data.cards[0].choices[0], text: t('term one option a (preview)') }
    expect(cardErrors(data)).toMatch(/only the correct option carries a status tag/)
    data.cards[0].choices[1] = { ...data.cards[0].choices[1], text: t('term one option b (preview)') }
    expect(cardErrors(data)).toBe('')
  })

  it('rejects a key that is the only option without an absolute word', () => {
    const data = goodCards()
    data.cards[0].choices = data.cards[0].choices.map((o) => (o.correct ? o : { ...o, text: { en: `${o.text.en} only`, de: `${o.text.de} nur` } }))
    expect(cardErrors(data)).toMatch(/only one \(en\) without "only", "always" or "never"[\s\S]*only one \(de\)/)
    data.cards[0].choices[1] = { ...data.cards[0].choices[1], text: t('term one option b') }
    expect(cardErrors(data)).toBe('')
  })

  it('warns when the correct option gives itself away by length', () => {
    const data = goodCards()
    data.cards[0].choices[0] = { ...data.cards[0].choices[0], text: t('A very long and detailed correct answer that explains everything the question asks about at length') }
    const issues: Issue[] = []
    validateCardFile(data, cardLesson(), issues, 'src/content/cards/a2a.json')
    expect(issues.filter((i) => i.level === 'warning').map((i) => i.message).join('\n')).toMatch(/gives the answer away/)
  })

  it('measures deck-wide answer cues and fails when length or the majority vote gives keys away', () => {
    const option = (id: string, en: string, correct = false) => ({ id, text: t(en), correct, why: t('A reason that is long enough.') })
    const longKey = [option('a', 'The right answer with a few extra words', true), option('b', 'A wrong answer'), option('c', 'Another one'), option('d', 'A third one')]
    const centralKey = [
      option('a', 'Use managed identity with the reader role', true),
      option('b', 'Use managed identity with the owner role only'),
      option('c', 'Use an API key with the reader role'),
      option('d', 'Rotate the certificate every quarter'),
    ]
    const balanced = [
      option('a', 'Use managed identity with the reader role', true),
      option('b', 'Use an API key with the owner role and rotate it'),
      option('c', 'Use managed identity with the owner role at subscription scope'),
      option('d', 'Use an API key with the reader role on every index'),
    ]
    const cues = answerCues([longKey, longKey, centralKey, balanced])
    expect(cues.cards).toBe(4)
    expect(cues.lengthRanks).toEqual([0.5, 0.25, 0, 0.25])
    expect(cues.centralCards).toBe(1)
    expect(cues.centralKey).toBe(1)
    const issues: Issue[] = []
    checkAnswerCues(issues, cues)
    expect(issues.map((i) => i.message).join('\n')).toMatch(/longest in 50 % of cards[\s\S]*two longest in 75 %[\s\S]*one central option/)
    const fine: Issue[] = []
    checkAnswerCues(fine, answerCues([balanced, balanced, balanced, longKey]))
    expect(fine).toEqual([])
  })

  it('flags outdated product names on cards', () => {
    const data = goodCards()
    data.cards[2] = { ...data.cards[2], back: t('Use Azure AI Studio to deploy the model.') }
    expect(cardErrors(data)).toMatch(/outdated name/)
  })
})

describe('model currency', () => {
  const lifecycle: ModelLifecycle = {
    source: 'test',
    retrieved: '2026-11-06',
    overrides: { 'video-x': { status: 'available', note: 'docs still list it' } },
    models: {
      'gpt-old': [{ version: '1', lifecycle: 'GA', retirement: '2026-10-15', replacement: '—' }],
      'gpt-dep': [{ version: '1', lifecycle: 'Deprecated', retirement: '2027-04-14', replacement: 'gpt-new' }],
      'gpt-new': [{ version: '1', lifecycle: 'GA', retirement: '2027-07-13', replacement: '—' }],
      'video-x': [{ version: '1', lifecycle: 'Preview', retirement: '2026-10-15', replacement: '—' }],
    },
  }

  it('classifies models relative to today', () => {
    expect(modelStatus('gpt-old', lifecycle, '2026-11-06')).toBe('retired')
    expect(modelStatus('gpt-old', lifecycle, '2026-10-01')).toBe('available')
    expect(modelStatus('gpt-dep', lifecycle, '2026-11-06')).toBe('deprecated')
    expect(modelStatus('gpt-new', lifecycle, '2026-11-06')).toBe('available')
    expect(modelStatus('video-x', lifecycle, '2026-11-06')).toBe('available')
  })

  it('flags outdated models unless the text frames them as outdated', () => {
    const found = findOutdatedModels('Deploy `gpt-dep` and call model="gpt-old" for transcription.', lifecycle, '2026-11-06')
    expect(found.map((f) => f.model).sort()).toEqual(['gpt-dep', 'gpt-old'])
    expect(findOutdatedModels('gpt-dep is deprecated; move to gpt-new.', lifecycle, '2026-11-06')).toEqual([])
    expect(findOutdatedModels('Use gpt-new or gpt-dep-mini.', lifecycle, '2026-11-06')).toEqual([])
  })
})
