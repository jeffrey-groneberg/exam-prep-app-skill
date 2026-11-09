import type { ReactNode } from 'react'

/**
 * Inline markdown-lite: **bold**, *italic*, `code` and [links](https://…).
 * Produces React nodes only (no HTML injection).
 */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    const token = m[0]
    const start = m.index ?? 0
    if (start > last) out.push(text.slice(last, start))
    const key = `${keyPrefix}-${n++}`
    if (token.startsWith('`')) out.push(<code key={key}>{token.slice(1, -1)}</code>)
    else if (token.startsWith('**')) out.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>)
    else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']('))
      const href = token.slice(token.indexOf('](') + 2, -1)
      out.push(
        <a key={key} href={href} target="_blank" rel="noreferrer">
          {renderInline(label, key)}
        </a>,
      )
    } else out.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>)
    last = start + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
