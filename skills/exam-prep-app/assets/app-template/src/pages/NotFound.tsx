import { Link, Navigate, useLocation } from 'react-router-dom'
import { useT } from '../i18n/index.ts'
import { legacyTarget } from '../lib/legacy-routes.ts'

export function NotFound() {
  const t = useT()
  const { pathname, search, hash } = useLocation()
  const legacy = legacyTarget(pathname, search, hash)
  if (legacy) return <Navigate to={legacy} replace />
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">{t.notFound.title}</h1>
        <p className="page-sub">{t.notFound.sub}</p>
      </header>
      <Link to="/" className="btn btn--primary">
        {t.notFound.cta}
      </Link>
    </div>
  )
}
