import { exam } from '../config.ts'
import { messages } from '../i18n/index.ts'
import type { Lang } from './types.ts'

/**
 * Feedback opens a new issue in the app's public repository (exam.json feedback.issuesUrl), so anyone with a
 * GitHub account can report a problem. Empty: the app shows no feedback links.
 */
export const ISSUES_NEW_URL: string = exam.feedback?.issuesUrl?.trim() ?? ''

/** Feedback links render only when exam.json names an issues URL. */
export const feedbackEnabled = ISSUES_NEW_URL !== ''

/** Short commit of this build; Vite replaces it at build time (see vite.config.ts). */
declare const __APP_VERSION__: string | undefined
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'

export interface FeedbackTarget {
  /** Where the problem is, e.g. "Question q-agents-vscode-03" or "Lesson agents-vscode · Core concepts". */
  subject: string
  /** Facts that locate the problem, listed in the issue. */
  details?: ReadonlyArray<readonly [string, string]>
  /** The text the learner saw, in the language shown. */
  excerpt?: string
}

const MAX_EXCERPT = 160

function clip(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > MAX_EXCERPT ? `${flat.slice(0, MAX_EXCERPT - 1)}…` : flat
}

/**
 * A prefilled "new issue" link: the learner only describes the problem, the app adds where it happened.
 * Headings and labels follow the language shown (the toggle switches UI and content together).
 * Returns '' when no issues URL is configured.
 */
export function feedbackUrl(
  target: FeedbackTarget,
  context: { lang: Lang; page: string; version?: string; issuesUrl?: string },
): string {
  const issuesUrl = context.issuesUrl ?? ISSUES_NEW_URL
  if (!issuesUrl) return ''
  const f = messages(context.lang).feedback.issue
  const body = [
    `### ${f.what}`,
    `<!-- ${f.hint} -->`,
    '',
    '',
    `### ${f.where}`,
    `- ${f.area}: ${target.subject}`,
    ...(target.details ?? []).map(([key, value]) => `- ${key}: ${value}`),
    ...(target.excerpt ? [`- ${f.text}: ${f.quote(clip(target.excerpt))}`] : []),
    `- ${f.page}: ${context.page}`,
    `- ${f.language}: ${f.languageName[context.lang]}`,
    `- ${f.version}: ${context.version ?? APP_VERSION}`,
  ].join('\n')
  const params = new URLSearchParams({ title: `Feedback: ${target.subject}`, body, labels: 'feedback' })
  return `${issuesUrl}?${params.toString()}`
}
