import { describe, expect, it } from 'vitest'
import { lessons } from '../src/content/index.ts'
import { summaryLines, summaryParts, summaryPath } from '../src/lib/diagram-summary.ts'
import { tx } from '../src/i18n/index.ts'
import type { Diagram } from '../src/lib/types.ts'

const hasEdge = (d: Diagram, from: string, to: string) =>
  d.edges.some((e) => (e.from === from && e.to === to) || (e.bidir && e.from === to && e.to === from))

describe('Home thumbnail summary', () => {
  it('starts where the step-through starts and draws an arrow exactly where the diagram has one', () => {
    const problems: string[] = []
    for (const lesson of lessons) {
      const d = lesson.diagrams[0]
      const path = summaryPath(d)
      const ids = path.map((p) => p.node.id)
      if (path.length !== Math.min(3, d.nodes.length)) problems.push(`${lesson.module}: ${path.length} stops`)
      if (new Set(ids).size !== ids.length) problems.push(`${lesson.module}: repeated node`)
      const firstFocus = d.steps.flatMap((s) => s.focus).find((id) => d.nodes.some((n) => n.id === id))
      if (firstFocus && ids[0] !== firstFocus) problems.push(`${lesson.module}: starts at ${ids[0]}, step-through starts at ${firstFocus}`)
      path.forEach((stop, i) => {
        if (i === 0) return
        const linked = hasEdge(d, ids[i - 1], stop.node.id)
        if (stop.linked !== linked) problems.push(`${lesson.module}: ${ids[i - 1]} → ${stop.node.id} drawn ${stop.linked} but edge ${linked}`)
      })
    }
    expect(problems).toEqual([])
  })

  it('keeps every line of labels and subs', () => {
    const squash = (s: string) => s.replace(/\u200b/g, '').replace(/[\s\u00a0]+/g, ' ').trim()
    for (const lesson of lessons) {
      for (const { node } of summaryPath(lesson.diagrams[0])) {
        for (const lang of ['de', 'en'] as const) {
          for (const t of [node.label, node.sub]) {
            if (!t) continue
            const full = tx(t, lang)
            const shown = summaryLines(full)
            expect(shown.split('\n')).toHaveLength(full.split('\n').length)
            expect(squash(shown)).toBe(squash(full))
            expect(shown).not.toMatch(/\n\u00a0?·/)
            expect(summaryParts(full).map((p) => p.text).join('')).toBe(shown)
          }
        }
      }
    }
  })

  it('marks API names and paths as code, so only natural words hyphenate', () => {
    const code = (t: string) => summaryParts(t).filter((p) => p.code).map((p) => p.text.replace(/\u200b/g, ''))
    expect(code('audio.transcriptions.create()')).toEqual(['audio.transcriptions.create()'])
    expect(code('PUT …/analyzers/{id}')).toEqual(['…/analyzers/{id}'])
    expect(code('A2ACardResolver · A2AAgent')).toEqual(['A2ACardResolver\u00a0·', 'A2AAgent'])
    expect(code('Rauschunterdrückung · Echounterdrückung')).toEqual([])
    expect(summaryLines('knowledge_base_retrieve')).toBe('knowledge_\u200bbase_\u200bretrieve')
  })
})
