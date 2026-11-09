import { useLang } from '../lib/store.ts'
import type { Lang, Text } from '../lib/types.ts'
import { de } from './de.ts'
import { en, type Messages } from './en.ts'

export type { Messages }

/** UI dictionaries; the language toggle switches the UI and the content together. */
export const dictionaries: Record<Lang, Messages> = { de, en }

/** Order of the language toggle. */
export const LANGS: Lang[] = ['de', 'en']

export function messages(lang: Lang): Messages {
  return dictionaries[lang] ?? en
}

/** The UI copy in the learner's current language. */
export function useT(): Messages {
  return messages(useLang())
}

/** Picks the language from localized content text; plain strings (product names, code) are the same in both. */
export function tx(t: Text | undefined, lang: Lang): string {
  if (t === undefined) return ''
  return typeof t === 'string' ? t : t[lang] || t.en
}
