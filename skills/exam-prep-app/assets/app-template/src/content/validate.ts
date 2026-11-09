import type {
  CardFile,
  CaseStudy,
  CourseModule,
  Diagram,
  L10n,
  LegacyName,
  Lesson,
  Question,
  QuestionFile,
  Text,
} from '../lib/types.ts'
import {
  ARROW_CLEARANCE,
  DIAMOND_INSET,
  ICON_SLOT,
  edgePoints,
  GROUP_RADIUS,
  groupTitleRect,
  nodeTextLayout,
  placeEdgeLabels,
  pointInRect,
  polylineLength,
  rectContains,
  rectsOverlap,
  samplePolyline,
  segmentHitsRect,
  storeCap,
  type Outlined,
  type Pt,
  type Rect,
} from '../lib/geometry.ts'
import { textWidth } from '../lib/text-metrics.ts'
import { isDiagramIcon } from './diagram-icons.ts'
import { indexOutline, outline as defaultOutline, type Outline, type OutlineIndex } from './outline.ts'
import { findOutdatedModels, scanText, type ModelLifecycle } from './model-currency.ts'
import { exam } from '../config.ts'

export interface Issue {
  level: 'error' | 'warning'
  where: string
  message: string
}

export interface CoverageRow {
  bullet: string
  domain: string
  text: string
  modules: string[]
  lessons: string[]
  primary: number
  secondary: number
}

export interface ValidationReport {
  issues: Issue[]
  errors: Issue[]
  warnings: Issue[]
  coverage: CoverageRow[]
  moduleCounts: Record<string, number>
  domainCounts: Record<string, number>
  typeCounts: Record<string, number>
  difficultyCounts: Record<string, number>
  /** Zettelkasten starter cards in the bundle. */
  cardCount: number
  /** How far the form of the card options points at the answer; measured on full runs only. */
  cues?: AnswerCues
}

export interface ContentBundle {
  files: Array<{ file: string; data: QuestionFile }>
  cases: CaseStudy[]
  lessons: Array<{ file: string; lesson: Lesson }>
  /** Zettelkasten starter cards (src/content/cards/*.json); when given, every lesson item needs exactly one card. */
  cards?: Array<{ file: string; data: CardFile }>
}

export interface ValidateOptions {
  /** Restrict per-item checks to these module ids and skip global coverage checks. */
  only?: string[]
  /** ISO date used to reject lastVerified dates in the future. */
  today?: string
  /** Defaults to exam.json targets. */
  minPerBullet?: number
  minPerModule?: number
  /** Snapshot of Learn's model retirement schedule; enables the model-currency check. */
  modelLifecycle?: ModelLifecycle
  /** Skills outline and course map to check against; defaults to src/content/domains.ts and course.ts. */
  outline?: Outline
  /** Renamed or retired product names; defaults to exam.json legacyNames. */
  legacyNames?: LegacyName[]
}

const LEARN_URL = /^https:\/\/learn\.microsoft\.com\/(?:[a-z]{2}-[a-z]{2}\/)?[a-z]/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** A legacy name compiled for matching. */
export interface LegacyPattern {
  pattern: RegExp
  current: string
}

/**
 * Names that were renamed or retired (exam.json legacyNames). They may only appear when the text explicitly
 * frames them as former names (e.g. "formerly", "classic").
 */
export function compileLegacyNames(list: readonly LegacyName[] = exam.legacyNames): LegacyPattern[] {
  return list.map((l) => ({ pattern: new RegExp(l.pattern, (l.flags ?? '').replace(/g/g, '')), current: l.current }))
}

const LEGACY_FRAMING = /formerly|previously|renamed|retired|deprecated|classic|legacy|ehemals|früher|umbenannt|eingestellt|veraltet|Vorgänger|predecessor/i

function textOf(t: Text | undefined): string[] {
  if (t === undefined) return []
  return typeof t === 'string' ? [t] : [t.en, t.de]
}

function checkL10n(issues: Issue[], where: string, field: string, v: L10n | undefined, opts?: { minLen?: number }) {
  if (!v || typeof v !== 'object') {
    issues.push({ level: 'error', where, message: `${field}: missing localized text` })
    return
  }
  const min = opts?.minLen ?? 2
  for (const lang of ['en', 'de'] as const) {
    const s = v[lang]
    if (typeof s !== 'string' || s.trim().length < min) {
      issues.push({ level: 'error', where, message: `${field}.${lang}: missing or too short` })
    }
  }
  if (typeof v.en === 'string' && typeof v.de === 'string' && v.en.trim() === v.de.trim()) {
    const prose = v.en.replace(/`[^`]*`/g, '').replace(/[^A-Za-zÄÖÜäöüß ]/g, '').trim()
    if (prose.split(/\s+/).filter((w) => w.length > 3).length >= 6) {
      issues.push({ level: 'warning', where, message: `${field}: German text identical to English (untranslated?)` })
    }
  }
}

function checkLegacy(issues: Issue[], where: string, strings: string[], legacy: readonly LegacyPattern[]) {
  for (const s of strings) {
    for (const { pattern, current } of legacy) {
      if (pattern.test(s) && !LEGACY_FRAMING.test(s)) {
        issues.push({ level: 'error', where, message: `outdated name ${pattern} — use "${current}" (or frame it as a former name)` })
      }
    }
  }
}

function checkModels(issues: Issue[], where: string, value: unknown, lifecycle: ModelLifecycle | undefined, today: string) {
  if (!lifecycle) return
  for (const f of findOutdatedModels(scanText(value), lifecycle, today)) {
    issues.push({ level: 'error', where, message: `${f.status} model "${f.model}" (${f.detail}) — use a current model, or frame it as retired/deprecated` })
  }
}

function checkSources(issues: Issue[], where: string, urls: string[] | undefined) {
  if (!Array.isArray(urls) || urls.length === 0) {
    issues.push({ level: 'error', where, message: 'needs at least one learn.microsoft.com source URL' })
    return
  }
  for (const u of urls) {
    if (!LEARN_URL.test(u)) issues.push({ level: 'error', where, message: `source must be a learn.microsoft.com documentation URL: ${u}` })
  }
}

function uniqueIds(issues: Issue[], where: string, label: string, ids: string[]) {
  const seen = new Set<string>()
  for (const id of ids) {
    if (seen.has(id)) issues.push({ level: 'error', where, message: `duplicate ${label} id "${id}"` })
    seen.add(id)
  }
}

function questionStrings(q: Question): string[] {
  const out = [...textOf(q.stem), ...textOf(q.explanation)]
  if (q.type === 'single' || q.type === 'multi') q.options.forEach((o) => out.push(...textOf(o.text), ...textOf(o.why)))
  if (q.type === 'order') q.items.forEach((o) => out.push(...textOf(o.text), ...textOf(o.why)))
  if (q.type === 'match') {
    q.prompts.forEach((p) => out.push(...textOf(p.prompt), ...textOf(p.why)))
    q.targets.forEach((t) => out.push(...textOf(t.text)))
  }
  if (q.type === 'code') q.blanks.forEach((b) => b.options.forEach((o) => out.push(...textOf(o.why))))
  return out
}

export interface QuestionContext {
  file: string
  fileModule: string
  caseIds: Set<string>
  today: string
  outline?: OutlineIndex
  legacy?: readonly LegacyPattern[]
}

export function validateQuestion(q: Question, issues: Issue[], ctx: QuestionContext) {
  const { moduleById, bulletById } = ctx.outline ?? defaultOutline
  const where = `${ctx.file} › ${q.id ?? '(no id)'}`
  if (!q.id || !/^q-[a-z0-9-]+$/.test(q.id)) issues.push({ level: 'error', where, message: 'id must match ^q-[a-z0-9-]+$' })
  if (q.module !== ctx.fileModule) issues.push({ level: 'error', where, message: `module "${q.module}" differs from file module "${ctx.fileModule}"` })
  if (!moduleById.has(q.module)) issues.push({ level: 'error', where, message: `unknown module "${q.module}" — add it to src/content/course.ts` })
  const bullet = bulletById.get(q.skill)
  if (!bullet) issues.push({ level: 'error', where, message: `unknown skill bullet "${q.skill}" — add it to src/content/domains.ts` })
  else if (bullet.domain !== q.domain) issues.push({ level: 'error', where, message: `skill ${q.skill} belongs to ${bullet.domain}, not ${q.domain}` })
  for (const s of q.skills ?? []) if (!bulletById.has(s)) issues.push({ level: 'error', where, message: `unknown secondary skill "${s}"` })
  if (![1, 2, 3].includes(q.difficulty)) issues.push({ level: 'error', where, message: 'difficulty must be 1, 2 or 3' })
  if (q.caseId && !ctx.caseIds.has(q.caseId)) issues.push({ level: 'error', where, message: `unknown caseId "${q.caseId}"` })
  checkL10n(issues, where, 'stem', q.stem, { minLen: 15 })
  checkL10n(issues, where, 'explanation', q.explanation, { minLen: 15 })
  checkSources(issues, where, q.sources)
  if (!ISO_DATE.test(q.lastVerified ?? '')) issues.push({ level: 'error', where, message: 'lastVerified must be YYYY-MM-DD' })
  else if (q.lastVerified > ctx.today) issues.push({ level: 'error', where, message: `lastVerified ${q.lastVerified} is in the future` })

  switch (q.type) {
    case 'single':
    case 'multi': {
      const opts = q.options ?? []
      uniqueIds(issues, where, 'option', opts.map((o) => o.id))
      const correct = opts.filter((o) => o.correct === true).length
      if (q.type === 'single') {
        if (opts.length < 3 || opts.length > 6) issues.push({ level: 'error', where, message: 'single choice needs 3–6 options' })
        if (correct !== 1) issues.push({ level: 'error', where, message: `single choice needs exactly one correct option (has ${correct})` })
      } else {
        if (opts.length < 4 || opts.length > 6) issues.push({ level: 'error', where, message: 'multiple select needs 4–6 options' })
        if (correct < 2) issues.push({ level: 'error', where, message: `multiple select needs at least two correct options (has ${correct})` })
        if (correct >= opts.length) issues.push({ level: 'error', where, message: 'multiple select needs at least one incorrect option' })
      }
      opts.forEach((o) => {
        checkL10n(issues, where, `option ${o.id}.text`, o.text)
        checkL10n(issues, where, `option ${o.id}.why`, o.why, { minLen: 10 })
      })
      break
    }
    case 'order': {
      const items = q.items ?? []
      if (items.length < 3 || items.length > 7) issues.push({ level: 'error', where, message: 'ordering needs 3–7 items' })
      uniqueIds(issues, where, 'item', items.map((o) => o.id))
      items.forEach((o) => {
        checkL10n(issues, where, `item ${o.id}.text`, o.text)
        checkL10n(issues, where, `item ${o.id}.why`, o.why, { minLen: 10 })
      })
      break
    }
    case 'match': {
      const prompts = q.prompts ?? []
      const targets = q.targets ?? []
      if (prompts.length < 2 || prompts.length > 6) issues.push({ level: 'error', where, message: 'matching needs 2–6 prompts' })
      if (targets.length < 2) issues.push({ level: 'error', where, message: 'matching needs at least two targets' })
      uniqueIds(issues, where, 'prompt', prompts.map((p) => p.id))
      uniqueIds(issues, where, 'target', targets.map((t) => t.id))
      const targetIds = new Set(targets.map((t) => t.id))
      prompts.forEach((p) => {
        if (!targetIds.has(p.answer)) issues.push({ level: 'error', where, message: `prompt ${p.id} answer "${p.answer}" is not a target` })
        checkL10n(issues, where, `prompt ${p.id}.prompt`, p.prompt)
        checkL10n(issues, where, `prompt ${p.id}.why`, p.why, { minLen: 10 })
      })
      targets.forEach((t) => checkL10n(issues, where, `target ${t.id}.text`, t.text))
      break
    }
    case 'code': {
      const blanks = q.blanks ?? []
      if (blanks.length < 1 || blanks.length > 4) issues.push({ level: 'error', where, message: 'code completion needs 1–4 blanks' })
      uniqueIds(issues, where, 'blank', blanks.map((b) => b.id))
      const placeholders = [...(q.template ?? '').matchAll(/\{\{([a-z0-9]+)\}\}/g)].map((m) => m[1])
      const blankIds = new Set(blanks.map((b) => b.id))
      for (const p of placeholders) if (!blankIds.has(p)) issues.push({ level: 'error', where, message: `template placeholder {{${p}}} has no blank` })
      for (const p of new Set(placeholders)) {
        if (placeholders.filter((x) => x === p).length > 1) issues.push({ level: 'error', where, message: `template uses placeholder {{${p}}} more than once` })
      }
      for (const b of blanks) {
        if (!placeholders.includes(b.id)) issues.push({ level: 'error', where, message: `blank ${b.id} missing from template` })
        const correct = b.options.filter((o) => o.correct === true).length
        if (correct !== 1) issues.push({ level: 'error', where, message: `blank ${b.id} needs exactly one correct option (has ${correct})` })
        if (b.options.length < 3 || b.options.length > 5) issues.push({ level: 'error', where, message: `blank ${b.id} needs 3–5 options` })
        uniqueIds(issues, where, `blank ${b.id} option`, b.options.map((o) => o.id))
        b.options.forEach((o) => {
          if (!o.code?.trim()) issues.push({ level: 'error', where, message: `blank ${b.id} option ${o.id} has no code` })
          checkL10n(issues, where, `blank ${b.id} option ${o.id}.why`, o.why, { minLen: 10 })
        })
      }
      break
    }
    default:
      issues.push({ level: 'error', where, message: `unknown question type "${(q as { type: string }).type}"` })
  }
  checkLegacy(issues, where, questionStrings(q), ctx.legacy ?? compileLegacyNames())
}

/** Width available to a text block of height `blockH` inside a node, as rendered. */
function availableTextWidth(n: Outlined, blockH: number): number {
  switch (n.shape) {
    case 'pill': {
      const r = n.h / 2
      const dy = Math.min(r, blockH / 2 + 1)
      return n.w - 2 * (r - Math.sqrt(r * r - dy * dy)) - 16
    }
    case 'diamond': {
      const dy = Math.min(n.h / 2, blockH / 2 + 1)
      return n.w - 2 * ((DIAMOND_INSET * dy) / (n.h / 2)) - 18
    }
    default:
      return n.w - 16
  }
}

/** Node labels must fit the drawn shape in every language (real font metrics). */
function checkNodeText(issues: Issue[], where: string, n: Diagram['nodes'][number]) {
  const labels = textOf(n.label)
  const subs = textOf(n.sub)
  labels.forEach((label, i) => {
    const lang = i === 0 ? 'en' : 'de'
    const labelLines = label.split('\n')
    const subLines = subs[i] ? subs[i].split('\n') : []
    const { blockH } = nodeTextLayout(n, labelLines.length, subLines.length)
    const cap = n.shape === 'store' ? 2 * storeCap(n.h) : 0
    const room = n.h - cap - (n.shape === 'store' ? 6 : 8)
    if (blockH > room) {
      issues.push({ level: 'error', where, message: `node ${n.id} (${lang}): ${labelLines.length} label + ${subLines.length} sub line(s) need ${blockH}px of height but only ${Math.floor(room)}px fit — make the node at least ${Math.ceil(n.h + blockH - room)}px tall or use fewer lines` })
    }
    const avail = availableTextWidth(n, blockH)
    // Label lines share their row with the node's icon, if it has one; sub lines use the full width.
    const iconSlot = n.icon ? ICON_SLOT : 0
    const tooWide = (line: string, style: 'label' | 'sub') => {
      const tw = textWidth(line, style) + (style === 'label' ? iconSlot : 0)
      if (tw > avail) {
        const what = style === 'label' ? `label line "${line}" needs ${Math.ceil(tw)}px${iconSlot ? ' with its icon' : ''}` : `sub line "${line}" is ${Math.ceil(tw)}px wide`
        issues.push({ level: 'error', where, message: `node ${n.id} (${lang}) ${what} but only ${Math.floor(avail)}px fit — widen the node to at least ${Math.ceil(n.w + tw - avail)}px, break the line with \\n, or shorten it` })
      }
    }
    labelLines.forEach((line) => tooWide(line, 'label'))
    subLines.forEach((line) => tooWide(line, 'sub'))
  })
}

function distanceToPolyline(p: Pt, pts: Pt[]): number {
  let best = Infinity
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const dx = bx - ax
    const dy = by - ay
    const l2 = dx * dx + dy * dy
    const t = l2 ? Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / l2)) : 0
    best = Math.min(best, Math.hypot(p[0] - (ax + t * dx), p[1] - (ay + t * dy)))
  }
  return best
}

/** Geometry exactly as rendered: arrows, labels, groups and titles must not collide. */
function checkDiagramGeometry(issues: Issue[], w: string, d: Diagram) {
  const err = (message: string) => issues.push({ level: 'error', where: w, message })
  const nodes = d.nodes ?? []
  const groups = d.groups ?? []
  const shapes = new Map<string, Outlined>()
  for (const g of groups) shapes.set(g.id, { ...g, radius: GROUP_RADIUS })
  for (const n of nodes) shapes.set(n.id, n)
  const canvas: Rect = { x: 0, y: 0, w: d.width, h: d.height }

  const titles = groups.flatMap((g) => [...new Set(textOf(g.label))].map((t) => ({ g, text: t, box: groupTitleRect(g, t) })))
  for (const t of titles) {
    if (t.box.w > t.g.w - 28) err(`group ${t.g.id} title "${t.text}" is ${Math.ceil(t.box.w)}px wide but the group is only ${t.g.w}px — widen the group to at least ${Math.ceil(t.box.w + 28)}px or shorten the title`)
    for (const n of nodes) if (rectsOverlap(t.box, n, 2)) err(`group ${t.g.id} title "${t.text}" touches node ${n.id} — move the node down (the title needs ~30px at the top of the group)`)
  }
  for (const g of groups) {
    for (const n of nodes) if (rectsOverlap(g, n) && !rectContains(g, n)) err(`node ${n.id} sits across the border of group ${g.id} — move it fully inside or outside`)
    for (const o of groups) if (o.id > g.id && rectsOverlap(g, o) && !rectContains(g, o) && !rectContains(o, g)) err(`groups ${g.id} and ${o.id} partly overlap — nest one inside the other or separate them`)
  }

  const paths = (d.edges ?? []).flatMap((e) => {
    const pts = edgePoints(e, shapes)
    return pts ? [{ e, pts, len: polylineLength(pts), samples: samplePolyline(pts, 2) }] : []
  })
  for (const { e, pts, len, samples } of paths) {
    const name = `edge ${e.id} (${e.from} → ${e.to})`
    for (const n of nodes) {
      if (n.id === e.from || n.id === e.to) continue
      for (let i = 1; i < pts.length; i++) {
        if (segmentHitsRect(pts[i - 1], pts[i], n)) {
          err(`${name} runs through node ${n.id}; move nodes or add via points`)
          break
        }
      }
    }
    for (const t of titles) if (samples.some((p) => pointInRect(t.box, [p[0], p[1]], 1))) err(`${name} crosses the title of group ${t.g.id}; route it with via points away from the title`)
    if (len < 20) err(`${name} is only ${Math.round(len)}px long, so its arrowhead hides it — move the nodes apart`)
  }

  // Edge labels, placed exactly like the renderer does (on the arrow, else beside it), per language.
  const langs = [...new Set((d.edges ?? []).flatMap((e) => textOf(e.label).map((_, i) => i)))]
  for (const li of langs.length ? langs : []) {
    const pick = (t: Text | undefined) => textOf(t)[li] ?? textOf(t)[0] ?? ''
    const items = paths.filter((p) => p.e.label).map((p) => ({ id: p.e.id, text: pick(p.e.label), pts: p.pts }))
    const blocked = groups.map((g) => groupTitleRect(g, pick(g.label)))
    const placed = placeEdgeLabels(items, paths.map((p) => ({ id: p.e.id, pts: p.pts })), nodes, blocked, canvas)
    for (const l of placed) {
      if (l.free) continue
      const p = paths.find((x) => x.e.id === l.id)!
      err(
        `label "${l.text}" of edge ${l.id} (${p.e.from} → ${p.e.to}) has no free spot: on the arrow it would hide the arrowhead ` +
          `(arrow ${Math.round(p.len)}px, needs about ${Math.ceil(l.box.w + 2 * ARROW_CLEARANCE)}px horizontally or ${l.box.h + 2 * ARROW_CLEARANCE}px vertically), ` +
          `and beside the arrow it would collide with a node, a group title, another label, another arrow or the canvas edge — move nodes apart, shorten the label or reroute the arrow`,
      )
    }
  }

  // Arrows drawn on top of each other. A shared trunk is fine when it fans out from one source
  // or merges into one target (a "bus").
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const a = paths[i]
      const b = paths[j]
      const close = a.samples.filter(([x, y]) => distanceToPolyline([x, y], b.pts) < 2.5)
      if (close.length * 2 <= 20) continue
      const first = close[0][2]
      const last = close[close.length - 1][2]
      const contiguous = last - first <= close.length * 2 + 4
      const fanOut = a.e.from === b.e.from && first < 6 && contiguous
      const fanIn = a.e.to === b.e.to && last > a.len - 6 && contiguous
      if (!fanOut && !fanIn) err(`edges ${a.e.id} (${a.e.from} → ${a.e.to}) and ${b.e.id} (${b.e.from} → ${b.e.to}) run on top of each other for ~${close.length * 2}px — use one bidirectional edge or separate them with via points`)
    }
  }
}

export function validateDiagram(d: Diagram, issues: Issue[], where: string) {
  const w = `${where} › diagram ${d.id}`
  checkL10n(issues, w, 'title', d.title)
  if (!(d.width > 0 && d.height > 0)) issues.push({ level: 'error', where: w, message: 'width/height must be positive' })
  if ((d.nodes ?? []).length < 2) issues.push({ level: 'error', where: w, message: 'needs at least two nodes' })
  const ids = [...(d.nodes ?? []).map((n) => n.id), ...(d.groups ?? []).map((g) => g.id), ...(d.edges ?? []).map((e) => e.id)]
  uniqueIds(issues, w, 'element', ids)
  const known = new Set(ids)
  const nodeOrGroup = new Set([...(d.nodes ?? []).map((n) => n.id), ...(d.groups ?? []).map((g) => g.id)])
  for (const n of d.nodes ?? []) {
    if (n.x < 0 || n.y < 0 || n.x + n.w > d.width || n.y + n.h > d.height) {
      issues.push({ level: 'error', where: w, message: `node ${n.id} lies outside the ${d.width}×${d.height} canvas` })
    }
    if (n.w < 60 || n.h < 30) issues.push({ level: 'error', where: w, message: `node ${n.id} is too small (min 60×30)` })
    if (n.icon !== undefined && !isDiagramIcon(n.icon)) {
      issues.push({ level: 'error', where: w, message: `node ${n.id}: icon ${JSON.stringify(n.icon)} is not registered in src/content/diagram-icons.ts — register it (see src/assets/diagram-icons/NOTICE.md) or remove the icon` })
    }
    checkNodeText(issues, w, n)
  }
  const nodes = d.nodes ?? []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (rectsOverlap(nodes[i], nodes[j])) issues.push({ level: 'error', where: w, message: `nodes ${nodes[i].id} and ${nodes[j].id} overlap` })
    }
  }
  for (const g of d.groups ?? []) {
    if (g.x < 0 || g.y < 0 || g.x + g.w > d.width || g.y + g.h > d.height) {
      issues.push({ level: 'error', where: w, message: `group ${g.id} lies outside the canvas` })
    }
  }
  for (const e of d.edges ?? []) {
    if (!nodeOrGroup.has(e.from)) issues.push({ level: 'error', where: w, message: `edge ${e.id} starts at unknown node "${e.from}"` })
    if (!nodeOrGroup.has(e.to)) issues.push({ level: 'error', where: w, message: `edge ${e.id} ends at unknown node "${e.to}"` })
  }

  checkDiagramGeometry(issues, w, d)
  if ((d.steps ?? []).length < 2) issues.push({ level: 'error', where: w, message: 'needs at least two steps for the step-through' })
  ;(d.steps ?? []).forEach((s, i) => {
    checkL10n(issues, w, `step ${i + 1}.title`, s.title)
    checkL10n(issues, w, `step ${i + 1}.text`, s.text, { minLen: 15 })
    if (!s.focus?.length) issues.push({ level: 'error', where: w, message: `step ${i + 1} has no focus ids` })
    for (const f of s.focus ?? []) if (!known.has(f)) issues.push({ level: 'error', where: w, message: `step ${i + 1} focuses unknown id "${f}"` })
  })
}

export function validateLesson(lesson: Lesson, issues: Issue[], file: string, opts: { outline?: OutlineIndex; legacy?: readonly LegacyPattern[] } = {}) {
  const { moduleById } = opts.outline ?? defaultOutline
  const where = `${file} › lesson ${lesson.module}`
  if (!moduleById.has(lesson.module)) issues.push({ level: 'error', where, message: `unknown module "${lesson.module}" — add it to src/content/course.ts` })
  checkL10n(issues, where, 'summary', lesson.summary, { minLen: 40 })
  checkL10n(issues, where, 'examFocus', lesson.examFocus, { minLen: 30 })
  if (!lesson.diagrams?.length) issues.push({ level: 'error', where, message: 'needs at least one diagram' })
  uniqueIds(issues, where, 'diagram', (lesson.diagrams ?? []).map((d) => d.id))
  for (const d of lesson.diagrams ?? []) validateDiagram(d, issues, where)
  if ((lesson.concepts ?? []).length < 3) issues.push({ level: 'error', where, message: 'needs at least three concepts' })
  for (const c of lesson.concepts ?? []) {
    if (!c.term?.trim()) issues.push({ level: 'error', where, message: 'concept without term' })
    checkL10n(issues, where, `concept ${c.term}`, c.text, { minLen: 30 })
  }
  if (lesson.comparison) {
    const cols = lesson.comparison.columns.length
    checkL10n(issues, where, 'comparison.title', lesson.comparison.title)
    lesson.comparison.columns.forEach((c, i) => checkL10n(issues, where, `comparison.column ${i + 1}`, c))
    lesson.comparison.rows.forEach((r, i) => {
      if (r.length !== cols) issues.push({ level: 'error', where, message: `comparison row ${i + 1} has ${r.length} cells, expected ${cols}` })
    })
  }
  if (!lesson.code?.length) issues.push({ level: 'error', where, message: 'needs at least one code sample' })
  for (const c of lesson.code ?? []) {
    checkL10n(issues, where, 'code.title', c.title)
    if (!c.code?.trim()) issues.push({ level: 'error', where, message: 'empty code sample' })
    c.notes?.forEach((n, i) => checkL10n(issues, where, `code note ${i + 1}`, n))
  }
  if ((lesson.traps ?? []).length < 2) issues.push({ level: 'error', where, message: 'needs at least two exam traps' })
  lesson.traps?.forEach((t, i) => checkL10n(issues, where, `trap ${i + 1}`, t, { minLen: 20 }))
  if ((lesson.takeaways ?? []).length < 3) issues.push({ level: 'error', where, message: 'needs at least three takeaways' })
  lesson.takeaways?.forEach((t, i) => checkL10n(issues, where, `takeaway ${i + 1}`, t, { minLen: 15 }))
  checkSources(issues, where, (lesson.sources ?? []).map((s) => s.url))

  const strings: string[] = [
    ...textOf(lesson.summary),
    ...textOf(lesson.examFocus),
    ...(lesson.concepts ?? []).flatMap((c) => [c.term, ...textOf(c.text)]),
    ...(lesson.traps ?? []).flatMap(textOf),
    ...(lesson.takeaways ?? []).flatMap(textOf),
    ...(lesson.diagrams ?? []).flatMap((d) => [
      ...d.nodes.flatMap((n) => [...textOf(n.label), ...textOf(n.sub)]),
      ...d.steps.flatMap((s) => [...textOf(s.title), ...textOf(s.text)]),
    ]),
  ]
  checkLegacy(issues, where, strings, opts.legacy ?? compileLegacyNames())
}

/** Phrases that only make sense on the lesson page, never on a card. */
export const PAGE_REFERENCE =
  /\bsee the (?:table|code)\b|\bsiehe (?:Tabelle|Code)\b|\bthe table below\b|\bdie Tabelle unten\b|\b(?:are|is|stehen|steht) in (?:the|der) (?:table|Tabelle)\b|\b(?:first|second|third) code sample\b|\b(?:erste|zweite|dritte) Codebeispiel\b|\bthe diagram (?:above|below)\b|\bdas Diagramm (?:oben|unten)\b/i

const CARD_KINDS = ['concept', 'trap', 'takeaway'] as const

/** A status tag on an option (preview, GA, retired …); if only the correct option carries one, it gives the answer away. */
const STATUS_TAG = /\((?:preview|public preview|GA|generally available|legacy|classic|deprecated|retired|veraltet|eingestellt|abgekündigt)\)/i

/** Absolute words; when every distractor carries one and the key doesn't, a test-wise learner picks the key without knowing the topic. */
const ABSOLUTE = { en: /\b(?:only|always|never)\b/i, de: /\b(?:nur|immer|nie|niemals)\b/i } as const

const CATCH_ALL = /\b(?:all|none|both) of the (?:above|options)\b|\balle (?:genannten|oben)\b|\bkeine der (?:genannten|obigen)\b/i

/** Four exam-style options, exactly one correct, each with a short reason why it is right or wrong. */
function checkCardChoices(issues: Issue[], w: string, choices: CardFile['cards'][number]['choices'] | undefined) {
  if (!Array.isArray(choices) || choices.length === 0) {
    issues.push({ level: 'error', where: w, message: 'needs four multiple-choice options (choices)' })
    return
  }
  if (choices.length !== 4) issues.push({ level: 'error', where: w, message: `needs exactly four options (has ${choices.length})` })
  uniqueIds(issues, w, 'option', choices.map((o) => o.id))
  const correct = choices.filter((o) => o.correct === true)
  if (correct.length !== 1) issues.push({ level: 'error', where: w, message: `needs exactly one correct option (has ${correct.length})` })
  for (const o of choices) {
    checkL10n(issues, w, `option ${o.id} text`, o.text, { minLen: 1 })
    checkL10n(issues, w, `option ${o.id} why`, o.why, { minLen: 15 })
    for (const t of [...textOf(o.text), ...textOf(o.why)]) {
      if (CATCH_ALL.test(t)) issues.push({ level: 'error', where: w, message: `option ${o.id}: no "all/none of the above" options` })
      if (PAGE_REFERENCE.test(t)) issues.push({ level: 'error', where: w, message: `option ${o.id} points at the lesson page ("${t.match(PAGE_REFERENCE)![0]}")` })
    }
    for (const lang of ['en', 'de'] as const) {
      const text = o.text?.[lang] ?? ''
      const why = o.why?.[lang] ?? ''
      if (text.length > 220) issues.push({ level: 'warning', where: w, message: `option ${o.id} text.${lang} is ${text.length} characters; keep options under 220` })
      if (why.length > 320) issues.push({ level: 'warning', where: w, message: `option ${o.id} why.${lang} is ${why.length} characters; keep the reason under 320` })
    }
  }
  const tagged = choices.filter((o) => textOf(o.text).some((t) => STATUS_TAG.test(t)))
  if (tagged.length > 0 && tagged.every((o) => o.correct)) {
    issues.push({ level: 'error', where: w, message: 'only the correct option carries a status tag like "(preview)" — tag distractors accurately too, or move the status into the reason' })
  }
  if (correct.length === 1 && choices.length > 2) {
    for (const lang of ['en', 'de'] as const) {
      const hasAbsolute = (o: (typeof choices)[number]) => ABSOLUTE[lang].test(o.text?.[lang] ?? '')
      if (!hasAbsolute(correct[0]) && choices.filter((o) => !o.correct).every(hasAbsolute)) {
        issues.push({ level: 'error', where: w, message: `the correct option is the only one (${lang}) without "only", "always" or "never" — reword a distractor so the absolute word gives nothing away` })
      }
    }
  }
  for (const lang of ['en', 'de'] as const) {
    const texts = choices.map((o) => (o.text?.[lang] ?? '').trim().toLowerCase())
    if (new Set(texts).size !== texts.length) issues.push({ level: 'error', where: w, message: `two options have the same ${lang} text` })
    const right = correct.length === 1 ? (correct[0].text?.[lang] ?? '').length : 0
    const longestWrong = Math.max(0, ...choices.filter((o) => !o.correct).map((o) => (o.text?.[lang] ?? '').length))
    if (right > longestWrong * 1.15 && right - longestWrong > 12) {
      issues.push({ level: 'warning', where: w, message: `correct option (${lang}) is much longer than every distractor (${right} vs ${longestWrong} characters) — it gives the answer away` })
    }
  }
}

/** Deck-wide answer cues, as shares of cards. Picking at random scores 25 % on both. */
export interface AnswerCues {
  cards: number
  /** Where the key ranks by length — longest, second, third, shortest — as shares of cards (English and German averaged). */
  lengthRanks: [number, number, number, number]
  /** Cards with one option that clearly shares the most words with the other three. */
  centralCards: number
  /** Share of those central options that are the correct one (the "majority vote" cue). */
  centralKey: number
}

/** Deck limits: above these, length or word overlap lets a test-wise learner guess the answer. */
export const MAX_LONGEST_KEY = 1 / 3
export const MAX_TOP_TWO_KEY = 0.6
export const MAX_CENTRAL_KEY = 0.5
const CENTRAL_MARGIN = 0.04
const CUE_STOPWORDS = new Set('the and for with from that this you your can not only into than then when which who what use uses using via per its are'.split(' '))

function cueWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_.-]+/gu, ' ')
      .split(' ')
      .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
      .filter((w) => w.length > 2 && !CUE_STOPWORDS.has(w)),
  )
}

function wordOverlap(a: Set<string>, b: Set<string>): number {
  let shared = 0
  for (const w of a) if (b.has(w)) shared++
  const union = a.size + b.size - shared
  return union === 0 ? 0 : shared / union
}

/** Measures how often the key is the longest option or the "central" one that shares the most words with the others. */
export function answerCues(decks: Array<CardFile['cards'][number]['choices'] | undefined>): AnswerCues {
  let cards = 0
  const ranks: [number, number, number, number] = [0, 0, 0, 0]
  let central = 0
  let centralKey = 0
  for (const choices of decks) {
    if (!Array.isArray(choices) || choices.length < 3) continue
    const key = choices.findIndex((o) => o.correct === true)
    if (key < 0) continue
    cards++
    for (const lang of ['en', 'de'] as const) {
      const len = choices.map((o) => (o.text?.[lang] ?? '').length)
      const longer = len.filter((l, i) => i !== key && l > len[key]).length
      ranks[Math.min(longer, 3)] += 0.5
    }
    const words = choices.map((o) => cueWords(o.text?.en ?? ''))
    const score = words.map((w, i) => words.reduce((sum, other, j) => (j === i ? sum : sum + wordOverlap(w, other)), 0) / (words.length - 1))
    const top = score.indexOf(Math.max(...score))
    const runnerUp = Math.max(...score.filter((_, i) => i !== top))
    if (score[top] - runnerUp > CENTRAL_MARGIN) {
      central++
      if (top === key) centralKey++
    }
  }
  const lengthRanks = ranks.map((r) => (cards ? r / cards : 0)) as AnswerCues['lengthRanks']
  return { cards, lengthRanks, centralCards: central, centralKey: central ? centralKey / central : 0 }
}

const percent = (share: number) => `${Math.round(share * 100)} %`

export function checkAnswerCues(issues: Issue[], cues: AnswerCues) {
  const [longest, second] = cues.lengthRanks
  if (longest > MAX_LONGEST_KEY) {
    issues.push({ level: 'error', where: 'cards', message: `the correct option is the longest in ${percent(longest)} of cards; keep it at or under ${percent(MAX_LONGEST_KEY)} so length gives nothing away` })
  }
  if (longest + second > MAX_TOP_TWO_KEY) {
    issues.push({ level: 'error', where: 'cards', message: `the correct option is one of the two longest in ${percent(longest + second)} of cards; keep it at or under ${percent(MAX_TOP_TWO_KEY)} — make the key the third or shortest option more often` })
  }
  if (cues.centralKey > MAX_CENTRAL_KEY) {
    issues.push({ level: 'error', where: 'cards', message: `in ${percent(cues.centralKey)} of the ${cues.centralCards} cards with one central option, that option is the correct one; build distractors with the 2×2 pattern so the majority vote gives nothing away` })
  }
}

function lessonItems(lesson: Lesson, kind: (typeof CARD_KINDS)[number]): L10n[] {
  if (kind === 'concept') return lesson.concepts.map((c) => c.text)
  return kind === 'trap' ? lesson.traps : lesson.takeaways
}

/** One card per concept, exam trap and takeaway; fronts ask a question, backs answer it in both languages. */
export function validateCardFile(data: CardFile, lesson: Lesson | undefined, issues: Issue[], file: string, opts: { legacy?: readonly LegacyPattern[] } = {}) {
  const legacy = opts.legacy ?? compileLegacyNames()
  const seen = new Set<string>()
  for (const c of data.cards ?? []) {
    const w = `${file} › ${c.id}`
    const kind = c.source?.kind
    const index = c.source?.index
    if (!CARD_KINDS.includes(kind)) {
      issues.push({ level: 'error', where: w, message: `source.kind must be concept, trap or takeaway (got ${JSON.stringify(kind)})` })
      continue
    }
    const items = lesson ? lessonItems(lesson, kind) : []
    if (!Number.isInteger(index) || index < 0 || index >= items.length) {
      issues.push({ level: 'error', where: w, message: `source ${kind} ${index} does not exist in the lesson (it has ${items.length})` })
      continue
    }
    const expected = `z-${data.module}-${kind}-${index + 1}`
    if (c.id !== expected) issues.push({ level: 'error', where: w, message: `id should be "${expected}"` })
    const key = `${kind}:${index}`
    if (seen.has(key)) issues.push({ level: 'error', where: w, message: `second card for ${kind} ${index + 1}` })
    seen.add(key)
    checkL10n(issues, w, 'front', c.front, { minLen: 10 })
    for (const lang of ['en', 'de'] as const) {
      const f = c.front?.[lang]
      if (typeof f !== 'string') continue
      if (!f.trim().endsWith('?')) issues.push({ level: 'error', where: w, message: `front.${lang} must be a question ending with "?"` })
      if (f.length > 160) issues.push({ level: 'warning', where: w, message: `front.${lang} is ${f.length} characters; keep a card question under 160` })
    }
    if (kind !== 'concept' || c.back !== undefined) checkL10n(issues, w, 'back', c.back, { minLen: 15 })
    const answer = c.back ?? items[index]
    for (const s of textOf(answer)) {
      if (PAGE_REFERENCE.test(s)) {
        const what = c.back ? 'back' : `the lesson's ${kind} text (used as the answer)`
        issues.push({ level: 'error', where: w, message: `${what} points at the lesson page ("${s.match(PAGE_REFERENCE)![0]}") — give the card a back without it` })
      }
    }
    checkCardChoices(issues, w, c.choices)
    checkLegacy(issues, w, [...textOf(c.front), ...textOf(c.back), ...(c.choices ?? []).flatMap((o) => [...textOf(o.text), ...textOf(o.why)])], legacy)
  }
  if (!lesson) return
  for (const kind of CARD_KINDS) {
    lessonItems(lesson, kind).forEach((t, i) => {
      if (!seen.has(`${kind}:${i}`)) issues.push({ level: 'error', where: file, message: `${kind} ${i + 1} ("${textOf(t)[0]?.slice(0, 50)}…") has no card` })
    })
  }
}

export function validateContent(bundle: ContentBundle, options: ValidateOptions = {}): ValidationReport {
  const issues: Issue[] = []
  const today = options.today ?? new Date().toISOString().slice(0, 10)
  const only = options.only?.length ? new Set(options.only) : null
  const inScope = (moduleId: string) => !only || only.has(moduleId)
  const minPerBullet = options.minPerBullet ?? exam.targets.minPerBullet
  const minPerModule = options.minPerModule ?? exam.targets.minPerModule
  const ix = options.outline ? indexOutline(options.outline) : defaultOutline
  const { allBullets, bulletById, moduleById, modules } = ix
  const legacy = compileLegacyNames(options.legacyNames ?? exam.legacyNames)

  if (!only) {
    if (!ix.domains.length) issues.push({ level: 'error', where: 'src/content/domains.ts', message: 'no domains yet — add the skills outline from the study guide (domains, skill groups and bullets)' })
    if (!modules.length) issues.push({ level: 'error', where: 'src/content/course.ts', message: 'no modules yet — add the learning paths and modules of the official course (learn-catalog.mjs prints a draft)' })
  }
  const domainIds = new Set<string>()
  for (const d of ix.domains) {
    if (domainIds.has(d.id)) issues.push({ level: 'error', where: 'src/content/domains.ts', message: `duplicate domain id "${d.id}"` })
    domainIds.add(d.id)
    if (!(d.weight[0] > 0 && d.weight[1] >= d.weight[0])) issues.push({ level: 'error', where: `domain ${d.id}`, message: `weight [${d.weight.join(', ')}] must be the official range in percent, e.g. [25, 30]` })
    if (!d.groups.some((g) => g.bullets.length)) issues.push({ level: 'error', where: `domain ${d.id}`, message: 'has no skill bullets' })
  }
  uniqueIds(issues, 'src/content/domains.ts', 'skill bullet', allBullets.map((b) => b.id))
  const inPaths = new Map<string, string>()
  for (const p of ix.learningPaths) {
    if (!p.modules.length) issues.push({ level: 'error', where: `learning path ${p.id}`, message: 'has no modules' })
    for (const id of p.modules) {
      if (!moduleById.has(id)) issues.push({ level: 'error', where: `learning path ${p.id}`, message: `lists unknown module "${id}" — add it to modules in src/content/course.ts` })
      if (inPaths.has(id)) issues.push({ level: 'error', where: `learning path ${p.id}`, message: `module "${id}" is already in learning path ${inPaths.get(id)}` })
      inPaths.set(id, p.id)
    }
  }
  for (const m of modules) {
    if (!inPaths.has(m.id)) issues.push({ level: 'error', where: `course ${m.id}`, message: 'module is in no learning path — list it in its learning path in src/content/course.ts' })
    else if (inPaths.get(m.id) !== m.pathId) issues.push({ level: 'error', where: `course ${m.id}`, message: `pathId "${m.pathId}" differs from the learning path that lists it ("${inPaths.get(m.id)}")` })
  }

  const caseIds = new Set(bundle.cases.map((c) => c.id))
  uniqueIds(issues, 'cases', 'case', bundle.cases.map((c) => c.id))
  for (const c of bundle.cases) {
    if (!c.modules.some(inScope)) continue
    const where = `case ${c.id}`
    checkL10n(issues, where, 'title', c.title)
    checkL10n(issues, where, 'scenario', c.scenario, { minLen: 200 })
    for (const m of c.modules) if (!moduleById.has(m)) issues.push({ level: 'error', where, message: `unknown module "${m}"` })
    checkLegacy(issues, where, textOf(c.scenario), legacy)
    checkModels(issues, where, c, options.modelLifecycle, today)
  }

  const allQuestions: Question[] = []
  const fileModules = new Set<string>()
  for (const { file, data } of bundle.files) {
    if (fileModules.has(data.module)) issues.push({ level: 'error', where: file, message: `second question file for module "${data.module}"` })
    fileModules.add(data.module)
    if (!moduleById.has(data.module)) issues.push({ level: 'error', where: file, message: `unknown module "${data.module}"` })
    for (const q of data.questions ?? []) {
      allQuestions.push(q)
      if (inScope(data.module)) {
        validateQuestion(q, issues, { file, fileModule: data.module, caseIds, today, outline: ix, legacy })
        checkModels(issues, `${file} › ${q.id}`, q, options.modelLifecycle, today)
      }
    }
  }
  uniqueIds(issues, 'questions', 'question', allQuestions.map((q) => q.id))

  const lessonModules = new Map<string, string>()
  for (const { file, lesson } of bundle.lessons) {
    if (lessonModules.has(lesson.module)) issues.push({ level: 'error', where: file, message: `second lesson for module "${lesson.module}"` })
    lessonModules.set(lesson.module, file)
    if (inScope(lesson.module)) {
      validateLesson(lesson, issues, file, { outline: ix, legacy })
      checkModels(issues, `${file} › lesson ${lesson.module}`, lesson, options.modelLifecycle, today)
    }
  }

  let cardCount = 0
  let cues: AnswerCues | undefined
  if (bundle.cards) {
    const lessonOf = new Map(bundle.lessons.map(({ lesson }) => [lesson.module, lesson]))
    const cardModules = new Set<string>()
    for (const { file, data } of bundle.cards) {
      cardCount += data.cards?.length ?? 0
      if (cardModules.has(data.module)) issues.push({ level: 'error', where: file, message: `second card file for module "${data.module}"` })
      cardModules.add(data.module)
      if (!moduleById.has(data.module)) issues.push({ level: 'error', where: file, message: `unknown module "${data.module}"` })
      if (!file.endsWith(`/${data.module}.json`)) issues.push({ level: 'error', where: file, message: `card file for "${data.module}" must be named ${data.module}.json` })
      if (!inScope(data.module)) continue
      validateCardFile(data, lessonOf.get(data.module), issues, file, { legacy })
      checkModels(issues, `${file} › cards`, data, options.modelLifecycle, today)
    }
    uniqueIds(issues, 'cards', 'card', bundle.cards.flatMap(({ data }) => (data.cards ?? []).map((c) => c.id)))
    if (!only) {
      cues = answerCues(bundle.cards.flatMap(({ data }) => (data.cards ?? []).map((c) => c.choices)))
      checkAnswerCues(issues, cues)
    }
    for (const { file, lesson } of bundle.lessons) {
      if (inScope(lesson.module) && !cardModules.has(lesson.module)) issues.push({ level: 'error', where: file, message: `lesson has no Zettelkasten cards (src/content/cards/${lesson.module}.json)` })
    }
  }

  const moduleCounts: Record<string, number> = Object.fromEntries(modules.map((m) => [m.id, 0]))
  const domainCounts: Record<string, number> = Object.fromEntries(ix.domains.map((d) => [d.id, 0]))
  const typeCounts: Record<string, number> = {}
  const difficultyCounts: Record<string, number> = {}
  const primary = new Map<string, number>()
  const secondary = new Map<string, number>()
  for (const q of allQuestions) {
    moduleCounts[q.module] = (moduleCounts[q.module] ?? 0) + 1
    domainCounts[q.domain] = (domainCounts[q.domain] ?? 0) + 1
    typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1
    difficultyCounts[String(q.difficulty)] = (difficultyCounts[String(q.difficulty)] ?? 0) + 1
    primary.set(q.skill, (primary.get(q.skill) ?? 0) + 1)
    for (const s of q.skills ?? []) secondary.set(s, (secondary.get(s) ?? 0) + 1)
  }

  const modulesForBullet = (bulletId: string) => modules.filter((m: CourseModule) => m.skills.includes(bulletId)).map((m) => m.id)
  const coverage: CoverageRow[] = allBullets.map((b) => {
    const mods = modulesForBullet(b.id)
    return {
      bullet: b.id,
      domain: b.domain,
      text: b.en,
      modules: mods,
      lessons: mods.filter((m) => lessonModules.has(m)),
      primary: primary.get(b.id) ?? 0,
      secondary: secondary.get(b.id) ?? 0,
    }
  })

  for (const m of modules) {
    for (const s of m.skills) if (!bulletById.has(s)) issues.push({ level: 'error', where: `course ${m.id}`, message: `maps to unknown bullet "${s}"` })
  }

  if (!only) {
    for (const row of coverage) {
      if (row.modules.length === 0) issues.push({ level: 'error', where: `coverage ${row.bullet}`, message: 'skills-outline bullet is not mapped to any module' })
      if (row.primary === 0) issues.push({ level: 'error', where: `coverage ${row.bullet}`, message: 'skills-outline bullet has no questions' })
      else if (row.primary < minPerBullet) issues.push({ level: 'warning', where: `coverage ${row.bullet}`, message: `only ${row.primary} question(s); aim for ≥ ${minPerBullet}` })
    }
    for (const m of modules) {
      if (!lessonModules.has(m.id)) issues.push({ level: 'error', where: `coverage ${m.id}`, message: 'module has no lesson' })
      const n = moduleCounts[m.id] ?? 0
      if (n === 0) issues.push({ level: 'error', where: `coverage ${m.id}`, message: 'module has no questions' })
      else if (n < minPerModule) issues.push({ level: 'warning', where: `coverage ${m.id}`, message: `only ${n} question(s); aim for ≥ ${minPerModule}` })
    }
    for (const c of bundle.cases) {
      const n = allQuestions.filter((q) => q.caseId === c.id).length
      if (n < 2) issues.push({ level: 'error', where: `case ${c.id}`, message: `case study needs at least two questions (has ${n})` })
    }
  }

  return {
    issues,
    errors: issues.filter((i) => i.level === 'error'),
    warnings: issues.filter((i) => i.level === 'warning'),
    coverage,
    moduleCounts,
    domainCounts,
    typeCounts,
    difficultyCounts,
    cardCount,
    cues,
  }
}
