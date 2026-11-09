import type { Question } from './types.ts'

export type Answer =
  | { type: 'single'; choice: string | null }
  | { type: 'multi'; choices: string[] }
  | { type: 'order'; order: string[] }
  | { type: 'match'; pairs: Record<string, string | null> }
  | { type: 'code'; blanks: Record<string, string | null> }

export interface ScoreResult {
  /** Points earned, 0..1 (partial credit for multi-part questions). */
  score: number
  /** True only when every component is right. */
  correct: boolean
  /** Number of scoreable components and how many were right. */
  parts: number
  partsCorrect: number
}

export function emptyAnswer(q: Question): Answer {
  switch (q.type) {
    case 'single':
      return { type: 'single', choice: null }
    case 'multi':
      return { type: 'multi', choices: [] }
    case 'order':
      return { type: 'order', order: [] }
    case 'match':
      return { type: 'match', pairs: Object.fromEntries(q.prompts.map((p) => [p.id, null])) }
    case 'code':
      return { type: 'code', blanks: Object.fromEntries(q.blanks.map((b) => [b.id, null])) }
  }
}

/** Number of options the learner must pick in a multiple-select question. */
export function requiredSelections(q: Question): number {
  return q.type === 'multi' ? q.options.filter((o) => o.correct).length : 1
}

/** Whether the learner has supplied enough input to check or submit the answer. */
export function isAnswerComplete(q: Question, a: Answer | undefined): boolean {
  if (!a || a.type !== q.type) return false
  switch (a.type) {
    case 'single':
      return a.choice !== null
    case 'multi':
      return a.choices.length === requiredSelections(q)
    case 'order':
      return q.type === 'order' && a.order.length === q.items.length
    case 'match':
      return Object.values(a.pairs).every((v) => v !== null)
    case 'code':
      return Object.values(a.blanks).every((v) => v !== null)
  }
}

/**
 * Scores an answer the way Microsoft describes exam scoring: one point per correctly
 * answered component, no penalty for guessing. Each question is normalized to 1 point.
 * Ordering ("build list") questions only score when the whole sequence is right.
 */
export function scoreQuestion(q: Question, a: Answer | undefined): ScoreResult {
  const none = (parts: number): ScoreResult => ({ score: 0, correct: false, parts, partsCorrect: 0 })
  switch (q.type) {
    case 'single': {
      if (!a || a.type !== 'single') return none(1)
      const ok = q.options.some((o) => o.correct && o.id === a.choice)
      return { score: ok ? 1 : 0, correct: ok, parts: 1, partsCorrect: ok ? 1 : 0 }
    }
    case 'multi': {
      const correctIds = new Set(q.options.filter((o) => o.correct).map((o) => o.id))
      const parts = correctIds.size
      if (!a || a.type !== 'multi') return none(parts)
      const picked = [...new Set(a.choices)]
      const hits = picked.filter((id) => correctIds.has(id)).length
      const extra = Math.max(0, picked.length - parts)
      const earned = Math.max(0, hits - extra)
      return { score: earned / parts, correct: earned === parts && picked.length === parts, parts, partsCorrect: earned }
    }
    case 'order': {
      const parts = q.items.length
      if (!a || a.type !== 'order') return none(parts)
      const inPlace = q.items.filter((item, i) => a.order[i] === item.id).length
      const ok = inPlace === parts && a.order.length === parts
      return { score: ok ? 1 : 0, correct: ok, parts, partsCorrect: inPlace }
    }
    case 'match': {
      const parts = q.prompts.length
      if (!a || a.type !== 'match') return none(parts)
      const hits = q.prompts.filter((p) => a.pairs[p.id] === p.answer).length
      return { score: hits / parts, correct: hits === parts, parts, partsCorrect: hits }
    }
    case 'code': {
      const parts = q.blanks.length
      if (!a || a.type !== 'code') return none(parts)
      const hits = q.blanks.filter((b) => {
        const pick = a.blanks[b.id]
        return b.options.some((o) => o.correct && o.id === pick)
      }).length
      return { score: hits / parts, correct: hits === parts, parts, partsCorrect: hits }
    }
  }
}
