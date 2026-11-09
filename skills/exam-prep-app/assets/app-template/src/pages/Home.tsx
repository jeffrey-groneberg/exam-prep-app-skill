import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { Diagram } from '../components/Diagram.tsx'
import { useProgress } from '../lib/store.ts'
import { domainMastery, dueQuestions, moduleStatus, nextModule, type ModuleStatus, type ModuleStep } from '../lib/progress.ts'
import { tx, useT } from '../i18n/index.ts'
import { lessonByModule, orderedModules, questions } from '../content/index.ts'
import { domainHue, domains, learningPaths, moduleById } from '../content/outline.ts'
import { EXAM_DEFAULTS } from '../lib/exam.ts'
import { exam } from '../config.ts'
import { ZettelBox } from '../components/ZettelBox.tsx'
import { countByFach } from '../lib/zettel.ts'
import { nextRound, useZettelBox } from '../lib/zettel-box.ts'

const STEPS: Array<Exclude<ModuleStep, 'done'>> = ['lesson', 'questions', 'review']

function Stepper({ step }: { step: ModuleStep }) {
  const t = useT()
  const idx = step === 'done' ? 3 : STEPS.indexOf(step)
  return (
    <ol className="stepper" aria-label={t.home.stepsLabel}>
      {STEPS.map((s, i) => {
        const state = i < idx ? 'is-done' : i === idx ? 'is-current' : ''
        return (
          <li key={s} className={`stepper__item ${state}`} aria-current={i === idx ? 'step' : undefined}>
            <span className="stepper__dot">{i < idx ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="stepper__label">{t.home.steps[s]}</span>
          </li>
        )
      })}
    </ol>
  )
}

function stationState(s: ModuleStatus, isNext: boolean) {
  if (s.step === 'done') return 'is-done'
  if (isNext) return 'is-next'
  if (s.lessonRead || s.attempted > 0) return 'is-started'
  return ''
}

function NextCard({ status }: { status: ModuleStatus | null }) {
  const { lang } = useProgress()
  const t = useT()
  if (!orderedModules.length) {
    return (
      <section className="panel next-card" aria-labelledby="next-h">
        <h2 id="next-h" className="panel__title">
          {t.home.next}
        </h2>
        <h3 className="next-card__module">{t.empty.title}</h3>
        <p className="next-card__meta">{t.empty.modules}</p>
      </section>
    )
  }
  if (!status) {
    return (
      <section className="panel next-card" aria-labelledby="next-h">
        <h2 id="next-h" className="panel__title">
          {t.home.next}
        </h2>
        <h3 className="next-card__module">{t.home.allDone(orderedModules.length)}</h3>
        <p className="next-card__meta">{t.home.allDoneText}</p>
        <div className="next-card__actions">
          <Link to="/exam" className="btn btn--primary btn--large">
            {t.home.startExam}
            <Icon name="arrowRight" size={18} />
          </Link>
          {exam.links.practiceAssessment && (
            <a className="btn btn--secondary btn--large" href={exam.links.practiceAssessment} target="_blank" rel="noreferrer">
              {t.home.practiceAssessment}
              <Icon name="open" size={16} />
            </a>
          )}
        </div>
      </section>
    )
  }
  const m = status.module
  const index = orderedModules.findIndex((x) => x.id === m.id) + 1
  const path = learningPaths.find((p) => p.id === m.pathId)
  const lesson = lessonByModule.get(m.id)
  const primary =
    status.step === 'lesson'
      ? { to: `/learn/${m.id}`, label: t.home.startLesson }
      : status.step === 'questions'
        ? { to: `/practice/session?module=${m.id}&new=1`, label: t.home.practiceN(status.total - status.attempted) }
        : { to: `/review/session?module=${m.id}`, label: t.home.reviewMistakes(status.wrongOpen) }
  return (
    <section className="panel next-card" aria-labelledby="next-h">
      <h2 id="next-h" className="panel__title">
        {t.home.next}
      </h2>
      <h3 className="next-card__module">
        <Link to={`/learn/${m.id}`}>{m.title}</Link>
      </h3>
      <p className="next-card__meta">{t.home.moduleMeta(index, orderedModules.length, path?.title ?? '', m.minutes)}</p>
      <Stepper step={status.step} />
      <div className="next-card__body">
        {lesson?.diagrams[0] && (
          <Link to={`/learn/${m.id}?section=diagrams`} className="next-card__thumb" aria-label={t.home.viewDiagram(tx(lesson.diagrams[0].title, lang))}>
            <Diagram diagram={lesson.diagrams[0]} lang={lang} mini />
          </Link>
        )}
        <p className="next-card__summary" lang={lesson ? lang : undefined}>{lesson ? firstSentences(tx(lesson.summary, lang)) : t.home.lessonComing}</p>
      </div>
      <div className="next-card__actions">
        <Link to={primary.to} className="btn btn--primary btn--large">
          {primary.label}
          <Icon name="arrowRight" size={18} />
        </Link>
        {status.step === 'lesson' && status.total > 0 && (
          <Link to={`/practice/session?module=${m.id}`} className="btn btn--secondary btn--large">
            {t.home.straightToQuestions}
          </Link>
        )}
      </div>
    </section>
  )
}

/** The Zettelkasten on the start page: the box at a glance and the next round one tap away. */
function ZettelPanel() {
  const t = useT()
  const { cards, zettel, lessonsRead } = useZettelBox()
  const counts = countByFach(cards.map((z) => z.id), zettel)
  const round = nextRound(cards, zettel, lessonsRead)
  return (
    <section className="panel zk-home" aria-labelledby="zk-home-h">
      <div className="panel__head">
        <h2 id="zk-home-h" className="panel__title">
          {t.cardsPanel.title}
        </h2>
        <Link to="/cards" className="link-inline">
          {t.cardsPanel.index}
          <Icon name="chevronRight" size={16} />
        </Link>
      </div>
      <div className="zk-home__body">
        <Link to="/cards" className="zk-home__box" aria-label={t.cardsPanel.open(counts[0], counts[1], counts[2])}>
          <ZettelBox counts={counts} variant="compact" />
        </Link>
        <div className="zk-home__side">
          <p className="zk-home__tally">
            {cards.length > 0 ? (
              <>
                <strong>{counts[2]}</strong>
                {t.cardsPanel.tally(cards.length)}
              </>
            ) : (
              t.cards.noCards
            )}
          </p>
          <p className="zk-home__rule">{cards.length > 0 ? t.cardsPanel.rule : t.cards.noCardsText}</p>
          <div className="zk-home__actions">
            {round.length > 0 ? (
              <Link to="/cards/round" className="btn btn--secondary btn--large">
                {t.cardsPanel.round(round.length)}
                <Icon name="arrowRight" size={18} />
              </Link>
            ) : (
              cards.length > 0 && (
                <Link to="/cards" className="btn btn--secondary btn--large">
                  {t.cardsPanel.allFront}
                </Link>
              )
            )}
            <Link to="/cards?new=1" className="btn btn--subtle btn--large">
              <Icon name="add" size={18} />
              {t.cardsPanel.newCard}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function firstSentences(text: string, max = 240): string {
  const plain = text.replace(/\*\*|\*|`/g, '')
  const first = plain.split(/(?<=[.!?])\s+/)[0] ?? plain
  if (first.length <= max) return first
  const cut = first.slice(0, max)
  const clause = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf(': '), cut.lastIndexOf(' – '), cut.lastIndexOf(' — '))
  const end = clause > max * 0.6 ? clause : cut.lastIndexOf(' ')
  return `${cut.slice(0, end)} …`
}

/** Keeps the side column sticky only while it fits the window, so nothing ends up out of reach. */
function useStickyWhenFits() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => el.classList.toggle('is-sticky', window.innerWidth > 1100 && el.offsetHeight + 84 <= window.innerHeight)
    update()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])
  return ref
}

export function Home() {
  const sideRef = useStickyWhenFits()
  const progress = useProgress()
  const t = useT()
  const { cards, lessonsRead, exams, lang } = progress
  const statuses = new Map(orderedModules.map((m) => [m.id, moduleStatus(m, questions, cards, lessonsRead)]))
  const next = nextModule(orderedModules, questions, cards, lessonsRead)
  const due = dueQuestions(questions, cards)
  const doneCount = [...statuses.values()].filter((s) => s.step === 'done').length
  const lastExam = exams[0]
  const dueByDomain = domains.map((d) => ({ d, n: due.filter((q) => q.domain === d.id).length }))

  return (
    <div className="page home">
      <h1 className="sr-only">{t.home.heading(exam.code)}</h1>

      <div className="home__grid">
        <section className="panel path-panel" aria-labelledby="path-h">
          <div className="path-panel__head">
            <h2 id="path-h" className="panel__title">
              {t.home.path}
            </h2>
            <p className="path-panel__meta">{t.home.pathMeta(exam.courseNumber ?? '', orderedModules.length, questions.length, doneCount)}</p>
          </div>
          {!learningPaths.length && (
            <div className="empty">
              <Icon name="book" size={28} className="ink-brand" />
              <p>{t.empty.modules}</p>
            </div>
          )}
          {learningPaths.map((p) => (
            <div key={p.id} className="path-group">
              <h3 className="path-group__title">{p.title}</h3>
              <ol className="stations">
                {p.modules.filter((id) => statuses.has(id)).map((id) => {
                  const s = statuses.get(id)!
                  const isNext = next?.module.id === id
                  const st = stationState(s, isNext)
                  const index = orderedModules.findIndex((x) => x.id === id) + 1
                  return (
                    <li key={id} className={`station ${st}`}>
                      <span className="station__dot" aria-hidden="true">
                        {s.step === 'done' && <Icon name="check" size={14} />}
                      </span>
                      <div className="station__body">
                        <Link to={`/learn/${id}`} className="station__title">
                          {moduleById.get(id)?.title}
                        </Link>
                        <span className="station__meta">
                          {t.home.station(index, s.total)}
                          {s.attempted > 0 && t.home.answered(s.attempted, s.total)}
                          {isNext && <span className="tag tag--brand">{t.home.nextTag}</span>}
                          {s.step === 'done' && <span className="sr-only">{t.home.doneSr}</span>}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </section>

        <div className="home__side" ref={sideRef}>
          <NextCard status={next} />

          <ZettelPanel />

          <div className="home__pair">
          <section className="panel today" aria-labelledby="today-h">
            <h2 id="today-h" className="panel__title">
              {t.home.today}
            </h2>
            <ul className="today__list">
              <li className="today__item">
                <Icon name="review" size={22} className="today__icon" />
                <div className="today__text">
                  <h3 className="today__title">{t.home.due}</h3>
                  <p className="today__meta">{due.length ? t.home.dueN(due.length) : t.home.nothingDue}</p>
                  {due.length > 0 && (
                    <>
                      <div className="stackbar" aria-hidden="true">
                        {dueByDomain
                          .filter((x) => x.n > 0)
                          .map((x) => (
                            <span key={x.d.id} className={`stackbar__seg bg-domain-${domainHue(x.d.id)}`} style={{ flexGrow: x.n }} />
                          ))}
                      </div>
                      <ul className="due-legend" aria-label={t.home.dueByDomain}>
                        {dueByDomain
                          .filter((x) => x.n > 0)
                          .map((x) => (
                            <li key={x.d.id}>
                              <span className={`due-legend__dot bg-domain-${domainHue(x.d.id)}`} aria-hidden="true" />
                              {tx(x.d.short, lang)}
                              <strong>{x.n}</strong>
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                </div>
                <Link to="/review" className={`btn btn--small ${due.length ? 'btn--primary' : 'btn--secondary'}`}>
                  {t.home.reviewCta}
                </Link>
              </li>
              <li className="today__item">
                <Icon name="practice" size={22} className="today__icon" />
                <div className="today__text">
                  <h3 className="today__title">{t.home.quick}</h3>
                  <p className="today__meta">{t.home.quickMeta}</p>
                </div>
                <Link to="/practice/session?count=10" className="btn btn--small btn--secondary">
                  {t.common.start}
                </Link>
              </li>
              <li className="today__item">
                <Icon name="exam" size={22} className="today__icon" />
                <div className="today__text">
                  <h3 className="today__title">{t.home.simulation}</h3>
                  <p className="today__meta">
                    {t.home.simulationMeta(Math.min(EXAM_DEFAULTS.questions, questions.length), EXAM_DEFAULTS.minutes)}
                    {lastExam && t.home.lastScore(lastExam.summary.percent)}
                  </p>
                </div>
                <Link to="/exam" className="btn btn--small btn--secondary">
                  {t.home.simulationCta}
                </Link>
              </li>
            </ul>
          </section>

          <section className="panel readiness" aria-labelledby="ready-h">
            <div className="panel__head">
              <h2 id="ready-h" className="panel__title">
                {t.home.readiness}
              </h2>
              <Link to="/progress" className="link-inline">
                {t.home.skillsMap}
                <Icon name="chevronRight" size={16} />
              </Link>
            </div>
            <ul className="readiness__list">
              {domains.map((d) => {
                const m = domainMastery(d.id, questions, cards)
                const pct = Math.round(m.value * 100)
                return (
                  <li key={d.id} className="readiness__row">
                    <Icon name={d.icon} size={20} className={`ink-domain-${domainHue(d.id)}`} />
                    <div className="readiness__label">
                      <span className="readiness__name">{tx(d.short, lang)}</span>
                      <span className="readiness__weight">
                        {t.format.percentRange(d.weight[0], d.weight[1])}<span className="sr-only">{t.home.ofExam}</span>
                      </span>
                    </div>
                    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t.home.retained(tx(d.short, lang), pct)}>
                      <span className={`meter__fill bg-domain-${domainHue(d.id)}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="readiness__pct">{m.attempted ? t.format.percent(pct) : '–'}</span>
                  </li>
                )
              })}
            </ul>
            {!domains.length && <p className="readiness__note">{t.empty.domains}</p>}
            <p className="readiness__note">{t.home.readinessNote}</p>
          </section>
          </div>
        </div>
      </div>
    </div>
  )
}
