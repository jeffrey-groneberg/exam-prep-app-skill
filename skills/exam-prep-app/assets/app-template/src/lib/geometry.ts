import type { DiagramEdge, NodeShape } from './types.ts'
import { textWidth } from './text-metrics.ts'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}
export type Pt = [number, number]

/** A node or group as drawn: its box plus the outline that arrows attach to. */
export interface Outlined extends Rect {
  shape?: NodeShape
  /** Corner radius of box-like outlines (nodes 8, groups 12). */
  radius?: number
}

export const NODE_RADIUS = 8
export const GROUP_RADIUS = 12
export const DIAMOND_INSET = 14
export const DOC_FOLD = 14
export const LINE_H = 18
export const SUB_H = 16
/** Horizontal padding between an edge label and its pill border. */
export const PILL_PAD = 9
export const PILL_H = 20

/** Height of a cylinder's elliptical cap. */
export function storeCap(h: number): number {
  return Math.min(8, h / 7)
}

export function center(r: Rect): Pt {
  return [r.x + r.w / 2, r.y + r.h / 2]
}

/** Point where the ray from the rect's center toward `p` leaves the rect, pushed out by `gap`. */
export function borderPoint(r: Rect, p: Pt, gap = 3): Pt {
  const [cx, cy] = center(r)
  const dx = p[0] - cx
  const dy = p[1] - cy
  if (dx === 0 && dy === 0) return [cx, cy]
  const t = Math.min(dx !== 0 ? r.w / 2 / Math.abs(dx) : Infinity, dy !== 0 ? r.h / 2 / Math.abs(dy) : Infinity)
  const len = Math.hypot(dx, dy)
  return [cx + dx * t + (dx / len) * gap, cy + dy * t + (dy / len) * gap]
}

function roundedRect(x: number, y: number, w: number, h: number, radius: number): Pt[] {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2))
  const pts: Pt[] = []
  const arc = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = a0 + ((Math.PI / 2) * i) / 6
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
    }
  }
  arc(x + w - r, y + r, -Math.PI / 2)
  arc(x + w - r, y + h - r, 0)
  arc(x + r, y + h - r, Math.PI / 2)
  arc(x + r, y + r, Math.PI)
  return pts
}

/** Convex outline polygon of a node or group exactly as the renderer draws it. */
export function outline(s: Outlined): Pt[] {
  const { x, y, w, h } = s
  switch (s.shape) {
    case 'pill':
      return roundedRect(x, y, w, h, h / 2)
    case 'store': {
      const e = storeCap(h)
      const cx = x + w / 2
      const pts: Pt[] = []
      for (let i = 0; i <= 24; i++) {
        const a = Math.PI + (Math.PI * i) / 24
        pts.push([cx + (w / 2) * Math.cos(a), y + e + e * Math.sin(a)])
      }
      for (let i = 0; i <= 24; i++) {
        const a = (Math.PI * i) / 24
        pts.push([cx + (w / 2) * Math.cos(a), y + h - e + e * Math.sin(a)])
      }
      return pts
    }
    case 'diamond': {
      const p = DIAMOND_INSET
      return [
        [x + p, y],
        [x + w - p, y],
        [x + w, y + h / 2],
        [x + w - p, y + h],
        [x + p, y + h],
        [x, y + h / 2],
      ]
    }
    case 'doc': {
      const f = DOC_FOLD
      return [
        [x, y],
        [x + w - f, y],
        [x + w, y + f],
        [x + w, y + h],
        [x, y + h],
      ]
    }
    default:
      return roundedRect(x, y, w, h, s.radius ?? NODE_RADIUS)
  }
}

/** Point where the ray from the shape's center toward `toward` leaves its outline, pushed out by `gap`. */
export function outlinePoint(s: Outlined, toward: Pt, gap = 3): Pt {
  const c = center(s)
  const dx = toward[0] - c[0]
  const dy = toward[1] - c[1]
  const len = Math.hypot(dx, dy)
  if (!len) return c
  const ux = dx / len
  const uy = dy / len
  const poly = outline(s)
  let best = Infinity
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const ex = b[0] - a[0]
    const ey = b[1] - a[1]
    const den = ux * ey - uy * ex
    if (Math.abs(den) < 1e-9) continue
    const ax = a[0] - c[0]
    const ay = a[1] - c[1]
    const t = (ax * ey - ay * ex) / den
    const u = (ax * uy - ay * ux) / den
    if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9 && t < best) best = t
  }
  if (!Number.isFinite(best)) return borderPoint(s, toward, gap)
  return [c[0] + ux * (best + gap), c[1] + uy * (best + gap)]
}

/** Is `p` inside the shape's outline? (Convex polygon test.) */
export function insideOutline(s: Outlined, p: Pt, margin = 0): boolean {
  const poly = outline(s)
  let sign = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const ex = b[0] - a[0]
    const ey = b[1] - a[1]
    const el = Math.hypot(ex, ey)
    if (!el) continue
    const cross = (ex * (p[1] - a[1]) - ey * (p[0] - a[0])) / el
    if (sign === 0) sign = Math.sign(cross) || 0
    const signed = sign === 0 ? cross : cross * sign
    if (signed < margin) return false
  }
  return true
}

/** Polyline of an edge exactly as the renderer draws it. */
export function edgePoints(e: Pick<DiagramEdge, 'from' | 'to' | 'via'>, shapes: Map<string, Outlined>): Pt[] | null {
  const a = shapes.get(e.from)
  const b = shapes.get(e.to)
  if (!a || !b) return null
  const via = (e.via ?? []) as Pt[]
  const first = via[0] ?? center(b)
  const last = via[via.length - 1] ?? center(a)
  return [outlinePoint(a, first, 2), ...via, outlinePoint(b, last, 4)]
}

export function polylineLength(pts: Pt[]): number {
  let total = 0
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return total
}

/** Points every `step` units along the polyline, each with its arc length. */
export function samplePolyline(pts: Pt[], step = 2): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = []
  let s0 = 0
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const seg = Math.hypot(bx - ax, by - ay)
    for (let d = 0; d < seg; d += step) out.push([ax + ((bx - ax) * d) / seg, ay + ((by - ay) * d) / seg, s0 + d])
    s0 += seg
  }
  const last = pts[pts.length - 1]
  out.push([last[0], last[1], s0])
  return out
}

export function midpoint(pts: Pt[]): Pt {
  let half = polylineLength(pts) / 2
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    if (half <= seg) {
      const t = seg ? half / seg : 0
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]
    }
    half -= seg
  }
  return pts[0]
}

/** Box of an edge label pill centered on the edge midpoint (matches the renderer). */
export function labelRect(text: string, mid: Pt): Rect {
  const w = Math.max(28, Math.ceil(textWidth(text, 'edge')) + 2 * PILL_PAD)
  return { x: mid[0] - w / 2, y: mid[1] - PILL_H / 2, w, h: PILL_H }
}

/** Arrow length that must stay visible on each side of a label sitting on its arrow. */
export const ARROW_CLEARANCE = 20

/** Unit direction of the polyline at arc length `at`. */
export function directionAt(pts: Pt[], at: number): Pt {
  let rest = at
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i - 1][0]
    const dy = pts[i][1] - pts[i - 1][1]
    const seg = Math.hypot(dx, dy)
    if (seg && (rest <= seg || i === pts.length - 1)) return [dx / seg, dy / seg]
    rest -= seg
  }
  return [1, 0]
}

export interface LabelItem {
  id: string
  text: string
  pts: Pt[]
}

export interface PlacedLabel {
  id: string
  text: string
  box: Rect
  /** `line`: centered on the arrow; `beside`: next to it because the arrow is too short or crowded. */
  mode: 'line' | 'beside'
  /** False when no candidate spot was free (the validator reports why). */
  free: boolean
}

function rectAround(c: Pt, w: number, h: number): Rect {
  return { x: c[0] - w / 2, y: c[1] - h / 2, w, h }
}

/**
 * Places edge labels exactly as the renderer draws them: on the arrow's midpoint when enough arrow stays
 * visible, otherwise beside it (above/right first, then below/left), avoiding nodes, group titles,
 * other labels and other arrows. Renderer and validator share this function.
 */
export function placeEdgeLabels(
  items: LabelItem[],
  paths: Array<{ id: string; pts: Pt[] }>,
  nodes: Outlined[],
  blocked: Rect[],
  canvas: Rect,
): PlacedLabel[] {
  const samples = new Map(paths.map((p) => [p.id, samplePolyline(p.pts, 2)]))
  const placed: PlacedLabel[] = []
  const grid = (b: Rect): Pt[] => {
    const g: Pt[] = []
    for (let i = 0; i <= 8; i++) for (let j = 0; j <= 2; j++) g.push([b.x + (b.w * i) / 8, b.y + (b.h * j) / 2])
    return g
  }
  for (const it of items) {
    const len = polylineLength(it.pts)
    const mid = midpoint(it.pts)
    const [dx, dy] = directionAt(it.pts, len / 2)
    const { w, h } = labelRect(it.text, mid)
    const along = Math.abs(dx) * (w / 2) + Math.abs(dy) * (h / 2)
    const onLine = rectAround(mid, w, h)
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    const sideA = horizontal ? rectAround([mid[0], mid[1] - h / 2 - 5], w, h) : rectAround([mid[0] + w / 2 + 7, mid[1]], w, h)
    const sideB = horizontal ? rectAround([mid[0], mid[1] + h / 2 + 5], w, h) : rectAround([mid[0] - w / 2 - 7, mid[1]], w, h)
    const free = (box: Rect, mode: PlacedLabel['mode']) => {
      if (!rectContains(canvas, box)) return false
      if (blocked.some((b) => rectsOverlap(box, b, 1))) return false
      if (placed.some((p) => rectsOverlap(box, p.box, 2))) return false
      const pts = grid(box)
      if (nodes.some((n) => rectsOverlap(box, n) && pts.some((p) => insideOutline(n, p)))) return false
      for (const [id, pts] of samples) {
        if (id === it.id && mode === 'line') continue
        if (pts.some(([x, y]) => pointInRect(box, [x, y], -1))) return false
      }
      return true
    }
    const candidates: Array<{ box: Rect; mode: PlacedLabel['mode'] }> = []
    if (len / 2 - along >= ARROW_CLEARANCE) candidates.push({ box: onLine, mode: 'line' })
    candidates.push({ box: sideA, mode: 'beside' }, { box: sideB, mode: 'beside' })
    const pick = candidates.find((c) => free(c.box, c.mode))
    placed.push(pick ? { id: it.id, text: it.text, ...pick, free: true } : { id: it.id, text: it.text, box: onLine, mode: 'line', free: false })
  }
  return placed
}

/** Box of a group title (drawn at x+14, baseline y+20). */
export function groupTitleRect(g: Rect, text: string): Rect {
  return { x: g.x + 14, y: g.y + 7, w: textWidth(text, 'group'), h: 17 }
}

/** Baseline of the first label line and the horizontal text center for a node (matches the renderer). */
export function nodeTextLayout(n: Outlined, labelLines: number, subLines: number): { cx: number; top: number; blockH: number } {
  const blockH = labelLines * LINE_H + subLines * SUB_H
  const shift = n.shape === 'store' ? storeCap(n.h) : 0
  return { cx: n.x + n.w / 2, top: n.y + n.h / 2 - blockH / 2 + 13 + shift, blockH }
}

/** Size of an official product icon in a node, and the gap to its label. */
export const ICON_SIZE = 18
export const ICON_GAP = 6
/** Horizontal room the icon takes beside the label lines. */
export const ICON_SLOT = ICON_SIZE + ICON_GAP

export interface NodeContentLayout {
  /** Text axis of the sub lines. */
  cx: number
  /** Baseline of the first label line. */
  top: number
  blockH: number
  /** Centre of the label lines (right of the icon when there is one). */
  labelCx: number
  /** Widest label line. */
  labelW: number
  /** Where the icon goes; null for a node without an icon. */
  icon: Rect | null
}

/**
 * Icon and label lines sit side by side, centred as one group on the node's text axis; sub lines run the full
 * width below. Without an icon the label lines centre on the axis. Renderer, validator and render audit all use
 * this one layout.
 */
export function nodeContentLayout(n: Outlined, label: string[], sub: string[], withIcon = false): NodeContentLayout {
  const { cx, top, blockH } = nodeTextLayout(n, label.length, sub.length)
  const labelW = Math.max(0, ...label.map((l) => textWidth(l, 'label')))
  const slot = withIcon ? ICON_SLOT : 0
  const left = cx - (slot + labelW) / 2
  // Optically centred on the label text: its cap-height centre sits about 5px above each baseline.
  const labelCenter = top - 5 + ((label.length - 1) * LINE_H) / 2
  return {
    cx,
    top,
    blockH,
    labelCx: left + slot + labelW / 2,
    labelW,
    icon: withIcon ? { x: left, y: labelCenter - ICON_SIZE / 2, w: ICON_SIZE, h: ICON_SIZE } : null,
  }
}

export function rectsOverlap(a: Rect, b: Rect, pad = 0): boolean {
  return a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad
}

export function rectContains(outer: Rect, inner: Rect, tol = 0): boolean {
  return inner.x >= outer.x - tol && inner.y >= outer.y - tol && inner.x + inner.w <= outer.x + outer.w + tol && inner.y + inner.h <= outer.y + outer.h + tol
}

export function pointInRect(r: Rect, p: Pt, pad = 0): boolean {
  return p[0] >= r.x - pad && p[0] <= r.x + r.w + pad && p[1] >= r.y - pad && p[1] <= r.y + r.h + pad
}

/** Liang–Barsky clip test: does segment p→q pass through the (shrunk) rectangle? */
export function segmentHitsRect(p: Pt, q: Pt, r: Rect, inset = 2): boolean {
  const x0 = r.x + inset
  const y0 = r.y + inset
  const x1 = r.x + r.w - inset
  const y1 = r.y + r.h - inset
  if (x1 <= x0 || y1 <= y0) return false
  const dx = q[0] - p[0]
  const dy = q[1] - p[1]
  let t0 = 0
  let t1 = 1
  const clip = (pp: number, qq: number) => {
    if (pp === 0) return qq >= 0
    const t = qq / pp
    if (pp < 0) {
      if (t > t1) return false
      if (t > t0) t0 = t
    } else {
      if (t < t0) return false
      if (t < t1) t1 = t
    }
    return true
  }
  return clip(-dx, p[0] - x0) && clip(dx, x1 - p[0]) && clip(-dy, p[1] - y0) && clip(dy, y1 - p[1]) && t0 < t1
}
