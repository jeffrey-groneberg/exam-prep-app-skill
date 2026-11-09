/**
 * Leitner-style spaced repetition. A wrong or partial answer sends a question back to
 * box 1 (due again right away); each fully correct answer promotes it one box and pushes
 * the next review further out.
 */
export interface CardState {
  box: number
  /** ISO timestamp when the question is due for review. */
  due: string
  attempts: number
  correct: number
  /** Score of the most recent attempt, 0..1. */
  lastScore: number
  lastAt: string
}

export const MAX_BOX = 5
/** Review interval in days for each box (index = box). */
export const BOX_INTERVAL_DAYS = [0, 0, 1, 3, 7, 21]

const DAY = 24 * 60 * 60 * 1000

export function applyResult(card: CardState | undefined, score: number, now: Date = new Date()): CardState {
  const fullyCorrect = score >= 1
  const prevBox = card?.box ?? 0
  const box = fullyCorrect ? Math.min(MAX_BOX, Math.max(1, prevBox) + 1) : 1
  const due = new Date(now.getTime() + BOX_INTERVAL_DAYS[box] * DAY)
  return {
    box,
    due: due.toISOString(),
    attempts: (card?.attempts ?? 0) + 1,
    correct: (card?.correct ?? 0) + (fullyCorrect ? 1 : 0),
    lastScore: score,
    lastAt: now.toISOString(),
  }
}

export function isDue(card: CardState | undefined, now: Date = new Date()): boolean {
  if (!card) return false
  return new Date(card.due).getTime() <= now.getTime()
}

/** 0 = unseen, then box/MAX_BOX: a question counts as retained only after spaced successes. */
export function retention(card: CardState | undefined): number {
  if (!card) return 0
  return card.box / MAX_BOX
}
