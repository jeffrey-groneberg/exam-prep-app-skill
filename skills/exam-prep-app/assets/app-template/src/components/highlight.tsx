import type { ReactNode } from 'react'

const PY_KEYWORDS = new Set(
  'False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '),
)
const PY_BUILTINS = new Set('print len range dict list str int float open set tuple isinstance enumerate zip super input'.split(' '))

const TOKEN = /("""[\s\S]*?"""|'''[\s\S]*?'''|f?"(?:[^"\\\n]|\\.)*"|f?'(?:[^'\\\n]|\\.)*'|#[^\n]*|\b\d+(?:\.\d+)?\b|@[A-Za-z_][\w.]*|\b[A-Za-z_]\w*\b)/g

/** Lightweight Python highlighter: keywords, strings, comments, numbers, calls, decorators. */
export function highlightPython(code: string): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of code.matchAll(TOKEN)) {
    const t = m[0]
    const start = m.index ?? 0
    if (start > last) out.push(code.slice(last, start))
    let cls: string | null = null
    if (t.startsWith('#')) cls = 'tok-comment'
    else if (/^f?["']/.test(t)) cls = 'tok-string'
    else if (/^\d/.test(t)) cls = 'tok-number'
    else if (t.startsWith('@')) cls = 'tok-decorator'
    else if (PY_KEYWORDS.has(t)) cls = 'tok-keyword'
    else if (PY_BUILTINS.has(t)) cls = 'tok-builtin'
    else if (code[start + t.length] === '(') cls = /^[A-Z]/.test(t) ? 'tok-class' : 'tok-call'
    else if (/^[A-Z][A-Za-z0-9]+$/.test(t)) cls = 'tok-class'
    out.push(
      cls ? (
        <span key={n++} className={cls}>
          {t}
        </span>
      ) : (
        t
      ),
    )
    last = start + t.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}
