import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Session } from '../components/Session.tsx'
import { Icon } from '../components/Icon.tsx'
import { useProgress } from '../lib/store.ts'
import { dueQuestions, wrongQuestions } from '../lib/progress.ts'
import { practiceUrl } from '../lib/select.ts'
import { BOX_INTERVAL_DAYS, MAX_BOX } from '../lib/srs.ts'
import { tx, useT } from '../i18n/index.ts'
import { questionById, questions } from '../content/index.ts'
import { domainHue, domains, moduleById } from '../content/outline.ts'

function ReviewSession({ search }: { search: string }) {
  const { cards } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const [list] = useState(() => {
    const p = new URLSearchParams(search)
    const mod = p.get('module')
    if (p.get('wrong') === '1') return wrongQuestions(questions, cards)
    const due = dueQuestions(questions, cards)
    if (mod) {
      const own = questions.filter((q) => q.module === mod && cards[q.id] && cards[q.id]!.box <= 1)
      return own.length ? own : due.filter((q) => q.module === mod)
    }
    return due
  })
  return (
    <Session
      questions={list}
      title={t.home.steps.review}
      exitTo="/review"
      onRestartWrong={(ids) => navigate(practiceUrl(ids))}
    />
  )
}

export function Review() {
  const { pathname, search } = useLocation()
  const { cards, lang } = useProgress()
  const t = useT()
  const [now] = useState(() => Date.now())
  if (pathname.endsWith('/session')) return <ReviewSession key={search} search={search} />

  const due = dueQuestions(questions, cards)
  const wrong = wrongQuestions(questions, cards)
  const boxes = Array.from({ length: MAX_BOX }, (_, i) => questions.filter((q) => cards[q.id]?.box === i + 1).length)
  const maxBox = Math.max(1, ...boxes)
  const upcoming = Object.entries(cards)
    .filter(([id, c]) => questionById.has(id) && new Date(c.due).getTime() > now)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .slice(0, 6)

  return (
    <div className="page review">
      <header className="page-head">
        <h1 className="page-title">{t.review.title}</h1>
        <p className="page-sub">{t.review.sub}</p>
      </header>

      <div className="review__grid">
        <section className="panel due-panel" aria-labelledby="due-h">
          <h2 id="due-h" className="panel__title">
            {t.review.dueNow}
          </h2>
          {due.length ? (
            <>
              <p className="due-panel__count">
                <strong>{due.length}</strong>
                {t.review.waiting(due.length)}
              </p>
              <ul className="due-panel__domains">
                {domains.map((d) => {
                  const n = due.filter((q) => q.domain === d.id).length
                  if (!n) return null
                  return (
                    <li key={d.id}>
                      <span className={`legend-dot bg-domain-${domainHue(d.id)}`} aria-hidden="true" />
                      {tx(d.short, lang)}
                      <strong>{n}</strong>
                    </li>
                  )
                })}
              </ul>
              <Link to="/review/session" className="btn btn--primary btn--large">
                {t.review.reviewN(due.length)}
                <Icon name="arrowRight" size={18} />
              </Link>
            </>
          ) : (
            <div className="empty">
              <Icon name="checkCircle" size={28} className="ink-ok" />
              <p>
                {t.review.nothingDue}
                {Object.keys(cards).length ? t.review.nextBelow : t.review.startHint}
              </p>
              <Link to="/" className="btn btn--secondary">
                {t.common.toPath}
              </Link>
            </div>
          )}
        </section>

        <section className="panel boxes-panel" aria-labelledby="boxes-h">
          <h2 id="boxes-h" className="panel__title">
            {t.review.boxes}
          </h2>
          <ol className="boxes" aria-label={t.review.perBox}>
            {boxes.map((n, i) => (
              <li key={i} className="boxes__col">
                <span className="boxes__count">{n}</span>
                <span className="boxes__bar" style={{ height: `${Math.max(4, (n / maxBox) * 120)}px` }} aria-hidden="true" />
                <span className="boxes__label">{t.review.box(i + 1)}</span>
                <span className="boxes__interval">{i === 0 ? t.review.now : t.review.days(BOX_INTERVAL_DAYS[i + 1])}</span>
              </li>
            ))}
          </ol>
          <p className="boxes__note">{t.review.boxNote}</p>
          {upcoming.length > 0 && (
            <>
              <h3 className="subhead">{t.review.upcoming}</h3>
              <ul className="upcoming">
                {upcoming.map(([id, c]) => {
                  const q = questionById.get(id)!
                  return (
                    <li key={id}>
                      <span className={`domain-chip domain-${domainHue(q.domain)}`}>{q.domain}</span>
                      <span className="upcoming__stem" lang={lang}>{tx(q.stem, lang).replace(/[`*]/g, '')}</span>
                      <span className="upcoming__due">{t.format.relativeDue(c.due)}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </section>

        <section className="panel wrong-panel" aria-labelledby="wrong-h">
          <div className="panel__head">
            <h2 id="wrong-h" className="panel__title">
              {t.review.wrong}
            </h2>
            {wrong.length > 0 && (
              <Link to="/review/session?wrong=1" className="btn btn--secondary">
                {t.review.practiceAll(wrong.length)}
              </Link>
            )}
          </div>
          {wrong.length ? (
            <ul className="wrong-list">
              {wrong.slice(0, 12).map((q) => (
                <li key={q.id}>
                  <Icon name="dismissCircle" size={18} className="ink-bad" />
                  <span className="wrong-list__stem" lang={lang}>{tx(q.stem, lang).replace(/[`*]/g, '')}</span>
                  <Link to={`/learn/${q.module}`} className="link-inline">
                    {moduleById.get(q.module)?.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t.review.noMistakes}</p>
          )}
        </section>
      </div>
    </div>
  )
}
