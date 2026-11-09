import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { App } from '../src/App.tsx'
import { initialState, store } from '../src/lib/store.ts'
import type { Lang } from '../src/lib/types.ts'

/** jsdom lacks scrolling; the app calls it on every navigation. */
export function stubScrolling() {
  window.scrollTo = () => undefined
  Element.prototype.scrollIntoView = () => undefined
}

/** Fresh progress in the given language. */
export function resetProgress(lang: Lang = 'en', extra: Record<string, unknown> = {}) {
  store.importJson(JSON.stringify({ ...initialState(), lang, ...extra }))
}

export function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}
