import type { CaseStudy, ChoiceOption, CourseModule, Domain, LegacyName, Question } from '../src/lib/types.ts'
import type { Outline } from '../src/content/outline.ts'

const t = (s: string) => ({ en: s, de: s })
const why = t('Because the docs say so.')

export function opt(id: string, correct: boolean): ChoiceOption {
  return { id, text: t(`Option ${id}`), correct, why }
}

let n = 0
export function single(overrides: Partial<Question> = {}): Question {
  n++
  return {
    id: `q-test-single-${n}`,
    type: 'single',
    domain: 'D2',
    skill: '2.1.1',
    module: 'foundry-chat-app',
    difficulty: 2,
    stem: t('Which option is right for this scenario?'),
    explanation: t('Option a is right because of the rule.'),
    sources: ['https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry'],
    lastVerified: '2026-11-06',
    options: [opt('a', true), opt('b', false), opt('c', false), opt('d', false)],
    ...overrides,
  } as Question
}

export function multi(): Question {
  n++
  return {
    id: `q-test-multi-${n}`,
    type: 'multi',
    domain: 'D1',
    skill: '1.3.4',
    module: 'plan-prepare',
    difficulty: 2,
    stem: t('Which TWO options apply in this scenario?'),
    explanation: t('Options a and b apply in this scenario.'),
    sources: ['https://learn.microsoft.com/en-us/azure/foundry/what-is-foundry'],
    lastVerified: '2026-11-06',
    options: [opt('a', true), opt('b', true), opt('c', false), opt('d', false)],
  }
}

export function order(): Question {
  n++
  return {
    id: `q-test-order-${n}`,
    type: 'order',
    domain: 'D5',
    skill: '5.1.1',
    module: 'knowledge-mining',
    difficulty: 1,
    stem: t('Put the indexing steps in the right order.'),
    explanation: t('Data source, indexer, skillset, index.'),
    sources: ['https://learn.microsoft.com/en-us/azure/search/search-indexer-overview'],
    lastVerified: '2026-11-06',
    items: ['s1', 's2', 's3'].map((id) => ({ id, text: t(`Step ${id}`), why })),
  }
}

export function match(): Question {
  n++
  return {
    id: `q-test-match-${n}`,
    type: 'match',
    domain: 'D4',
    skill: '4.1.3',
    module: 'translation',
    difficulty: 2,
    stem: t('Match each requirement to the right service.'),
    explanation: t('Each requirement maps to one service.'),
    sources: ['https://learn.microsoft.com/en-us/azure/ai-services/translator/overview'],
    lastVerified: '2026-11-06',
    prompts: [
      { id: 'p1', prompt: t('Requirement 1'), answer: 't1', why },
      { id: 'p2', prompt: t('Requirement 2'), answer: 't2', why },
      { id: 'p3', prompt: t('Requirement 3'), answer: 't1', why },
    ],
    targets: [
      { id: 't1', text: t('Target 1') },
      { id: 't2', text: t('Target 2') },
      { id: 't3', text: t('Target 3') },
    ],
  }
}

export function code(): Question {
  n++
  return {
    id: `q-test-code-${n}`,
    type: 'code',
    domain: 'D2',
    skill: '2.1.5',
    module: 'foundry-chat-app',
    difficulty: 2,
    stem: t('Complete the code so that it works.'),
    explanation: t('get_openai_client returns the chat client.'),
    sources: ['https://learn.microsoft.com/en-us/azure/foundry/quickstarts/get-started-code'],
    lastVerified: '2026-11-06',
    template: 'client = project.{{b1}}()\nr = client.responses.create(model="m", input="x")\nprint(r.{{b2}})',
    blanks: [
      {
        id: 'b1',
        options: [
          { id: 'a', code: 'get_openai_client', correct: true, why },
          { id: 'b', code: 'get_chat_client', correct: false, why },
          { id: 'c', code: 'connect', correct: false, why },
        ],
      },
      {
        id: 'b2',
        options: [
          { id: 'a', code: 'output_text', correct: true, why },
          { id: 'b', code: 'text', correct: false, why },
          { id: 'c', code: 'usage', correct: false, why },
        ],
      },
    ],
  }
}

export function testCase(id = 'case-test'): CaseStudy {
  return { id, title: t('Test case'), scenario: t('x'.repeat(220)), modules: ['foundry-chat-app'] }
}

/** A bank with `perDomain` questions in every domain spread over several bullets. */
export function bank(perDomain: number): Question[] {
  const bullets: Record<string, string[]> = {
    D1: ['1.1.1', '1.2.2', '1.3.4', '1.4.1'],
    D2: ['2.1.1', '2.2.4', '2.3.1'],
    D3: ['3.1.1', '3.2.1'],
    D4: ['4.1.1', '4.2.1'],
    D5: ['5.1.2', '5.2.1'],
  }
  const out: Question[] = []
  for (const [domain, skills] of Object.entries(bullets)) {
    for (let i = 0; i < perDomain; i++) {
      out.push(single({ id: `q-bank-${domain.toLowerCase()}-${i}`, domain: domain as Question['domain'], skill: skills[i % skills.length] }))
    }
  }
  return out
}

/* ---------- A fixed outline, so engine tests don't depend on the app's content ---------- */

const bullet = (id: string) => ({ id, en: `Skill ${id} as worded in the study guide`, de: `Skill ${id} auf Deutsch` })
const group = (id: string, bullets: string[]) => ({ id, title: { en: `Group ${id}`, de: `Gruppe ${id}` }, bullets: bullets.map(bullet) })
const domain = (id: string, weight: [number, number], groups: ReturnType<typeof group>[]): Domain => ({
  id,
  title: { en: `Domain ${id}`, de: `Domäne ${id}` },
  short: { en: `Short ${id}`, de: `Kurz ${id}` },
  weight,
  icon: 'cloud',
  groups,
})

/** Five domains weighted like a typical associate exam. */
export const TEST_DOMAINS: Domain[] = [
  domain('D1', [25, 30], [group('1.1', ['1.1.1']), group('1.2', ['1.2.2']), group('1.3', ['1.3.4']), group('1.4', ['1.4.1'])]),
  domain('D2', [30, 35], [group('2.1', ['2.1.1', '2.1.5', '2.1.6']), group('2.2', ['2.2.1', '2.2.4']), group('2.3', ['2.3.1'])]),
  domain('D3', [10, 15], [group('3.1', ['3.1.1']), group('3.2', ['3.2.1'])]),
  domain('D4', [10, 15], [group('4.1', ['4.1.1', '4.1.3']), group('4.2', ['4.2.1'])]),
  domain('D5', [10, 15], [group('5.1', ['5.1.1', '5.1.2']), group('5.2', ['5.2.1'])]),
]

const mod = (id: string, pathId: string, skills: string[]): CourseModule => ({
  id,
  uid: `learn.test.${id}`,
  title: `Module ${id}`,
  url: `https://learn.microsoft.com/en-us/training/modules/${id}/`,
  minutes: 45,
  pathId,
  units: ['Introduction', 'Summary'],
  skills,
})

export const TEST_OUTLINE: Outline = {
  domains: TEST_DOMAINS,
  learningPaths: [
    { id: 'p1', uid: 'learn.test.p1', title: 'Path one', url: 'https://learn.microsoft.com/en-us/training/paths/p1/', modules: ['plan-prepare', 'foundry-chat-app'] },
    { id: 'p2', uid: 'learn.test.p2', title: 'Path two', url: 'https://learn.microsoft.com/en-us/training/paths/p2/', modules: ['knowledge-mining', 'translation', 'a2a'] },
  ],
  modules: [
    mod('plan-prepare', 'p1', ['1.1.1', '1.2.2', '1.3.4', '1.4.1']),
    mod('foundry-chat-app', 'p1', ['2.1.1', '2.1.5', '2.1.6', '2.2.4', '2.3.1']),
    mod('knowledge-mining', 'p2', ['3.1.1', '3.2.1', '5.1.1', '5.1.2', '5.2.1']),
    mod('translation', 'p2', ['4.1.1', '4.1.3', '4.2.1']),
    mod('a2a', 'p2', ['2.2.1']),
  ],
}

/** Renamed products the validator tests use, independent of exam.json. */
export const TEST_LEGACY: LegacyName[] = [
  { pattern: '\\bAzure AI Studio\\b', current: 'Microsoft Foundry' },
  { pattern: '\\bAzure AI (?:User|Owner)\\b', current: 'Foundry User / Foundry Owner' },
]
