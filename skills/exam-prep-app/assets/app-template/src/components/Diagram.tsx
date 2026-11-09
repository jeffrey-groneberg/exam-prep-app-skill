import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { Diagram as DiagramData, DiagramNode, Lang, Tone } from '../lib/types.ts'
import { edgePoints, GROUP_RADIUS, groupTitleRect, nodeContentLayout, placeEdgeLabels, storeCap, type Outlined, type Pt } from '../lib/geometry.ts'
import { isDiagramIcon, type DiagramIconId } from '../content/diagram-icons.ts'
import { messages, tx } from '../i18n/index.ts'
import { summaryParts, summaryPath } from '../lib/diagram-summary.ts'
import { renderInline } from './inline.tsx'
import { Icon } from './Icon.tsx'
import { FeedbackLink } from './Feedback.tsx'
import type { IconName } from './icons.generated.ts'
import { exam } from '../config.ts'

const TONES: Tone[] = ['user', 'app', 'platform', 'model', 'data', 'tool', 'safety', 'external', 'neutral']

/** Thumbnail glyph per tone (Fluent UI System Icons) for nodes without an official product icon. */
const TONE_ICON: Record<Tone, IconName> = {
  user: 'person',
  app: 'window',
  platform: 'cloud',
  model: 'brain',
  data: 'database',
  tool: 'wrench',
  safety: 'shield',
  external: 'globe',
  neutral: 'cube',
}

// Official product icons registered in src/content/diagram-icons.ts (unaltered SVG files in src/assets/diagram-icons/),
// referenced as images so their gradient ids never clash.
const ICON_URLS = import.meta.glob<string>('../assets/diagram-icons/*.svg', { eager: true, query: '?url', import: 'default' })
const diagramIconUrl = (id: DiagramIconId | undefined): string | undefined => (id && isDiagramIcon(id) ? ICON_URLS[`../assets/diagram-icons/${id}.svg`] : undefined)

function NodeShape({ n }: { n: DiagramNode }) {
  const { x, y, w, h } = n
  switch (n.shape) {
    case 'pill':
      return <rect className="dg-shape" x={x} y={y} width={w} height={h} rx={h / 2} />
    case 'store': {
      const e = storeCap(h)
      return (
        <g>
          <path className="dg-shape" d={`M${x},${y + e} a${w / 2},${e} 0 0 1 ${w},0 v${h - 2 * e} a${w / 2},${e} 0 0 1 ${-w},0 z`} />
          <path className="dg-shape-line" d={`M${x},${y + e} a${w / 2},${e} 0 0 0 ${w},0`} />
        </g>
      )
    }
    case 'doc': {
      const f = 14
      return (
        <g>
          <path className="dg-shape" d={`M${x},${y} h${w - f} l${f},${f} v${h - f} h${-w} z`} />
          <path className="dg-shape-line" d={`M${x + w - f},${y} v${f} h${f}`} />
        </g>
      )
    }
    case 'diamond': {
      const p = 14
      return <path className="dg-shape" d={`M${x + p},${y} h${w - 2 * p} l${p},${h / 2} l${-p},${h / 2} h${-(w - 2 * p)} l${-p},${-h / 2} z`} />
    }
    default:
      return <rect className="dg-shape" x={x} y={y} width={w} height={h} rx={8} />
  }
}

function NodeText({ n, lang }: { n: DiagramNode; lang: Lang }) {
  const label = tx(n.label, lang).split('\n')
  const sub = n.sub ? tx(n.sub, lang).split('\n') : []
  const iconUrl = diagramIconUrl(n.icon)
  const { cx, top, labelCx, icon } = nodeContentLayout(n, label, sub, !!iconUrl)
  const lineH = 18
  const subH = 16
  return (
    <g>
      {iconUrl && icon && <image className="dg-icon" href={iconUrl} x={icon.x} y={icon.y} width={icon.w} height={icon.h} aria-hidden="true" />}
      {label.map((l, i) => (
        <text key={`l${i}`} className="dg-label" x={labelCx} y={top + i * lineH} textAnchor="middle">
          {l}
        </text>
      ))}
      {sub.map((s, i) => (
        <text key={`s${i}`} className="dg-sub" x={cx} y={top + label.length * lineH + i * subH - 2} textAnchor="middle">
          {s}
        </text>
      ))}
    </g>
  )
}

interface DiagramProps {
  diagram: DiagramData
  lang: Lang
  /** Static thumbnail: no controls, no captions. */
  mini?: boolean
}

function SummaryText({ text }: { text: string }) {
  return summaryParts(text).map((p, i) =>
    p.code ? (
      <span key={i} className="dg-summary__code">
        {p.text}
      </span>
    ) : (
      <Fragment key={i}>{p.text}</Fragment>
    ),
  )
}

function DiagramSummary({ diagram, lang }: { diagram: DiagramData; lang: Lang }) {
  const path = summaryPath(diagram)
  const flat = (t: Parameters<typeof tx>[0]) => tx(t, lang).replace(/\s*\n\s*/g, ' ')
  return (
    <div className="dg-summary" lang={lang} role="img" aria-label={`${flat(diagram.title)}: ${path.map((p) => flat(p.node.label)).join(', ')}`}>
      {path.map(({ node: n, linked }, i) => (
        <Fragment key={n.id}>
          {i > 0 && (linked ? <Icon name="arrowRight" size={18} className="dg-summary__arrow" /> : <span className="dg-summary__gap" aria-hidden="true" />)}
          <div className={`dg-summary__item tone-${n.tone}`}>
            <span className="dg-summary__tile">
              {diagramIconUrl(n.icon) ? <img src={diagramIconUrl(n.icon)} width={24} height={24} alt="" /> : <Icon name={TONE_ICON[n.tone] ?? 'cube'} size={24} />}
            </span>
            <span className="dg-summary__label">
              <SummaryText text={tx(n.label, lang)} />
            </span>
            {n.sub && (
              <span className="dg-summary__sub">
                <SummaryText text={tx(n.sub, lang)} />
              </span>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

export function Diagram({ diagram, lang, mini = false }: DiagramProps) {
  const t = messages(lang)
  const uid = useId().replace(/:/g, '')
  const [step, setStep] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const steps = diagram.steps
  const active = step >= 0 ? steps[step] : null
  const focus = useMemo(() => new Set(active?.focus ?? []), [active])

  const shapes = useMemo(() => {
    const m = new Map<string, Outlined>()
    for (const g of diagram.groups ?? []) m.set(g.id, { ...g, radius: GROUP_RADIUS })
    for (const n of diagram.nodes) m.set(n.id, n)
    return m
  }, [diagram])

  const paths = useMemo(
    () => diagram.edges.flatMap((e) => {
      const pts = edgePoints(e, shapes)
      return pts ? [{ id: e.id, pts }] : []
    }),
    [diagram, shapes],
  )

  const labels = useMemo(() => {
    const ptsById = new Map(paths.map((p) => [p.id, p.pts]))
    const items = diagram.edges.flatMap((e) => {
      const pts: Pt[] | undefined = ptsById.get(e.id)
      return e.label && pts ? [{ id: e.id, text: tx(e.label, lang), pts }] : []
    })
    const titles = (diagram.groups ?? []).map((g) => groupTitleRect(g, tx(g.label, lang)))
    const canvas = { x: 0, y: 0, w: diagram.width, h: diagram.height }
    return new Map(placeEdgeLabels(items, paths, diagram.nodes, titles, canvas).map((l) => [l.id, l]))
  }, [diagram, lang, paths])

  // Endpoints of a lit arrow stay readable (context), even when the step doesn't name them.
  const context = useMemo(() => {
    const c = new Set<string>()
    for (const e of diagram.edges) {
      if (!focus.has(e.id)) continue
      if (!focus.has(e.from)) c.add(e.from)
      if (!focus.has(e.to)) c.add(e.to)
    }
    return c
  }, [diagram, focus])

  // On narrow screens the canvas scrolls sideways: bring the lit part of each step into view.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active || canvas.scrollWidth <= canvas.clientWidth + 4) return
    const svg = canvas.querySelector('svg')
    if (!svg) return
    const svgBox = svg.getBoundingClientRect()
    const scale = svgBox.width / diagram.width
    const room = canvas.clientWidth - 32
    const nodeIds = new Set(diagram.nodes.map((n) => n.id))
    const boxesOf = (ids: Iterable<string>) => [...ids].map((id) => shapes.get(id)).filter((b): b is Outlined => !!b)
    // Aim at the nodes the step names; arrow endpoints join (nearest first) only while everything still
    // fits; groups only when a step lights nothing else.
    const own = boxesOf([...focus].filter((id) => nodeIds.has(id)))
    const ends = boxesOf(context)
    const boxes = own.length ? own : ends.length ? ends : boxesOf(focus)
    if (!boxes.length) return
    let minX = Math.min(...boxes.map((b) => b.x))
    let maxX = Math.max(...boxes.map((b) => b.x + b.w))
    if (own.length) {
      const mid = (minX + maxX) / 2
      const byDistance = [...ends].sort((a, b) => Math.abs(a.x + a.w / 2 - mid) - Math.abs(b.x + b.w / 2 - mid))
      for (const b of byDistance) {
        const lo = Math.min(minX, b.x)
        const hi = Math.max(maxX, b.x + b.w)
        if ((hi - lo) * scale > room) continue
        minX = lo
        maxX = hi
      }
    }
    const svgLeft = svgBox.left - canvas.getBoundingClientRect().left + canvas.scrollLeft
    const left = (maxX - minX) * scale > room ? svgLeft + minX * scale - 16 : svgLeft + ((minX + maxX) / 2) * scale - canvas.clientWidth / 2
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    canvas.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' })
  }, [active, focus, context, shapes, diagram])

  const go = useCallback(
    (next: number) => {
      setStep(Math.max(-1, Math.min(steps.length - 1, next)))
    },
    [steps.length],
  )

  useEffect(() => {
    if (!playing) return
    const timer = setTimeout(() => {
      if (step >= steps.length - 1) setPlaying(false)
      else go(step + 1)
    }, step < 0 ? 600 : 4200)
    return () => clearTimeout(timer)
  }, [playing, step, steps.length, go])

  const cls = (id: string, base: string) => {
    if (!active) return base
    if (focus.has(id)) return `${base} is-focus`
    return context.has(id) ? `${base} is-context` : `${base} is-dim`
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(step + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(step - 1)
    } else if (e.key === 'Escape') go(-1)
  }

  const usedTones = TONES.filter((tone) => diagram.nodes.some((n) => n.tone === tone))
  const title = tx(diagram.title, lang)

  const svg = (
    <svg
      className="dg-svg"
      lang={lang}
      viewBox={`0 0 ${diagram.width} ${diagram.height}`}
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title id={`${uid}-t`}>{title}</title>
      <desc id={`${uid}-d`}>{steps.map((s, i) => `${i + 1}. ${tx(s.title, lang)}: ${tx(s.text, lang)}`).join(' ')}</desc>
      <defs>
        <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="dg-arrowhead" />
        </marker>
        <marker id={`${uid}-arrow-on`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="dg-arrowhead is-on" />
        </marker>
      </defs>
      {(diagram.groups ?? []).map((g) => (
        <g key={g.id} className={cls(g.id, `dg-group tone-${g.tone ?? 'neutral'}`)} data-group={g.id}>
          <rect x={g.x} y={g.y} width={g.w} height={g.h} rx={12} />
          <text x={g.x + 14} y={g.y + 20} className="dg-group-label">
            {tx(g.label, lang)}
          </text>
        </g>
      ))}
      {paths.map(({ id, pts }) => {
        const e = diagram.edges.find((x) => x.id === id)!
        const on = active ? focus.has(e.id) : false
        const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
        return (
          <path
            key={e.id}
            d={d}
            className={cls(e.id, `dg-edge${e.dashed ? ' is-dashed' : ''}`)}
            data-edge={e.id}
            data-from={e.from}
            data-to={e.to}
            data-bidir={e.bidir ? '' : undefined}
            markerEnd={`url(#${uid}-${on ? 'arrow-on' : 'arrow'})`}
            markerStart={e.bidir ? `url(#${uid}-${on ? 'arrow-on' : 'arrow'})` : undefined}
          />
        )
      })}
      {diagram.nodes.map((n) => (
        <g key={n.id} className={cls(n.id, `dg-node tone-${n.tone}`)} data-node={n.id} data-shape={n.shape ?? 'box'}>
          <NodeShape n={n} />
          <NodeText n={n} lang={lang} />
        </g>
      ))}
      {[...labels.values()].map((l) => (
        <g key={`${l.id}-label`} className={cls(l.id, 'dg-edge-label')} data-label-for={l.id} data-mode={l.mode}>
          <rect x={l.box.x} y={l.box.y} width={l.box.w} height={l.box.h} rx={10} />
          <text x={l.box.x + l.box.w / 2} y={l.box.y + l.box.h / 2 + 4} textAnchor="middle">
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  )

  if (mini) return <DiagramSummary diagram={diagram} lang={lang} />

  return (
    <figure className="dg" aria-label={title}>
      <figcaption className="dg-head">
        <div className="dg-head__row">
          <h3 className="dg-title" lang={lang}>
            {title}
          </h3>
          <FeedbackLink
            about="diagram"
            compact
            target={{
              subject: t.feedback.subject.diagram(diagram.id),
              details: [
                [t.feedback.detail.diagram, title],
                [t.feedback.detail.step, step < 0 ? t.diagram.whole : t.feedback.stepOf(step + 1, diagram.steps.length)],
              ],
            }}
          />
        </div>
        {diagram.caption && (
          <p className="dg-caption" lang={lang}>
            {tx(diagram.caption, lang)}
          </p>
        )}
      </figcaption>
      <div ref={canvasRef} className={`dg-canvas${active ? ' has-focus' : ''}`} tabIndex={0} onKeyDown={onKey} aria-label={t.diagram.keys(title)}>
        {svg}
      </div>
      <p className="dg-swipe-hint" aria-hidden="true">
        {t.diagram.swipe}
        <Icon name="arrowRight" size={14} />
      </p>
      <div className="dg-controls">
        <button type="button" className="btn btn--secondary btn--small" onClick={() => go(step - 1)} disabled={step < 0}>
          <Icon name="chevronLeft" size={16} />
          {t.common.back}
        </button>
        <ol className="dg-steps" aria-label={t.diagram.steps}>
          {steps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className={`dg-step-dot${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
                aria-current={i === step ? 'step' : undefined}
                aria-label={t.diagram.step(i + 1, tx(s.title, lang))}
                onClick={() => {
                  setPlaying(false)
                  go(i)
                }}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="btn btn--primary btn--small" onClick={() => go(step + 1)} disabled={step >= steps.length - 1}>
          {step < 0 ? t.diagram.stepByStep : t.common.next}
          <Icon name="chevronRight" size={16} />
        </button>
        <button
          type="button"
          className="btn btn--subtle btn--small"
          onClick={() => {
            if (!playing && step >= steps.length - 1) setStep(-1)
            setPlaying((p) => !p)
          }}
          aria-pressed={playing}
        >
          <Icon name={playing ? 'pause' : 'play'} size={16} />
          {playing ? t.diagram.pause : t.diagram.play}
        </button>
        {step >= 0 && (
          <button type="button" className="btn btn--subtle btn--small" data-whole="" onClick={() => { setPlaying(false); go(-1) }}>
            {t.diagram.whole}
          </button>
        )}
      </div>
      <div className="dg-narration" aria-live="polite">
        {active ? (
          <>
            <p className="dg-narration__title">
              <span className="dg-narration__num">{step + 1}</span>
              <span lang={lang}>{tx(active.title, lang)}</span>
            </p>
            <p className="dg-narration__text" lang={lang}>
              {renderInline(tx(active.text, lang))}
            </p>
          </>
        ) : (
          <p className="dg-narration__text dg-narration__text--hint">
            {t.diagram.hint(steps.length)}
          </p>
        )}
      </div>
      <ul className="dg-legend" aria-label={t.common.legend}>
        {usedTones.map((tone) => (
          <li key={tone}>
            <span className={`dg-swatch tone-${tone}`} aria-hidden="true" />
            {exam.toneLabels?.[tone] ? tx(exam.toneLabels[tone], lang) : t.labels.tone[tone]}
          </li>
        ))}
      </ul>
    </figure>
  )
}
