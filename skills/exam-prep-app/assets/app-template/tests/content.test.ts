import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { Ajv2020 } from 'ajv/dist/2020.js'
import type { CaseFile, QuestionFile } from '../src/lib/types.ts'
import { validateContent } from '../src/content/validate.ts'
import { cases, lessons, questions } from '../src/content/index.ts'
import { domains, modules } from '../src/content/outline.ts'
import { hasSourceTitle, sourceLabel } from '../src/content/sources.ts'
import { exam } from '../src/config.ts'
import questionSchema from '../src/content/schema/question-file.schema.json'
import caseSchema from '../src/content/schema/case-file.schema.json'
import examSchema from '../src/content/schema/exam.schema.json'
import modelLifecycle from '../src/content/model-lifecycle.json'
import type { ModelLifecycle } from '../src/content/model-currency.ts'

const dir = join(process.cwd(), 'src', 'content')
const jsonFiles = <T>(sub: string) =>
  (existsSync(join(dir, sub)) ? readdirSync(join(dir, sub)) : [])
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ file: f, data: JSON.parse(readFileSync(join(dir, sub, f), 'utf8')) as T }))
const questionFiles = jsonFiles<QuestionFile>('questions')
const caseFiles = jsonFiles<CaseFile>('cases')
const { targets } = exam
/** Failure message that lists what is open, so an unfinished app explains itself. */
const listed = (items: string[], limit = 15) =>
  `\n${items.slice(0, limit).join('\n')}${items.length > limit ? `\n… and ${items.length - limit} more (npm run validate lists all)` : ''}\n`

describe('exam.json', () => {
  it('conforms to its schema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false })
    const check = ajv.compile(examSchema)
    expect(check(exam) ? '' : ajv.errorsText(check.errors)).toBe('')
  })
})

describe('real content', () => {
  it('conforms to the JSON schemas', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false })
    const checkQ = ajv.compile(questionSchema)
    const checkC = ajv.compile(caseSchema)
    const problems: string[] = []
    for (const { file, data } of questionFiles) if (!checkQ(data)) problems.push(`${file}: ${ajv.errorsText(checkQ.errors)}`)
    for (const { file, data } of caseFiles) if (!checkC(data)) problems.push(`${file}: ${ajv.errorsText(checkC.errors)}`)
    expect(problems, listed(problems)).toEqual([])
  })

  it('passes the content validator including full coverage', () => {
    const report = validateContent(
      {
        files: questionFiles,
        cases: caseFiles.flatMap((c) => c.data.cases),
        lessons: lessons.map((lesson) => ({ file: `${lesson.module}.ts`, lesson })),
      },
      { modelLifecycle: modelLifecycle as ModelLifecycle },
    )
    const errors = report.errors.map((e) => `${e.where}: ${e.message}`)
    expect(errors, listed(errors)).toEqual([])
  })

  it(`has at least targets.minQuestions (${targets.minQuestions}) original questions, weighted like the exam`, () => {
    expect(questions.length, 'questions in src/content/questions').toBeGreaterThanOrEqual(targets.minQuestions)
    const share = (d: string) => (questions.filter((q) => q.domain === d).length / Math.max(1, questions.length)) * 100
    for (const d of domains) expect(share(d.id), `${d.id} share of the bank`).toBeGreaterThanOrEqual(d.weight[0] - targets.domainShareTolerance)
  })

  it('mixes all question types and includes case studies', () => {
    const types = new Set(questions.map((q) => q.type))
    expect([...types].sort(), 'question types in the bank').toEqual(['code', 'match', 'multi', 'order', 'single'])
    expect(cases.length, 'case studies in src/content/cases').toBeGreaterThanOrEqual(targets.minCases)
  })

  it('loads one lesson per module through the app loader', () => {
    expect(lessons.map((l) => l.module).sort(), 'lessons in src/content/lessons, one per module of course.ts').toEqual(modules.map((m) => m.id).sort())
  })

  it('has a title for every cited question source', () => {
    const missing = questions.flatMap((q) => q.sources).filter((u) => !hasSourceTitle(u))
    expect(missing, `cited sources without a title in source-titles.json (npm run sources:titles):${listed(missing)}`).toEqual([])
  })
})

describe('source labels', () => {
  const titles = { 'https://learn.microsoft.com/en-us/agent-framework/concepts/session': 'Session', 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview': 'About Azure Key Vault' }
  const docsets = [
    { prefix: '/agent-framework/', label: 'Agent Framework' },
    { prefix: '/azure/key-vault/', label: 'Key Vault' },
  ]

  it('uses the fetched page title with its doc set', () => {
    expect(sourceLabel('https://learn.microsoft.com/en-us/agent-framework/concepts/session', { titles, docsets })).toBe('Agent Framework: Session')
    expect(sourceLabel('https://learn.microsoft.com/en-us/azure/key-vault/general/overview#intro', { titles, docsets })).toBe('About Azure Key Vault')
  })

  it('falls back to the URL slug and the Learn label for unknown pages', () => {
    expect(sourceLabel('https://learn.microsoft.com/en-us/azure/key-vault/some-new-page', { titles, docsets })).toBe('Key Vault: some new page')
    expect(sourceLabel('https://learn.microsoft.com/en-us/azure/storage/blobs/overview', { titles, docsets })).toBe('Learn: overview')
  })
})
