import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { DomainId, QuestionType } from '../lib/types.ts'
import { Session } from '../components/Session.tsx'
import { Icon } from '../components/Icon.tsx'
import { renderInline } from '../components/inline.tsx'
import { useProgress } from '../lib/store.ts'
import { practiceUrl, selectQuestions } from '../lib/select.ts'
import { domainHue, domains, learningPaths, moduleById } from '../content/outline.ts'
import { tx, useT } from '../i18n/index.ts'
import { exam } from '../config.ts'

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

const TYPES: QuestionType[] = ['single', 'multi', 'order', 'match', 'code']

function Setup() {
  const { cards, lang } = useProgress()
  const t = useT()
  const navigate = useNavigate()
  const [doms, setDoms] = useState<DomainId[]>([])
  const [mod, setMod] = useState('')
  const [diffs, setDiffs] = useState<number[]>([])
  const [types, setTypes] = useState<QuestionType[]>([])
  const [status, setStatus] = useState<'all' | 'new' | 'wrong'>('all')
  const [count, setCount] = useState(10)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (doms.length) p.set('domain', doms.join(','))
    if (mod) p.set('module', mod)
    if (diffs.length) p.set('difficulty', diffs.join(','))
    if (types.length) p.set('type', types.join(','))
    if (status === 'new') p.set('new', '1')
    if (status === 'wrong') p.set('wrong', '1')
    return p
  }, [doms, mod, diffs, types, status])

  const available = useMemo(() => {
    const p = new URLSearchParams(params)
    return selectQuestions(p, cards).length
  }, [params, cards])

  const start = () => {
    const p = new URLSearchParams(params)
    if (count > 0) p.set('count', String(count))
    navigate(`/practice/session?${p.toString()}`)
  }

  return (
    <div className="page practice">
      <header className="page-head">
        <h1 className="page-title">{t.practice.title}</h1>
        <p className="page-sub">{t.practice.sub}</p>
      </header>
      <div className="practice__grid">
        <section className="panel filters" aria-labelledby="filter-h">
          <h2 id="filter-h" className="panel__title">
            {t.practice.choose}
          </h2>
          {domains.length > 0 && (
            <fieldset className="filter">
              <legend>{t.practice.domain}</legend>
              <div className="chip-row">
                {domains.map((d) => (
                  <button key={d.id} type="button" className={`toggle-chip domain-${domainHue(d.id)}`} aria-pressed={doms.includes(d.id)} onClick={() => setDoms(toggle(doms, d.id))}>
                    {d.id} · {tx(d.short, lang)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="filter">
            <label htmlFor="mod-select" className="filter__label">
              {t.practice.module}
            </label>
            <select id="mod-select" className="select" value={mod} onChange={(e) => setMod(e.target.value)}>
              <option value="">{t.practice.allModules}</option>
              {learningPaths.map((p) => (
                <optgroup key={p.id} label={p.title}>
                  {p.modules.filter((id) => moduleById.has(id)).map((id) => (
                    <option key={id} value={id}>
                      {moduleById.get(id)?.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <fieldset className="filter">
            <legend>{t.practice.difficulty}</legend>
            <div className="chip-row">
              {[1, 2, 3].map((d) => (
                <button key={d} type="button" className="toggle-chip" aria-pressed={diffs.includes(d)} onClick={() => setDiffs(toggle(diffs, d))}>
                  {t.labels.difficulty[d]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter">
            <legend>{t.practice.type}</legend>
            <div className="chip-row">
              {TYPES.map((type) => (
                <button key={type} type="button" className="toggle-chip" aria-pressed={types.includes(type)} onClick={() => setTypes(toggle(types, type))}>
                  {t.labels.questionType[type]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter">
            <legend>{t.practice.status}</legend>
            <div className="segmented">
              {(
                [
                  ['all', t.practice.statusAll],
                  ['new', t.practice.statusNew],
                  ['wrong', t.practice.statusWrong],
                ] as const
              ).map(([v, label]) => (
                <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="filter">
            <legend>{t.practice.count}</legend>
            <div className="segmented">
              {[10, 20, 40, 0].map((n) => (
                <button key={n} type="button" aria-pressed={count === n} onClick={() => setCount(n)}>
                  {n === 0 ? t.practice.countAll : n}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="filters__foot">
            <p className="filters__count" aria-live="polite">
              <strong>{available}</strong>
              {t.practice.matching}
            </p>
            <button type="button" className="btn btn--primary btn--large" onClick={start} disabled={available === 0}>
              {t.practice.startRound}
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </section>
        <aside className="panel practice__aside" aria-labelledby="types-h">
          <h2 id="types-h" className="panel__title">
            {t.practice.typesTitle}
          </h2>
          <ul className="type-list">
            {t.practice.types(exam.codeLanguage ?? '').map((item) => (
              <li key={item}>{renderInline(item)}</li>
            ))}
          </ul>
          <p className="type-list__note">{t.practice.scoringNote}</p>
          <Link to="/exam" className="link-inline">
            {t.practice.toExam}
            <Icon name="chevronRight" size={16} />
          </Link>
        </aside>
      </div>
    </div>
  )
}

function PracticeSession({ search }: { search: string }) {
  const navigate = useNavigate()
  const t = useT()
  const { cards } = useProgress()
  // Freeze the question list for the whole session (answers change progress mid-run).
  const [list] = useState(() => selectQuestions(new URLSearchParams(search), cards))
  const mod = new URLSearchParams(search).get('module')
  const title = mod ? (moduleById.get(mod)?.title ?? t.practice.round) : t.practice.round
  return (
    <Session
      questions={list}
      title={title}
      exitTo={mod ? `/learn/${mod}` : '/practice'}
      onRestartWrong={(ids) => navigate(practiceUrl(ids))}
    />
  )
}

export function Practice() {
  const { search, pathname } = useLocation()
  if (!pathname.endsWith('/session')) return <Setup />
  return <PracticeSession key={search} search={search} />
}
