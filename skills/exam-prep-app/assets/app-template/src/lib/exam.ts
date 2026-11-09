import type { CaseStudy, DomainId, Question } from './types.ts'
import { createRng, shuffle } from './random.ts'
import { scoreQuestion, type Answer } from './scoring.ts'
import { exam } from '../config.ts'
import { domains as outlineDomains } from '../content/outline.ts'

/** A domain as the exam weights it: its id and official weight range in percent. */
export interface WeightedDomain {
  id: DomainId
  weight: [number, number]
}

/** Exam format from exam.json: questions, minutes and the app's pass guideline in percent. */
export const EXAM_DEFAULTS = exam.exam

/**
 * Splits `total` questions across domains proportionally to the midpoint of each weight
 * range, using the largest-remainder method so the quotas always sum to `total`.
 * Domains without weights (all zero) share equally.
 */
export function domainQuotas(total: number, domains: readonly WeightedDomain[] = outlineDomains): Record<DomainId, number> {
  if (!domains.length) return {}
  const mids = domains.map((d) => (d.weight[0] + d.weight[1]) / 2)
  const weights = mids.some((m) => m > 0) ? mids : mids.map(() => 1)
  const sum = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / sum) * total)
  const floors = raw.map(Math.floor)
  let remaining = total - floors.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r), mid: weights[i] }))
    .sort((a, b) => b.frac - a.frac || b.mid - a.mid || a.i - b.i)
  for (const { i } of order) {
    if (remaining <= 0) break
    floors[i] += 1
    remaining -= 1
  }
  return Object.fromEntries(domains.map((d, i) => [d.id, floors[i]]))
}

/**
 * Quotas of a simulation with `total` questions drawn from this bank. Domains without questions get none; a domain
 * with fewer questions than its share gives all it has, and the rest is split over the other domains by weight.
 */
export function examQuotas(questions: readonly Question[], total: number, domains: readonly WeightedDomain[] = outlineDomains): Record<DomainId, number> {
  const available = new Map<DomainId, number>()
  for (const q of questions) available.set(q.domain, (available.get(q.domain) ?? 0) + 1)
  const out: Record<DomainId, number> = Object.fromEntries(domains.map((d) => [d.id, 0]))
  let pool = domains.filter((d) => available.has(d.id))
  let left = Math.min(total, pool.reduce((a, d) => a + (available.get(d.id) ?? 0), 0))
  while (pool.length && left > 0) {
    const quotas = domainQuotas(left, pool)
    const short = pool.filter((d) => quotas[d.id] > (available.get(d.id) ?? 0))
    if (!short.length) {
      for (const d of pool) out[d.id] = quotas[d.id]
      break
    }
    for (const d of short) {
      out[d.id] = available.get(d.id) ?? 0
      left -= out[d.id]
    }
    pool = pool.filter((d) => !short.includes(d))
  }
  return out
}

export interface ExamPlan {
  seed: number
  questionIds: string[]
  /** Case study questions are appended as their own section, like on the real exam. */
  caseId: string | null
  caseQuestionIds: string[]
  minutes: number
  quotas: Record<DomainId, number>
}

export interface BuildExamOptions {
  total?: number
  minutes?: number
  seed?: number
  includeCase?: boolean
  /** Domains with their weights; defaults to the skills outline. */
  domains?: readonly WeightedDomain[]
}

/**
 * Builds an exam weighted by domain. Picks one case study (if any has ≥ 3 questions),
 * then fills each domain's remaining quota round-robin across skills-outline bullets so a
 * simulation samples the breadth of the outline instead of clustering on one topic.
 */
export function buildExam(questions: Question[], cases: CaseStudy[], options: BuildExamOptions = {}): ExamPlan {
  const total = Math.min(options.total ?? EXAM_DEFAULTS.questions, questions.length)
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31)
  const rng = createRng(seed)
  const domains = options.domains ?? outlineDomains
  const ids = domains.map((d) => d.id)
  const quotas = examQuotas(questions, total, domains)
  const remaining = { ...quotas }

  let caseId: string | null = null
  let caseQuestionIds: string[] = []
  if (options.includeCase !== false) {
    const eligible = cases.filter((c) => questions.filter((q) => q.caseId === c.id).length >= 3)
    if (eligible.length) {
      const chosen = eligible[Math.floor(rng() * eligible.length)]
      const caseQs = questions.filter((q) => q.caseId === chosen.id).slice(0, Math.max(3, Math.floor(total / 8)))
      caseId = chosen.id
      caseQuestionIds = caseQs.map((q) => q.id)
      for (const q of caseQs) remaining[q.domain] = Math.max(0, (remaining[q.domain] ?? 0) - 1)
    }
  }

  const used = new Set(caseQuestionIds)
  const picked: string[] = []
  for (const d of ids) {
    const pool = shuffle(
      questions.filter((q) => q.domain === d && !q.caseId && !used.has(q.id)),
      rng,
    )
    const byBullet = new Map<string, Question[]>()
    for (const q of pool) byBullet.set(q.skill, [...(byBullet.get(q.skill) ?? []), q])
    const buckets = shuffle([...byBullet.values()], rng)
    let need = remaining[d]
    while (need > 0 && buckets.some((b) => b.length)) {
      for (const b of buckets) {
        if (need <= 0) break
        const q = b.shift()
        if (q) {
          picked.push(q.id)
          used.add(q.id)
          need--
        }
      }
    }
    remaining[d] = need
  }

  // Domains without enough questions: top up from any unused non-case question.
  let shortfall = total - caseQuestionIds.length - picked.length
  if (shortfall > 0) {
    const extra = shuffle(questions.filter((q) => !used.has(q.id) && !q.caseId), rng)
    for (const q of extra) {
      if (shortfall <= 0) break
      picked.push(q.id)
      used.add(q.id)
      shortfall--
    }
  }

  return {
    seed,
    questionIds: shuffle(picked, rng),
    caseId,
    caseQuestionIds,
    minutes: options.minutes ?? EXAM_DEFAULTS.minutes,
    quotas,
  }
}

export interface DomainResult {
  domain: DomainId
  earned: number
  possible: number
  percent: number
}

export interface ExamSummary {
  earned: number
  possible: number
  percent: number
  passed: boolean
  correctCount: number
  byDomain: DomainResult[]
}

export function summarizeExam(
  questionIds: string[],
  questionById: Map<string, Question>,
  answers: Record<string, Answer | undefined>,
  passPercent: number = EXAM_DEFAULTS.passPercent,
  domains: readonly WeightedDomain[] = outlineDomains,
): ExamSummary {
  const byDomain = new Map<DomainId, { earned: number; possible: number }>(domains.map((d) => [d.id, { earned: 0, possible: 0 }]))
  let earned = 0
  let correctCount = 0
  for (const id of questionIds) {
    const q = questionById.get(id)
    if (!q) continue
    const r = scoreQuestion(q, answers[id])
    earned += r.score
    if (r.correct) correctCount++
    let slot = byDomain.get(q.domain)
    if (!slot) byDomain.set(q.domain, (slot = { earned: 0, possible: 0 }))
    slot.earned += r.score
    slot.possible += 1
  }
  const possible = questionIds.filter((id) => questionById.has(id)).length
  const percent = possible ? Math.round((earned / possible) * 1000) / 10 : 0
  return {
    earned: Math.round(earned * 100) / 100,
    possible,
    percent,
    passed: percent >= passPercent,
    correctCount,
    byDomain: [...byDomain.entries()].map(([d, s]) => {
      return { domain: d, earned: Math.round(s.earned * 100) / 100, possible: s.possible, percent: s.possible ? Math.round((s.earned / s.possible) * 100) : 0 }
    }),
  }
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
