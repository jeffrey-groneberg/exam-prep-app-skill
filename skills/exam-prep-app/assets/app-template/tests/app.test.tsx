// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { store } from '../src/lib/store.ts'
import { lessons, orderedModules, questions, starterZettel } from '../src/content/index.ts'
import { moduleById } from '../src/content/outline.ts'
import { en } from '../src/i18n/en.ts'
import { tx } from '../src/i18n/index.ts'
import { exam } from '../src/config.ts'
import { feedbackEnabled, ISSUES_NEW_URL } from '../src/lib/feedback.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

beforeAll(stubScrolling)
beforeEach(() => resetProgress('en'))
afterEach(() => cleanup())

const firstModule = orderedModules[0]
const lesson = lessons[0]
const deck = starterZettel.filter((z) => z.module === starterZettel[0]?.module && z.choices?.length)
const plain = (s: string) => s.replace(/[`*\u200b]/g, '').replace(/\s+/g, ' ').trim()

describe('app routes render', () => {
  it('home shows the guided path and the next step', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: en.home.heading(exam.code) })).toBeTruthy()
    expect(screen.getByRole('heading', { name: en.home.next })).toBeTruthy()
    if (firstModule) expect(screen.getAllByText(firstModule.title).length).toBeGreaterThan(0)
  })

  it.skipIf(!lesson)('lesson page renders a lesson with its diagram', () => {
    renderAt(`/learn/${lesson!.module}`)
    expect(screen.getByRole('heading', { level: 1, name: moduleById.get(lesson!.module)!.title })).toBeTruthy()
    expect(screen.getAllByText(tx(lesson!.diagrams[0].title, 'en')).length).toBeGreaterThan(0)
  })

  it.each([
    ['/learn', en.learn.title],
    ['/practice', en.practice.title],
    ['/exam', en.exam.title],
    ['/review', en.review.title],
    ['/progress', en.progress.title],
    ['/coverage', en.coverage.title],
    ['/resources', en.resources.title],
    ['/cards', en.cards.title],
    ['/cards/own', en.cards.ownCards],
    ['/does-not-exist', en.notFound.title],
  ])('%s renders', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
  })

  it.skipIf(!deck.length)('a module index tab lists its cards', () => {
    const module = moduleById.get(deck[0].module!)!
    renderAt(`/cards/module/${module.id}`)
    expect(screen.getByRole('heading', { level: 1, name: module.title })).toBeTruthy()
  })

  it.skipIf(!feedbackEnabled || !lesson || !deck.length)(
    'offers feedback where problems happen: on questions, lesson sections, diagrams, code samples, cards and in the footer',
    () => {
      const hrefOf = (el: HTMLElement) => el.getAttribute('href') ?? ''
      const issue = (el: HTMLElement) => new URL(hrefOf(el)).searchParams
      renderAt(`/practice/session?module=${lesson!.module}`)
      const question = screen.getByRole('link', { name: /^Feedback on this question/ })
      expect(hrefOf(question).startsWith(`${ISSUES_NEW_URL}?`)).toBe(true)
      expect(issue(question).get('title')).toMatch(/^Feedback: Question q-/)
      expect(issue(question).get('labels')).toBe('feedback')
      expect(screen.getByRole('link', { name: /^Feedback on the app/ })).toBeTruthy()
      cleanup()

      renderAt(`/learn/${lesson!.module}`)
      expect(screen.getAllByRole('link', { name: /^Feedback on this section/ }).length).toBeGreaterThanOrEqual(5)
      const diagram = screen.getAllByRole('link', { name: /^Feedback on this diagram/ })[0]
      expect(issue(diagram).get('body')).toMatch(/- Step: Whole picture/)
      expect(screen.getAllByRole('link', { name: /^Feedback on this code sample/ })).toHaveLength(lesson!.code.length)
      cleanup()

      renderAt(`/cards/module/${deck[0].module}`)
      expect(screen.getAllByRole('link', { name: /^Feedback on this card/ }).length).toBeGreaterThan(0)
      cleanup()

      renderAt(`/cards/round?module=${deck[0].module}`)
      const card = screen.getByRole('link', { name: /^Feedback on this card/ })
      expect(issue(card).get('title')).toMatch(/^Feedback: Card z-/)
      cleanup()

      renderAt('/exam')
      fireEvent.click(screen.getByRole('button', { name: new RegExp(en.exam.start) }))
      expect(screen.getByRole('link', { name: /^Feedback on this question/ })).toBeTruthy()
    },
  )

  it.skipIf(!questions.length)('a practice session shows the first question and a disabled check button', () => {
    renderAt(`/practice/session?module=${questions[0].module}`)
    expect(screen.getByRole('button', { name: en.common.check })).toHaveProperty('disabled', true)
  })

  it.skipIf(!starterZettel.length)('home shows the flashcards with every starter card at the back', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: en.cardsPanel.title })).toBeTruthy()
    expect(screen.getByText(new RegExp(`of ${starterZettel.length} cards at the front`))).toBeTruthy()
  })

  it.skipIf(deck.length < 2)('a flashcard round asks multiple choice, explains every option and moves the card', () => {
    renderAt(`/cards/round?module=${deck[0].module}`)
    expect(screen.getByText(en.cards.sideFront)).toBeTruthy()
    const pick = (id: string, correct: boolean) => {
      const option = deck.find((z) => z.id === id)!.choices!.find((o) => o.correct === correct)!
      const radio = (screen.getAllByRole('radio') as HTMLInputElement[]).find((r) => plain(r.closest('label')!.textContent!).includes(plain(option.text.en)))!
      fireEvent.click(radio)
      return option
    }
    expect(screen.getByRole('button', { name: en.common.check })).toHaveProperty('disabled', true)
    const right = pick(deck[0].id, true)
    fireEvent.click(screen.getByRole('button', { name: en.common.check }))
    expect(screen.getByText(`${en.cards.right}!`)).toBeTruthy()
    expect(screen.getByText(plain(right.why.en).slice(0, 40), { exact: false })).toBeTruthy()
    expect(store.get().zettel[deck[0].id]?.fach).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.common.next) }))
    pick(deck[1].id, false)
    fireEvent.click(screen.getByRole('button', { name: en.common.check }))
    expect(screen.getByText(en.cards.wrong)).toBeTruthy()
    expect(store.get().zettel[deck[1].id]).toMatchObject({ fach: 1, wrong: 1 })
  })

  it('own cards without options are still turned and rated', () => {
    resetProgress('en', { ownZettel: [{ id: 'z-own-1', module: null, front: 'My question?', back: 'My answer.', createdAt: '2026-11-09T10:00:00Z' }] })
    renderAt('/cards/round?own=1')
    fireEvent.click(screen.getByRole('button', { name: new RegExp(en.cards.showAnswer) }))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${en.cards.knew}`) }))
    expect(store.get().zettel['z-own-1']?.fach).toBe(2)
  })

  it('the language toggle switches the UI and the content', () => {
    renderAt('/learn')
    expect(screen.getByRole('heading', { level: 1, name: en.learn.title })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'DE' }))
    expect(store.get().lang).toBe('de')
    expect(screen.getByRole('heading', { level: 1, name: 'Lernen' })).toBeTruthy()
    expect(document.documentElement.lang).toBe('de')
  })
})
