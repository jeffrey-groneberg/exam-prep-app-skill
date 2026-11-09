/**
 * Routes of the engine's first, German-only version (e.g. #/lernen/<module>?abschnitt=fallen) and their
 * English successors, so old bookmarks, shared links and page URLs in feedback issues still land on the same screen.
 */
const PATHS: Array<[RegExp, string]> = [
  [/^\/lernen\/?$/, '/learn'],
  [/^\/lernen\/(.+)$/, '/learn/$1'],
  [/^\/ueben\/?$/, '/practice'],
  [/^\/ueben\/sitzung\/?$/, '/practice/session'],
  [/^\/pruefung\/?$/, '/exam'],
  [/^\/pruefung\/laeuft\/?$/, '/exam/run'],
  [/^\/pruefung\/ergebnis\/(.+)$/, '/exam/result/$1'],
  [/^\/wiederholen\/?$/, '/review'],
  [/^\/wiederholen\/sitzung\/?$/, '/review/session'],
  [/^\/fortschritt\/?$/, '/progress'],
  [/^\/abdeckung\/?$/, '/coverage'],
  [/^\/ressourcen\/?$/, '/resources'],
  [/^\/zettel\/?$/, '/cards'],
  [/^\/zettel\/lernen\/?$/, '/cards/round'],
  [/^\/zettel\/eigene\/?$/, '/cards/own'],
  [/^\/zettel\/modul\/(.+)$/, '/cards/module/$1'],
]

const PARAMS: Record<string, string> = {
  modul: 'module',
  schwierigkeit: 'difficulty',
  typ: 'type',
  falsch: 'wrong',
  neu: 'new',
  runde: 'count',
  pfad: 'path',
  eigene: 'own',
  abschnitt: 'section',
}

/** Lesson section anchors: German id → English id. */
const SECTIONS: Record<string, string> = {
  worum: 'about',
  bild: 'diagrams',
  konzepte: 'concepts',
  vergleich: 'compare',
  code: 'code',
  fallen: 'traps',
  merke: 'takeaways',
  quiz: 'quiz',
  quellen: 'sources',
}

/** The English route for an old German one (path, query and hash), or null when the address isn't an old route. */
export function legacyTarget(pathname: string, search = '', hash = ''): string | null {
  const match = PATHS.find(([re]) => re.test(pathname))
  if (!match) return null
  // A section can also ride along in the module id (#/lernen/<module>%23fallen).
  const path = pathname.replace(match[0], match[1]).replace(/(%23|#)([a-z]+)$/i, (_, sep: string, id: string) => `${sep}${SECTIONS[id] ?? id}`)
  const params = new URLSearchParams(search)
  const next = new URLSearchParams()
  for (const [key, value] of params) {
    const name = PARAMS[key] ?? key
    next.append(name, name === 'section' ? (SECTIONS[value] ?? value) : value)
  }
  const query = next.toString()
  const anchor = hash.replace(/^#/, '')
  return `${path}${query ? `?${query}` : ''}${anchor ? `#${SECTIONS[anchor] ?? anchor}` : ''}`
}
