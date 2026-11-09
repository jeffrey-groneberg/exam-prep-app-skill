// @vitest-environment jsdom
// A freshly scaffolded app: one domain, one learning path with one module, and no lessons, questions, cards or cases.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { en } from '../src/i18n/en.ts'
import { exam } from '../src/config.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

vi.mock('../src/content/domains.ts', () => ({
  domains: [
    {
      id: 'D1',
      title: { en: 'Plan the solution', de: 'Lösung planen' },
      short: { en: 'Plan', de: 'Planen' },
      weight: [40, 60],
      icon: 'cloud',
      groups: [{ id: '1.1', title: { en: 'Plan', de: 'Planen' }, bullets: [{ id: '1.1.1', en: 'Plan a solution', de: 'Eine Lösung planen' }] }],
    },
    {
      id: 'D2',
      title: { en: 'Run the solution', de: 'Lösung betreiben' },
      short: { en: 'Run', de: 'Betreiben' },
      weight: [40, 60],
      icon: 'brain',
      groups: [{ id: '2.1', title: { en: 'Run', de: 'Betreiben' }, bullets: [{ id: '2.1.1', en: 'Run a solution', de: 'Eine Lösung betreiben' }] }],
    },
  ],
}))

vi.mock('../src/content/course.ts', () => ({
  CATALOG_RETRIEVED: '',
  learningPaths: [{ id: 'p1', uid: 'learn.test.p1', title: 'First path', url: 'https://learn.microsoft.com/en-us/training/paths/p1/', modules: ['m1'] }],
  modules: [
    { id: 'm1', uid: 'learn.test.m1', title: 'First module', url: 'https://learn.microsoft.com/en-us/training/modules/m1/', minutes: 30, pathId: 'p1', units: ['Introduction', 'Summary'], skills: ['1.1.1', '2.1.1'] },
  ],
}))

vi.mock('../src/content/index.ts', async () => {
  const { outline } = await import('../src/content/outline.ts')
  return {
    questions: [],
    questionById: new Map(),
    cases: [],
    caseById: new Map(),
    lessons: [],
    lessonByModule: new Map(),
    orderedModules: outline.orderedModules,
    questionsForModule: () => [],
    questionsForBullet: () => [],
    starterZettel: [],
  }
})

beforeAll(stubScrolling)
beforeEach(() => resetProgress('en'))
afterEach(() => cleanup())

describe('an app with an outline but no content yet', () => {
  it.each([
    ['/', en.home.heading('')],
    ['/learn', en.learn.title],
    ['/learn/m1', 'First module'],
    ['/practice', en.practice.title],
    ['/exam', en.exam.title],
    ['/review', en.review.title],
    ['/cards', en.cards.title],
    ['/cards/module/m1', 'First module'],
    ['/progress', en.progress.title],
    ['/coverage', en.coverage.title],
    ['/resources', en.resources.title],
  ])('%s renders', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: new RegExp(title) })).toBeTruthy()
  })

  it('home points at the first module and its coming lesson', () => {
    renderAt('/')
    expect(screen.getAllByText('First module').length).toBeGreaterThan(0)
    expect(screen.getByText(en.home.lessonComing)).toBeTruthy()
  })

  it('home sizes the exam to the bank and says the card box is still empty', () => {
    renderAt('/')
    expect(screen.getByText(en.home.simulationMeta(0, exam.exam.minutes))).toBeTruthy()
    expect(screen.getByText(en.cards.noCards)).toBeTruthy()
    expect(screen.queryByText(en.cardsPanel.allFront)).toBeNull()
  })

  it('a module without a lesson lists the official units', () => {
    renderAt('/learn/m1')
    expect(screen.getByRole('heading', { name: en.lesson.comingTitle })).toBeTruthy()
    expect(screen.getByText('Introduction')).toBeTruthy()
  })

  it('the exam cannot start without questions and says why', () => {
    renderAt('/exam')
    expect(screen.getByRole('button', { name: new RegExp(en.exam.start) })).toHaveProperty('disabled', true)
    expect(screen.getByText(en.exam.noQuestions)).toBeTruthy()
  })

  it('sessions and rounds without questions or cards show an empty state', () => {
    renderAt('/practice/session?module=m1')
    expect(screen.getByRole('heading', { name: en.session.emptyTitle })).toBeTruthy()
    cleanup()
    renderAt('/review/session')
    expect(screen.getByRole('heading', { name: en.session.emptyTitle })).toBeTruthy()
    cleanup()
    renderAt('/cards/round')
    expect(screen.getByRole('heading', { level: 1, name: en.cards.noCards })).toBeTruthy()
  })
})
