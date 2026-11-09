// Render audit for every lesson diagram (EN + DE): measures the real SVG in Chromium and reports text
// overflow, labels hiding arrowheads, arrows through nodes or group titles, arrows that miss their
// shapes, overlaps, canvas bounds and steps that light an arrow but leave an endpoint dimmed.
// It complements `npm run validate`, which checks the same rules with the shared geometry in Node.
//
// Usage: start `npm run dev`, then `npm run audit:diagrams [-- <outDir> [baseUrl] [moduleFilter]]`.
// Writes report.json and one PNG per diagram and language to <outDir> (default audit-diagrams/).
// Exits with code 1 when any error is found.
import { chromium } from 'playwright'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import exam from '../src/content/exam.json' with { type: 'json' }
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const out = process.argv[2] ?? 'audit-diagrams'
const base = (process.argv[3] ?? 'http://localhost:5173/').replace(/\/?$/, '/')
const filter = process.argv[4] ?? ''
const lessonsDir = fileURLToPath(new URL('../src/content/lessons', import.meta.url))
const modules = (existsSync(lessonsDir) ? readdirSync(lessonsDir) : [])
  .filter((f) => f.endsWith('.ts') && !f.startsWith('_'))
  .map((f) => f.replace(/\.ts$/, ''))
  .filter((m) => !filter || m.includes(filter))
  .sort()

if (!modules.length) {
  console.log('No lessons to audit yet (src/content/lessons/ is empty).')
  process.exit(0)
}

try {
  await fetch(base)
} catch {
  console.error(`The app is not reachable at ${base}. Start it with \`npm run dev\` and run the audit again.`)
  process.exit(2)
}

function auditInPage() {
  const results = []
  for (const [fi, fig] of [...document.querySelectorAll('figure.dg')].entries()) {
    const svg = fig.querySelector('svg.dg-svg')
    const title = fig.querySelector('.dg-title')?.textContent ?? `diagram ${fi + 1}`
    const vb = svg.viewBox.baseVal
    const issues = []
    const add = (kind, severity, ids, msg) => issues.push({ kind, severity, ids, msg })
    const bb = (el) => {
      const b = el.getBBox()
      return { x: b.x, y: b.y, w: b.width, h: b.height }
    }
    const inter = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad
    const contains = (o, i, tol = 0.5) => i.x >= o.x - tol && i.y >= o.y - tol && i.x + i.w <= o.x + o.w + tol && i.y + i.h <= o.y + o.h + tol
    const inRect = (r, x, y, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad
    const fill = (el, x, y) => el.isPointInFill(new DOMPoint(x, y))
    const q = (s) => `“${s}”`

    const groups = [...svg.querySelectorAll('g[data-group]')].map((g) => {
      const rect = g.querySelector('rect')
      const label = g.querySelector('text')
      return { id: g.dataset.group, rect, box: bb(rect), label: label?.textContent ?? '', lbox: label?.textContent ? bb(label) : null }
    })
    const nodes = [...svg.querySelectorAll('g[data-node]')].map((g) => {
      const shape = g.querySelector('.dg-shape')
      const texts = [...g.querySelectorAll('text')].map((t) => ({ text: t.textContent, box: bb(t), sub: t.classList.contains('dg-sub') }))
      return { id: g.dataset.node, g, kind: g.dataset.shape, shape, box: bb(shape), texts, name: texts.filter((t) => !t.sub).map((t) => t.text).join(' ') }
    })
    const nodeById = new Map(nodes.map((n) => [n.id, n]))
    const groupById = new Map(groups.map((g) => [g.id, g]))
    const shapeOf = (id) => nodeById.get(id)?.shape ?? groupById.get(id)?.rect
    const nameOf = (id) => nodeById.get(id)?.name ?? groupById.get(id)?.label ?? id
    const pills = [...svg.querySelectorAll('g[data-label-for]')].map((g) => ({
      id: g.dataset.labelFor,
      box: bb(g.querySelector('rect')),
      tbox: bb(g.querySelector('text')),
      text: g.querySelector('text').textContent,
    }))
    const edges = [...svg.querySelectorAll('path[data-edge]')].map((p) => {
      const len = p.getTotalLength()
      const pts = []
      for (let s = 0; s < len; s += 2) {
        const pt = p.getPointAtLength(s)
        pts.push([pt.x, pt.y, s])
      }
      const end = p.getPointAtLength(len)
      pts.push([end.x, end.y, len])
      const poly = (p.getAttribute('d').match(/-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?/g) ?? []).map((s) => s.split(',').map(Number))
      return { id: p.dataset.edge, from: p.dataset.from, to: p.dataset.to, bidir: p.hasAttribute('data-bidir'), el: p, len, pts, poly }
    })
    const edgeName = (e) => `${q(nameOf(e.from))} → ${q(nameOf(e.to))}`

    // 1. Node text must fit inside the drawn shape.
    for (const n of nodes) {
      const { x, y, w, h } = n.box
      const cy = y + h / 2
      let left = x + 7
      let right = x + w - 7
      let top = y + 1.5
      let bottom = y + h - 1.5
      if (n.kind === 'store') top = y + 2 * Math.min(9, h / 5) + 0.5
      for (const t of n.texts) {
        let l = left
        let r = right
        if (n.kind === 'diamond') {
          const dy = Math.max(Math.abs(t.box.y - cy), Math.abs(t.box.y + t.box.h - cy))
          const inset = 14 * Math.min(1, dy / (h / 2)) + 4
          l = Math.max(l, x + inset)
          r = Math.min(r, x + w - inset)
        }
        const over = Math.max(l - t.box.x, t.box.x + t.box.w - r)
        const overV = Math.max(top - t.box.y, t.box.y + t.box.h - bottom)
        if (over > 0.5) add('text-overflow', 'error', [n.id], `${q(t.text)} is ${over.toFixed(1)} px too wide for its box (${n.kind}, w=${w.toFixed(0)})`)
        if (overV > 0.5) add('text-overflow', 'error', [n.id], `${q(t.text)} sticks out ${overV.toFixed(1)} px vertically (h=${h.toFixed(0)})`)
      }
      // An official product icon (optional): fully inside the drawn shape, clear of every text line.
      const icon = n.g.querySelector('image.dg-icon')
      if (icon && !icon.getAttribute('href')) add('icon-missing', 'error', [n.id], `the icon of ${q(n.name)} has no image`)
      else if (icon) {
        const ib = bb(icon)
        const corners = [[ib.x + 1, ib.y + 1], [ib.x + ib.w - 1, ib.y + 1], [ib.x + 1, ib.y + ib.h - 1], [ib.x + ib.w - 1, ib.y + ib.h - 1]]
        if (!corners.every(([cx, cy2]) => fill(n.shape, cx, cy2))) add('icon-outside', 'error', [n.id], `the icon of ${q(n.name)} sticks out of its ${n.kind}`)
        for (const t of n.texts) if (inter(ib, t.box, -0.5)) add('icon-text', 'error', [n.id], `the icon of ${q(n.name)} overlaps ${q(t.text)}`)
      }
    }

    // 2. Edge label pills: text fits; no collisions.
    for (const p of pills) {
      const over = Math.max(p.box.x + 5 - p.tbox.x, p.tbox.x + p.tbox.w - (p.box.x + p.box.w - 5))
      if (over > 0.5) add('label-overflow', 'error', [p.id], `label ${q(p.text)} is ${over.toFixed(1)} px wider than its pill`)
      const samples = []
      for (let i = 0; i <= 8; i++) for (let j = 0; j <= 2; j++) samples.push([p.box.x + (p.box.w * i) / 8, p.box.y + (p.box.h * j) / 2])
      for (const n of nodes) {
        if (!inter(p.box, n.box)) continue
        if (samples.some(([sx, sy]) => fill(n.shape, sx, sy))) add('label-on-node', 'error', [p.id, n.id], `label ${q(p.text)} covers node ${q(n.name)}`)
      }
      for (const o of pills) if (o !== p && o.id > p.id && inter(p.box, o.box, 2)) add('label-on-label', 'error', [p.id, o.id], `labels ${q(p.text)} and ${q(o.text)} collide`)
      for (const g of groups) if (g.lbox && inter(p.box, g.lbox, 1)) add('label-on-title', 'error', [p.id, g.id], `label ${q(p.text)} covers group title ${q(g.label)}`)
      for (const e of edges) {
        const tail = e.pts.filter(([, , s]) => s > e.len - 12 || (e.bidir && s < 12))
        if (tail.some(([sx, sy]) => inRect(p.box, sx, sy, 0.5))) add('label-hides-arrowhead', 'error', [p.id, e.id], `label ${q(p.text)} hides the arrowhead of ${edgeName(e)}`)
        else if (e.id !== p.id && e.pts.some(([sx, sy]) => inRect(p.box, sx, sy, -1))) add('edge-under-label', 'error', [p.id, e.id], `arrow ${edgeName(e)} runs under the label ${q(p.text)}`)
      }
    }

    // 3. Arrows: no node crossings, real contact with source and target.
    for (const e of edges) {
      const src = shapeOf(e.from)
      const dst = shapeOf(e.to)
      if (!src || !dst) {
        add('edge-dangling', 'error', [e.id], `arrow ${e.id} references a missing endpoint`)
        continue
      }
      if (e.len < 22) add('edge-too-short', 'warning', [e.id], `arrow ${edgeName(e)} is only ${e.len.toFixed(0)} px long; its head covers it`)
      for (const n of nodes) {
        if (n.id === e.from || n.id === e.to) continue
        const hit = e.pts.filter(([sx, sy, s]) => s > 1 && s < e.len - 1 && fill(n.shape, sx, sy)).length
        if (hit) add('edge-through-node', 'error', [e.id, n.id], `arrow ${edgeName(e)} runs through ${q(n.name)} (~${hit * 2} px)`)
      }
      for (const g of groups) {
        if (!g.lbox) continue
        if (e.pts.some(([sx, sy]) => inRect(g.lbox, sx, sy, 1))) add('edge-through-title', 'error', [e.id, g.id], `arrow ${edgeName(e)} crosses the group title ${q(g.label)}`)
      }
      const back = e.pts.filter(([sx, sy, s]) => s > 5 && s < e.len - 5 && (fill(src, sx, sy) || fill(dst, sx, sy))).length
      const groupEnd = groupById.has(e.from) || groupById.has(e.to)
      if (back && !groupEnd) add('edge-through-own-node', 'error', [e.id], `arrow ${edgeName(e)} runs back through its own node (~${back * 2} px)`)
      const contact = (pt, ref, shape) => {
        const dx0 = pt.x - ref.x
        const dy0 = pt.y - ref.y
        const l = Math.hypot(dx0, dy0) || 1
        const dx = dx0 / l
        const dy = dy0 / l
        if (fill(shape, pt.x, pt.y)) return 0
        for (let d = 0.5; d <= 20; d += 0.5) if (fill(shape, pt.x + dx * d, pt.y + dy * d)) return d
        return Infinity
      }
      const end = e.el.getPointAtLength(e.len)
      const endRef = e.el.getPointAtLength(Math.max(0, e.len - 3))
      if (fill(dst, end.x, end.y)) add('arrowhead-hidden', 'error', [e.id], `arrow ${edgeName(e)} ends inside its target, so the head is hidden`)
      else {
        const g = contact(end, endRef, dst)
        if (g === Infinity) add('arrow-misses-target', 'error', [e.id], `arrow ${edgeName(e)} does not point at its target`)
        else if (g - 1 > 6) add('arrow-short', 'error', [e.id], `arrowhead of ${edgeName(e)} stops ${(g - 1).toFixed(1)} px before its target`)
      }
      const start = e.el.getPointAtLength(0)
      const startRef = e.el.getPointAtLength(Math.min(e.len, 3))
      const gs = contact(start, startRef, src)
      if (e.bidir && gs === 0) add('arrowhead-hidden', 'error', [e.id], `the start arrowhead of ${edgeName(e)} is hidden inside its source`)
      else if (gs === Infinity) add('edge-detached', 'error', [e.id], `arrow ${edgeName(e)} does not start at its source`)
      else if (gs > 7) add('edge-detached', 'error', [e.id], `arrow ${edgeName(e)} starts ${gs.toFixed(1)} px away from its source`)
    }

    // 4. Overlapping arrows and crossings.
    for (let i = 0; i < edges.length; i++) {
      for (let j = i + 1; j < edges.length; j++) {
        const a = edges[i]
        const b = edges[j]
        const close = a.pts.filter(([ax, ay]) => b.pts.some(([bx, by]) => Math.abs(ax - bx) < 2.5 && Math.abs(ay - by) < 2.5))
        if (close.length * 2 > 20) {
          const first = close[0][2]
          const last = close[close.length - 1][2]
          const contiguous = last - first <= close.length * 2 + 4
          const bus = (a.from === b.from && first < 6 && contiguous) || (a.to === b.to && last > a.len - 6 && contiguous)
          if (!bus) add('edge-overlap', 'error', [a.id, b.id], `arrows ${edgeName(a)} and ${edgeName(b)} run on top of each other (~${close.length * 2} px)`)
        }
        const shared = new Set([a.from, a.to]).has(b.from) || new Set([a.from, a.to]).has(b.to)
        if (shared) continue
        let crossings = 0
        for (let s = 1; s < a.poly.length; s++) {
          for (let t = 1; t < b.poly.length; t++) {
            const [p1, p2, p3, p4] = [a.poly[s - 1], a.poly[s], b.poly[t - 1], b.poly[t]]
            const d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0])
            if (!d) continue
            const u = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d
            const v = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d
            if (u > 0.02 && u < 0.98 && v > 0.02 && v < 0.98) crossings++
          }
        }
        if (crossings) add('edge-crossing', 'info', [a.id, b.id], `arrows ${edgeName(a)} and ${edgeName(b)} cross`)
      }
    }

    // 5. Boxes, groups and canvas bounds.
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) if (inter(nodes[i].box, nodes[j].box, 2)) add('node-overlap', 'error', [nodes[i].id, nodes[j].id], `${q(nodes[i].name)} and ${q(nodes[j].name)} touch or overlap`)
    for (const g of groups) {
      if (g.lbox && g.lbox.x + g.lbox.w > g.box.x + g.box.w - 8) add('title-overflow', 'error', [g.id], `group title ${q(g.label)} is wider than its group`)
      for (const n of nodes) {
        if (g.lbox && inter(g.lbox, n.box, 2)) add('title-on-node', 'error', [g.id, n.id], `group title ${q(g.label)} touches ${q(n.name)}`)
        if (inter(g.box, n.box) && !contains(g.box, n.box)) add('node-straddles-group', 'error', [n.id, g.id], `${q(n.name)} sits across the border of group ${q(g.label)}`)
      }
      for (const o of groups) if (o !== g && o.id > g.id && inter(g.box, o.box) && !contains(g.box, o.box) && !contains(o.box, g.box)) add('group-overlap', 'error', [g.id, o.id], `groups ${q(g.label)} and ${q(o.label)} overlap`)
    }
    const canvas = { x: vb.x, y: vb.y, w: vb.width, h: vb.height }
    const outside = (b) => !contains(canvas, b, 0.5)
    for (const n of nodes) {
      if (outside(n.box)) add('outside-canvas', 'error', [n.id], `${q(n.name)} extends beyond the canvas`)
      for (const t of n.texts) if (outside(t.box)) add('outside-canvas', 'error', [n.id], `text ${q(t.text)} extends beyond the canvas`)
    }
    for (const g of groups) if (outside(g.box)) add('outside-canvas', 'error', [g.id], `group ${q(g.label)} extends beyond the canvas`)
    for (const p of pills) if (outside(p.box)) add('outside-canvas', 'error', [p.id], `label ${q(p.text)} extends beyond the canvas`)

    results.push({ index: fi, title, size: [vb.width, vb.height], counts: { nodes: nodes.length, edges: edges.length, groups: groups.length, labels: pills.length }, issues })
  }
  return results
}

async function stepChecks(page) {
  // For each diagram, click through the steps and record which nodes/edges are lit.
  return page.evaluate(async () => {
    const wait = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const all = []
    for (const [fi, fig] of [...document.querySelectorAll('figure.dg')].entries()) {
      const svg = fig.querySelector('svg.dg-svg')
      const dots = [...fig.querySelectorAll('.dg-step-dot')]
      const issues = []
      for (const [si, dot] of dots.entries()) {
        dot.click()
        await wait()
        const lit = new Set([...svg.querySelectorAll('.is-focus, .is-context')].map((el) => el.dataset.node ?? el.dataset.edge ?? el.dataset.group ?? el.dataset.labelFor))
        const litNodes = [...svg.querySelectorAll('g[data-node].is-focus')]
        if (!litNodes.length && !svg.querySelector('g[data-group].is-focus')) issues.push({ kind: 'step-empty', severity: 'warning', msg: `step ${si + 1} highlights no node or group` })
        for (const p of svg.querySelectorAll('path[data-edge].is-focus')) {
          const dim = [p.dataset.from, p.dataset.to].filter((id) => !lit.has(id))
          if (dim.length) issues.push({ kind: 'step-arrow-to-dim', severity: 'warning', msg: `step ${si + 1} lights arrow ${p.dataset.edge} (${p.dataset.from} → ${p.dataset.to}) but leaves ${dim.join(', ')} dimmed` })
        }
      }
      const reset = fig.querySelector('.dg-controls button[data-whole]')
      reset?.click()
      await wait()
      all.push({ index: fi, issues })
    }
    return all
  })
}

const browser = await chromium.launch()
const report = []
for (const lang of ['en', 'de']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  await ctx.addInitScript((l) => {
    localStorage.setItem(l.key, JSON.stringify({ version: 1, lang: l.lang, cards: {}, lessonsRead: {}, exams: [], activeExam: null }))
  }, { key: exam.storageKey, lang })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  mkdirSync(join(out, lang), { recursive: true })
  for (const m of modules) {
    await page.goto(`${base}#/learn/${m}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('figure.dg svg.dg-svg', { timeout: 15000 })
    await page.evaluate(() => document.fonts.ready)
    const res = await page.evaluate(auditInPage)
    const steps = await stepChecks(page)
    const canvases = await page.$$('figure.dg .dg-canvas')
    for (const [i, c] of canvases.entries()) {
      await c.scrollIntoViewIfNeeded()
      await c.screenshot({ path: join(out, lang, `${m}-${i + 1}.png`) })
    }
    for (const r of res) {
      r.issues.push(...(steps.find((s) => s.index === r.index)?.issues ?? []))
      report.push({ lang, module: m, ...r })
    }
  }
  if (errors.length) console.log(`page errors (${lang}):`, errors)
  await ctx.close()
}
await browser.close()
writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1))

const sev = { error: 0, warning: 0, info: 0 }
const byKind = {}
for (const r of report) for (const i of r.issues) {
  sev[i.severity]++
  byKind[`${i.severity} ${i.kind}`] = (byKind[`${i.severity} ${i.kind}`] ?? 0) + 1
}
console.log(`Diagrams audited: ${report.length / 2} × EN/DE — errors ${sev.error}, warnings ${sev.warning}, info ${sev.info}`)
console.log(Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, v]) => `  ${String(v).padStart(4)} ${k}`).join('\n'))
for (const r of report) {
  const shown = r.issues.filter((i) => i.severity !== 'info')
  if (!shown.length) continue
  console.log(`\n[${r.lang}] ${r.module} #${r.index + 1} “${r.title}”`)
  for (const i of shown) console.log(`  ${i.severity === 'error' ? '✗' : '⚠'} ${i.kind}: ${i.msg}`)
}

process.exitCode = sev.error > 0 ? 1 : 0
