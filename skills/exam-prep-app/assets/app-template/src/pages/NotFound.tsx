import { Link } from 'react-router-dom'
import { useT } from '../i18n/index.ts'

export function NotFound() {
  const t = useT()
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
