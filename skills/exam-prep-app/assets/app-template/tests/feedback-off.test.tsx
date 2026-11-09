// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { lessons, questions, starterZettel } from '../src/content/index.ts'
import { en } from '../src/i18n/en.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

// An app whose exam.json has no feedback.issuesUrl yet, e.g. scaffolded without --repo.
vi.mock('../src/config.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/config.ts')>()
  return { ...actual, exam: { ...actual.exam, feedback: { issuesUrl: '' } } }
})

beforeAll(stubScrolling)
beforeEach(() => resetProgress('en'))
afterEach(() => cleanup())

const lesson = lessons[0]
const card = starterZettel.find((z) => z.choices?.length)
const noFeedback = () => {
  expect(screen.queryAllByRole('link', { name: /^Feedback/ })).toHaveLength(0)
  expect(document.querySelector('.feedback-link, .zk-flip__feedback, .q-meta--exam')).toBeNull()
}

describe('without feedback.issuesUrl the app shows no feedback links', () => {
  it('not in the footer', () => {
    renderAt('/')
    noFeedback()
    expect(screen.queryByText(en.feedback.footerStart.trim(), { exact: false })).toBeNull()
  })

  it.skipIf(!lesson)('not on lesson sections, diagrams or code samples', () => {
    renderAt(`/learn/${lesson!.module}`)
    expect(screen.getAllByRole('heading', { level: 2, name: en.lesson.sections.about })).toHaveLength(1)
    noFeedback()
  })

  it.skipIf(!questions.length)('not on questions, in practice or in the exam', () => {
    renderAt(`/practice/session?module=${questions[0].module}`)
    noFeedback()
    cleanup()
    renderAt('/exam')
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.exam.start) }))
    noFeedback()
  })

  it.skipIf(!card)('not on cards, in the index or in a round', () => {
    renderAt(`/cards/module/${card!.module}`)
    noFeedback()
    cleanup()
    renderAt(`/cards/round?module=${card!.module}`)
    expect(screen.getByText(en.cards.sideFront)).toBeTruthy()
    noFeedback()
  })
})
