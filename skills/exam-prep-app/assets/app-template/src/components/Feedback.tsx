import { useSyncExternalStore } from 'react'
import type { Text } from '../lib/types.ts'
import { feedbackEnabled, feedbackUrl, type FeedbackTarget } from '../lib/feedback.ts'
import { tx, useT, type Messages } from '../i18n/index.ts'
import { useLang } from '../lib/store.ts'
import { Icon } from './Icon.tsx'

export type FeedbackAbout = keyof Messages['feedback']['about']

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** The current address including the hash route, so a report links back to the exact screen. */
function usePageUrl(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => '',
  )
}

interface FeedbackLinkProps {
  target: Omit<FeedbackTarget, 'excerpt'> & { excerpt?: Text }
  /** Completes the accessible name: "Feedback on this question …". */
  about: FeedbackAbout
  /** Icon only, for tight card headers; the accessible name still starts with "Feedback". */
  iconOnly?: boolean
  /** Hide the text below 560 px (icon stays). */
  compact?: boolean
  /** A plain text link inside running text (the footer), labelled from the dictionary. */
  plain?: boolean
}

/** Opens a prefilled GitHub issue for the thing it sits next to: a question, a lesson section, a diagram, a code sample or a card. */
export function FeedbackLink({ target, about, iconOnly = false, compact = false, plain = false }: FeedbackLinkProps) {
  const lang = useLang()
  const t = useT()
  const page = usePageUrl()
  if (!feedbackEnabled) return null
  const f = t.feedback
  const href = feedbackUrl({ ...target, excerpt: target.excerpt === undefined ? undefined : tx(target.excerpt, lang) }, { lang, page })
  if (plain) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={f.newTab(f.appLink)}>
        {f.appLink}
      </a>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`feedback-link${iconOnly ? ' feedback-link--icon' : ''}${compact ? ' feedback-link--compact' : ''}`}
      aria-label={f.name(f.about[about])}
      title={f.tooltip(f.about[about])}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon name="feedback" size={16} />
      {!iconOnly && <span className="feedback-link__text">{f.link}</span>}
    </a>
  )
}
