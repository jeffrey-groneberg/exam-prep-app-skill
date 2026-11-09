import type { CourseModule, DomainId, Question } from './types.ts'
import { isDue, retention, type CardState } from './srs.ts'

export type MasteryLevel = 0 | 1 | 2 | 3

export interface MasteryInfo {
  level: MasteryLevel
  /** Average retention 0..1 over all questions (unseen = 0). */
  value: number
  attempted: number
  total: number
  correctLast: number
}

/**
 * Mastery reflects retained knowledge, not clicks: each question contributes its Leitner box (0..5).
 * Levels (labels in the dictionaries): 0 not started · 1 seen · 2 proficient · 3 mastered, which needs most
 * questions answered correctly over spaced reviews.
 */
export function masteryOf(questions: Question[], cards: Record<string, CardState | undefined>): MasteryInfo {
  const total = questions.length
  if (!total) return { level: 0, value: 0, attempted: 0, total: 0, correctLast: 0 }
  let sum = 0
  let attempted = 0
  let correctLast = 0
  for (const q of questions) {
    const c = cards[q.id]
    if (c) {
      attempted++
      if (c.lastScore >= 1) correctLast++
    }
    sum += retention(c)
  }
  const value = sum / total
  let level: MasteryLevel = 0
  if (attempted > 0) level = 1
  if (attempted / total >= 0.6 && value >= 0.45) level = 2
  if (attempted === total && value >= 0.75) level = 3
  return { level, value, attempted, total, correctLast }
}

export type ModuleStep = 'lesson' | 'questions' | 'review' | 'done'

export interface ModuleStatus {
  module: CourseModule
  step: ModuleStep
  lessonRead: boolean
  attempted: number
  total: number
  wrongOpen: number
  mastery: MasteryInfo
}

export function moduleStatus(
  module: CourseModule,
  questions: Question[],
  cards: Record<string, CardState | undefined>,
  lessonsRead: Record<string, string | undefined>,
): ModuleStatus {
  const qs = questions.filter((q) => q.module === module.id)
  const lessonRead = Boolean(lessonsRead[module.id])
  const attempted = qs.filter((q) => cards[q.id]).length
  const wrongOpen = qs.filter((q) => {
    const c = cards[q.id]
    return c !== undefined && c.box <= 1
  }).length
  let step: ModuleStep = 'done'
  if (!lessonRead) step = 'lesson'
  else if (attempted < qs.length) step = 'questions'
  else if (wrongOpen > 0) step = 'review'
  return { module, step, lessonRead, attempted, total: qs.length, wrongOpen, mastery: masteryOf(qs, cards) }
}

/** The guided path: the first module (in official course order) that is not done yet. */
export function nextModule(
  orderedModules: CourseModule[],
  questions: Question[],
  cards: Record<string, CardState | undefined>,
  lessonsRead: Record<string, string | undefined>,
): ModuleStatus | null {
  for (const m of orderedModules) {
    const s = moduleStatus(m, questions, cards, lessonsRead)
    if (s.step !== 'done') return s
  }
  return null
}

export function dueQuestions(questions: Question[], cards: Record<string, CardState | undefined>, now: Date = new Date()): Question[] {
  return questions
    .filter((q) => isDue(cards[q.id], now))
    .sort((a, b) => (cards[a.id]!.box - cards[b.id]!.box) || cards[a.id]!.due.localeCompare(cards[b.id]!.due))
}

export function wrongQuestions(questions: Question[], cards: Record<string, CardState | undefined>): Question[] {
  return questions.filter((q) => {
    const c = cards[q.id]
    return c !== undefined && c.lastScore < 1
  })
}

export function domainMastery(domain: DomainId, questions: Question[], cards: Record<string, CardState | undefined>): MasteryInfo {
  return masteryOf(
    questions.filter((q) => q.domain === domain),
    cards,
  )
}
