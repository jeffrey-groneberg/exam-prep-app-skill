import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { learningPaths, moduleById, CATALOG_RETRIEVED } from '../content/outline.ts'
import { useProgress } from '../lib/store.ts'
import { tx, useT } from '../i18n/index.ts'
import { exam, SKILL_CREDIT_URL } from '../config.ts'
import { feedbackEnabled } from '../lib/feedback.ts'

interface OfficialItem {
  title: string
  url: string
  text: string
}

export function Resources() {
  const { lang } = useProgress()
  const t = useT()
  const r = t.resources
  const { links } = exam
  const official: OfficialItem[] = [
    { title: r.examPage(exam.code, tx(exam.title, lang)), url: links.examPage, text: r.examPageText },
    { title: r.studyGuide(exam.code), url: links.studyGuide, text: r.studyGuideText },
    { title: r.practiceAssessment, url: links.practiceAssessment, text: r.practiceAssessmentText },
    { title: r.sandbox, url: links.examSandbox, text: r.sandboxText },
    ...(exam.official ?? []).map((item) => ({ title: tx(item.title, lang), url: item.url, text: tx(item.note, lang) })),
    { title: r.course(exam.courseNumber ?? '', exam.courseTitle ?? ''), url: links.course, text: r.courseText },
    { title: r.durationTitle, url: 'https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience', text: r.durationText },
    { title: r.scoringTitle, url: 'https://learn.microsoft.com/en-us/credentials/certifications/exam-scoring-reports', text: r.scoringText },
  ].filter((item) => item.url)
  const community = exam.community

  return (
    <div className="page resources">
      <header className="page-head">
        <h1 className="page-title">{r.title}</h1>
        <p className="page-sub">{r.sub(exam.code, community.length > 0)}</p>
      </header>

      <section className="panel" aria-labelledby="off-h">
        <h2 id="off-h" className="panel__title">
          {r.official}
        </h2>
        <ul className="resource-list">
          {official.map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noreferrer" className="resource-list__link">
                {item.title}
                <Icon name="open" size={14} />
              </a>
              {item.text && <p>{item.text}</p>}
            </li>
          ))}
        </ul>
      </section>

      {community.length > 0 && (
        <section className="panel" aria-labelledby="community-h">
          <h2 id="community-h" className="panel__title">
            {r.community}
          </h2>
          <ul className="resource-list">
            {community.map((item) => (
              <li key={item.url}>
                <a href={item.url} target="_blank" rel="noreferrer" className="resource-list__link">
                  {tx(item.title, lang)}
                  <Icon name="open" size={14} />
                </a>
                {item.note && <p>{tx(item.note, lang)}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="resources__grid">
        <section className="panel" aria-labelledby="facts-h">
          <h2 id="facts-h" className="panel__title">
            {r.examDay}
          </h2>
          <ul className="facts">
            {r.facts(exam.exam.minutes, exam.exam.seatMinutes ?? 0).map((f) => (
              <li key={f}>
                <Icon name="info" size={18} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel" aria-labelledby="policy-h">
          <h2 id="policy-h" className="panel__title">
            {r.origin}
          </h2>
          <ul className="facts">
            {r.policy.map((text, i) => (
              <li key={text}>
                <Icon name={(['shield', 'documentSearch', 'lightbulb'] as const)[i] ?? 'info'} size={18} />
                <span>{text}</span>
              </li>
            ))}
            {feedbackEnabled && (
              <li>
                <Icon name="feedback" size={18} />
                <span>{r.policyFeedback}</span>
              </li>
            )}
            <li>
              <Icon name="calendar" size={18} />
              <span>{r.asOf(t.format.day(exam.skillsOutlineDate), t.format.day(CATALOG_RETRIEVED))}</span>
            </li>
          </ul>
          <Link to="/coverage" className="link-inline">
            {r.matrix}
            <Icon name="chevronRight" size={16} />
          </Link>
        </section>
      </div>

      {learningPaths.length > 0 && (
        <section className="panel" aria-labelledby="lp-h">
          <h2 id="lp-h" className="panel__title">
            {r.paths}
          </h2>
          <div className="lp-links">
            {learningPaths.map((p) => (
              <div key={p.id} className="lp-links__group">
                <a href={p.url} target="_blank" rel="noreferrer" className="lp-links__path">
                  {p.title}
                  <Icon name="open" size={14} />
                </a>
                <ol>
                  {p.modules
                    .filter((id) => moduleById.has(id))
                    .map((id) => (
                      <li key={id}>
                        <a href={moduleById.get(id)?.url} target="_blank" rel="noreferrer">
                          {moduleById.get(id)?.title}
                        </a>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </section>
      )}

      {SKILL_CREDIT_URL && (
        <section className="panel" aria-labelledby="skill-h">
          <h2 id="skill-h" className="panel__title">
            {r.skillTitle}
          </h2>
          <ul className="resource-list">
            <li>
              <a href={SKILL_CREDIT_URL} target="_blank" rel="noreferrer" className="resource-list__link">
                {r.skillLink}
                <Icon name="open" size={14} />
              </a>
              <p>{r.skillText}</p>
            </li>
          </ul>
        </section>
      )}
    </div>
  )
}
