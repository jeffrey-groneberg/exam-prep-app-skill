import { useState } from 'react'
import { Icon } from './Icon.tsx'
import { highlightPython } from './highlight.tsx'
import { useT } from '../i18n/index.ts'
import { exam } from '../config.ts'
import { FeedbackLink } from './Feedback.tsx'
import type { FeedbackTarget } from '../lib/feedback.ts'

interface CodeBlockProps {
  code: string
  /** Defaults to exam.json codeLanguage; "Python" is highlighted, anything else is shown as plain text. */
  language?: string
  caption?: string
  /** Lesson code samples get their own feedback link; question code is covered by the question's link. */
  feedback?: FeedbackTarget
}

export function CodeBlock({ code, language = exam.codeLanguage ?? '', caption, feedback }: CodeBlockProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const python = language.toLowerCase() === 'python'
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <figure className="code-block">
      <div className="code-block__bar">
        <span className="code-block__lang">{caption ?? (language || t.code.text)}</span>
        {feedback && <FeedbackLink about="code" compact target={feedback} />}
        <button type="button" className="btn btn--subtle btn--small" onClick={copy} aria-live="polite">
          <Icon name={copied ? 'check' : 'document'} size={16} />
          {copied ? t.code.copied : t.code.copy}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{python ? highlightPython(code) : code}</code>
      </pre>
    </figure>
  )
}
