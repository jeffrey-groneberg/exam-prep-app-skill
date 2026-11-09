import { describe, expect, it } from 'vitest'
import { applyResult, BOX_INTERVAL_DAYS, isDue, retention } from '../src/lib/srs.ts'
import { dueQuestions, masteryOf, moduleStatus, nextModule, wrongQuestions } from '../src/lib/progress.ts'
import type { CourseModule } from '../src/lib/types.ts'
import { single } from './fixtures.ts'

const NOW = new Date('2026-11-06T10:00:00Z')
const DAY = 86_400_000

describe('Leitner spaced repetition', () => {
  it('promotes a first correct answer to box 2 (due tomorrow)', () => {
    const c = applyResult(undefined, 1, NOW)
    expect(c.box).toBe(2)
    expect(new Date(c.due).getTime() - NOW.getTime()).toBe(BOX_INTERVAL_DAYS[2] * DAY)
    expect(c).toMatchObject({ attempts: 1, correct: 1, lastScore: 1 })
  })

  it('climbs one box per correct answer up to box 5', () => {
    let c = applyResult(undefined, 1, NOW)
    for (let i = 0; i < 6; i++) c = applyResult(c, 1, NOW)
    expect(c.box).toBe(5)
    expect(new Date(c.due).getTime() - NOW.getTime()).toBe(21 * DAY)
  })

  it('sends wrong and partial answers back to box 1, due immediately', () => {
    const up = applyResult(applyResult(undefined, 1, NOW), 1, NOW)
    const wrong = applyResult(up, 0, NOW)
    expect(wrong.box).toBe(1)
    expect(isDue(wrong, NOW)).toBe(true)
    expect(applyResult(up, 0.5, NOW).box).toBe(1)
  })

  it('reports due dates and retention', () => {
    const c = applyResult(undefined, 1, NOW)
    expect(isDue(c, NOW)).toBe(false)
    expect(isDue(c, new Date(NOW.getTime() + 2 * DAY))).toBe(true)
    expect(isDue(undefined, NOW)).toBe(false)
    expect(retention(undefined)).toBe(0)
    expect(retention(c)).toBeCloseTo(0.4)
  })
})

describe('progress', () => {
  const mod = (id: string): CourseModule => ({ id, uid: id, title: id, url: '', minutes: 30, pathId: 'p', units: [], skills: [] })
  const m1 = mod('foundry-chat-app')
  const m2 = mod('plan-prepare')
  const q1 = single({ id: 'q-a', module: 'foundry-chat-app' })
  const q2 = single({ id: 'q-b', module: 'foundry-chat-app' })
  const q3 = single({ id: 'q-c', module: 'plan-prepare', domain: 'D1', skill: '1.1.1' })
  const questions = [q1, q2, q3]

  it('walks lesson → questions → review → done for a module', () => {
    expect(moduleStatus(m1, questions, {}, {}).step).toBe('lesson')
    const read = { 'foundry-chat-app': NOW.toISOString() }
    expect(moduleStatus(m1, questions, {}, read).step).toBe('questions')
    const cards = { 'q-a': applyResult(undefined, 1, NOW), 'q-b': applyResult(undefined, 0, NOW) }
    expect(moduleStatus(m1, questions, cards, read).step).toBe('review')
    const fixed = { ...cards, 'q-b': applyResult(cards['q-b'], 1, NOW) }
    expect(moduleStatus(m1, questions, fixed, read).step).toBe('done')
  })

  it('points the guided path at the first unfinished module in course order', () => {
    const read = { 'foundry-chat-app': NOW.toISOString() }
    const cards = { 'q-a': applyResult(undefined, 1, NOW), 'q-b': applyResult(undefined, 1, NOW) }
    expect(nextModule([m1, m2], questions, cards, read)?.module.id).toBe('plan-prepare')
    expect(nextModule([m1, m2], questions, {}, {})?.module.id).toBe('foundry-chat-app')
    const allDone = { ...cards, 'q-c': applyResult(undefined, 1, NOW) }
    expect(nextModule([m1, m2], questions, allDone, { ...read, 'plan-prepare': NOW.toISOString() })).toBeNull()
  })

  it('reaches "Gemeistert" only after spaced successes on every question', () => {
    const once = { 'q-a': applyResult(undefined, 1, NOW), 'q-b': applyResult(undefined, 1, NOW) }
    expect(masteryOf([q1, q2], once).level).toBe(1)
    let a = once['q-a']
    let b = once['q-b']
    for (let i = 0; i < 3; i++) {
      a = applyResult(a, 1, NOW)
      b = applyResult(b, 1, NOW)
    }
    expect(masteryOf([q1, q2], { 'q-a': a, 'q-b': b }).level).toBe(3)
    expect(masteryOf([q1, q2], {}).level).toBe(0)
  })

  it('lists due and wrong questions', () => {
    const cards = { 'q-a': applyResult(undefined, 0, NOW), 'q-b': applyResult(undefined, 1, NOW) }
    expect(dueQuestions(questions, cards, NOW).map((q) => q.id)).toEqual(['q-a'])
    expect(wrongQuestions(questions, cards).map((q) => q.id)).toEqual(['q-a'])
  })
})
