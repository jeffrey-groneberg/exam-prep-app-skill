import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import type { IconName } from '../components/icons.generated.ts'
import { Explanation, QuestionView } from '../components/QuestionView.tsx'
import { store, useProgress, type ExamRecord, type ExamSession } from '../lib/store.ts'
import { buildExam, EXAM_DEFAULTS, examQuotas, formatClock, summarizeExam, type ExamPlan } from '../lib/exam.ts'
import { practiceUrl } from '../lib/select.ts'
import { emptyAnswer, isAnswerComplete, scoreQuestion } from '../lib/scoring.ts'
import { renderInline } from '../components/inline.tsx'
import { tx, useT } from '../i18n/index.ts'
import { caseById, cases, questionById, questions } from '../content/index.ts'
import { domainById, domainHue, domains } from '../content/outline.ts'
import { exam, outlineDateEn } from '../config.ts'

/** Full length from exam.json; the compact simulation takes half the questions and half the time. */
const LENGTHS = [
  { id: 'full', label: 'full', questions: EXAM_DEFAULTS.questions, minutes: EXAM_DEFAULTS.minutes },
  { id: 'half', label: 'compact', questions: Math.max(1, Math.round(EXAM_DEFAULTS.questions / 2)), minutes: Math.max(1, Math.round(EXAM_DEFAULTS.minutes / 2)) },
] as const

const RULE_ICONS: IconName[] = ['exam', 'grid', 'flag', 'target']

/** A running simulation for this plan, with its clock started now. */
function newSession(plan: ExamPlan, now: number = Date.now()): ExamSession {
  return {
    id: `exam-${now}`,
    startedAt: new Date(now).toISOString(),
    endsAt: now + plan.minutes * 60_000,
    questionIds: [...plan.questionIds, ...plan.caseQuestionIds],
    caseId: plan.caseId,
    caseQuestionIds: plan.caseQuestionIds,
    answers: {},
    marked: [],
    current: 0,
    minutes: plan.minutes,
  }
}

/** Questions per domain for each length, from this question bank. */
const QUOTAS = { full: examQuotas(questions, LENGTHS[0].questions), half: examQuotas(questions, LENGTHS[1].questions) }

function Setup() {
  const { activeExam, exams, lang } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const [length, setLength] = useState<(typeof LENGTHS)[number]['id']>('full')
  const cfg = LENGTHS.find((l) => l.id === length)!
  const quotas = QUOTAS[length]

  const start = () => {
    store.startExam(newSession(buildExam(questions, cases, { total: cfg.questions, minutes: cfg.minutes })))
    navigate('/exam/run')
  }

  return (
    <div className="page exam-setup">
      <header className="page-head">
        <h1 className="page-title">{t.exam.title}</h1>
        <p className="page-sub">{t.exam.sub}</p>
      </header>
      {activeExam && (
        <div className="callout callout--warn">
          <Icon name="exam" size={20} />
          <div>
            <p className="callout__title">{t.exam.running}</p>
            <p>{t.exam.runningText(t.format.date(activeExam.startedAt), Object.keys(activeExam.answers).length, activeExam.questionIds.length)}</p>
            <div className="callout__actions">
              <Link to="/exam/run" className="btn btn--primary">
                {t.exam.resume}
              </Link>
              <button type="button" className="btn btn--subtle" onClick={() => store.abandonExam()}>
                {t.exam.discard}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="exam-setup__grid">
        <section className="panel" aria-labelledby="cfg-h">
          <h2 id="cfg-h" className="panel__title">
            {t.exam.setup}
          </h2>
          <div className="segmented segmented--wide" role="group" aria-label={t.exam.length}>
            {LENGTHS.map((l) => (
              <button key={l.id} type="button" aria-pressed={length === l.id} onClick={() => setLength(l.id)}>
                {t.exam.lengthOption(t.exam[l.label], Math.min(l.questions, questions.length), l.minutes)}
              </button>
            ))}
          </div>
          <ul className="rules">
            {t.exam.rules(cfg.minutes, EXAM_DEFAULTS.minutes, EXAM_DEFAULTS.passPercent).map((rule, i) => (
              <li key={i}>
                <Icon name={RULE_ICONS[i] ?? 'info'} size={20} />
                <span>{renderInline(rule)}</span>
              </li>
            ))}
          </ul>
          {questions.length === 0 && <p className="muted">{t.exam.noQuestions}</p>}
          <button type="button" className="btn btn--primary btn--large" onClick={start} disabled={questions.length === 0}>
            {t.exam.start}
            <Icon name="arrowRight" size={18} />
          </button>
        </section>
        <section className="panel" aria-labelledby="dist-h">
          <h2 id="dist-h" className="panel__title">
            {t.exam.distribution}
          </h2>
          <ul className="dist">
            {domains.map((d) => (
              <li key={d.id} className="dist__row">
                <span className={`domain-chip domain-${domainHue(d.id)}`}>{d.id}</span>
                <span className="dist__name">{tx(d.title, lang)}</span>
                <span className="dist__weight">{t.format.percentRange(d.weight[0], d.weight[1])}</span>
                <span className="dist__n">{t.common.questions(quotas[d.id] ?? 0)}</span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            {t.exam.weights(outlineDateEn())}
            {exam.links.examSandbox && (
              <>
                {' '}
                {t.exam.sandbox}
                <a href={exam.links.examSandbox} target="_blank" rel="noreferrer">
                  {t.resources.sandbox}
                </a>
                .
              </>
            )}
          </p>
        </section>
      </div>
      {exams.length > 0 && (
        <section className="panel" aria-labelledby="hist-h">
          <h2 id="hist-h" className="panel__title">
            {t.exam.history}
          </h2>
          <ul className="history">
            {exams.map((e) => (
              <li key={e.id} className="history__row">
                <span className={`status-pill${e.summary.passed ? ' is-ok' : ' is-bad'}`}>{e.summary.passed ? t.exam.reached : t.exam.below}</span>
                <span className="history__date">{t.format.date(e.finishedAt)}</span>
                <span className="history__score">{t.exam.historyScore(e.summary.percent, e.summary.correctCount, e.questionIds.length, e.minutesUsed)}</span>
                <Link to={`/exam/result/${e.id}`} className="link-inline">
                  {t.common.results}
                  <Icon name="chevronRight" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Runner({ session }: { session: ExamSession }) {
  const { lang } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const [now, setNow] = useState(() => Date.now())
  const [overview, setOverview] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const remaining = Math.max(0, Math.round((session.endsAt - now) / 1000))
  const qid = session.questionIds[session.current]
  const q = questionById.get(qid)
  const inCase = session.caseQuestionIds.includes(qid)

  const submit = useCallback(() => {
    const scores: Record<string, number> = {}
    for (const id of session.questionIds) {
      const qq = questionById.get(id)
      if (qq) scores[id] = scoreQuestion(qq, session.answers[id]).score
    }
    const summary = summarizeExam(session.questionIds, questionById, session.answers)
    const record: ExamRecord = {
      id: session.id,
      finishedAt: new Date().toISOString(),
      minutesUsed: Math.min(session.minutes, Math.max(1, Math.ceil((Date.now() - new Date(session.startedAt).getTime()) / 60_000))),
      minutes: session.minutes,
      questionIds: session.questionIds,
      answers: session.answers,
      summary,
    }
    store.finishExam(record, scores)
    navigate(`/exam/result/${record.id}`, { replace: true })
  }, [session, navigate])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (remaining === 0) submit()
  }, [remaining, submit])

  if (!q) return null
  const answered = (id: string) => {
    const qq = questionById.get(id)
    return qq ? isAnswerComplete(qq, session.answers[id]) : false
  }
  const marked = session.marked.includes(qid)
  const answeredCount = session.questionIds.filter(answered).length
  const go = (i: number) => {
    store.updateExam({ current: Math.max(0, Math.min(session.questionIds.length - 1, i)) })
    setOverview(false)
  }

  return (
    <div className="exam-run">
      <div className="exam-run__top">
        <div className="exam-run__top-inner">
          <span className="exam-run__title">
            {t.exam.title}
            {inCase ? t.exam.caseSuffix : ''}
          </span>
          <span className="exam-run__pos">{t.exam.position(session.current + 1, session.questionIds.length)}</span>
          <span className={`exam-run__clock${remaining < 600 ? ' is-low' : ''}`} role="timer" aria-label={t.exam.timeLeft(formatClock(remaining))}>
            <Icon name="exam" size={18} />
            {formatClock(remaining)}
          </span>
          <button type="button" className="btn btn--secondary btn--small" onClick={() => setOverview((o) => !o)} aria-pressed={overview}>
            <Icon name="grid" size={16} />
            {t.exam.overview}
          </button>
        </div>
      </div>

      {overview ? (
        <section className="exam-overview panel" aria-labelledby="ov-h">
          <h2 id="ov-h" className="panel__title">
            {t.exam.overview}
          </h2>
          <p className="muted">{t.exam.overviewText(answeredCount, session.questionIds.length, session.marked.length)}</p>
          <ol className="ov-grid">
            {session.questionIds.map((id, i) => (
              <li key={id}>
                <button
                  type="button"
                  className={`ov-cell${answered(id) ? ' is-answered' : ''}${session.marked.includes(id) ? ' is-marked' : ''}${i === session.current ? ' is-current' : ''}`}
                  onClick={() => go(i)}
                  aria-label={t.exam.cell(i + 1, answered(id), session.marked.includes(id))}
                >
                  {i + 1}
                  {session.marked.includes(id) && <Icon name="flagFilled" size={12} />}
                </button>
              </li>
            ))}
          </ol>
          <ul className="ov-legend">
            <li>
              <span className="ov-cell is-answered" aria-hidden="true" />
              {t.exam.answered}
            </li>
            <li>
              <span className="ov-cell" aria-hidden="true" />
              {t.exam.open}
            </li>
            <li>
              <span className="ov-cell is-marked" aria-hidden="true" />
              {t.exam.marked}
            </li>
          </ul>
          {!confirm ? (
            <button type="button" className="btn btn--primary btn--large" onClick={() => setConfirm(true)}>
              {t.exam.submit}
            </button>
          ) : (
            <div className="callout callout--warn">
              <Icon name="warning" size={20} />
              <div>
                <p className="callout__title">{t.exam.confirm}</p>
                <p>{session.questionIds.length - answeredCount > 0 ? t.exam.stillOpen(session.questionIds.length - answeredCount) : t.exam.allAnswered}</p>
                <div className="callout__actions">
                  <button type="button" className="btn btn--primary" onClick={submit}>
                    {t.exam.submitNow}
                  </button>
                  <button type="button" className="btn btn--subtle" onClick={() => setConfirm(false)}>
                    {t.exam.keepWorking}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        <div className="exam-run__body">
          <QuestionView
            key={qid}
            question={q}
            lang={lang}
            answer={session.answers[qid] ?? emptyAnswer(q)}
            onChange={(a) => store.updateExam({ answers: { ...session.answers, [qid]: a } })}
            revealed={false}
            seed={7}
            caseStudy={q.caseId ? caseById.get(q.caseId) : undefined}
            examMode
          />
        </div>
      )}

      {!overview && (
        <div className="exam-run__bar">
          <div className="exam-run__bar-inner">
            <button type="button" className="btn btn--secondary" onClick={() => go(session.current - 1)} disabled={session.current === 0}>
              <Icon name="chevronLeft" size={16} />
              {t.common.back}
            </button>
            <button
              type="button"
              className={`btn btn--subtle${marked ? ' is-on' : ''}`}
              aria-pressed={marked}
              onClick={() => store.updateExam({ marked: marked ? session.marked.filter((m) => m !== qid) : [...session.marked, qid] })}
            >
              <Icon name={marked ? 'flagFilled' : 'flag'} size={16} />
              {marked ? t.exam.marked : t.exam.mark}
            </button>
            {session.current < session.questionIds.length - 1 ? (
              <button type="button" className="btn btn--primary" onClick={() => go(session.current + 1)}>
                {t.common.next}
                <Icon name="chevronRight" size={16} />
              </button>
            ) : (
              <button type="button" className="btn btn--primary" onClick={() => setOverview(true)}>
                {t.exam.toOverview}
                <Icon name="chevronRight" size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Results({ record }: { record: ExamRecord }) {
  const { lang } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const s = record.summary
  const wrongIds = record.questionIds.filter((id) => {
    const q = questionById.get(id)
    return q ? !scoreQuestion(q, record.answers[id]).correct : false
  })
  const simulated = Math.round(s.percent * 10)

  return (
    <div className="page exam-results">
      <header className="page-head">
        <h1 className="page-title">{t.exam.resultTitle(s.passed, s.percent)}</h1>
        <p className="page-sub">{t.exam.resultSub(t.format.date(record.finishedAt), s.correctCount, record.questionIds.length, record.minutesUsed, record.minutes, simulated)}</p>
      </header>
      <section className="panel" aria-labelledby="sr-h">
        <h2 id="sr-h" className="panel__title">
          {t.exam.byArea}
        </h2>
        <div className="score-line" aria-hidden="true">
          <span className="score-line__fill" style={{ width: `${s.percent}%` }} />
          <span className="score-line__mark" style={{ left: `${EXAM_DEFAULTS.passPercent}%` }}>
            {t.format.percent(EXAM_DEFAULTS.passPercent)}
          </span>
        </div>
        <ul className="report-bars">
          {s.byDomain.map((d) => {
            const dom = domainById.get(d.domain)
            const name = dom ? tx(dom.title, lang) : d.domain
            return (
              <li key={d.domain} className="report-bars__row">
                <span className="report-bars__name">
                  {name}
                  <span className="muted small">
                    {' '}
                    {dom ? t.exam.areaMeta(d.possible, dom.weight[0], dom.weight[1]) : ''}
                  </span>
                </span>
                <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={d.percent} aria-label={`${dom ? tx(dom.short, lang) : d.domain}: ${t.format.percent(d.percent)}`}>
                  <span className={`meter__fill bg-domain-${domainHue(d.domain)}`} style={{ width: `${d.percent}%` }} />
                </div>
                <span className="report-bars__pct">{d.possible ? t.format.percent(d.percent) : '–'}</span>
              </li>
            )
          })}
        </ul>
        <p className="muted small">{t.exam.reportNote}</p>
        <div className="callout__actions">
          {wrongIds.length > 0 && (
            <button type="button" className="btn btn--primary" onClick={() => navigate(practiceUrl(wrongIds))}>
              {t.exam.practiceWrong(wrongIds.length)}
            </button>
          )}
          <Link to="/exam" className="btn btn--secondary">
            {t.exam.newSimulation}
          </Link>
        </div>
      </section>
      <section className="panel" aria-labelledby="rv-h">
        <h2 id="rv-h" className="panel__title">
          {t.exam.allQuestions}
        </h2>
        <ol className="result-list">
          {record.questionIds.map((id, i) => {
            const q = questionById.get(id)
            if (!q) return null
            const answer = record.answers[id] ?? emptyAnswer(q)
            const r = scoreQuestion(q, answer)
            return (
              <li key={id}>
                <details className={`result-item${r.correct ? ' is-correct' : ' is-wrong'}`}>
                  <summary>
                    <Icon name={r.correct ? 'checkCircle' : 'dismissCircle'} size={20} />
                    <span className="result-item__num">{i + 1}</span>
                    <span className={`domain-chip domain-${domainHue(q.domain)}`}>{q.domain}</span>
                    <span className="result-item__stem" lang={lang}>{tx(q.stem, lang).replace(/[`*]/g, '')}</span>
                    {!r.correct && r.score > 0 && <span className="tag">{t.format.percent(Math.round(r.score * 100))}</span>}
                  </summary>
                  <div className="result-item__body">
                    <QuestionView question={q} lang={lang} answer={answer} onChange={() => undefined} revealed seed={7} caseStudy={q.caseId ? caseById.get(q.caseId) : undefined} />
                    <Explanation q={q} lang={lang} answer={answer} />
                  </div>
                </details>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}

export function Exam() {
  const t = useT()
  const { pathname } = useLocation()
  const { examId } = useParams()
  const { activeExam, exams } = useProgress()
  const record = useMemo(() => exams.find((e) => e.id === examId), [exams, examId])

  if (pathname.startsWith('/exam/result')) {
    if (!record)
      return (
        <div className="page">
          <p>{t.exam.missing}</p>
          <Link to="/exam">{t.exam.toExam}</Link>
        </div>
      )
    return <Results record={record} />
  }
  if (pathname.startsWith('/exam/run')) {
    if (!activeExam) return <Setup />
    return <Runner session={activeExam} />
  }
  return <Setup />
}
