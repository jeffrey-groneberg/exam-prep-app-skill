import { Fragment } from 'react'
import { renderInline } from './inline.tsx'

/** Markdown-lite blocks for content strings: paragraphs and "- " bullet lists; inline syntax via renderInline. */
interface RichTextProps {
  text: string
  className?: string
  /** Render a single paragraph inline (no <p> wrapper). */
  inline?: boolean
  /** Language of the content (the UI chrome stays German). */
  lang?: string
}

export function RichText({ text, className, inline, lang }: RichTextProps) {
  if (inline)
    return (
      <span className={className} lang={lang}>
        {renderInline(text)}
      </span>
    )
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  return (
    <div className={className ? `rich ${className}` : 'rich'} lang={lang}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n')
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*[-•]\s+/, ''), `${bi}-${li}`)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
