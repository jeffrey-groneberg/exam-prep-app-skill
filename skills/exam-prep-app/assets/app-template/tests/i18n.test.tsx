// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { de } from '../src/i18n/de.ts'
import { en, type Messages } from '../src/i18n/en.ts'
import { messages } from '../src/i18n/index.ts'
import type { Lang } from '../src/lib/types.ts'
import { exam } from '../src/config.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

beforeAll(stubScrolling)
afterEach(() => cleanup())

type Leaf = { path: string; value: unknown }
function leaves(obj: unknown, path = ''): Leaf[] {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) return Object.entries(obj).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return [{ path, value: obj }]
}

describe('UI dictionaries', () => {
  const enLeaves = leaves(en)
  const deLeaves = leaves(de)

  it('have exactly the same keys', () => {
    expect(deLeaves.map((l) => l.path)).toEqual(enLeaves.map((l) => l.path))
  })

  it('have the same kind of value and the same parameters for every key', () => {
    const deByPath = new Map(deLeaves.map((l) => [l.path, l.value]))
    for (const { path, value } of enLeaves) {
      const other = deByPath.get(path)
      expect(typeof other, path).toBe(typeof value)
      if (typeof value === 'function') expect((other as (...a: unknown[]) => unknown).length, path).toBe(value.length)
      if (Array.isArray(value)) expect((other as unknown[]).length, path).toBe(value.length)
    }
  })

  it('have no empty strings', () => {
    const empty = [...enLeaves, ...deLeaves].filter((l) => typeof l.value === 'string' && !l.value.trim()).map((l) => l.path)
    expect(empty).toEqual([])
  })
})

/** Plain strings of a dictionary, including list items. */
function strings(dict: Messages): string[] {
  return leaves(dict).flatMap(({ value }) => (typeof value === 'string' ? [value] : Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [])).map((s) => s.trim())
}

/** UI strings only the other language uses: seeing one on this language's screen is a leak. */
function onlyIn(dict: Messages, other: Messages): Set<string> {
  const shared = new Set(strings(other))
  return new Set(strings(dict).filter((s) => s.length > 2 && !shared.has(s)))
}

/** Every element's own text plus the labels assistive technology reads. */
function uiTexts(root: HTMLElement): string[] {
  const out: string[] = []
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    const own = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent ?? '').join('').trim()
    if (own) out.push(own)
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      const v = el.getAttribute(attr)?.trim()
      if (v) out.push(v)
    }
  }
  return out
}

const GERMAN = /[äöüÄÖÜß]|\b(?:und|oder|nicht|noch|der|die|das|den|dem|ein|eine|mit|für|von|zum|zur|auf|ist|sind|alle|Frage|Fragen|Lektion|Prüfung|Zettel|Fach|Weiter|Zurück|Übersicht)\b/

const PAGES: Array<[string, (t: Messages) => string]> = [
  ['/', (t) => t.home.heading(exam.code)],
  ['/learn', (t) => t.learn.title],
  ['/practice', (t) => t.practice.title],
  ['/exam', (t) => t.exam.title],
  ['/review', (t) => t.review.title],
  ['/cards', (t) => t.cards.title],
  ['/progress', (t) => t.progress.title],
  ['/resources', (t) => t.resources.title],
  ['/coverage', (t) => t.coverage.title],
]

describe.each(['en', 'de'] as Lang[])('main pages in %s', (lang) => {
  const t = messages(lang)
  const leaks = onlyIn(messages(lang === 'en' ? 'de' : 'en'), t)
  beforeEach(() => resetProgress(lang))

  it.each(PAGES)('%s', (path, title) => {
    const { container } = renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title(t) })).toBeTruthy()
    expect(screen.getAllByText(t.nav.learn).length).toBeGreaterThan(0)
    expect(document.documentElement.lang).toBe(lang)
    const texts = uiTexts(container)
    expect(texts.filter((s) => leaks.has(s))).toEqual([])
    if (lang === 'en') expect(texts.filter((s) => GERMAN.test(s))).toEqual([])
  })
})
