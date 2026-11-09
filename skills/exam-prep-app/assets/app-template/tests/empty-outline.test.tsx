// @vitest-environment jsdom
// A scaffold before anything is filled in: no domains, no learning paths, no modules, no content.
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { en } from '../src/i18n/en.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

vi.mock('../src/content/domains.ts', () => ({ domains: [] }))
vi.mock('../src/content/course.ts', () => ({ CATALOG_RETRIEVED: '', learningPaths: [], modules: [] }))
vi.mock('../src/content/index.ts', () => ({
  questions: [],
  questionById: new Map(),
  cases: [],
  caseById: new Map(),
  lessons: [],
  lessonByModule: new Map(),
  orderedModules: [],
  questionsForModule: () => [],
  questionsForBullet: () => [],
  starterZettel: [],
}))

beforeAll(stubScrolling)
beforeEach(() => resetProgress('en'))
afterEach(() => cleanup())

describe('an empty scaffold', () => {
  it('home says there is no content yet', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: en.empty.title })).toBeTruthy()
    expect(screen.getAllByText(en.empty.modules).length).toBeGreaterThan(0)
  })

  it.each([
    ['/learn', en.learn.title, en.empty.modules],
    ['/coverage', en.coverage.title, en.empty.domains],
    ['/progress', en.progress.title, en.empty.domains],
    ['/cards', en.cards.title, en.cards.noPaths],
    ['/exam', en.exam.title, en.exam.noQuestions],
  ])('%s shows an empty state', (path, title, text) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  })

  it.each(['/practice', '/review', '/resources', '/learn/anything', '/cards/own', '/cards/round', '/practice/session'])('%s renders without content', (path) => {
    renderAt(path)
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
  })
})
