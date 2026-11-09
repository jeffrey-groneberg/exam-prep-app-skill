import { useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { store, STORAGE_KEY, useProgress } from '../lib/store.ts'
import { masteryOf, moduleStatus, type MasteryLevel } from '../lib/progress.ts'
import { tx, useT } from '../i18n/index.ts'
import { domainHue, domains, learningPaths, moduleById } from '../content/outline.ts'
import { orderedModules, questions, questionsForBullet } from '../content/index.ts'
import { exam } from '../config.ts'

const LEVELS: MasteryLevel[] = [0, 1, 2, 3]

export function ProgressPage() {
  const progress = useProgress()
  const { cards, lessonsRead, exams, lang } = progress
  const t = useT()
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const answered = Object.keys(cards).length

  const download = () => {
    const blob = new Blob([store.exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${STORAGE_KEY.replace(/:v\d+$/, '')}-${t.progress.fileName}-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const upload = async (file: File) => {
    const ok = store.importJson(await file.text())
    setImportMsg(ok ? t.progress.imported : t.progress.importFailed(exam.appName))
  }

  return (
    <div className="page progress-page">
      <header className="page-head">
        <h1 className="page-title">{t.progress.title}</h1>
        <p className="page-sub">{t.progress.sub(answered, questions.length, Object.keys(lessonsRead).length, orderedModules.length, exams.length)}</p>
      </header>

      <section className="panel skills-map" aria-labelledby="map-h">
        <div className="panel__head">
          <h2 id="map-h" className="panel__title">
            {t.progress.map(exam.code)}
          </h2>
          <ul className="mastery-legend" aria-label={t.common.legend}>
            {LEVELS.map((l) => (
              <li key={l}>
                <span className={`tile-swatch level-${l}`} aria-hidden="true" />
                {t.labels.mastery[l]}
              </li>
            ))}
          </ul>
        </div>
        <p className="muted small skills-map__hint">{domains.length ? t.progress.mapHint : t.empty.domains}</p>
        {domains.map((d) => (
          <div key={d.id} className="skills-row">
            <div className="skills-row__head">
              <span className={`skills-row__icon ink-domain-${domainHue(d.id)}`} aria-hidden="true">
                <Icon name={d.icon} size={20} />
              </span>
              <div>
                <p className="skills-row__title">{tx(d.title, lang)}</p>
                <p className="skills-row__weight">
                  {d.id} · {t.format.percentRange(d.weight[0], d.weight[1])}
                </p>
              </div>
            </div>
            <ol className="tiles">
              {d.groups.flatMap((g) =>
                g.bullets.map((b) => {
                  const qs = questionsForBullet(b.id)
                  const m = masteryOf(qs, cards)
                  const label = t.progress.tile(b.id, tx(b, lang), t.labels.mastery[m.level], m.correctLast, m.total)
                  return (
                    <li key={b.id}>
                      <Link to={`/practice/session?skill=${b.id}`} className={`tile level-${m.level}`} aria-label={label} data-tip={label}>
                        <span className="tile__id">{b.id}</span>
                      </Link>
                    </li>
                  )
                }),
              )}
            </ol>
          </div>
        ))}
      </section>

      <section className="panel" aria-labelledby="mods-h">
        <div className="panel__head">
          <h2 id="mods-h" className="panel__title">
            {t.progress.modules}
          </h2>
          <Link to="/coverage" className="link-inline">
            {t.progress.matrix}
            <Icon name="chevronRight" size={16} />
          </Link>
        </div>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={t.progress.perModule}>
          <table className="data-table stack-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">{t.progress.module}</th>
                <th scope="col" role="columnheader">{t.progress.lesson}</th>
                <th scope="col" role="columnheader">{t.progress.questions}</th>
                <th scope="col" role="columnheader">{t.progress.status}</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {learningPaths.flatMap((p) =>
                p.modules.filter((id) => moduleById.has(id)).map((id) => {
                  const m = moduleById.get(id)!
                  const s = moduleStatus(m, questions, cards, lessonsRead)
                  return (
                    <tr key={id} role="row">
                      <th scope="row" role="rowheader">
                        <Link to={`/learn/${id}`}>{m.title}</Link>
                      </th>
                      <td role="cell" data-label={t.progress.lesson}>
                        {s.lessonRead ? <Icon name="checkCircle" size={18} className="ink-ok" label={t.progress.read} /> : <span className="muted">–</span>}
                      </td>
                      <td role="cell" data-label={t.progress.questions}>
                        {s.attempted}/{s.total}
                      </td>
                      <td role="cell" data-label={t.progress.status}>
                        <span className="mastery-cell">
                          <span className={`mastery-bar level-${s.mastery.level}`} aria-hidden="true">
                            <span style={{ width: `${Math.round(s.mastery.value * 100)}%` }} />
                          </span>
                          <span className="small">{t.labels.mastery[s.mastery.level]}</span>
                        </span>
                      </td>
                    </tr>
                  )
                }),
              )}
            </tbody>
          </table>
        </div>
      </section>

      {exams.length > 0 && (
        <section className="panel" aria-labelledby="ex-h">
          <h2 id="ex-h" className="panel__title">
            {t.progress.simulations}
          </h2>
          <ol className="exam-trend" style={{ '--pass': `${exam.exam.passPercent}%` } as CSSProperties}>
            {exams
              .slice(0, 10)
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <Link to={`/exam/result/${e.id}`} className="exam-trend__bar" aria-label={t.progress.trendBar(t.format.date(e.finishedAt), e.summary.percent)}>
                    <span className={e.summary.passed ? 'bg-ok' : 'bg-brand-soft'} style={{ height: `${Math.max(4, e.summary.percent)}%` }} />
                  </Link>
                  <span className="exam-trend__label">{t.format.percent(e.summary.percent)}</span>
                </li>
              ))}
          </ol>
          <p className="muted small">{t.progress.trendNote(exam.exam.passPercent)}</p>
        </section>
      )}

      <section className="panel" aria-labelledby="data-h">
        <h2 id="data-h" className="panel__title">
          {t.progress.data}
        </h2>
        <p className="muted">{t.progress.dataText}</p>
        <div className="callout__actions">
          <button type="button" className="btn btn--secondary" onClick={download}>
            <Icon name="download" size={16} />
            {t.progress.export}
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={16} />
            {t.progress.import}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void upload(f)
              e.target.value = ''
            }}
          />
          {!confirmReset ? (
            <button type="button" className="btn btn--subtle" onClick={() => setConfirmReset(true)}>
              <Icon name="reset" size={16} />
              {t.progress.reset}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  store.reset()
                  setConfirmReset(false)
                }}
              >
                {t.progress.resetConfirm}
              </button>
              <button type="button" className="btn btn--subtle" onClick={() => setConfirmReset(false)}>
                {t.common.cancel}
              </button>
            </>
          )}
        </div>
        {importMsg && (
          <p className="small" role="status">
            {importMsg}
          </p>
        )}
      </section>
    </div>
  )
}
