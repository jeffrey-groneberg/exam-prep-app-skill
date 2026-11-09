import titles from './source-titles.json'
import { exam } from '../config.ts'

const TITLES = titles as Record<string, string>

export interface SourceLabelOptions {
  /** Fetched page titles by URL (src/content/source-titles.json). */
  titles?: Record<string, string>
  /** Doc set label per Learn path prefix (exam.json sourceDocsets). */
  docsets?: ReadonlyArray<{ prefix: string; label: string }>
}

/** Link text for a cited Learn URL: "<doc set>: <page title>", falling back to the URL slug. */
export function sourceLabel(url: string, opts: SourceLabelOptions = {}): string {
  const key = url.split('#')[0]
  let path = ''
  let slug = url
  try {
    const u = new URL(key)
    path = u.pathname.replace(/^\/[a-z]{2}-[a-z]{2}(?=\/)/, '')
    const parts = path.split('/').filter(Boolean)
    slug = (parts[parts.length - 1] ?? u.hostname).replace(/-/g, ' ')
  } catch {
    return url
  }
  const title = (opts.titles ?? TITLES)[key] ?? slug
  const docset = (opts.docsets ?? exam.sourceDocsets).find((d) => path.startsWith(d.prefix))?.label ?? 'Learn'
  return title.toLowerCase().includes(docset.toLowerCase()) ? title : `${docset}: ${title}`
}

export function hasSourceTitle(url: string, titles: Record<string, string> = TITLES): boolean {
  return url.split('#')[0] in titles
}
