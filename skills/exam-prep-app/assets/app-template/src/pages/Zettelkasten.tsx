import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { FeedbackLink } from '../components/Feedback.tsx'
import { feedbackEnabled } from '../lib/feedback.ts'
import { RichText } from '../components/RichText.tsx'
import { ChoiceList } from '../components/QuestionView.tsx'
import { orderChoices, type ChoiceSet } from '../lib/choices.ts'
import { renderInline } from '../components/inline.tsx'
import { ZettelBox } from '../components/ZettelBox.tsx'
import { store } from '../lib/store.ts'
import { advance, buildDeck, countByFach, fachOf, GOAL, type Fach, type OwnChoice, type OwnZettel, type ZettelStates } from '../lib/zettel.ts'
import { nextRound, ROUND_SIZE, useZettelBox } from '../lib/zettel-box.ts'
import { tx, useT, type Messages } from '../i18n/index.ts'
import type { Lang, Zettel } from '../lib/types.ts'
import { orderedModules, starterZettel } from '../content/index.ts'
import { learningPaths, moduleById } from '../content/outline.ts'

const moduleNumber = new Map(orderedModules.map((m, i) => [m.id, i + 1]))

const ids = (cards: readonly Zettel[]) => cards.map((z) => z.id)
/** Own cards are written in the learner's own words, so they carry no content language. */
const langOf = (z: Zettel, lang: Lang) => (z.kind === 'own' ? undefined : lang)

function FachBadge({ fach }: { fach: Fach }) {
  const t = useT()
  return <span className={`zk-fach zk-fach--${fach}`}>{t.cards.stage(fach)}</span>
}

function SplitBar({ counts }: { counts: readonly [number, number, number] }) {
  const t = useT()
  return (
    <span className="zk-split" role="img" aria-label={t.cards.split(counts[0], counts[1], counts[2])}>
      {counts.map((n, i) => (n > 0 ? <span key={i} className={`zk-split__seg zk-split__seg--${i + 1}`} style={{ flexGrow: n }} /> : null))}
    </span>
  )
}

/**
 * "All back to stage 1" asks first: it undoes the learner's progress for every card in scope. The question
 * focuses Cancel, never the destructive action; afterwards focus returns to the trigger (Cancel) or moves
 * to `focusAfter` (Put back), and a status line says what happened.
 */
function ResetCards({ cardIds, states, focusAfter }: { cardIds: string[]; states: ZettelStates; focusAfter: string }) {
  const t = useT()
  const [asking, setAsking] = useState(false)
  const [announce, setAnnounce] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const moved = cardIds.filter((id) => fachOf(states, id) > 1)
  const status = (
    <p className="sr-only" role="status">
      {announce}
    </p>
  )
  const cancel = () => {
    setAsking(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const reset = () => {
    store.resetZettel(moved)
    setAsking(false)
    setAnnounce(t.cards.resetDone(moved.length))
    requestAnimationFrame(() => document.getElementById(focusAfter)?.focus())
  }
  if (!moved.length) return status
  if (!asking) {
    return (
      <>
        {status}
        <button
          ref={triggerRef}
          type="button"
          className="btn btn--subtle btn--large"
          onClick={() => {
            setAnnounce('')
            setAsking(true)
          }}
        >
          <Icon name="reset" size={18} />
          {t.cards.resetAll}
        </button>
      </>
    )
  }
  return (
    <>
      {status}
      <div className="zk-confirm" role="group" aria-labelledby="zk-confirm-q" onKeyDown={(e) => e.key === 'Escape' && cancel()}>
        <p id="zk-confirm-q" className="zk-confirm__q">
          {t.cards.resetAsk(moved.length)}
        </p>
        <button type="button" className="btn btn--danger btn--large" onClick={reset}>
          {t.cards.putBack}
        </button>
        <button type="button" className="btn btn--subtle btn--large" autoFocus onClick={cancel}>
          {t.common.cancel}
        </button>
      </div>
    </>
  )
}

/** Stage colours of the split bars, as their legend. */
function FachLegend() {
  const t = useT()
  return (
    <ul className="zk-legend" aria-label={t.cards.legend}>
      {[1, 2, 3].map((f) => (
        <li key={f}>
          <span className={`zk-legend__swatch zk-split__seg--${f}`} aria-hidden="true" />
          {t.cards.stage(f)}
        </li>
      ))}
    </ul>
  )
}

/* ---------- Editor ---------- */

interface EditorProps {
  initial?: OwnZettel
  defaultModule?: string | null
  onDone: () => void
}

const EMPTY_WRONG = [
  { text: '', why: '' },
  { text: '', why: '' },
  { text: '', why: '' },
]

export function ZettelEditor({ initial, defaultModule = null, onDone }: EditorProps) {
  const t = useT()
  const initialRight = initial?.choices?.find((c) => c.correct)?.text ?? ''
  const initialWrong = initial?.choices?.filter((c) => !c.correct).map((c) => ({ text: c.text, why: c.why ?? '' })) ?? []
  const [front, setFront] = useState(initial?.front ?? '')
  const [back, setBack] = useState(initial?.back ?? '')
  const [module, setModule] = useState(initial?.module ?? defaultModule ?? '')
  const [right, setRight] = useState(initialRight)
  const [wrong, setWrong] = useState(() => EMPTY_WRONG.map((e, i) => initialWrong[i] ?? e))
  const [saved, setSaved] = useState(0)
  const frontRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => frontRef.current?.focus(), [])
  const wrongFilled = wrong.filter((w) => w.text.trim())
  const usesChoices = right.trim() !== '' || wrongFilled.length > 0
  const choicesComplete = right.trim() !== '' && wrongFilled.length >= 2
  const ready = front.trim().length > 0 && back.trim().length > 0 && (!usesChoices || choicesComplete)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ready) return
    const choices: OwnChoice[] | undefined = usesChoices
      ? [{ text: right.trim(), correct: true }, ...wrongFilled.map((w) => ({ text: w.text.trim(), correct: false, why: w.why.trim() || undefined }))]
      : undefined
    const card = { front: front.trim(), back: back.trim(), module: module || null, choices }
    if (initial) {
      store.updateOwnZettel(initial.id, card)
      onDone()
      return
    }
    store.addOwnZettel(card)
    setFront('')
    setBack('')
    setRight('')
    setWrong(EMPTY_WRONG)
    setSaved((n) => n + 1)
    frontRef.current?.focus()
  }

  return (
    <form className="zk-editor" onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && onDone()}>
      <h2 className="panel__title">{initial ? t.cards.editTitle : t.cards.newTitle}</h2>
      <label className="zk-field">
        <span className="zk-field__label">{t.cards.front}</span>
        <textarea ref={frontRef} className="zk-input" rows={3} value={front} onChange={(e) => setFront(e.target.value)} placeholder={t.cards.frontPlaceholder} required />
      </label>
      <label className="zk-field">
        <span className="zk-field__label">{t.cards.back}</span>
        <textarea className="zk-input" rows={4} value={back} onChange={(e) => setBack(e.target.value)} placeholder={t.cards.backPlaceholder} required />
      </label>
      <details className="zk-editor__choices" open={initialRight !== ''}>
        <summary>{t.cards.options}</summary>
        <p className="zk-editor__hint">{t.cards.optionsHint}</p>
        <label className="zk-field">
          <span className="zk-field__label">{t.cards.rightOption}</span>
          <input className="zk-input" value={right} onChange={(e) => setRight(e.target.value)} />
        </label>
        {wrong.map((w, i) => (
          <div key={i} className="zk-editor__wrong">
            <label className="zk-field">
              <span className="zk-field__label">{t.cards.wrongOption(i + 1)}</span>
              <input className="zk-input" value={w.text} onChange={(e) => setWrong(wrong.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
            </label>
            <label className="zk-field">
              <span className="zk-field__label">{t.cards.whyWrong}</span>
              <input className="zk-input" value={w.why} onChange={(e) => setWrong(wrong.map((x, j) => (j === i ? { ...x, why: e.target.value } : x)))} />
            </label>
          </div>
        ))}
        {usesChoices && !choicesComplete && (
          <p className="zk-editor__missing" role="status">
            {t.cards.missing(!right.trim(), Math.max(0, 2 - wrongFilled.length))}
          </p>
        )}
      </details>
      <label className="zk-field">
        <span className="zk-field__label">{t.cards.module}</span>
        <select className="select zk-input" value={module} onChange={(e) => setModule(e.target.value)}>
          <option value="">{t.cards.noModule}</option>
          {learningPaths.map((p) => (
            <optgroup key={p.id} label={p.title}>
              {p.modules.filter((id) => moduleById.has(id)).map((id) => (
                <option key={id} value={id}>
                  {moduleNumber.get(id)}. {moduleById.get(id)?.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <p className="zk-editor__hint">{t.cards.editorHint}</p>
      <div className="zk-editor__actions">
        <button type="submit" className="btn btn--primary" disabled={!ready}>
          {initial ? t.cards.save : t.cards.addToBox}
        </button>
        <button type="button" className="btn btn--subtle" onClick={onDone}>
          {saved ? t.cards.done : t.common.cancel}
        </button>
        {saved > 0 && (
          <p className="zk-editor__saved" role="status">
            <Icon name="check" size={16} />
            {t.cards.saved(saved)}
          </p>
        )}
      </div>
    </form>
  )
}

/* ---------- Overview: the box and the register ---------- */

interface DividerProps {
  to: string
  learnTo: string
  tab: string
  title: string
  cards: readonly Zettel[]
  states: ZettelStates
  slot: number
  /** The next mixed round deals cards from this register. */
  next?: boolean
}

function Divider({ to, learnTo, tab, title, cards, states, slot, next = false }: DividerProps) {
  const t = useT()
  const counts = countByFach(ids(cards), states)
  const open = counts[0] + counts[1]
  const done = cards.length > 0 && open === 0
  return (
    <li className={`zk-divider${done ? ' is-done' : ''}`} style={{ '--slot': slot } as CSSProperties}>
      <span className="zk-divider__tab" aria-hidden="true">
        {done && <Icon name="check" size={12} />}
        {tab}
      </span>
      <div className="zk-divider__body">
        <div className="zk-divider__text">
          <Link to={to} className="zk-divider__title">
            {title}
          </Link>
          <span className="zk-divider__meta">
            {cards.length ? t.cards.meta(cards.length, counts[2]) : t.cards.emptyTab}
            {done && <span className="sr-only">{t.cards.allFrontSr}</span>}
            {next && <span className="tag tag--brand">{t.cards.nextRound}</span>}
          </span>
        </div>
        {cards.length > 0 && <SplitBar counts={counts} />}
        {open > 0 ? (
          <Link to={learnTo} className="btn btn--secondary btn--small zk-divider__go" aria-label={t.cards.studyLabel(title, open)}>
            {t.cards.study}
          </Link>
        ) : (
          <span className="zk-divider__go zk-divider__state">{done ? t.cards.allFront : ''}</span>
        )}
      </div>
    </li>
  )
}

/** The divider in front of a learning path's modules: its whole split and a round across the path. */
function PathDivider({ index, pathId, title, cards, states }: { index: number; pathId: string; title: string; cards: readonly Zettel[]; states: ZettelStates }) {
  const t = useT()
  const counts = countByFach(ids(cards), states)
  const open = counts[0] + counts[1]
  const done = cards.length > 0 && open === 0
  return (
    <div className={`zk-divider zk-divider--path${done ? ' is-done' : ''}`}>
      <span className="zk-divider__tab" aria-hidden="true">
        {done && <Icon name="check" size={12} />}
        {t.cards.pathTab(index)}
      </span>
      <div className="zk-divider__body">
        <div className="zk-divider__text">
          <h3 className="zk-divider__heading">
            <span className="sr-only">{t.cards.pathSr(index)}</span>
            {title}
          </h3>
          <span className="zk-divider__meta">{t.cards.meta(cards.length, counts[2])}</span>
        </div>
        <SplitBar counts={counts} />
        {open > 0 ? (
          <Link to={`/cards/round?path=${pathId}`} className="btn btn--secondary btn--small zk-divider__go" aria-label={t.cards.pathRound(index, ROUND_SIZE)}>
            {t.cards.study}
          </Link>
        ) : (
          <span className="zk-divider__go zk-divider__state">{done ? t.cards.allFront : ''}</span>
        )}
      </div>
    </div>
  )
}

export function Zettelkasten() {
  const t = useT()
  const { cards, zettel, lessonsRead, ownZettel } = useZettelBox()
  const { search } = useLocation()
  const [adding, setAdding] = useState(() => new URLSearchParams(search).get('new') === '1')
  const counts = countByFach(ids(cards), zettel)
  const round = nextRound(cards, zettel, lessonsRead)
  const byModule = useMemo(() => {
    const map = new Map<string, Zettel[]>()
    for (const z of cards) if (z.module) map.set(z.module, [...(map.get(z.module) ?? []), z])
    return map
  }, [cards])
  const own = cards.filter((z) => z.kind === 'own')
  const pct = cards.length ? Math.round((counts[2] / cards.length) * 100) : 0
  const moduleOf = new Map(cards.map((z) => [z.id, z.module]))
  const nextModules = new Set(round.map((id) => moduleOf.get(id)))

  return (
    <div className="page zk">
      <header className="page-head">
        <h1 className="page-title">{t.cards.title}</h1>
        <p className="page-sub">{t.cards.sub}</p>
      </header>

      <div className="zk__grid">
        <div className="zk__side">
          <section className="panel zk-boxpanel" aria-labelledby="zk-box-h">
            <h2 id="zk-box-h" className="panel__title" tabIndex={-1}>
              {t.cards.box}
            </h2>
            <ZettelBox counts={counts} />
            <p className="zk-tally">
              <strong>{counts[2]}</strong>
              {t.cards.tally(cards.length)}
            </p>
            <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t.cards.inFront(pct)}>
              <span className="meter__fill bg-brand" style={{ width: `${pct}%` }} />
            </div>
            <div className="zk-actions">
              {round.length > 0 && (
                <Link to="/cards/round" className="btn btn--primary btn--large">
                  {t.cards.round(round.length)}
                  <Icon name="arrowRight" size={18} />
                </Link>
              )}
              <button type="button" className="btn btn--secondary btn--large" aria-expanded={adding} aria-controls="zk-editor" onClick={() => setAdding(true)}>
                <Icon name="add" size={18} />
                {t.cards.newCard}
              </button>
              {round.length === 0 && <ResetCards cardIds={ids(cards)} states={zettel} focusAfter="zk-box-h" />}
            </div>
            {cards.length > 0 && <p className="zk-note">{round.length > 0 ? t.cards.roundNote(ROUND_SIZE) : t.cards.allFrontNote}</p>}
          </section>
          {adding && (
            <section id="zk-editor" className="panel">
              <ZettelEditor onDone={() => setAdding(false)} />
            </section>
          )}
        </div>

        <section className="panel zk-register" aria-labelledby="zk-reg-h">
          <div className="panel__head">
            <h2 id="zk-reg-h" className="panel__title">
              {t.cards.index}
            </h2>
            <FachLegend />
          </div>
          {!learningPaths.length && <p className="zk-note">{t.cards.noPaths}</p>}
          {learningPaths.map((p, pi) => (
            <div key={p.id} className="zk-path">
              <PathDivider index={pi + 1} pathId={p.id} title={p.title} cards={p.modules.flatMap((id) => byModule.get(id) ?? [])} states={zettel} />
              <ol className="zk-dividers" aria-label={t.cards.pathModules(pi + 1)}>
                {p.modules.filter((id) => moduleById.has(id)).map((id, i) => (
                  <Divider
                    key={id}
                    to={`/cards/module/${id}`}
                    learnTo={`/cards/round?module=${id}`}
                    tab={t.cards.moduleTab(moduleNumber.get(id) ?? 0)}
                    title={moduleById.get(id)?.title ?? id}
                    cards={byModule.get(id) ?? []}
                    states={zettel}
                    slot={i % 4}
                    next={nextModules.has(id)}
                  />
                ))}
              </ol>
            </div>
          ))}
          <div className="zk-path">
            <h3 className="zk-own__title">{t.cards.ownTitle}</h3>
            <ol className="zk-dividers">
              <Divider to="/cards/own" learnTo="/cards/round?own=1" tab={t.cards.ownTab} title={t.cards.ownCards} cards={own} states={zettel} slot={0} next={own.some((z) => round.includes(z.id))} />
            </ol>
            {ownZettel.length === 0 && <p className="zk-note">{t.cards.ownHint}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------- One module's cards (or the own cards) ---------- */

/** Feedback for a starter card; the issue names the card and quotes its question. */
function ZettelFeedback({ z, iconOnly = false }: { z: Zettel; iconOnly?: boolean }) {
  const t = useT()
  const f = t.feedback
  return (
    <FeedbackLink
      about="card"
      iconOnly={iconOnly}
      compact
      target={{
        subject: f.subject.card(z.id),
        details: [
          [f.detail.module, z.module ?? f.ownCard],
          [f.detail.kind, t.labels.kind[z.kind]],
        ],
        excerpt: z.front,
      }}
    />
  )
}

function CardItem({ z, fach, lang }: { z: Zettel; fach: Fach; lang: Lang }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const own = z.kind === 'own' ? store.get().ownZettel.find((o) => o.id === z.id) : undefined
  if (editing && own) {
    return (
      <li className="zk-card is-editing">
        <ZettelEditor initial={own} onDone={() => setEditing(false)} />
      </li>
    )
  }
  const contentLang = langOf(z, lang)
  const right = z.choices?.find((o) => o.correct)
  return (
    <li className="zk-card">
      <div className="zk-card__head">
        <span className="zk-card__kind">{t.labels.kind[z.kind]}</span>
        <FachBadge fach={fach} />
        {!own && <ZettelFeedback z={z} iconOnly />}
        {!own && (
          <button type="button" className="icon-btn zk-card__hide" onClick={() => store.setZettelHidden(z.id, true)} aria-label={t.cards.hide} title={t.cards.hide}>
            <Icon name="eyeOff" size={16} />
          </button>
        )}
      </div>
      <RichText text={tx(z.front, lang)} className="zk-card__front" lang={contentLang} />
      <details className="zk-card__answer">
        <summary>{t.cards.answer}</summary>
        {right && (
          <p className="zk-card__right" lang={contentLang}>
            <Icon name="checkCircle" size={16} className="ink-ok" />
            <span>
              <span className="sr-only">{t.cards.rightOptionSr}</span>
              {renderInline(tx(right.text, lang))}
            </span>
          </p>
        )}
        {z.term && <p className="zk-card__term">{z.term}</p>}
        <RichText text={tx(z.back, lang)} lang={contentLang} />
      </details>
      {own && (
        <div className="zk-card__actions">
          {confirmDelete ? (
            <>
              <button type="button" className="btn btn--danger btn--small" onClick={() => store.deleteOwnZettel(z.id)}>
                {t.cards.deleteForGood}
              </button>
              <button type="button" className="btn btn--subtle btn--small" onClick={() => setConfirmDelete(false)}>
                {t.common.cancel}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn--subtle btn--small" onClick={() => setEditing(true)}>
                <Icon name="edit" size={16} />
                {t.cards.edit}
              </button>
              <button type="button" className="btn btn--subtle btn--small" onClick={() => setConfirmDelete(true)}>
                <Icon name="trash" size={16} />
                {t.cards.delete}
              </button>
            </>
          )}
        </div>
      )}
    </li>
  )
}

export function ZettelModule({ own = false }: { own?: boolean }) {
  const t = useT()
  const { moduleId = '' } = useParams()
  const { cards, zettel, lang, hiddenZettel } = useZettelBox()
  const [adding, setAdding] = useState(false)
  const module = own ? undefined : moduleById.get(moduleId)
  if (!own && !module) {
    return (
      <div className="page">
        <h1 className="page-title">{t.cards.notFoundTitle}</h1>
        <p className="page-sub">{t.cards.notFoundText}</p>
        <Link to="/cards" className="btn btn--primary">
          {t.cards.toBox}
        </Link>
      </div>
    )
  }
  const list = own ? cards.filter((z) => z.kind === 'own') : cards.filter((z) => z.module === moduleId)
  const hidden = own ? [] : starterZettel.filter((z) => z.module === moduleId && hiddenZettel.includes(z.id))
  const counts = countByFach(ids(list), zettel)
  const open = counts[0] + counts[1]
  const title = own ? t.cards.ownCards : module!.title
  const learnTo = own ? '/cards/round?own=1' : `/cards/round?module=${moduleId}`

  return (
    <div className="page zk-module">
      <nav className="breadcrumb" aria-label={t.common.breadcrumb}>
        <Link to="/cards">{t.cards.title}</Link>
        <Icon name="chevronRight" size={16} />
        <span aria-current="page">{own ? t.cards.ownCards : t.cards.moduleTab(moduleNumber.get(moduleId) ?? 0)}</span>
      </nav>
      <header className="page-head">
        <h1 id="zk-module-h" className="page-title" tabIndex={-1}>
          {title}
        </h1>
        <p className="page-sub">{own ? t.cards.ownSub : t.cards.moduleSub(list.length)}</p>
      </header>

      <section className="panel zk-module__box" aria-label={t.cards.stages}>
        <ZettelBox counts={counts} variant="compact" />
        <div className="zk-actions">
          {open > 0 && (
            <Link to={learnTo} className="btn btn--primary btn--large">
              {t.cards.studyN(open)}
              <Icon name="arrowRight" size={18} />
            </Link>
          )}
          {!own && (
            <Link to={`/learn/${moduleId}`} className="btn btn--secondary btn--large">
              {t.cards.toLesson}
            </Link>
          )}
          <button type="button" className="btn btn--secondary btn--large" aria-expanded={adding} onClick={() => setAdding(true)}>
            <Icon name="add" size={18} />
            {t.cards.newCard}
          </button>
          <ResetCards cardIds={ids(list)} states={zettel} focusAfter="zk-module-h" />
        </div>
      </section>

      {adding && (
        <section className="panel zk-module__editor">
          <ZettelEditor defaultModule={own ? null : moduleId} onDone={() => setAdding(false)} />
        </section>
      )}

      {list.length > 0 ? (
        <ol className="zk-cards">
          {list.map((z) => (
            <CardItem key={z.id} z={z} fach={fachOf(zettel, z.id)} lang={lang} />
          ))}
        </ol>
      ) : (
        <div className="panel empty">
          <Icon name="zettel" size={28} className="ink-brand" />
          <p>{own ? t.cards.noOwn : t.cards.noneHere}</p>
        </div>
      )}

      {hidden.length > 0 && (
        <details className="panel zk-hidden">
          <summary>{t.cards.hidden(hidden.length)}</summary>
          <ul className="zk-hidden__list">
            {hidden.map((z) => (
              <li key={z.id}>
                <RichText inline text={tx(z.front, lang)} lang={lang} />
                <button type="button" className="btn btn--subtle btn--small" onClick={() => store.setZettelHidden(z.id, false)}>
                  <Icon name="undo" size={16} />
                  {t.cards.putBack}
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

/* ---------- A round ---------- */

function useReducedMotion() {
  return typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
}

type RoundResult = { knew: boolean; from: Fach; after: Fach; counts: [number, number, number] }

/** After checking, bring the picked option and its reason into view when they sit under the fixed bar. */
function revealExplanation() {
  const el = document.querySelector('.zk-flip .choice.is-wrong, .zk-flip .choice.is-correct')
  if (!el) return
  const { top, bottom } = el.getBoundingClientRect()
  const visibleBottom = window.innerHeight - 110
  if (bottom <= visibleBottom && top >= 0) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.scrollBy({ top: top - window.innerHeight * 0.3, behavior: reduce ? 'auto' : 'smooth' })
}

function destination(r: RoundResult, t: Messages): string {
  if (!r.knew) return t.cards.toBack
  return r.after === GOAL ? t.cards.toFront : t.cards.toStage(r.after)
}

function RoundSession({ search }: { search: string }) {
  const navigate = useNavigate()
  const t = useT()
  const { cards, zettel, lang } = useZettelBox()
  const params = new URLSearchParams(search)
  const scopeModule = params.get('module')
  const ownOnly = params.get('own') === '1'
  const pathIndex = learningPaths.findIndex((p) => p.id === params.get('path'))
  const scopePath = pathIndex >= 0 ? learningPaths[pathIndex] : undefined
  const exitTo = scopeModule ? `/cards/module/${scopeModule}` : ownOnly ? '/cards/own' : '/cards'
  const scopeTitle = scopeModule
    ? `${t.cards.moduleTab(moduleNumber.get(scopeModule) ?? 0)} · ${moduleById.get(scopeModule)?.title ?? ''}`
    : ownOnly
      ? t.cards.ownCards
      : scopePath
        ? `${t.cards.pathTab(pathIndex + 1)} · ${scopePath.title}`
        : t.cards.mixed
  const pool = useMemo(
    () =>
      cards.filter((z) =>
        scopeModule ? z.module === scopeModule : ownOnly ? z.kind === 'own' : scopePath ? z.module !== null && scopePath.modules.includes(z.module) : true,
      ),
    [cards, scopeModule, ownOnly, scopePath],
  )
  // A module (or the own cards) is dealt in full; a learning path or the whole box twenty at a time.
  const [deck] = useState(() => {
    const s = store.get()
    return scopeModule || ownOnly ? buildDeck(pool, s.zettel) : nextRound(pool, s.zettel, s.lessonsRead)
  })
  const [queue, setQueue] = useState(deck)
  /** Cards without answer options: the learner turns the card and rates it. */
  const [flipped, setFlipped] = useState(false)
  /** Cards with answer options: the option the learner picked. */
  const [picked, setPicked] = useState<string | null>(null)
  /** The recorded answer, with the round as it stood before it: the box changes only when the card lands. */
  const [result, setResult] = useState<RoundResult | null>(null)
  const [flying, setFlying] = useState(false)
  /** Counts dealt cards, so each card on the table is a fresh element (and its flight is never cut short). */
  const [dealt, setDealt] = useState(0)
  const [seed] = useState(() => Math.floor(Math.random() * 1e9))
  const [tally, setTally] = useState({ right: 0, wrong: 0 })
  const [arrival, setArrival] = useState<{ fach: Fach; key: number } | null>(null)
  const [announce, setAnnounce] = useState('')
  const cardRef = useRef<HTMLElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const reduceMotion = useReducedMotion()
  const byId = useMemo(() => new Map(cards.map((z) => [z.id, z])), [cards])
  const current = queue.length ? byId.get(queue[0]) : undefined
  const choiceSet = useMemo<ChoiceSet | null>(() => (current?.choices?.length ? { id: current.id, type: 'single', options: current.choices } : null), [current])
  // A card that comes back later in the round shows its options in a new order.
  const choiceSeed = seed + dealt * 7919
  const ordered = useMemo(() => (choiceSet ? orderChoices(choiceSet, choiceSeed) : []), [choiceSet, choiceSeed])
  const roundCounts = result ? result.counts : countByFach(deck, zettel)
  const fach = result ? result.from : current ? fachOf(zettel, current.id) : 1
  const revealed = choiceSet ? result !== null : flipped

  const record = (knew: boolean, words: [string, string]): Fach => {
    const s = store.get()
    const from = fachOf(s.zettel, current!.id)
    const counts = countByFach(deck, s.zettel)
    store.answerZettel(current!.id, knew)
    const after = fachOf(store.get().zettel, current!.id)
    const r = { knew, from, after, counts }
    setResult(r)
    setTally((prev) => (knew ? { ...prev, right: prev.right + 1 } : { ...prev, wrong: prev.wrong + 1 }))
    const right = choiceSet?.options.find((o) => o.correct)
    const hint = !knew && right ? t.cards.rightIs(tx(right.text, lang).replace(/[`*]/g, '')) : ''
    setAnnounce(`${knew ? words[0] : words[1]}.${hint} ${destination(r, t)}`)
    return after
  }

  // The one authored motion: the card flies into the compartment it now belongs to; the box changes on landing.
  const fly = (after: Fach) => {
    const land = () => {
      setQueue((q) => advance(q, after))
      setFlipped(false)
      setPicked(null)
      setResult(null)
      setFlying(false)
      setDealt((d) => d + 1)
      setArrival({ fach: after, key: Date.now() })
    }
    const card = cardRef.current
    const target = boxRef.current?.querySelector(`[data-fach="${after}"]`)
    if (reduceMotion || !card || !target || typeof card.animate !== 'function') {
      land()
      return
    }
    setFlying(true)
    const a = card.getBoundingClientRect()
    const b = target.getBoundingClientRect()
    const dx = b.left + b.width / 2 - (a.left + a.width / 2)
    const dy = b.top + b.height / 2 - (a.top + a.height / 2)
    const motion = card.animate(
      [
        { transform: 'none', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0.2 },
      ],
      { duration: 460, easing: 'cubic-bezier(0.55, 0, 0.2, 1)', fill: 'forwards' },
    )
    motion.onfinish = land
    motion.oncancel = land
  }

  const check = () => {
    if (!current || !choiceSet || !picked || result) return
    record(choiceSet.options.find((o) => o.id === picked)?.correct === true, [t.cards.right, t.cards.wrong])
    requestAnimationFrame(revealExplanation)
  }
  const next = () => {
    if (!result || flying) return
    fly(result.after)
  }
  const rate = (knew: boolean) => {
    if (!current || result) return
    fly(record(knew, [t.cards.knew, t.cards.didntKnow]))
  }

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true })
  }, [queue, flipped])

  useEffect(() => {
    if (!current) doneRef.current?.focus()
  }, [current])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || !current) return
      const t = e.target as HTMLElement | null
      const onControl = !!t && (!!t.closest('button, a, textarea, select, input:not([type="radio"])') || t.isContentEditable)
      if (choiceSet) {
        if (!result) {
          const k = e.key.length === 1 ? e.key.toLowerCase() : ''
          const index = k ? Math.max('1234'.indexOf(k), 'abcd'.indexOf(k)) : -1
          if (index >= 0 && ordered[index] && !onControl) {
            e.preventDefault()
            setPicked(ordered[index].id)
          } else if (e.key === 'Enter' && !onControl && picked) {
            e.preventDefault()
            check()
          }
        } else if (e.key === 'Enter' && !onControl) {
          e.preventDefault()
          next()
        }
        return
      }
      if (onControl && (e.key === 'Enter' || e.key === ' ')) return
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setFlipped(true)
      } else if (flipped && (e.key === '1' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        rate(false)
      } else if (flipped && (e.key === '2' || e.key === 'ArrowRight')) {
        e.preventDefault()
        rate(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!current) {
    const after = countByFach(ids(pool), zettel)
    const stillOpen = after[0] + after[1]
    return (
      <div className="session-done zk-done">
        <div className="panel session-done__panel">
          <h1 ref={doneRef} tabIndex={-1} className="page-title">
            {deck.length ? t.cards.roundDone : pool.length ? t.cards.allFrontHere : t.cards.noCards}
          </h1>
          <p className="session-done__score">
            {deck.length ? (
              <>
                {t.cards.doneAll}
                <strong>{deck.length}</strong>
                {t.cards.doneText(tally.right, tally.wrong)}
              </>
            ) : pool.length ? (
              t.cards.doneNone
            ) : (
              t.cards.noCardsText
            )}
          </p>
          <ZettelBox counts={after} variant="compact" />
          <div className="session-done__actions">
            {stillOpen > 0 && (
              <button type="button" className="btn btn--primary btn--large" onClick={() => navigate(`/cards/round?${new URLSearchParams({ ...Object.fromEntries(params), r: String(Date.now()) })}`)}>
                {t.cards.nextRound}
                <Icon name="arrowRight" size={18} />
              </button>
            )}
            <Link to={exitTo} className={`btn ${stillOpen > 0 ? 'btn--secondary' : 'btn--primary'} btn--large`}>
              {scopeModule || ownOnly ? t.cards.toIndex : t.cards.toBox}
            </Link>
            <Link to="/" className="btn btn--subtle btn--large">
              {t.common.toHome}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const contentLang = langOf(current, lang)
  const nextFach = Math.min(GOAL, fach + 1) as Fach
  const own = current.kind === 'own'
  return (
    <div className="session zk-session">
      <div className="session__top">
        <button type="button" className="icon-btn icon-btn--large" onClick={() => navigate(exitTo)} aria-label={t.common.endRound}>
          <Icon name="dismiss" size={22} />
        </button>
        <div
          className="session__progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={deck.length}
          aria-valuenow={roundCounts[2]}
          aria-label={t.cards.roundProgress(roundCounts[2], deck.length)}
        >
          <span style={{ width: `${(roundCounts[2] / deck.length) * 100}%` }} />
        </div>
        <span className="session__count">{t.cards.roundCount(roundCounts[2], deck.length)}</span>
      </div>
      <p className="zk-session__scope">{scopeTitle}</p>
      <div ref={boxRef} className="zk-session__box">
        <ZettelBox counts={roundCounts} variant="compact" receiving={arrival?.fach ?? null} pulseKey={arrival?.key ?? 0} />
      </div>

      <article
        ref={cardRef}
        key={choiceSet ? `${current.id}-${dealt}` : `${current.id}-${flipped ? 'back' : 'front'}-${dealt}`}
        className={`zk-flip${choiceSet ? ' zk-flip--choice' : ''} ${revealed ? 'is-back' : 'is-front'}${flying ? ' is-moving' : ''}`}
        tabIndex={-1}
        aria-labelledby="zk-side"
        aria-describedby="zk-content"
        onClick={() => !choiceSet && !flipped && !flying && setFlipped(true)}
      >
        <header className="zk-flip__head">
          <span id="zk-side" className="zk-flip__side">
            {revealed ? t.cards.sideBack : t.cards.sideFront}
          </span>
          <span className="zk-flip__module">
            {[current.module ? t.cards.moduleTab(moduleNumber.get(current.module) ?? 0) : null, t.labels.kind[current.kind]].filter(Boolean).join(' · ')}
          </span>
          <FachBadge fach={fach} />
        </header>
        {choiceSet ? (
          <div className="zk-flip__body">
            <div id="zk-content">
              <RichText text={tx(current.front, lang)} className="zk-flip__question" lang={contentLang} />
            </div>
            <ChoiceList
              q={choiceSet}
              lang={lang}
              answer={{ type: 'single', choice: picked }}
              onChange={(a) => a.type === 'single' && !result && setPicked(a.choice)}
              revealed={revealed}
              seed={choiceSeed}
              ownText={own}
            />
            {revealed &&
              (own ? (
                <div className="zk-flip__backtext">
                  <p className="zk-flip__label">{t.cards.yourBack}</p>
                  <RichText text={tx(current.back, lang)} />
                </div>
              ) : (
                <details className="zk-lesson">
                  <summary>{t.cards.fromLesson(current.term ?? '')}</summary>
                  <RichText text={tx(current.back, lang)} className="zk-lesson__text" lang={contentLang} />
                </details>
              ))}
            {!own && feedbackEnabled && (
              <div className="zk-flip__feedback">
                <ZettelFeedback z={current} />
              </div>
            )}
          </div>
        ) : flipped ? (
          <div className="zk-flip__body">
            <RichText text={tx(current.front, lang)} className="zk-flip__asked" lang={contentLang} />
            <div id="zk-content">
              {current.term && <p className="zk-flip__term">{current.term}</p>}
              <RichText text={tx(current.back, lang)} className="zk-flip__answer" lang={contentLang} />
            </div>
          </div>
        ) : (
          <div className="zk-flip__body">
            <div id="zk-content">
              <RichText text={tx(current.front, lang)} className="zk-flip__question" lang={contentLang} />
            </div>
            <p className="zk-flip__tap">{t.cards.tap}</p>
          </div>
        )}
      </article>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      <div className={`session__bar zk-bar${flying ? ' is-moving' : ''}${choiceSet && result ? (result.knew ? ' is-correct' : ' is-wrong') : ''}`}>
        <div className="session__bar-inner">
          {choiceSet ? (
            result ? (
              <>
                <p className="session__verdict">
                  <Icon name={result.knew ? 'checkCircle' : 'dismissCircle'} size={28} />
                  <span>
                    <strong>{result.knew ? `${t.cards.right}!` : t.cards.wrong}</strong>
                    <span className="session__verdict-sub">{destination(result, t)}</span>
                  </span>
                </p>
                <button type="button" className="btn btn--primary btn--large" onClick={next} autoFocus>
                  {t.common.next}
                  <Icon name="arrowRight" size={18} />
                </button>
              </>
            ) : (
              <>
                <p className="session__hint">
                  {picked ? t.cards.readyToCheck : t.cards.pick} <span className="zk-keys">{t.cards.keysChoice}</span>
                </p>
                <button type="button" className="btn btn--primary btn--large" onClick={check} disabled={!picked}>
                  {t.common.check}
                </button>
              </>
            )
          ) : !flipped ? (
            <>
              <p className="session__hint">
                {t.cards.left(queue.length)} <span className="zk-keys">{t.cards.keysFlip}</span>
              </p>
              <button type="button" className="btn btn--primary btn--large" onClick={() => setFlipped(true)}>
                <Icon name="eye" size={18} />
                {t.cards.showAnswer}
              </button>
            </>
          ) : (
            <div className="zk-rate">
              <button type="button" className="btn btn--large zk-rate__btn zk-rate__btn--miss" onClick={() => rate(false)}>
                <Icon name="dismissCircle" size={20} />
                <span className="zk-rate__text">
                  {t.cards.didntKnow}
                  <span className="zk-rate__dest">{t.cards.backToStage1}</span>
                </span>
                <kbd className="zk-keys">1</kbd>
              </button>
              <button type="button" className="btn btn--large zk-rate__btn zk-rate__btn--hit" onClick={() => rate(true)}>
                <Icon name="checkCircle" size={20} />
                <span className="zk-rate__text">
                  {t.cards.knew}
                  <span className="zk-rate__dest">{fach === GOAL ? t.cards.staysFront : t.cards.onToStage(nextFach)}</span>
                </span>
                <kbd className="zk-keys">2</kbd>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ZettelSession() {
  const { search } = useLocation()
  return <RoundSession key={search} search={search} />
}
