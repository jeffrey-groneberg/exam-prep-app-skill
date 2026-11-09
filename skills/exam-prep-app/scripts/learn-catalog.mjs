#!/usr/bin/env node
// Reads the official course map of a Microsoft Learn course from the public, anonymous Learn Catalog API:
// course → learning paths (its study guide) → modules → units.
//
//   node learn-catalog.mjs <COURSE-NUMBER> [--locale en-us] [--out file.json] [--ts]
//
//   <COURSE-NUMBER>   e.g. AZ-104T00 (case does not matter)
//   --locale          catalog locale, default en-us
//   --out <file>      write the result to a file instead of printing it
//   --ts              print a draft src/content/course.ts for the exam-prep app template instead of JSON
//
// JSON output: { retrieved, course: { uid, number, title, url, lastModified },
//                learningPaths: [{ uid, id, title, url, modules: [{ uid, id, title, url, units, minutes }] }] }
// Module ids are short kebab-case ids from the module URL slugs; rename them if you like (they become file names).
// Plain Node 22+ (global fetch), no dependencies. new-app.mjs imports toCourseTs from here.
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const API = 'https://learn.microsoft.com/api/catalog/'

function usage(message) {
  if (message) console.error(`Error: ${message}\n`)
  console.error('Usage: node learn-catalog.mjs <COURSE-NUMBER> [--locale en-us] [--out file.json] [--ts]')
  process.exit(2)
}

function parseArgs(argv) {
  const opts = { course: '', locale: 'en-us', out: '', ts: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--locale') opts.locale = argv[++i] ?? usage('--locale needs a value')
    else if (a === '--out') opts.out = argv[++i] ?? usage('--out needs a file name')
    else if (a === '--ts') opts.ts = true
    else if (a === '--help' || a === '-h') usage()
    else if (a.startsWith('--')) usage(`unknown option ${a}`)
    else if (!opts.course) opts.course = a
    else usage(`unexpected argument ${a}`)
  }
  if (!opts.course) usage('missing course number')
  if (!/^[a-z]{2}-[a-z]{2}$/i.test(opts.locale)) usage(`locale "${opts.locale}" should look like en-us`)
  return opts
}

function fallback(courseNumber, reason) {
  const lower = courseNumber.toLowerCase()
  console.error(`✗ ${reason}

The Learn Catalog API is a legacy API and may change or be retired. Fallback:
  1. Open https://learn.microsoft.com/training/courses/${lower}/ (with the Microsoft Learn MCP server's
     microsoft_docs_fetch tool, or any web fetch) and note its learning paths in order.
  2. Open each learning path page (https://learn.microsoft.com/training/paths/<slug>/) and note its modules in order.
  3. For each module page note the official title, URL, duration in minutes and unit titles.
  4. Write them into src/content/course.ts (learningPaths and modules) by hand.
If the exam has no course, build the learning paths from the modules the study guide and exam page link to.`)
  process.exit(1)
}

async function getJson(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    let res
    try {
      res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'exam-prep-learn-catalog' }, signal: AbortSignal.timeout(60000) })
    } catch (e) {
      if (attempt === 4) throw new Error(`network error for ${url}: ${e.message}`)
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)))
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after')) || 3 * (attempt + 1)
      await res.body?.cancel()
      await new Promise((r) => setTimeout(r, wait * 1000))
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    return res.json()
  }
  throw new Error(`no answer from ${url} after several attempts`)
}

/** Catalog items of one type by uid; the API rejects long uid lists, so ask in small batches. */
async function byUid(type, uids, locale) {
  const out = []
  for (let i = 0; i < uids.length; i += 8) {
    const batch = uids.slice(i, i + 8)
    const json = await getJson(`${API}?type=${type}&uid=${batch.map(encodeURIComponent).join(',')}&locale=${locale}`)
    out.push(...(json[type] ?? []))
  }
  return out
}

/** Drops tracking parameters such as ?WT.mc_id=… and fragments. */
const cleanUrl = (url = '') => {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    return url.split(/[?#]/)[0]
  }
}

const SKIP = new Set(['a', 'an', 'the', 'and', 'or', 'with', 'to', 'in', 'on', 'for', 'of', 'by', 'using', 'use', 'your', 'into', 'from', 'via'])
const LEADING = new Set(['introduction', 'intro', 'get', 'started', 'getting', 'explore', 'understand', 'learn', 'develop', 'build', 'create'])

/** A short kebab-case id from a Learn URL slug: filler words out, at most five words, unique. */
function shortId(url, taken) {
  const slug = cleanUrl(url).split('/').filter(Boolean).pop() ?? 'module'
  let words = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').split('-').filter(Boolean)
  const kept = words.filter((w) => !SKIP.has(w))
  if (kept.length >= 2) words = kept
  while (words.length > 2 && LEADING.has(words[0])) words = words.slice(1)
  let id = words.slice(0, 5).join('-') || 'module'
  for (let n = 2; taken.has(id); n++) id = `${words.slice(0, 5).join('-')}-${n}`
  taken.add(id)
  return id
}

export async function readCourse(courseNumber, locale = 'en-us') {
  const uid = `course.${courseNumber.toLowerCase()}`
  let [course] = (await getJson(`${API}?type=courses&uid=${encodeURIComponent(uid)}&locale=${locale}`)).courses ?? []
  if (!course) {
    // Some courses use another uid; search the full course list by course number.
    const all = (await getJson(`${API}?type=courses&locale=${locale}`)).courses ?? []
    course = all.find((c) => (c.course_number ?? '').toLowerCase() === courseNumber.toLowerCase())
  }
  if (!course) return null

  const pathUids = (course.study_guide ?? []).filter((s) => s.type === 'learningPath').map((s) => s.uid)
  const paths = await byUid('learningPaths', pathUids, locale)
  const pathByUid = new Map(paths.map((p) => [p.uid, p]))
  const moduleUids = [...new Set(paths.flatMap((p) => p.modules ?? []))]
  const modules = await byUid('modules', moduleUids, locale)
  const moduleByUid = new Map(modules.map((m) => [m.uid, m]))
  const unitUids = modules.flatMap((m) => m.units ?? [])
  let unitTitle = new Map()
  try {
    unitTitle = new Map((await byUid('units', unitUids, locale)).map((u) => [u.uid, u.title]))
  } catch (e) {
    console.error(`! Unit titles unavailable (${e.message}); using unit ids instead.`)
  }

  const takenPathIds = new Set()
  const takenModuleIds = new Set()
  const seen = new Set()
  const learningPaths = []
  for (const puid of pathUids) {
    const p = pathByUid.get(puid)
    if (!p) {
      console.error(`! Learning path ${puid} is listed by the course but missing from the catalog; skipped.`)
      continue
    }
    const mods = []
    for (const muid of p.modules ?? []) {
      const m = moduleByUid.get(muid)
      if (!m) {
        console.error(`! Module ${muid} of ${puid} is missing from the catalog; skipped.`)
        continue
      }
      if (seen.has(muid)) {
        console.error(`! Module ${muid} appears in more than one learning path; kept in the first one only.`)
        continue
      }
      seen.add(muid)
      mods.push({
        uid: m.uid,
        id: shortId(m.url, takenModuleIds),
        title: m.title,
        url: cleanUrl(m.url),
        units: (m.units ?? []).map((u) => unitTitle.get(u) ?? u.split('.').pop()),
        minutes: m.duration_in_minutes ?? 0,
      })
    }
    learningPaths.push({ uid: p.uid, id: shortId(p.url, takenPathIds), title: p.title, url: cleanUrl(p.url), modules: mods })
  }
  return {
    retrieved: new Date().toISOString().slice(0, 10),
    course: {
      uid: course.uid,
      number: course.course_number ?? courseNumber.toUpperCase(),
      title: course.title,
      url: cleanUrl(course.url),
      lastModified: course.last_modified ?? '',
    },
    learningPaths,
  }
}

const q = (s) => JSON.stringify(s)

/** A draft src/content/course.ts in the template's types; skills stay empty for the agent to map. */
export function toCourseTs(data) {
  const today = data.retrieved || new Date().toISOString().slice(0, 10)
  const lines = [
    "import type { CourseModule, LearningPath } from '../lib/types.ts'",
    '',
    '/**',
    ` * Official course ${data.course.number} "${data.course.title}" as listed by the Microsoft Learn Catalog API`,
    ` * (${data.course.uid}), retrieved ${today}. Module and unit titles are the official English titles.`,
    ' * TODO: map every module to the skills-outline bullets it teaches (skills), using the ids in domains.ts.',
    ' */',
    `export const CATALOG_RETRIEVED = ${q(today)}`,
    '',
    'export const learningPaths: LearningPath[] = [',
  ]
  for (const p of data.learningPaths) {
    lines.push('  {', `    id: ${q(p.id)},`, `    uid: ${q(p.uid)},`, `    title: ${q(p.title)},`, `    url: ${q(p.url)},`, `    modules: [${p.modules.map((m) => q(m.id)).join(', ')}],`, '  },')
  }
  lines.push(']', '', 'export const modules: CourseModule[] = [')
  for (const p of data.learningPaths) {
    for (const m of p.modules) {
      lines.push(
        '  {',
        `    id: ${q(m.id)},`,
        `    uid: ${q(m.uid)},`,
        `    title: ${q(m.title)},`,
        `    url: ${q(m.url)},`,
        `    minutes: ${m.minutes},`,
        `    pathId: ${q(p.id)},`,
        '    units: [',
        ...m.units.map((u) => `      ${q(u)},`),
        '    ],',
        '    skills: [],',
        '  },',
      )
    }
  }
  lines.push(']', '')
  return lines.join('\n')
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  let data
  try {
    data = await readCourse(opts.course, opts.locale)
  } catch (e) {
    fallback(opts.course, `Could not read the Learn Catalog API: ${e.message}`)
  }
  if (!data) fallback(opts.course, `Course ${opts.course.toUpperCase()} was not found in the Learn Catalog API.`)
  if (!data.learningPaths.length) fallback(opts.course, `Course ${data.course.number} lists no learning paths in the Learn Catalog API.`)

  const output = opts.ts ? toCourseTs(data) : `${JSON.stringify(data, null, 2)}\n`
  const moduleCount = data.learningPaths.reduce((a, p) => a + p.modules.length, 0)
  if (opts.out) writeFileSync(opts.out, output)
  else process.stdout.write(output)
  console.error(`✓ ${data.course.number} "${data.course.title}": ${data.learningPaths.length} learning paths, ${moduleCount} modules${opts.out ? ` → ${opts.out}` : ''}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
