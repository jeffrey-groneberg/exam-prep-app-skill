import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { useProgress } from '../lib/store.ts'
import { moduleStatus } from '../lib/progress.ts'
import { domainHue, learningPaths, moduleById } from '../content/outline.ts'
import { lessonByModule, orderedModules, questions } from '../content/index.ts'
import { moduleDomains } from '../lib/select.ts'
import { useT } from '../i18n/index.ts'
import { exam } from '../config.ts'

export function Learn() {
  const { cards, lessonsRead } = useProgress()
  const t = useT()
  return (
    <div className="page learn">
      <header className="page-head">
        <h1 className="page-title">{t.learn.title}</h1>
        <p className="page-sub">
          {exam.courseNumber && exam.links.course ? (
            <>
              {t.learn.sub}
              <a href={exam.links.course} target="_blank" rel="noreferrer">
                {t.learn.course(exam.courseNumber, exam.courseTitle ?? '')}
              </a>
              {t.learn.subEnd}
            </>
          ) : (
            t.learn.subNoCourse
          )}
        </p>
      </header>
      {!learningPaths.length && (
        <section className="panel empty">
          <Icon name="book" size={28} className="ink-brand" />
          <p>{t.empty.modules}</p>
        </section>
      )}
      {learningPaths.map((p, pi) => {
        const ids = p.modules.filter((id) => moduleById.has(id))
        const mins = ids.reduce((a, id) => a + (moduleById.get(id)?.minutes ?? 0), 0)
        return (
          <section key={p.id} className="panel lp" aria-labelledby={`lp-${p.id}`}>
            <div className="panel__head">
              <div>
                <h2 id={`lp-${p.id}`} className="lp__title">
                  {p.title}
                </h2>
                <p className="lp__meta">{t.learn.pathMeta(pi + 1, learningPaths.length, ids.length, Math.round(mins / 60))}</p>
              </div>
              <a href={p.url} target="_blank" rel="noreferrer" className="link-inline">
                {t.learn.onLearn}
                <Icon name="open" size={16} />
              </a>
            </div>
            <ol className="module-list">
              {ids.map((id) => {
                const m = moduleById.get(id)!
                const s = moduleStatus(m, questions, cards, lessonsRead)
                const index = orderedModules.findIndex((x) => x.id === id) + 1
                const hasLesson = lessonByModule.has(id)
                return (
                  <li key={id} className="module-row">
                    <span className={`module-row__index${s.step === 'done' ? ' is-done' : ''}`} aria-hidden="true">
                      {s.step === 'done' ? <Icon name="check" size={16} /> : index}
                    </span>
                    <div className="module-row__main">
                      <Link to={`/learn/${id}`} className="module-row__title">
                        {m.title}
                      </Link>
                      <div className="module-row__chips">
                        {moduleDomains(m.skills).map((d) => (
                          <span key={d} className={`domain-chip domain-${domainHue(d)}`}>
                            {d}
                          </span>
                        ))}
                        {m.skills.length > 0 && <span className="module-row__skills">{t.learn.skills(m.skills.join(', '))}</span>}
                      </div>
                    </div>
                    <div className="module-row__status">
                      <span className={`status-pill${s.lessonRead ? ' is-on' : ''}`}>
                        <Icon name={s.lessonRead ? 'check' : 'book'} size={14} />
                        {s.lessonRead ? t.learn.read : hasLesson ? t.learn.lesson : t.learn.lessonComing}
                      </span>
                      <span className="module-row__mastery">{t.learn.status(t.labels.mastery[s.mastery.level], s.attempted, s.total)}</span>
                      <span className={`mastery-bar level-${s.mastery.level}`} aria-hidden="true">
                        <span style={{ width: `${Math.round(s.mastery.value * 100)}%` }} />
                      </span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
