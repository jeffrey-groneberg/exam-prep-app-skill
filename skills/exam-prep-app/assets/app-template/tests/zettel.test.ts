import { beforeEach, describe, expect, it } from 'vitest'
import { advance, applyZettel, boxCards, buildDeck, countByFach, fachOf, GOAL, newOwnId, ownChoices, ownToZettel, type ZettelStates } from '../src/lib/zettel.ts'
import { initialState, normalizeState, store } from '../src/lib/store.ts'
import type { Zettel } from '../src/lib/types.ts'

const NOW = new Date('2026-11-09T10:00:00Z')
const card = (id: string, module: string | null = 'm1'): Zettel => ({ id, module, kind: 'trap', front: `${id}?`, back: `${id}.` })

describe('Zettelkasten — moving cards', () => {
  it('starts every card at the back, in compartment 1', () => {
    expect(fachOf({}, 'x')).toBe(1)
    expect(fachOf({ x: { fach: 7 as never, right: 0, wrong: 0, lastAt: '' } }, 'x')).toBe(1)
  })

  it('moves a known card one compartment forward and keeps it at the front', () => {
    const one = applyZettel(undefined, true, NOW)
    const two = applyZettel(one, true, NOW)
    const three = applyZettel(two, true, NOW)
    expect([one.fach, two.fach, three.fach]).toEqual([2, 3, 3])
    expect(three).toMatchObject({ right: 3, wrong: 0, lastAt: NOW.toISOString() })
  })

  it('sends an unknown card back to compartment 1, even from the front', () => {
    const front = applyZettel(applyZettel(undefined, true, NOW), true, NOW)
    const back = applyZettel(front, false, NOW)
    expect(back).toMatchObject({ fach: 1, right: 2, wrong: 1 })
  })

  it('counts cards per compartment', () => {
    const states: ZettelStates = { b: applyZettel(undefined, true, NOW), c: applyZettel(applyZettel(undefined, true, NOW), true, NOW) }
    expect(countByFach(['a', 'b', 'c', 'd'], states)).toEqual([2, 1, 1])
  })
})

describe('Zettelkasten — a round', () => {
  const cards = [card('a', 'm1'), card('b', 'm1'), card('c', 'm2'), card('d', 'm2')]

  it('deals every card not yet at the front, in box order, preferred modules first, up to the limit', () => {
    const states: ZettelStates = { b: { fach: GOAL, right: 2, wrong: 0, lastAt: '' } }
    expect(buildDeck(cards, states)).toEqual(['a', 'c', 'd'])
    expect(buildDeck(cards, states, { first: new Set(['m2']) })).toEqual(['c', 'd', 'a'])
    expect(buildDeck(cards, states, { limit: 2 })).toEqual(['a', 'c'])
  })

  it('takes a card out of the round once it reaches the front; any other card goes to the end', () => {
    expect(advance(['a', 'b', 'c'], 2)).toEqual(['b', 'c', 'a'])
    expect(advance(['a', 'b', 'c'], 1)).toEqual(['b', 'c', 'a'])
    expect(advance(['a', 'b', 'c'], 3)).toEqual(['b', 'c'])
    expect(advance([], 3)).toEqual([])
  })

  it('ends when every card of the round sits two compartments forward', () => {
    let states: ZettelStates = {}
    let queue = buildDeck(cards, states)
    const answers: Array<[string, boolean]> = []
    // The learner misses card c once; everything else is known.
    let missedC = false
    while (queue.length) {
      const id = queue[0]
      const knew = id !== 'c' || missedC
      if (id === 'c') missedC = true
      const next = applyZettel(states[id], knew, NOW)
      states = { ...states, [id]: next }
      answers.push([id, knew])
      queue = advance(queue, next.fach)
      expect(answers.length).toBeLessThan(50)
    }
    expect(countByFach(cards.map((c) => c.id), states)).toEqual([0, 0, 4])
    // Four cards × two steps forward, plus the miss and the step it undid.
    expect(answers).toHaveLength(4 * 2 + 1)
    expect(answers.slice(0, 4)).toEqual([['a', true], ['b', true], ['c', false], ['d', true]])
  })

  it('leaves hidden starter cards out and adds own cards at the end', () => {
    const own = [{ id: 'z-own-1', module: null, front: 'Mine?', back: 'Yes.', createdAt: NOW.toISOString() }]
    expect(boxCards(cards, own, ['b']).map((z) => [z.id, z.kind])).toEqual([
      ['a', 'trap'],
      ['c', 'trap'],
      ['d', 'trap'],
      ['z-own-1', 'own'],
    ])
  })

  it('turns own cards with one right and at least two wrong options into multiple-choice cards', () => {
    const base = { id: 'z-own-2', module: null, front: 'Which API?', back: 'The Responses API, because …', createdAt: NOW.toISOString() }
    const choices = [
      { text: 'Responses API', correct: true },
      { text: 'Assistants API', correct: false, why: 'Retired.' },
      { text: 'Completions API', correct: false },
    ]
    const z = ownToZettel({ ...base, choices })
    expect(z.choices?.map((o) => [o.id, o.text.de, o.correct, o.why.de])).toEqual([
      ['a', 'Responses API', true, ''],
      ['b', 'Assistants API', false, 'Retired.'],
      ['c', 'Completions API', false, ''],
    ])
    expect(ownToZettel(base).choices).toBeUndefined()
    expect(ownChoices(choices.slice(0, 2))).toBeUndefined()
    expect(ownChoices([{ text: 'x', correct: true }, { text: 'y', correct: true }, { text: 'z', correct: false }])).toBeUndefined()
    expect(ownChoices('nonsense')).toBeUndefined()
  })

  it('gives own cards unique, stable-looking ids', () => {
    expect(newOwnId(NOW, () => 0.5)).toMatch(/^z-own-[a-z0-9]+-[a-z0-9]{4}$/)
    expect(newOwnId(NOW, () => 0.1)).not.toBe(newOwnId(NOW, () => 0.2))
  })
})

describe('Zettelkasten — stored progress', () => {
  beforeEach(() => {
    store.importJson(JSON.stringify(initialState()))
  })

  it('records answers per card', () => {
    store.answerZettel('a', true, NOW)
    store.answerZettel('a', true, NOW)
    store.answerZettel('b', false, NOW)
    expect(store.get().zettel.a.fach).toBe(3)
    expect(store.get().zettel.b).toMatchObject({ fach: 1, wrong: 1 })
    store.resetZettel(['a'])
    expect(store.get().zettel.a).toBeUndefined()
  })

  it('adds, edits and deletes own cards together with their progress', () => {
    const id = store.addOwnZettel({ front: 'Which API?', back: 'Responses API.', module: 'foundry-chat-app' }, NOW)
    store.answerZettel(id, true, NOW)
    store.updateOwnZettel(id, { back: 'The Responses API.' })
    expect(store.get().ownZettel).toEqual([{ id, front: 'Which API?', back: 'The Responses API.', module: 'foundry-chat-app', createdAt: NOW.toISOString() }])
    store.deleteOwnZettel(id)
    expect(store.get().ownZettel).toEqual([])
    expect(store.get().zettel[id]).toBeUndefined()
  })

  it('takes starter cards out of the box and puts them back', () => {
    store.setZettelHidden('a', true)
    store.setZettelHidden('a', true)
    expect(store.get().hiddenZettel).toEqual(['a'])
    store.setZettelHidden('a', false)
    expect(store.get().hiddenZettel).toEqual([])
  })

  it('keeps own cards when the learning progress is reset', () => {
    const id = store.addOwnZettel({ front: 'Q?', back: 'A.', module: null }, NOW)
    store.answerZettel(id, true, NOW)
    store.reset()
    expect(store.get().ownZettel.map((z) => z.id)).toEqual([id])
    expect(store.get().zettel).toEqual({})
  })

  it('imports exports made before the Zettelkasten existed', () => {
    const old = { version: 1, lang: 'en', cards: {}, lessonsRead: { 'a2a': NOW.toISOString() }, exams: [], activeExam: null }
    expect(store.importJson(JSON.stringify(old))).toBe(true)
    expect(store.get()).toMatchObject({ lang: 'en', zettel: {}, ownZettel: [], hiddenZettel: [] })
    expect(normalizeState({ ...old, zettel: null as never, ownZettel: 'x' as never } as never)).toMatchObject({ zettel: {}, ownZettel: [] })
  })
})
