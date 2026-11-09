import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Question } from '../lib/types.ts'
import { emptyAnswer, isAnswerComplete, scoreQuestion, type Answer } from '../lib/scoring.ts'
import { store, useProgress } from '../lib/store.ts'
import { caseById } from '../content/index.ts'
import { moduleById } from '../content/outline.ts'
import { Explanation, QuestionView } from './QuestionView.tsx'
import { Icon } from './Icon.tsx'
import { tx, useT } from '../i18n/index.ts'

interface SessionProps {
  questions: Question[]
  title: string
  /** Where ending the round leads. */
  exitTo: string
  onRestartWrong?: (ids: string[]) => void
}

interface Result {
  id: string
  score: number
}

/** After checking, bring the feedback into view when it starts below the fixed action bar. */
function revealFeedback() {
  const el = document.getElementById('session-feedback')
  if (!el) return
  const top = el.getBoundingClientRect().top
  if (top < window.innerHeight - 140) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  window.scrollBy({ top: top - window.innerHeight * 0.45, behavior: reduce ? 'auto' : 'smooth' })
}

export function Session({ questions, title, exitTo, onRestartWrong }: SessionProps) {
  const { lang } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [revealed, setRevealed] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [seed] = useState(() => Math.floor(Math.random() * 1e9))
  const q = questions[index]
  const answer = q ? (answers[q.id] ?? emptyAnswer(q)) : undefined
  const finished = index >= questions.length

  if (!questions.length) {
    return (
      <div className="session-empty panel">
        <h2 className="panel__title">{t.session.emptyTitle}</h2>
        <p>{t.session.emptyText}</p>
        <Link to={exitTo} className="btn btn--primary">
          {t.common.back}
        </Link>
      </div>
    )
  }

  if (finished) {
    const correct = results.filter((r) => r.score >= 1).length
    const wrong = results.filter((r) => r.score < 1)
    const pct = Math.round((results.reduce((a, r) => a + r.score, 0) / results.length) * 100)
    return (
      <div className="session-done">
        <div className="panel session-done__panel">
          <h1 className="page-title">{t.common.roundDone}</h1>
          <p className="session-done__score">
            <strong>{correct}</strong>
            {t.session.score(results.length, pct)}
          </p>
          <div className="meter meter--large" aria-hidden="true">
            <span className="meter__fill bg-ok" style={{ width: `${pct}%` }} />
          </div>
          {wrong.length > 0 && (
            <>
              <h2 className="panel__title">{t.session.marked}</h2>
              <ul className="wrong-list">
                {wrong.map((r) => {
                  const wq = questions.find((x) => x.id === r.id)!
                  return (
                    <li key={r.id}>
                      <Icon name="dismissCircle" size={18} className="ink-bad" />
                      <span className="wrong-list__stem">{tx(wq.stem, lang).replace(/[`*]/g, '')}</span>
                      <Link to={`/learn/${wq.module}`} className="link-inline">
                        {moduleById.get(wq.module)?.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
          <div className="session-done__actions">
            {wrong.length > 0 && onRestartWrong && (
              <button type="button" className="btn btn--primary btn--large" onClick={() => onRestartWrong(wrong.map((w) => w.id))}>
                {t.session.reviewNow(wrong.length)}
              </button>
            )}
            <Link to="/" className={`btn ${wrong.length ? 'btn--secondary' : 'btn--primary'} btn--large`}>
              {t.common.toHome}
            </Link>
            <Link to={exitTo} className="btn btn--subtle btn--large">
              {t.session.newRound}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const result = revealed && answer ? scoreQuestion(q, answer) : null
  const check = () => {
    if (!answer) return
    const r = scoreQuestion(q, answer)
    store.recordAnswer(q.id, r.score)
    setResults((prev) => [...prev, { id: q.id, score: r.score }])
    setRevealed(true)
    requestAnimationFrame(revealFeedback)
  }
  const next = () => {
    setRevealed(false)
    setIndex((i) => i + 1)
  }

  return (
    <div className="session">
      <div className="session__top">
        <button type="button" className="icon-btn icon-btn--large" onClick={() => navigate(exitTo)} aria-label={t.common.endRound}>
          <Icon name="dismiss" size={22} />
        </button>
        <div className="session__progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index} aria-label={t.session.progress(title, index + 1, questions.length)}>
          <span style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
        <span className="session__count">
          {index + 1}/{questions.length}
        </span>
      </div>
      <div className="session__body">
        <QuestionView
          key={q.id}
          question={q}
          lang={lang}
          answer={answer!}
          onChange={(a) => setAnswers((prev) => ({ ...prev, [q.id]: a }))}
          revealed={revealed}
          seed={seed}
          caseStudy={q.caseId ? caseById.get(q.caseId) : undefined}
        />
        {revealed && answer && (
          <div id="session-feedback">
            <Explanation q={q} lang={lang} answer={answer} />
          </div>
        )}
      </div>
      <div className={`session__bar${result ? (result.correct ? ' is-correct' : ' is-wrong') : ''}`}>
        <div className="session__bar-inner">
          {result ? (
            <p className="session__verdict" role="status">
              <Icon name={result.correct ? 'checkCircle' : 'dismissCircle'} size={28} />
              <span>
                <strong>{result.correct ? t.common.correct : result.score > 0 ? t.common.partly : t.common.notQuite}</strong>
                <span className="session__verdict-sub">{result.correct ? t.session.movesUp : t.session.toReviews}</span>
              </span>
            </p>
          ) : (
            <p className="session__hint">{isAnswerComplete(q, answer) ? t.session.ready : t.session.choose}</p>
          )}
          {result ? (
            <button type="button" className="btn btn--primary btn--large" onClick={next} autoFocus>
              {index + 1 < questions.length ? t.common.next : t.common.results}
              <Icon name="arrowRight" size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn--primary btn--large" onClick={check} disabled={!isAnswerComplete(q, answer)}>
              {t.common.check}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
