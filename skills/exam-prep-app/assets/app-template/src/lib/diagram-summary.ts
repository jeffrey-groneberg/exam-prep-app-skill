import type { Diagram, DiagramNode } from './types.ts'

export interface SummaryStop {
  node: DiagramNode
  /** True when the diagram has an arrow from the previous stop to this one. */
  linked: boolean
}

/**
 * Three nodes for the Home thumbnail: start where the step-through starts and follow real arrows,
 * so the summary only draws an arrow where the diagram has one.
 */
export function summaryPath(d: Diagram, count = 3): SummaryStop[] {
  const byId = new Map(d.nodes.map((n) => [n.id, n]))
  const rank = new Map<string, number>()
  for (const s of d.steps) for (const id of s.focus) if (byId.has(id) && !rank.has(id)) rank.set(id, rank.size)
  const ordered = [...d.nodes].sort((a, b) => (rank.get(a.id) ?? 1e6 + a.y * 10 + a.x) - (rank.get(b.id) ?? 1e6 + b.y * 10 + b.x))
  const path: SummaryStop[] = []
  const used = new Set<string>()
  const add = (n: DiagramNode, linked: boolean) => {
    path.push({ node: n, linked })
    used.add(n.id)
  }
  if (!ordered.length) return path
  add(ordered[0], false)
  while (path.length < count && used.size < ordered.length) {
    const last = path[path.length - 1].node.id
    const next = d.edges
      .filter((e) => (e.from === last && !used.has(e.to)) || (e.bidir && e.to === last && !used.has(e.from)))
      .map((e) => byId.get(e.from === last ? e.to : e.from))
      .filter((n): n is DiagramNode => !!n)
      .sort((a, b) => ordered.indexOf(a) - ordered.indexOf(b))[0]
    if (next) add(next, true)
    else add(ordered.find((n) => !used.has(n.id))!, false)
  }
  return path
}

const ZWSP = '\u200b'

/**
 * Diagram labels use "\n" as a chosen line break; the thumbnail keeps those breaks and never drops a line.
 * Code-like tokens get break opportunities (after "/", "_", "." and at camelCase seams) so a narrow tile
 * wraps them at a sensible point instead of overflowing, and "·" never starts a line.
 */
export function summaryLines(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/([/_])(?=[^\s/_])/g, `$1${ZWSP}`)
        .replace(/\.(?=[A-Za-z])/g, `.${ZWSP}`)
        .replace(/([a-z])(?=[A-Z][a-z])/g, `$1${ZWSP}`)
        .replace(/ · /g, '\u00a0· '),
    )
    .join('\n')
}

export interface SummaryPart {
  text: string
  /** Code-like tokens (API names, paths) wrap only at their separators and are never hyphenated. */
  code: boolean
}

const CODE_LIKE = /[._/(){}<>=[\]]|[a-z][A-Z]|[A-Za-z]\d|\d[A-Za-z]|\u200b/

export function summaryParts(text: string): SummaryPart[] {
  const parts: SummaryPart[] = []
  for (const piece of summaryLines(text).split(/([ \n]+)/)) {
    if (!piece) continue
    const code = !/^[ \n]+$/.test(piece) && CODE_LIKE.test(piece)
    const last = parts[parts.length - 1]
    if (last && !last.code && !code) last.text += piece
    else parts.push({ text: piece, code })
  }
  return parts
}
