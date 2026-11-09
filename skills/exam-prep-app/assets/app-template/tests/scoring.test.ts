import { describe, expect, it } from 'vitest'
import { emptyAnswer, isAnswerComplete, requiredSelections, scoreQuestion } from '../src/lib/scoring.ts'
import { code, match, multi, order, single } from './fixtures.ts'

describe('scoreQuestion', () => {
  it('scores single choice as all-or-nothing', () => {
    const q = single()
    expect(scoreQuestion(q, { type: 'single', choice: 'a' })).toMatchObject({ score: 1, correct: true })
    expect(scoreQuestion(q, { type: 'single', choice: 'b' })).toMatchObject({ score: 0, correct: false })
    expect(scoreQuestion(q, { type: 'single', choice: null }).score).toBe(0)
  })

  it('gives one point per correct component for multiple select, no penalty for guessing', () => {
    const q = multi()
    expect(requiredSelections(q)).toBe(2)
    expect(scoreQuestion(q, { type: 'multi', choices: ['a', 'b'] })).toMatchObject({ score: 1, correct: true, partsCorrect: 2 })
    expect(scoreQuestion(q, { type: 'multi', choices: ['a', 'c'] })).toMatchObject({ score: 0.5, correct: false, partsCorrect: 1 })
    expect(scoreQuestion(q, { type: 'multi', choices: ['c', 'd'] }).score).toBe(0)
  })

  it('does not reward selecting more options than required', () => {
    const q = multi()
    const r = scoreQuestion(q, { type: 'multi', choices: ['a', 'b', 'c'] })
    expect(r.correct).toBe(false)
    expect(r.score).toBe(0.5)
    expect(scoreQuestion(q, { type: 'multi', choices: ['a', 'b', 'c', 'd'] }).score).toBe(0)
  })

  it('ignores duplicate picks in multiple select', () => {
    const q = multi()
    expect(scoreQuestion(q, { type: 'multi', choices: ['a', 'a'] }).score).toBe(0.5)
  })

  it('scores ordering only when the full sequence is right', () => {
    const q = order()
    expect(scoreQuestion(q, { type: 'order', order: ['s1', 's2', 's3'] })).toMatchObject({ score: 1, correct: true })
    const partial = scoreQuestion(q, { type: 'order', order: ['s1', 's3', 's2'] })
    expect(partial).toMatchObject({ score: 0, correct: false, partsCorrect: 1 })
    expect(scoreQuestion(q, { type: 'order', order: ['s1', 's2'] }).score).toBe(0)
  })

  it('gives partial credit per correct pair in matching', () => {
    const q = match()
    expect(scoreQuestion(q, { type: 'match', pairs: { p1: 't1', p2: 't2', p3: 't1' } }).score).toBe(1)
    const r = scoreQuestion(q, { type: 'match', pairs: { p1: 't1', p2: 't3', p3: null } })
    expect(r.score).toBeCloseTo(1 / 3)
    expect(r.correct).toBe(false)
  })

  it('gives partial credit per blank in code completion', () => {
    const q = code()
    expect(scoreQuestion(q, { type: 'code', blanks: { b1: 'a', b2: 'a' } }).correct).toBe(true)
    expect(scoreQuestion(q, { type: 'code', blanks: { b1: 'a', b2: 'b' } }).score).toBe(0.5)
  })

  it('treats a missing or mismatched answer as zero', () => {
    const q = single()
    expect(scoreQuestion(q, undefined).score).toBe(0)
    expect(scoreQuestion(q, { type: 'multi', choices: ['a'] }).score).toBe(0)
  })
})

describe('isAnswerComplete', () => {
  it('requires the exact number of selections for multiple select', () => {
    const q = multi()
    expect(isAnswerComplete(q, { type: 'multi', choices: ['a'] })).toBe(false)
    expect(isAnswerComplete(q, { type: 'multi', choices: ['a', 'c'] })).toBe(true)
  })

  it('requires every item placed, every prompt matched and every blank filled', () => {
    expect(isAnswerComplete(order(), { type: 'order', order: ['s1', 's2'] })).toBe(false)
    const m = match()
    expect(isAnswerComplete(m, emptyAnswer(m))).toBe(false)
    expect(isAnswerComplete(m, { type: 'match', pairs: { p1: 't1', p2: 't1', p3: 't1' } })).toBe(true)
    const c = code()
    expect(isAnswerComplete(c, { type: 'code', blanks: { b1: 'a', b2: null } })).toBe(false)
  })
})
