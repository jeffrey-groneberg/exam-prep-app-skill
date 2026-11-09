import { useMemo } from 'react'
import { useProgress } from './store.ts'
import { boxCards, buildDeck, type ZettelStates } from './zettel.ts'
import type { Zettel } from './types.ts'
import { starterZettel } from '../content/index.ts'

/** Cards in a mixed round; a module round takes all of its open cards. */
export const ROUND_SIZE = 20

/** Everything in the learner's box: starter cards not taken out, plus own cards. */
export function useZettelBox() {
  const progress = useProgress()
  const { ownZettel, hiddenZettel } = progress
  const cards = useMemo(() => boxCards(starterZettel, ownZettel, hiddenZettel), [ownZettel, hiddenZettel])
  return { ...progress, cards }
}

/** The next mixed round: open cards in course order, modules whose lesson was read first. */
export function nextRound(cards: readonly Zettel[], states: ZettelStates, lessonsRead: Record<string, string>): string[] {
  return buildDeck(cards, states, { limit: ROUND_SIZE, first: new Set(Object.keys(lessonsRead)) })
}
