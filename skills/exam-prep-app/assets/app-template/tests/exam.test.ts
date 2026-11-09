import { describe, expect, it } from 'vitest'
import { buildExam, domainQuotas, EXAM_DEFAULTS, examQuotas, formatClock, summarizeExam, type BuildExamOptions } from '../src/lib/exam.ts'
import type { Question } from '../src/lib/types.ts'
import { exam } from '../src/config.ts'
import { bank, single, testCase, TEST_DOMAINS } from './fixtures.ts'

const DOMAIN_IDS = TEST_DOMAINS.map((d) => d.id)
const quotas = (total: number) => domainQuotas(total, TEST_DOMAINS)
const build = (questions: Question[], cases: Parameters<typeof buildExam>[1], options: BuildExamOptions = {}) => buildExam(questions, cases, { domains: TEST_DOMAINS, ...options })

describe('domainQuotas', () => {
  it('always sums to the requested total', () => {
    for (const total of [1, 10, 25, 40, 50, 60, 97]) {
      const q = quotas(total)
      expect(Object.values(q).reduce((a, b) => a + b, 0)).toBe(total)
    }
  })

  it('weights a 50-question exam by the midpoints of the official ranges', () => {
    expect(quotas(50)).toEqual({ D1: 14, D2: 17, D3: 7, D4: 6, D5: 6 })
  })

  it('works for any number of domains', () => {
    expect(domainQuotas(20, [{ id: 'D1', weight: [30, 40] }, { id: 'D2', weight: [60, 70] }])).toEqual({ D1: 7, D2: 13 })
    expect(domainQuotas(10, [{ id: 'D1', weight: [0, 0] }, { id: 'D2', weight: [0, 0] }])).toEqual({ D1: 5, D2: 5 })
    expect(domainQuotas(10, [])).toEqual({})
  })

  it('keeps every domain inside its official range (±1 question of rounding)', () => {
    const total = 60
    const q = quotas(total)
    const ranges: Record<string, [number, number]> = { D1: [25, 30], D2: [30, 35], D3: [10, 15], D4: [10, 15], D5: [10, 15] }
    for (const d of DOMAIN_IDS) {
      const pct = (q[d] / total) * 100
      expect(pct).toBeGreaterThanOrEqual(ranges[d][0] - 100 / total)
      expect(pct).toBeLessThanOrEqual(ranges[d][1] + 100 / total)
    }
  })
})

describe('examQuotas', () => {
  it('skips domains without questions and gives the rest to the others by weight', () => {
    const q = examQuotas(bank(30).filter((x) => x.domain !== 'D3'), 50, TEST_DOMAINS)
    expect(q.D3).toBe(0)
    expect(Object.values(q).reduce((a, b) => a + b, 0)).toBe(50)
  })

  it('takes all questions of a short domain and never more than the bank holds', () => {
    const lopsided = [...bank(30).filter((x) => x.domain !== 'D1'), single({ id: 'q-only-d1', domain: 'D1', skill: '1.1.1' })]
    const q = examQuotas(lopsided, 50, TEST_DOMAINS)
    expect(q.D1).toBe(1)
    expect(Object.values(q).reduce((a, b) => a + b, 0)).toBe(50)
    expect(Object.values(examQuotas(bank(1), 50, TEST_DOMAINS)).reduce((a, b) => a + b, 0)).toBe(5)
    expect(examQuotas([], 50, TEST_DOMAINS)).toEqual({ D1: 0, D2: 0, D3: 0, D4: 0, D5: 0 })
  })
})

describe('buildExam', () => {
  const questions = bank(30)

  it('builds an exam of the requested size without duplicates', () => {
    const plan = build(questions, [], { total: 50, seed: 1 })
    const all = [...plan.questionIds, ...plan.caseQuestionIds]
    expect(all).toHaveLength(50)
    expect(new Set(all).size).toBe(50)
  })

  it('matches the domain quotas when the bank is large enough', () => {
    const plan = build(questions, [], { total: 50, seed: 7 })
    const byId = new Map(questions.map((q) => [q.id, q]))
    const counts = Object.fromEntries(DOMAIN_IDS.map((d) => [d, 0]))
    for (const id of plan.questionIds) counts[byId.get(id)!.domain]++
    expect(counts).toEqual(quotas(50))
  })

  it('is deterministic for a given seed and varies across seeds', () => {
    const a = build(questions, [], { total: 30, seed: 42 })
    const b = build(questions, [], { total: 30, seed: 42 })
    const c = build(questions, [], { total: 30, seed: 43 })
    expect(a.questionIds).toEqual(b.questionIds)
    expect(a.questionIds).not.toEqual(c.questionIds)
  })

  it('spreads picks across skills-outline bullets', () => {
    const plan = build(questions, [], { total: 50, seed: 3 })
    const byId = new Map(questions.map((q) => [q.id, q]))
    const d1Bullets = new Set(plan.questionIds.map((id) => byId.get(id)!).filter((q) => q.domain === 'D1').map((q) => q.skill))
    expect(d1Bullets.size).toBe(4)
  })

  it('appends one case study as its own section and counts it toward the domain quotas', () => {
    const c = testCase('case-x')
    const caseQs: Question[] = [1, 2, 3, 4].map((i) => single({ id: `q-case-x-${i}`, caseId: 'case-x', domain: 'D2', skill: '2.2.1' }))
    const plan = build([...questions, ...caseQs], [c], { total: 50, seed: 5 })
    expect(plan.caseId).toBe('case-x')
    expect(plan.caseQuestionIds.length).toBeGreaterThanOrEqual(3)
    expect(plan.questionIds.length + plan.caseQuestionIds.length).toBe(50)
    for (const id of plan.caseQuestionIds) expect(plan.questionIds).not.toContain(id)
    const byId = new Map([...questions, ...caseQs].map((q) => [q.id, q]))
    const d2 = [...plan.questionIds, ...plan.caseQuestionIds].filter((id) => byId.get(id)!.domain === 'D2').length
    expect(d2).toBe(quotas(50).D2)
  })

  it('ignores case studies with fewer than three questions', () => {
    const c = testCase('case-small')
    const caseQs = [1, 2].map((i) => single({ id: `q-case-small-${i}`, caseId: 'case-small' }))
    const plan = build([...questions, ...caseQs], [c], { total: 20, seed: 9 })
    expect(plan.caseId).toBeNull()
  })

  it('tops up from other domains when one domain runs short', () => {
    const lopsided = [...bank(30).filter((q) => q.domain !== 'D3'), single({ id: 'q-only-d3', domain: 'D3', skill: '3.1.1' })]
    const plan = build(lopsided, [], { total: 50, seed: 11 })
    expect(plan.questionIds).toHaveLength(50)
    expect(plan.questionIds).toContain('q-only-d3')
  })

  it('caps the exam at the size of the bank', () => {
    const small = bank(2)
    expect(build(small, [], { total: 50, seed: 1 }).questionIds).toHaveLength(small.length)
  })

  it('takes its defaults from exam.json', () => {
    expect(EXAM_DEFAULTS).toEqual(exam.exam)
    expect(build(questions, [], { seed: 2 }).minutes).toBe(exam.exam.minutes)
    expect(build(questions, [], { seed: 2 }).questionIds).toHaveLength(Math.min(exam.exam.questions, questions.length))
  })

  it('builds nothing from an empty bank', () => {
    expect(build([], [], { seed: 1 })).toMatchObject({ questionIds: [], caseId: null, caseQuestionIds: [] })
  })
})

describe('summarizeExam', () => {
  it('computes points, percent, per-domain results and the pass guideline', () => {
    const qs = [single({ id: 'q-s-1', domain: 'D1', skill: '1.1.1' }), single({ id: 'q-s-2', domain: 'D1', skill: '1.1.1' }), single({ id: 'q-s-3', domain: 'D2' }), single({ id: 'q-s-4', domain: 'D2' })]
    const byId = new Map(qs.map((q) => [q.id, q]))
    const s = summarizeExam(
      qs.map((q) => q.id),
      byId,
      {
        'q-s-1': { type: 'single', choice: 'a' },
        'q-s-2': { type: 'single', choice: 'b' },
        'q-s-3': { type: 'single', choice: 'a' },
      },
      70,
      TEST_DOMAINS,
    )
    expect(s).toMatchObject({ earned: 2, possible: 4, percent: 50, passed: false, correctCount: 2 })
    expect(s.byDomain.find((d) => d.domain === 'D1')).toMatchObject({ earned: 1, possible: 2, percent: 50 })
    expect(s.byDomain.find((d) => d.domain === 'D3')).toMatchObject({ possible: 0, percent: 0 })
  })

  it('passes at the 70 % guideline', () => {
    const qs = Array.from({ length: 10 }, (_, i) => single({ id: `q-p-${i}` }))
    const byId = new Map(qs.map((q) => [q.id, q]))
    const answers = Object.fromEntries(qs.slice(0, 7).map((q) => [q.id, { type: 'single' as const, choice: 'a' }]))
    expect(summarizeExam(qs.map((q) => q.id), byId, answers, 70, TEST_DOMAINS).passed).toBe(true)
    expect(summarizeExam(qs.map((q) => q.id), byId, answers, 80, TEST_DOMAINS).passed).toBe(false)
  })
})

describe('formatClock', () => {
  it('formats remaining time', () => {
    expect(formatClock(100 * 60)).toBe('1:40:00')
    expect(formatClock(59)).toBe('00:59')
    expect(formatClock(-5)).toBe('00:00')
  })
})
