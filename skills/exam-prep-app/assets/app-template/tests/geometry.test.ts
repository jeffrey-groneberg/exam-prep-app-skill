import { describe, expect, it } from 'vitest'
import { ARROW_CLEARANCE, borderPoint, edgePoints, insideOutline, labelRect, midpoint, outlinePoint, PILL_PAD, placeEdgeLabels, rectsOverlap, samplePolyline, segmentHitsRect, type Outlined, type Rect } from '../src/lib/geometry.ts'
import { textWidth } from '../src/lib/text-metrics.ts'

describe('diagram geometry', () => {
  const a: Rect = { x: 0, y: 0, w: 100, h: 50 }
  const b: Rect = { x: 300, y: 0, w: 100, h: 50 }

  it('anchors edges on the facing borders with a small gap', () => {
    const [x, y] = borderPoint(a, [350, 25], 0)
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(25)
    const pts = edgePoints({ from: 'a', to: 'b' }, new Map([['a', a], ['b', b]]))!
    expect(pts[0][0]).toBeCloseTo(102)
    expect(pts[1][0]).toBeCloseTo(296)
  })

  it('routes through via points and finds the midpoint by length', () => {
    const pts = edgePoints({ from: 'a', to: 'b', via: [[50, 200], [350, 200]] }, new Map([['a', a], ['b', b]]))!
    expect(pts).toHaveLength(4)
    const [mx, my] = midpoint(pts)
    expect(Math.abs(mx - 200)).toBeLessThan(3)
    expect(my).toBeCloseTo(200)
  })

  it('detects segments crossing a rectangle but not ones passing beside it', () => {
    const box: Rect = { x: 150, y: 0, w: 50, h: 50 }
    expect(segmentHitsRect([100, 25], [300, 25], box)).toBe(true)
    expect(segmentHitsRect([100, 80], [300, 80], box)).toBe(false)
    expect(segmentHitsRect([100, 25], [140, 25], box)).toBe(false)
  })

  it('sizes label pills like the renderer and tests overlap', () => {
    const r = labelRect('Entra ID', [200, 25])
    expect(r.w).toBe(Math.ceil(textWidth('Entra ID', 'edge')) + 2 * PILL_PAD)
    expect(r.h).toBe(20)
    expect(rectsOverlap(r, b)).toBe(false)
    expect(rectsOverlap(labelRect('a very very long label here', [250, 25]), b)).toBe(true)
  })

  it('attaches arrows to the drawn outline, not the bounding box', () => {
    const cyl: Outlined = { x: 0, y: 0, w: 100, h: 60, shape: 'store' }
    const top = outlinePoint(cyl, [50, -100], 0)
    expect(top[1]).toBeCloseTo(0, 0)
    const corner = outlinePoint(cyl, [200, -200], 0)
    expect(insideOutline(cyl, [corner[0] - 1, corner[1] + 1])).toBe(true)
    expect(corner[0]).toBeLessThan(100)
    const pill: Outlined = { x: 0, y: 0, w: 120, h: 40, shape: 'pill' }
    const p = outlinePoint(pill, [300, -40], 0)
    expect(Math.hypot(p[0] - 100, p[1] - 20)).toBeCloseTo(20, 0)
    expect(p[0]).toBeGreaterThan(100)
    const hex: Outlined = { x: 0, y: 0, w: 120, h: 40, shape: 'diamond' }
    const h = outlinePoint(hex, [120, 0], 0)
    expect(insideOutline(hex, [h[0] - 0.5, h[1] + 0.5])).toBe(true)
  })

  it('samples a polyline with arc lengths', () => {
    const s = samplePolyline([[0, 0], [10, 0], [10, 10]], 2)
    expect(s[0]).toEqual([0, 0, 0])
    expect(s[s.length - 1]).toEqual([10, 10, 20])
  })

  it('keeps a label on a long arrow and moves it beside a short one', () => {
    const left: Outlined = { x: 0, y: 100, w: 100, h: 60 }
    const far: Outlined = { x: 400, y: 100, w: 100, h: 60 }
    const near: Outlined = { x: 160, y: 100, w: 100, h: 60 }
    const canvas = { x: 0, y: 0, w: 600, h: 300 }
    const longPts = edgePoints({ from: 'l', to: 'f' }, new Map([['l', left], ['f', far]]))!
    const shortPts = edgePoints({ from: 'l', to: 'n' }, new Map([['l', left], ['n', near]]))!
    const [onLong] = placeEdgeLabels([{ id: 'e', text: 'calls', pts: longPts }], [{ id: 'e', pts: longPts }], [left, far], [], canvas)
    expect(onLong.mode).toBe('line')
    const [onShort] = placeEdgeLabels([{ id: 'e', text: 'calls', pts: shortPts }], [{ id: 'e', pts: shortPts }], [left, near], [], canvas)
    expect(onShort.mode).toBe('beside')
    expect(onShort.free).toBe(true)
    expect(onShort.box.y + onShort.box.h).toBeLessThan(130)
    expect(ARROW_CLEARANCE).toBeGreaterThanOrEqual(18)
  })
})
