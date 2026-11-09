import type { ChoiceOption, Zettel } from './types.ts'

/**
 * Zettelkasten = a Leitner card box with three compartments. Every card starts at the back in
 * compartment 1. Knowing the answer moves it one compartment forward; not knowing it sends it back
 * to compartment 1. The goal is every card in compartment 3, two compartments forward.
 */
export type Fach = 1 | 2 | 3

export const FAECHER: readonly Fach[] = [1, 2, 3]
export const GOAL: Fach = 3

export interface ZettelState {
  fach: Fach
  right: number
  wrong: number
  lastAt: string
}

/** An answer option on a card the learner wrote. */
export interface OwnChoice {
  text: string
  correct: boolean
  /** Why this option is wrong; the right one is explained by the card's back. */
  why?: string
}

/** A card the learner wrote. */
export interface OwnZettel {
  id: string
  module: string | null
  front: string
  back: string
  /** Optional answer options: one correct and at least two wrong ones turn the card into a multiple-choice card. */
  choices?: OwnChoice[]
  createdAt: string
}

const same = (s: string) => ({ en: s, de: s })

/** Options of an own card, or undefined unless they form a valid set (one correct, at least two wrong). */
export function ownChoices(choices: unknown): ChoiceOption[] | undefined {
  if (!Array.isArray(choices)) return undefined
  const valid = choices.filter((c): c is OwnChoice => typeof c?.text === 'string' && c.text.trim() !== '' && typeof c.correct === 'boolean').slice(0, 4)
  if (valid.filter((c) => c.correct).length !== 1 || valid.length < 3) return undefined
  return valid.map((c, i) => ({ id: 'abcd'[i], text: same(c.text.trim()), correct: c.correct, why: same(typeof c.why === 'string' ? c.why.trim() : '') }))
}

export type ZettelStates = Record<string, ZettelState | undefined>

export function fachOf(states: ZettelStates, id: string): Fach {
  const f = states[id]?.fach
  return f === 2 || f === 3 ? f : 1
}

export function applyZettel(prev: ZettelState | undefined, knew: boolean, now: Date = new Date()): ZettelState {
  const fach = prev?.fach ?? 1
  return {
    fach: knew ? (Math.min(GOAL, fach + 1) as Fach) : 1,
    right: (prev?.right ?? 0) + (knew ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (knew ? 0 : 1),
    lastAt: now.toISOString(),
  }
}

/** Cards per compartment: [stage 1, stage 2, stage 3]. */
export function countByFach(ids: Iterable<string>, states: ZettelStates): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0]
  for (const id of ids) out[fachOf(states, id) - 1]++
  return out
}

export function ownToZettel(o: OwnZettel): Zettel {
  return { id: o.id, module: o.module, kind: 'own', front: o.front, back: o.back, choices: ownChoices(o.choices) }
}

/** Starter cards the learner has not taken out of the box, followed by the learner's own cards. */
export function boxCards(starter: readonly Zettel[], own: readonly OwnZettel[], hidden: readonly string[]): Zettel[] {
  const out = new Set(hidden)
  return [...starter.filter((z) => !out.has(z.id)), ...own.map(ownToZettel)]
}

export interface DeckOptions {
  /** Most cards in one round; omit for all open cards. */
  limit?: number
  /** Modules whose cards come first, e.g. lessons the learner has read. */
  first?: ReadonlySet<string>
}

/** The cards a round works through: every card not yet at the front, in box order (preferred modules first). */
export function buildDeck(cards: readonly Zettel[], states: ZettelStates, opts: DeckOptions = {}): string[] {
  const rank = (z: Zettel) => (opts.first && z.module && opts.first.has(z.module) ? 0 : 1)
  const open = cards
    .map((z, i) => ({ z, i }))
    .filter(({ z }) => fachOf(states, z.id) < GOAL)
    .sort((a, b) => rank(a.z) - rank(b.z) || a.i - b.i)
    .map(({ z }) => z.id)
  return opts.limit ? open.slice(0, opts.limit) : open
}

/**
 * The round after answering the card at the head of the queue: a card that reached the front leaves
 * the round; every other card goes to the end and comes back after the rest.
 */
export function advance(queue: readonly string[], fachAfter: Fach): string[] {
  const [head, ...rest] = queue
  if (head === undefined) return []
  return fachAfter >= GOAL ? rest : [...rest, head]
}

export function newOwnId(now: Date = new Date(), rand: () => number = Math.random): string {
  return `z-own-${now.getTime().toString(36)}-${Math.floor(rand() * 36 ** 4).toString(36).padStart(4, '0')}`
}
