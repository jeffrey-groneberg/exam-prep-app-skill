// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, screen } from '@testing-library/react'
import { legacyTarget } from '../src/lib/legacy-routes.ts'
import { lessons, questions, starterZettel } from '../src/content/index.ts'
import { moduleById } from '../src/content/outline.ts'
import { en } from '../src/i18n/en.ts'
import { exam } from '../src/config.ts'
import { renderAt, resetProgress, stubScrolling } from './helpers.tsx'

describe('old German routes', () => {
  it.each([
    ['/lernen', '', '', '/learn'],
    ['/lernen/foundry-iq', '?abschnitt=fallen', '', '/learn/foundry-iq?section=traps'],
    ['/lernen/foundry-iq', '', '#merke', '/learn/foundry-iq#takeaways'],
    ['/lernen/foundry-iq%23bild', '', '', '/learn/foundry-iq%23diagrams'],
    ['/ueben', '', '', '/practice'],
    ['/ueben/sitzung', '?modul=a2a,web-iq&schwierigkeit=2&typ=single&neu=1&runde=10', '', '/practice/session?module=a2a%2Cweb-iq&difficulty=2&type=single&new=1&count=10'],
    ['/ueben/sitzung', '?skill=2.1.3&domain=D2&ids=q-a-01,q-a-02', '', '/practice/session?skill=2.1.3&domain=D2&ids=q-a-01%2Cq-a-02'],
    ['/pruefung', '', '', '/exam'],
    ['/pruefung/laeuft', '', '', '/exam/run'],
    ['/pruefung/ergebnis/e-123', '', '', '/exam/result/e-123'],
    ['/wiederholen', '', '', '/review'],
    ['/wiederholen/sitzung', '?falsch=1', '', '/review/session?wrong=1'],
    ['/fortschritt', '', '', '/progress'],
    ['/abdeckung', '', '', '/coverage'],
    ['/ressourcen', '', '', '/resources'],
    ['/zettel', '?neu=1', '', '/cards?new=1'],
    ['/zettel/lernen', '?pfad=agents', '', '/cards/round?path=agents'],
    ['/zettel/lernen', '?eigene=1', '', '/cards/round?own=1'],
    ['/zettel/eigene', '', '', '/cards/own'],
    ['/zettel/modul/a2a', '', '', '/cards/module/a2a'],
  ])('%s%s%s → %s', (path, search, hash, target) => {
    expect(legacyTarget(path, search, hash)).toBe(target)
  })

  it('leave every other address alone', () => {
    for (const path of ['/', '/learn', '/learn/a2a', '/practice/session', '/cards', '/does-not-exist', '/lernenx']) expect(legacyTarget(path)).toBeNull()
  })
})

describe('old German deep links land on the same screen', () => {
  beforeAll(stubScrolling)
  beforeEach(() => resetProgress('en'))
  afterEach(() => cleanup())

  it.each([
    ['/lernen', en.learn.title],
    ['/ueben', en.practice.title],
    ['/pruefung', en.exam.title],
    ['/wiederholen', en.review.title],
    ['/fortschritt', en.progress.title],
    ['/abdeckung', en.coverage.title],
    ['/ressourcen', en.resources.title],
    ['/zettel', en.cards.title],
    ['/zettel/eigene', en.cards.ownCards],
  ])('%s', (path, title) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy()
  })

  it.skipIf(!lessons.length)('a lesson with its section', () => {
    const lesson = lessons[0]
    renderAt(`/lernen/${lesson.module}?abschnitt=fallen`)
    expect(screen.getByRole('heading', { level: 1, name: moduleById.get(lesson.module)!.title })).toBeTruthy()
  })

  it.skipIf(!questions.length)('a practice session of one module', () => {
    renderAt(`/ueben/sitzung?modul=${questions[0].module}&neu=1`)
    expect(screen.getByRole('button', { name: en.common.check })).toBeTruthy()
  })

  it.skipIf(!starterZettel.length)('a module tab of the card index', () => {
    const module = starterZettel[0].module!
    renderAt(`/zettel/modul/${module}`)
    expect(screen.getByRole('heading', { level: 1, name: moduleById.get(module)!.title })).toBeTruthy()
  })

  it('an unknown address still shows the not-found page', () => {
    renderAt('/gibt-es-nicht')
    expect(screen.getByRole('heading', { level: 1, name: en.notFound.title })).toBeTruthy()
    expect(document.title).toBe(en.meta.title(exam.appName))
  })
})
