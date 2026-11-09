import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon.tsx'
import { Diagram } from '../components/Diagram.tsx'
import { CodeBlock } from '../components/CodeBlock.tsx'
import { RichText } from '../components/RichText.tsx'
import { renderInline } from '../components/inline.tsx'
import { InlineQuestion } from '../components/InlineQuestion.tsx'
import { FeedbackLink } from '../components/Feedback.tsx'
import { store, useProgress } from '../lib/store.ts'
import { moduleStatus } from '../lib/progress.ts'
import { tx, useT, type Messages } from '../i18n/index.ts'
import { bulletById, domainHue, learningPaths, moduleById } from '../content/outline.ts'
import { lessonByModule, orderedModules, questionsForModule, questions } from '../content/index.ts'
import { NotFound } from './NotFound.tsx'
import type { CourseModule, Question } from '../lib/types.ts'
import { moduleDomains } from '../lib/select.ts'
import { useZettelBox } from '../lib/zettel-box.ts'
import { countByFach } from '../lib/zettel.ts'

type SectionId = keyof Messages['lesson']['sections']

/** Lesson sections in page order; the ids are the anchors (?section=…). */
const SECTIONS: SectionId[] = ['about', 'diagrams', 'concepts', 'compare', 'code', 'traps', 'takeaways', 'quiz', 'sources']

export function LessonPage() {
  const { moduleId: rawId = '' } = useParams()
  const moduleId = decodeURIComponent(rawId).split('#')[0]
  const { hash, search } = useLocation()
  const navigate = useNavigate()
  const progress = useProgress()
  const t = useT()
  const { cards: boxCards } = useZettelBox()
  const { lang } = progress
  const mod = moduleById.get(moduleId)
  const lesson = lessonByModule.get(moduleId)
  const moduleQuestions = questionsForModule(moduleId)
  const quiz = pickQuiz(moduleQuestions)

  useEffect(() => {
    const section = new URLSearchParams(search).get('section') ?? (hash ? hash.slice(1) : decodeURIComponent(rawId).split('#')[1])
    if (!section) return
    const el = document.getElementById(section)
    el?.scrollIntoView({ block: 'start' })
  }, [hash, search, rawId, moduleId])

  // "On this page" marks the section being read, like Microsoft Learn: the last section whose
  // heading has passed a reading line a quarter down the window (below the top bar).
  const [activeSection, setActiveSection] = useState<string | null>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      const line = 56 + window.innerHeight * 0.25
      const present = SECTIONS.map((s) => document.getElementById(s)).filter((el): el is HTMLElement => !!el)
      let current = present[0]?.id ?? null
      for (const el of present) if (el.getBoundingClientRect().top <= line) current = el.id
      if (present.length && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = present[present.length - 1].id
      setActiveSection(current)
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [moduleId, lesson])

  if (!mod) return <NotFound />
  const status = moduleStatus(mod, questions, progress.cards, progress.lessonsRead)
  const index = orderedModules.findIndex((m) => m.id === mod.id)
  const prev = orderedModules[index - 1]
  const next = orderedModules[index + 1]
  const path = learningPaths.find((p) => p.id === mod.pathId)
  const sections = SECTIONS.filter((s) => (s === 'compare' ? lesson?.comparison : s === 'quiz' ? quiz.length > 0 : true))
  const zettel = boxCards.filter((z) => z.module === mod.id)
  const zettelCounts = countByFach(zettel.map((z) => z.id), progress.zettel)
  const zettelOpen = zettelCounts[0] + zettelCounts[1]

  const finish = () => {
    store.markLessonRead(mod.id)
    navigate(moduleQuestions.length ? `/practice/session?module=${mod.id}&new=1` : '/')
  }

  return (
    <div className="page lesson">
      <nav className="breadcrumb" aria-label={t.common.breadcrumb}>
        <Link to="/learn">{t.learn.title}</Link>
        <Icon name="chevronRight" size={14} />
        <span>{path?.title}</span>
        <Icon name="chevronRight" size={14} />
        <span aria-current="page">{t.lesson.module(index + 1)}</span>
      </nav>
      <header className="lesson-head">
        <h1 className="page-title">{mod.title}</h1>
        <p className="page-sub">{t.lesson.sub(index + 1, orderedModules.length, mod.minutes, moduleQuestions.length, t.labels.mastery[status.mastery.level])}</p>
        <div className="lesson-head__chips">
          {moduleDomains(mod.skills).map((d) => (
            <span key={d} className={`domain-chip domain-${domainHue(d)}`}>
              {d}
            </span>
          ))}
          {mod.skills.map((s) => (
            <span key={s} className="skill-chip" title={bulletById.get(s)?.[lang === 'de' ? 'de' : 'en']}>
              {s}
            </span>
          ))}
        </div>
        <div className="lesson-head__actions">
          <a className="btn btn--secondary" href={mod.url} target="_blank" rel="noreferrer">
            <Icon name="open" size={16} />
            {t.lesson.officialModule}
          </a>
          {moduleQuestions.length > 0 && (
            <Link className="btn btn--secondary" to={`/practice/session?module=${mod.id}`}>
              <Icon name="practice" size={16} />
              {t.lesson.practiceN(moduleQuestions.length)}
            </Link>
          )}
          {zettel.length > 0 && (
            <Link className="btn btn--secondary" to={`/cards/module/${mod.id}`}>
              <Icon name="zettel" size={16} />
              {t.lesson.cardsN(zettel.length)}
            </Link>
          )}
          <button type="button" className={`btn btn--subtle${status.lessonRead ? ' is-on' : ''}`} onClick={() => store.markLessonRead(mod.id, !status.lessonRead)} aria-pressed={status.lessonRead}>
            <Icon name={status.lessonRead ? 'checkCircle' : 'check'} size={16} />
            {status.lessonRead ? t.lesson.markedRead : t.lesson.markRead}
          </button>
        </div>
      </header>

      <div className="lesson__layout">
        <article className="lesson__body">
          {!lesson ? (
            <section className="lesson-section">
              <h2>{t.lesson.comingTitle}</h2>
              <p>{t.lesson.comingText}</p>
              <UnitList units={mod.units} url={mod.url} />
            </section>
          ) : (
            <>
              <section id="about" className="lesson-section">
                <SectionHead mod={mod} title={t.lesson.sections.about} />
                <RichText text={tx(lesson.summary, lang)} className="lesson-lead" lang={lang} />
                <div className="callout callout--exam">
                  <Icon name="target" size={20} />
                  <div>
                    <p className="callout__title">{t.lesson.examFocus}</p>
                    <RichText text={tx(lesson.examFocus, lang)} lang={lang} />
                  </div>
                </div>
              </section>

              <section id="diagrams" className="lesson-section">
                <h2>{t.lesson.sections.diagrams}</h2>
                {lesson.diagrams.map((d) => (
                  <Diagram key={d.id} diagram={d} lang={lang} />
                ))}
              </section>

              <section id="concepts" className="lesson-section">
                <SectionHead mod={mod} title={t.lesson.sections.concepts} />
                <dl className="concepts" lang={lang}>
                  {lesson.concepts.map((c) => (
                    <div key={c.term} className="concept">
                      <dt>{c.term}</dt>
                      <dd>{renderInline(tx(c.text, lang))}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {lesson.comparison && (
                <section id="compare" className="lesson-section">
                  <SectionHead mod={mod} title={t.lesson.sections.compare} />
                  <div className="table-wrap" tabIndex={0} role="region" aria-label={tx(lesson.comparison.title, lang)} lang={lang}>
                    <table className="compare stack-table" role="table">
                      <caption>{tx(lesson.comparison.title, lang)}</caption>
                      <thead role="rowgroup">
                        <tr role="row">
                          {lesson.comparison.columns.map((c, i) => (
                            <th key={i} scope="col" role="columnheader">
                              {tx(c, lang)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody role="rowgroup">
                        {lesson.comparison.rows.map((row, ri) => (
                          <tr key={ri} role="row">
                            {row.map((cell, ci) =>
                              ci === 0 ? (
                                <th key={ci} scope="row" role="rowheader">
                                  {renderInline(tx(cell, lang))}
                                </th>
                              ) : (
                                <td key={ci} role="cell" data-label={tx(lesson.comparison!.columns[ci], lang)}>
                                  {renderInline(tx(cell, lang))}
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section id="code" className="lesson-section">
                <h2>{t.lesson.sections.code}</h2>
                {lesson.code.map((c, i) => (
                  <div key={i} className="code-sample">
                    <h3 lang={lang}>{tx(c.title, lang)}</h3>
                    <CodeBlock
                      code={c.code}
                      feedback={{
                        subject: t.feedback.subject.code(mod.id, i + 1),
                        details: [
                          [t.feedback.detail.module, `${mod.id} (${mod.title})`],
                          [t.feedback.detail.codeSample, tx(c.title, lang)],
                        ],
                      }}
                    />
                    {c.notes.length > 0 && (
                      <ul className="code-notes" lang={lang}>
                        {c.notes.map((n, ni) => (
                          <li key={ni}>{renderInline(tx(n, lang))}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </section>

              <section id="traps" className="lesson-section">
                <SectionHead mod={mod} title={t.lesson.sections.traps} />
                <ul className="traps" lang={lang}>
                  {lesson.traps.map((trap, i) => (
                    <li key={i}>
                      <Icon name="warning" size={20} />
                      <span>{renderInline(tx(trap, lang))}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="takeaways" className="lesson-section">
                <SectionHead mod={mod} title={t.lesson.sections.takeaways} />
                <ul className="takeaways" lang={lang}>
                  {lesson.takeaways.map((takeaway, i) => (
                    <li key={i}>
                      <Icon name="lightbulb" size={20} />
                      <span>{renderInline(tx(takeaway, lang))}</span>
                    </li>
                  ))}
                </ul>
                {zettel.length > 0 && (
                  <div className="lesson-zettel">
                    <Icon name="zettel" size={20} className="ink-brand" />
                    <p>{t.lesson.cards(zettel.length, zettelCounts[2])}</p>
                    <Link to={zettelOpen > 0 ? `/cards/round?module=${mod.id}` : `/cards/module/${mod.id}`} className="btn btn--secondary">
                      {zettelOpen > 0 ? t.lesson.studyCards : t.lesson.toIndex}
                      <Icon name="arrowRight" size={16} />
                    </Link>
                  </div>
                )}
              </section>

              {quiz.length > 0 && (
                <section id="quiz" className="lesson-section">
                  <h2>{t.lesson.sections.quiz}</h2>
                  <p className="section-sub">{t.lesson.quizSub}</p>
                  {quiz.map((q, i) => (
                    <InlineQuestion key={q.id} q={q} seed={i + 1} />
                  ))}
                </section>
              )}

              <section id="sources" className="lesson-section">
                <SectionHead mod={mod} title={t.lesson.sections.sources} />
                <ul className="sources">
                  {lesson.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                        <Icon name="open" size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
                <h3 className="units-head">{t.lesson.units}</h3>
                <UnitList units={mod.units} url={mod.url} />
              </section>
            </>
          )}

          <div className="lesson-end">
            <button type="button" className="btn btn--primary btn--large" onClick={finish}>
              {moduleQuestions.length ? t.lesson.finishAndPractice : t.lesson.finish}
              <Icon name="arrowRight" size={18} />
            </button>
            <div className="lesson-end__nav">
              {prev && (
                <Link to={`/learn/${prev.id}`} className="link-inline">
                  <Icon name="chevronLeft" size={16} />
                  {prev.title}
                </Link>
              )}
              {next && (
                <Link to={`/learn/${next.id}`} className="link-inline">
                  {next.title}
                  <Icon name="chevronRight" size={16} />
                </Link>
              )}
            </div>
          </div>
        </article>

        <aside className="lesson__rail" aria-label={t.lesson.onThisPage}>
          <div className="rail-box">
            <p className="rail-box__title">{t.lesson.onThisPage}</p>
            <ol className="toc">
              {lesson &&
                sections.map((s) => (
                  <li key={s}>
                    <a
                      href={`#/learn/${mod.id}?section=${s}`}
                      className={activeSection === s ? 'is-active' : undefined}
                      aria-current={activeSection === s ? 'location' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById(s)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      {t.lesson.sections[s]}
                    </a>
                  </li>
                ))}
            </ol>
          </div>
          <div className="rail-box">
            <p className="rail-box__title">{t.lesson.skills}</p>
            <ul className="rail-skills">
              {mod.skills.map((s) => (
                <li key={s}>
                  <span className="skill-chip">{s}</span>
                  <span>{bulletById.get(s)?.[lang === 'de' ? 'de' : 'en']}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

/** A section heading with a feedback link that names the module and the section. */
function SectionHead({ mod, title }: { mod: CourseModule; title: string }) {
  const f = useT().feedback
  return (
    <div className="section-head">
      <h2>{title}</h2>
      <FeedbackLink
        about="section"
        compact
        target={{
          subject: f.subject.section(mod.id, title),
          details: [
            [f.detail.module, `${mod.id} (${mod.title})`],
            [f.detail.section, title],
          ],
        }}
      />
    </div>
  )
}

function pickQuiz(moduleQuestions: Question[]): Question[] {
  const sorted = [...moduleQuestions].sort((a, b) => a.difficulty - b.difficulty)
  const pick: Question[] = []
  for (const d of [1, 2, 3]) {
    const q = sorted.find((x) => x.difficulty === d && !x.caseId && !pick.includes(x))
    if (q) pick.push(q)
  }
  for (const q of sorted) if (pick.length < 3 && !q.caseId && !pick.includes(q)) pick.push(q)
  return pick.slice(0, 3)
}

function UnitList({ units, url }: { units: string[]; url: string }) {
  const t = useT()
  return (
    <ol className="unit-list">
      {units.map((u) => (
        <li key={u}>{u}</li>
      ))}
      <li className="unit-list__link">
        <a href={url} target="_blank" rel="noreferrer">
          {t.lesson.openModule}
          <Icon name="open" size={14} />
        </a>
      </li>
    </ol>
  )
}
