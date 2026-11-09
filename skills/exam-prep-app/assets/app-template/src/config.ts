import raw from './content/exam.json' with { type: 'json' }
import type { ExamConfig } from './lib/types.ts'

/** Everything exam-specific outside the content files: names, links, exam format, storage key and content targets. */
export const exam = raw as ExamConfig

/** The footer credits the agent skill that builds apps like this one; set it to '' to drop the line. */
export const SKILL_CREDIT_URL: string = 'https://github.com/jeffrey-groneberg/exam-prep-app-skill'

/** "April 16, 2026": dates quoted from the English study guide ("Skills measured as of …"). */
export function outlineDateEn(iso: string = exam.skillsOutlineDate): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
