import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parseAst } from 'vite'
import { describe, expect, it } from 'vitest'

/**
 * Every word the interface shows comes from the dictionaries (src/i18n), the content (src/content) or exam.json.
 * This scans the code for copy that bypasses them: JSX text, UI attributes (aria-label, title, placeholder, alt)
 * with literal values, string literals rendered as JSX children, and prose-like string literals anywhere else.
 */
const SRC = join(process.cwd(), 'src')
/** Folders that are meant to hold copy. */
const COPY_DIRS = new Set(['content', 'i18n'])
const UI_ATTRS = new Set(['aria-label', 'title', 'placeholder', 'alt', 'aria-description', 'aria-roledescription', 'aria-valuetext'])
/** Attributes whose string values are technical and never read as copy. */
const TECH_ATTRS = new Set(['className', 'to', 'href', 'id', 'key', 'type', 'role', 'rel', 'target', 'name', 'htmlFor', 'lang', 'mode', 'viewBox', 'd', 'fill', 'stroke', 'xmlns', 'src', 'autoComplete', 'inputMode', 'dir', 'value', 'textAnchor', 'dominantBaseline', 'strokeLinecap', 'strokeLinejoin', 'transform'])
/** Calls whose string arguments are selectors, keys or patterns. */
const TECH_CALL = /(?:^console\.|(?:^|\.)(?:querySelector|querySelectorAll|getElementById|matchMedia|addEventListener|removeEventListener|setAttribute|getAttribute|getItem|setItem|removeItem|closest|matches|startsWith|endsWith|includes|split|replace|test|get|has)$)/
/** Strings that may appear in code: names that read the same in every language. Keep this list short. */
const ALLOWED = new Set<string>([])
const LETTER = /\p{L}/u
/** Looks like copy: two or more words, and capitalised, ending in sentence punctuation or using German letters. */
const PROSE = /^(?=.*\p{L}.*[\s\u00a0].*\p{L})(?:\p{Lu}|.*[äöüÄÖÜß]|.*\p{L}[.!?:]$)/u

type Node = { type: string; start: number; [key: string]: unknown }
interface Finding {
  where: string
  kind: string
  text: string
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return dir === SRC && COPY_DIRS.has(name) ? [] : sourceFiles(path)
    return /\.tsx?$/.test(name) && !/\.(generated|d)\.ts$/.test(name) ? [path] : []
  })
}

function scan(code: string, file: string): Finding[] {
  const ast = parseAst(code, { lang: file.endsWith('.tsx') ? 'tsx' : 'ts' }) as unknown as Node
  const out: Finding[] = []
  const add = (node: Node, kind: string, text: string) => {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (ALLOWED.has(clean)) return
    out.push({ where: `${relative(process.cwd(), file)}:${code.slice(0, node.start).split('\n').length}`, kind, text: clean })
  }
  const staticText = (n: Node | undefined): string | null => {
    if (n?.type === 'Literal' && typeof n.value === 'string') return n.value
    if (n?.type === 'TemplateLiteral') return (n.quasis as Array<{ value: { cooked: string | null } }>).map((q) => q.value.cooked ?? '').join('…')
    return null
  }
  const nameOf = (callee: Node | undefined): string => {
    if (!callee) return ''
    if (callee.type === 'Identifier') return String(callee.name)
    if (callee.type === 'MemberExpression') return `${nameOf(callee.object as Node)}.${String((callee.property as Node)?.name ?? '')}`
    return ''
  }

  function walk(node: unknown, parent: Node | null): void {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, parent))
    if (!node || typeof node !== 'object' || typeof (node as Node).type !== 'string') return
    const n = node as Node
    switch (n.type) {
      case 'ImportDeclaration':
      case 'ExportAllDeclaration':
      case 'TSTypeAliasDeclaration':
      case 'TSInterfaceDeclaration':
      case 'TSTypeAnnotation':
      case 'TSLiteralType':
        return
      case 'ExportNamedDeclaration':
        if (n.source) return
        break
      case 'CallExpression':
        if (TECH_CALL.test(nameOf(n.callee as Node))) return
        break
      case 'NewExpression':
        if (['RegExp', 'Error', 'URL', 'URLSearchParams'].includes(nameOf(n.callee as Node))) return
        break
      case 'JSXText':
        if (LETTER.test(String(n.value))) add(n, 'JSX text', String(n.value))
        return
      case 'JSXAttribute': {
        const attr = n.name as Node
        const name = attr.type === 'JSXNamespacedName' ? `${(attr.namespace as Node).name}:${(attr.name as Node).name}` : String(attr.name)
        if (TECH_ATTRS.has(name) || name.startsWith('data-') || /^on[A-Z]/.test(name)) return
        if (UI_ATTRS.has(name)) {
          const value = (n.value as Node | null)?.type === 'JSXExpressionContainer' ? ((n.value as Node).expression as Node) : (n.value as Node | undefined)
          const text = staticText(value)
          if (text && LETTER.test(text)) add(n, `${name} attribute`, text)
          if (value && value.type !== 'Literal' && value.type !== 'TemplateLiteral') walk(value, n)
          return
        }
        break
      }
      case 'JSXExpressionContainer':
        if (parent?.type === 'JSXElement' || parent?.type === 'JSXFragment') {
          const text = staticText(n.expression as Node)
          if (text && LETTER.test(text)) add(n, 'JSX string', text)
        }
        break
      case 'Property':
        return walk(n.value, n)
      case 'Literal':
        if (typeof n.value === 'string' && PROSE.test(n.value.trim())) add(n, 'string', n.value)
        return
      case 'TemplateLiteral': {
        const text = (n.quasis as Array<{ value: { cooked: string | null } }>).map((q) => q.value.cooked ?? '').join(' ')
        if (PROSE.test(text.trim())) add(n, 'template', text)
        return walk(n.expressions, n)
      }
    }
    for (const [key, child] of Object.entries(n)) if (key !== 'type' && child && typeof child === 'object') walk(child, n)
  }
  walk(ast, null)
  return out
}

describe('UI copy lives in the dictionaries', () => {
  const files = sourceFiles(SRC)

  it('scans the app code', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it('has no copy in code outside src/i18n and src/content', () => {
    const findings = files.flatMap((f) => scan(readFileSync(f, 'utf8'), f)).map((f) => `${f.where}  ${f.kind}: ${f.text}`)
    expect(findings, `\n${findings.join('\n')}\n`).toEqual([])
  })

  it('catches copy that bypasses the dictionaries, and only that', () => {
    const bad = scan(
      `const a = <p title="Weiter lesen" aria-label={'Open menu'}>Next up {'Zurück'}</p>
       const b = 'Hello there, learner.'
       const c = <img alt={\`Diagram \${n}\`} />`,
      join(SRC, 'probe.tsx'),
    )
    expect(bad.map((f) => f.kind).sort()).toEqual(['JSX string', 'JSX text', 'alt attribute', 'aria-label attribute', 'string', 'title attribute'])
    const good = scan(
      `const a = <p className="btn btn--primary" title={t.common.next} aria-label={t.nav.more}>{t.home.next} · {n}</p>
       const b = document.querySelector('.zk-flip .choice__main')
       const c = new RegExp('Start lesson')
       const d = { key: 'D1' }`,
      join(SRC, 'probe.tsx'),
    )
    expect(good).toEqual([])
  })
})
