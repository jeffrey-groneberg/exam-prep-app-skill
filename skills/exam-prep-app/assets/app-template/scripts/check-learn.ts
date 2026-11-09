/**
 * Cross-checks the app's course map and skills outline against the live Microsoft Learn sources.
 *
 *   npm run check:learn
 *
 * - Learn Catalog API: course.<courseNumber> from exam.json → learning paths → modules → units (order, titles, URLs)
 * - Study guide (exam.json links.studyGuide): "Skills measured as of …" versions and every skills-outline bullet
 * Exits with code 1 when anything drifted, so content updates start from the current learning path.
 */
import { allBullets, CATALOG_RETRIEVED, learningPaths, modules } from '../src/content/outline.ts'
import { exam } from '../src/config.ts'

const SKILLS_OUTLINE_DATE = exam.skillsOutlineDate
const STUDY_GUIDE_URL = exam.links.studyGuide
const COURSE_UID = exam.courseNumber ? `course.${exam.courseNumber.toLowerCase()}` : ''

const CATALOG = 'https://learn.microsoft.com/api/catalog/'
const drift: string[] = []

interface CatalogItem {
  uid: string
  title: string
  url?: string
  last_modified?: string
  modules?: string[]
  units?: string[]
  study_guide?: Array<{ uid: string; type: string }>
}

async function catalog(type: string, uids: string[]): Promise<CatalogItem[]> {
  const out: CatalogItem[] = []
  // The catalog rejects long uid lists; query in small batches.
  for (let i = 0; i < uids.length; i += 8) {
    const batch = uids.slice(i, i + 8)
    const res = await fetch(`${CATALOG}?type=${type}&uid=${batch.join(',')}&locale=en-us`)
    if (!res.ok) throw new Error(`catalog ${type} ${res.status}`)
    const json = (await res.json()) as Record<string, CatalogItem[]>
    out.push(...(json[type] ?? []))
  }
  return out
}

const clean = (url = '') => url.split('?')[0]
const norm = (s: string) =>
  s
    .replace(/[\u2010-\u2015\u2011]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

async function checkCatalog() {
  if (!COURSE_UID) {
    console.log('No courseNumber in exam.json: skipping the course check.')
    return
  }
  const [course] = await catalog('courses', [COURSE_UID])
  if (!course) {
    drift.push(`${COURSE_UID} not found in the Learn catalog`)
    return
  }
  const livePaths = (course.study_guide ?? []).filter((s) => s.type === 'learningPath').map((s) => s.uid)
  const appPaths = learningPaths.map((p) => p.uid)
  if (livePaths.join('|') !== appPaths.join('|')) drift.push(`learning paths differ:\n  live: ${livePaths.join(', ')}\n  app:  ${appPaths.join(', ')}`)

  const paths = await catalog('learningPaths', livePaths)
  for (const p of paths) {
    const app = learningPaths.find((x) => x.uid === p.uid)
    if (!app) continue
    if (norm(p.title) !== norm(app.title)) drift.push(`path title changed: "${app.title}" → "${p.title}"`)
    const liveModules = p.modules ?? []
    const appModules = app.modules.map((id) => modules.find((m) => m.id === id)?.uid)
    if (liveModules.join('|') !== appModules.join('|')) drift.push(`modules of ${p.uid} differ:\n  live: ${liveModules.join(', ')}\n  app:  ${appModules.join(', ')}`)
  }

  const liveModules = await catalog('modules', modules.map((m) => m.uid))
  for (const m of modules) {
    const live = liveModules.find((x) => x.uid === m.uid)
    if (!live) {
      drift.push(`module ${m.uid} no longer in the catalog`)
      continue
    }
    if (norm(live.title) !== norm(m.title)) drift.push(`module title changed: "${m.title}" → "${live.title}"`)
    if (clean(live.url) !== m.url) drift.push(`module URL changed for ${m.uid}: ${m.url} → ${clean(live.url)}`)
    if (live.last_modified && live.last_modified.slice(0, 10) > CATALOG_RETRIEVED) {
      drift.push(`module ${m.id} was updated on Learn (${live.last_modified.slice(0, 10)}) after the app's catalog snapshot (${CATALOG_RETRIEVED}) — re-check its lesson and questions`)
    }
    const units = await catalog('units', live.units ?? [])
    const liveTitles = (live.units ?? []).map((uid) => units.find((u) => u.uid === uid)?.title ?? uid)
    if (liveTitles.map(norm).join('|') !== m.units.map(norm).join('|')) {
      drift.push(`units of ${m.id} differ:\n  live: ${liveTitles.join(' / ')}\n  app:  ${m.units.join(' / ')}`)
    }
  }
}

async function checkStudyGuide() {
  if (!STUDY_GUIDE_URL) {
    drift.push('exam.json has no links.studyGuide')
    return
  }
  const res = await fetch(STUDY_GUIDE_URL)
  if (!res.ok) {
    drift.push(`study guide fetch failed: ${res.status}`)
    return
  }
  const html = await res.text()
  const versions = [...new Set([...html.matchAll(/Skills measured (?:as of|prior to|starting|after) ([A-Z][a-z]+ \d{1,2}, \d{4})/g)].map((m) => m[1]))]
  const appDate = new Date(SKILLS_OUTLINE_DATE + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  if (!versions.includes(appDate)) drift.push(`study guide no longer lists "Skills measured as of ${appDate}" (found: ${versions.join(', ') || 'none'})`)
  if (versions.length > 1) drift.push(`study guide lists more than one skills version: ${versions.join(' | ')} — an update is announced; review both`)
  const text = norm(html.replace(/<[^>]+>/g, ' '))
  for (const b of allBullets) {
    if (!text.includes(norm(b.en))) drift.push(`skills bullet ${b.id} not found verbatim in the study guide: "${b.en}"`)
  }
}

await checkCatalog()
await checkStudyGuide()

if (drift.length) {
  console.error(`✗ ${drift.length} difference(s) between the app and the current Learn sources:\n`)
  for (const d of drift) console.error(`- ${d}`)
  process.exit(1)
}
console.log(`✓ Course map (${learningPaths.length} paths, ${modules.length} modules, units) and skills outline (${allBullets.length} bullets, ${SKILLS_OUTLINE_DATE}) match the current Learn catalog and study guide.`)
