import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { useProgress } from '../lib/store.ts'
import { domainHue, domains, learningPaths, moduleById, modules } from '../content/outline.ts'
import { cases, lessonByModule, questions } from '../content/index.ts'
import { tx, useT } from '../i18n/index.ts'
import { exam } from '../config.ts'

export function Coverage() {
  const { lang } = useProgress()
  const t = useT()
  const primary = new Map<string, number>()
  const secondary = new Map<string, number>()
  for (const q of questions) {
    primary.set(q.skill, (primary.get(q.skill) ?? 0) + 1)
    for (const s of q.skills ?? []) secondary.set(s, (secondary.get(s) ?? 0) + 1)
  }
  const byModule = new Map<string, number>()
  for (const q of questions) byModule.set(q.module, (byModule.get(q.module) ?? 0) + 1)
  const gaps = domains.flatMap((d) => d.groups.flatMap((g) => g.bullets)).filter((b) => !primary.get(b.id))

  return (
    <div className="page coverage">
      <header className="page-head">
        <h1 className="page-title">{t.coverage.title}</h1>
        <p className="page-sub">
          {t.coverage.subStart}
          {exam.links.studyGuide ? (
            <a href={exam.links.studyGuide} target="_blank" rel="noreferrer">
              {t.coverage.outline}
            </a>
          ) : (
            t.coverage.outline
          )}
          {t.coverage.subEnd(t.format.day(exam.skillsOutlineDate), questions.length, lessonByModule.size, modules.length, cases.length)}
        </p>
      </header>
      {!domains.length && (
        <section className="panel empty">
          <Icon name="grid" size={28} className="ink-brand" />
          <p>{t.empty.domains}</p>
        </section>
      )}
      {gaps.length > 0 && (
        <div className="callout callout--warn">
          <Icon name="warning" size={20} />
          <div>
            <p className="callout__title">{t.coverage.gaps}</p>
            <p>{gaps.map((g) => g.id).join(', ')}</p>
          </div>
        </div>
      )}
      {domains.map((d) => (
        <section key={d.id} className="panel" aria-labelledby={`cov-${d.id}`}>
          <h2 id={`cov-${d.id}`} className="panel__title">
            <span className={`domain-chip domain-${domainHue(d.id)}`}>{d.id}</span> {tx(d.title, lang)}
            {t.coverage.domainHead(d.weight[0], d.weight[1], questions.filter((q) => q.domain === d.id).length)}
          </h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-label={t.coverage.table(d.id)}>
            <table className="data-table coverage-table stack-table" role="table">
              <thead role="rowgroup">
                <tr role="row">
                  <th scope="col" role="columnheader">{t.coverage.skill}</th>
                  <th scope="col" role="columnheader">{t.coverage.modulesLesson}</th>
                  <th scope="col" role="columnheader">{t.coverage.questions}</th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {d.groups.flatMap((g) =>
                  g.bullets.map((b) => {
                    const mods = modules.filter((m) => m.skills.includes(b.id))
                    const n = primary.get(b.id) ?? 0
                    return (
                      <tr key={b.id} role="row">
                        <th scope="row" role="rowheader">
                          <span className="skill-chip">{b.id}</span> {tx(b, lang)}
                        </th>
                        <td role="cell" data-label={t.coverage.modules}>
                          <ul className="cov-mods">
                            {mods.map((m) => (
                              <li key={m.id}>
                                <Link to={`/learn/${m.id}`}>{m.title}</Link>
                                {lessonByModule.has(m.id) ? <Icon name="checkCircle" size={14} className="ink-ok" label={t.coverage.lessonThere} /> : <span className="muted small">{t.coverage.lessonComing}</span>}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className={n ? '' : 'ink-bad'} role="cell" data-label={t.coverage.questions}>
                          {n ? (
                            <Link to={`/practice/session?skill=${b.id}`}>
                              {n}
                              {secondary.get(b.id) ? ` + ${secondary.get(b.id)}` : ''}
                            </Link>
                          ) : (
                            '0'
                          )}
                        </td>
                      </tr>
                    )
                  }),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <section className="panel" aria-labelledby="cov-mod">
        <h2 id="cov-mod" className="panel__title">
          {t.coverage.perModule}
        </h2>
        <div className="table-wrap" tabIndex={0} role="region" aria-label={t.coverage.perModuleLabel}>
          <table className="data-table stack-table" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">{t.coverage.path}</th>
                <th scope="col" role="columnheader">{t.coverage.module}</th>
                <th scope="col" role="columnheader">{t.coverage.lesson}</th>
                <th scope="col" role="columnheader">{t.coverage.questions}</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {learningPaths.flatMap((p) =>
                p.modules.filter((id) => moduleById.has(id)).map((id) => (
                  <tr key={id} role="row">
                    <td className="small" role="cell" data-label={t.coverage.path}>
                      {p.title}
                    </td>
                    <th scope="row" role="rowheader">
                      <a href={moduleById.get(id)?.url} target="_blank" rel="noreferrer">
                        {moduleById.get(id)?.title}
                      </a>
                    </th>
                    <td role="cell" data-label={t.coverage.lesson}>
                      {lessonByModule.has(id) ? <Icon name="checkCircle" size={16} className="ink-ok" label={t.coverage.there} /> : '–'}
                    </td>
                    <td role="cell" data-label={t.coverage.questions}>
                      {byModule.get(id) ?? 0}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
