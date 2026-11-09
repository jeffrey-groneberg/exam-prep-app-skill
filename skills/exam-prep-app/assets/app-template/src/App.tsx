import { useEffect, useState } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Icon } from './components/Icon.tsx'
import type { IconName } from './components/icons.generated.ts'
import { store, useProgress } from './lib/store.ts'
import { dueQuestions } from './lib/progress.ts'
import { questions } from './content/index.ts'
import { Home } from './pages/Home.tsx'
import { Learn } from './pages/Learn.tsx'
import { LessonPage } from './pages/LessonPage.tsx'
import { Practice } from './pages/Practice.tsx'
import { Exam } from './pages/Exam.tsx'
import { Review } from './pages/Review.tsx'
import { ProgressPage } from './pages/ProgressPage.tsx'
import { Coverage } from './pages/Coverage.tsx'
import { Resources } from './pages/Resources.tsx'
import { Zettelkasten, ZettelModule, ZettelSession } from './pages/Zettelkasten.tsx'
import { NotFound } from './pages/NotFound.tsx'
import { FeedbackLink } from './components/Feedback.tsx'
import { feedbackEnabled } from './lib/feedback.ts'
import { LANGS, useT, type Messages } from './i18n/index.ts'
import { exam, SKILL_CREDIT_URL } from './config.ts'

type NavLabel = keyof Pick<Messages['nav'], 'home' | 'learn' | 'practice' | 'exam' | 'review' | 'cards' | 'progress' | 'resources' | 'coverage'>

interface NavItem {
  to: string
  label: NavLabel
  icon: IconName
  activeIcon: IconName
  mobile?: boolean
  /** Moves into the menu below 1100px. */
  more?: boolean
  /** Shown in the menu only on phones (it sits in the top bar above 760px). */
  phoneMenu?: boolean
}

const NAV: NavItem[] = [
  { to: '/', label: 'home', icon: 'home', activeIcon: 'homeFilled', mobile: true },
  { to: '/learn', label: 'learn', icon: 'book', activeIcon: 'bookFilled', mobile: true },
  { to: '/practice', label: 'practice', icon: 'practice', activeIcon: 'practiceFilled', mobile: true },
  { to: '/exam', label: 'exam', icon: 'exam', activeIcon: 'examFilled', mobile: true },
  { to: '/review', label: 'review', icon: 'review', activeIcon: 'reviewFilled', mobile: true },
  { to: '/cards', label: 'cards', icon: 'zettel', activeIcon: 'zettelFilled' },
  { to: '/progress', label: 'progress', icon: 'progress', activeIcon: 'progressFilled', more: true },
  { to: '/resources', label: 'resources', icon: 'resources', activeIcon: 'resourcesFilled', more: true },
]

/** Badges longer than three characters shrink to keep inside the mark. */
const badgeLength = [...exam.badge].length

function AppMark() {
  return (
    <svg className="app-mark" viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
      <rect width="32" height="32" rx="7" />
      <text x="16" y="21" textAnchor="middle" style={badgeLength > 3 ? { fontSize: `${(12.5 * 3) / badgeLength}px` } : undefined}>
        {exam.badge}
      </text>
    </svg>
  )
}

function LangToggle() {
  const { lang } = useProgress()
  const t = useT()
  return (
    <div className="lang-toggle" role="group" aria-label={t.nav.language}>
      {LANGS.map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} className={lang === l ? 'is-on' : ''} onClick={() => store.setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

const MORE: NavItem[] = [
  { to: '/cards', label: 'cards', icon: 'zettel', activeIcon: 'zettelFilled', phoneMenu: true },
  { to: '/progress', label: 'progress', icon: 'progress', activeIcon: 'progressFilled' },
  { to: '/resources', label: 'resources', icon: 'resources', activeIcon: 'resourcesFilled' },
  { to: '/coverage', label: 'coverage', icon: 'grid', activeIcon: 'grid' },
]

/** Menu for the sections that don't fit the top bar (below 1100px) or the phone tab bar. */
function MoreMenu() {
  const t = useT()
  const [open, setOpen] = useState(false)
  return (
    <div className="more-menu">
      <button
        type="button"
        className="icon-btn icon-btn--large"
        aria-expanded={open}
        aria-controls="more-menu"
        aria-label={t.nav.menu}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name={open ? 'dismiss' : 'menu'} size={22} />
      </button>
      {open && (
        <>
          <div className="more-menu__backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
          <nav id="more-menu" className="more-menu__panel" aria-label={t.nav.more} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
            {MORE.map((n) => (
              <NavLink key={n.to} to={n.to} className={`more-menu__link${n.phoneMenu ? ' more-menu__link--phone' : ''}`} onClick={() => setOpen(false)}>
                <Icon name={n.icon} size={20} />
                {t.nav[n.label]}
              </NavLink>
            ))}
          </nav>
        </>
      )}
    </div>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

/** The page language and title follow the language toggle. */
function useDocumentLanguage() {
  const { lang } = useProgress()
  const t = useT()
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title(exam.appName)
  }, [lang, t])
}

export function App() {
  const progress = useProgress()
  const t = useT()
  useDocumentLanguage()
  const due = dueQuestions(questions, progress.cards).length
  const { pathname } = useLocation()
  const immersive = /^\/(practice|review)\/session|^\/exam\/run|^\/cards\/round/.test(pathname)

  return (
    <div className={`app${immersive ? ' app--immersive' : ''}`}>
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <ScrollToTop />
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand" aria-label={t.nav.brand(exam.appName)}>
            <AppMark />
            <span className="brand__name">{exam.appName}</span>
          </NavLink>
          <nav className="topnav" aria-label={t.nav.main}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={`topnav__link${n.more ? ' topnav__link--more' : ''}`}>
                {t.nav[n.label]}
                {n.to === '/review' && due > 0 && <span className="count-badge" aria-label={t.nav.due(due)}>{due}</span>}
              </NavLink>
            ))}
          </nav>
          <LangToggle />
          <MoreMenu />
        </div>
      </header>
      <main id="main" className="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:moduleId" element={<LessonPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/practice/session" element={<Practice />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/exam/run" element={<Exam />} />
          <Route path="/exam/result/:examId" element={<Exam />} />
          <Route path="/review" element={<Review />} />
          <Route path="/review/session" element={<Review />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/cards" element={<Zettelkasten />} />
          <Route path="/cards/round" element={<ZettelSession />} />
          <Route path="/cards/own" element={<ZettelModule own />} />
          <Route path="/cards/module/:moduleId" element={<ZettelModule />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>{t.footer}</p>
        {feedbackEnabled && (
          <p>
            {t.feedback.footerStart}
            <FeedbackLink about="app" plain target={{ subject: t.feedback.subject.app }} />
            {t.feedback.footerEnd}
          </p>
        )}
        {SKILL_CREDIT_URL && (
          <p>
            {t.credit.start}
            <a href={SKILL_CREDIT_URL} target="_blank" rel="noreferrer">
              {t.credit.link}
            </a>
            {t.credit.end}
          </p>
        )}
      </footer>
      <nav className="tabbar" aria-label={t.nav.mainMobile}>
        {NAV.filter((n) => n.mobile).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="tabbar__link">
            {({ isActive }) => (
              <>
                <span className="tabbar__icon">
                  <Icon name={isActive ? n.activeIcon : n.icon} size={22} />
                  {n.to === '/review' && due > 0 && <span className="tabbar__dot" aria-label={t.nav.due(due)} />}
                </span>
                <span className="tabbar__label">{t.nav[n.label]}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
