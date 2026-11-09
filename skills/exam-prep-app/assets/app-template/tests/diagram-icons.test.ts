import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lessons } from '../src/content/index.ts'
import { DIAGRAM_ICONS, isDiagramIcon } from '../src/content/diagram-icons.ts'

const dir = new URL('../src/assets/diagram-icons/', import.meta.url)
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.svg')) : []
const registry: Record<string, { name: string; source: string }> = DIAGRAM_ICONS
const ids = Object.keys(registry)

describe('official diagram icons (optional)', () => {
  it('ships exactly one SVG per registered icon id', () => {
    expect(files.map((f) => f.replace(/\.svg$/, '')).sort()).toEqual([...ids].sort())
    for (const f of files) expect(readFileSync(new URL(f, dir), 'utf8')).toMatch(/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/)
  })

  it.skipIf(!ids.length)('lists every icon with its source file in NOTICE.md', () => {
    const notice = readFileSync(new URL('NOTICE.md', dir), 'utf8')
    for (const id of ids) expect(notice).toContain(registry[id].source.split('/').pop()!)
  })

  it('uses only registered icons, and every registered icon at least once', () => {
    const used = new Set(lessons.flatMap((l) => l.diagrams.flatMap((d) => d.nodes.flatMap((n) => (n.icon ? [n.icon as string] : [])))))
    expect([...used].filter((id) => !isDiagramIcon(id))).toEqual([])
    expect(ids.filter((id) => !used.has(id))).toEqual([])
  })
})
