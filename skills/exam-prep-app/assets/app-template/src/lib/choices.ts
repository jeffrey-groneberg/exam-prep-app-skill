import type { ChoiceOption } from './types.ts'
import { createRng, hashSeed, shuffle } from './random.ts'

/** Options of a choice question or a Zettelkasten card. */
export interface ChoiceSet {
  id: string
  type: 'single' | 'multi'
  options: ChoiceOption[]
}

/** The display order of a choice set; the same seed always gives the same order. */
export function orderChoices(q: ChoiceSet, seed: number): ChoiceOption[] {
  return shuffle(q.options, createRng(hashSeed(q.id) ^ seed))
}
