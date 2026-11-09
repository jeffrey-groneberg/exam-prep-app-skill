#!/usr/bin/env node
// Scaffolds a study app for one Microsoft certification exam from ../assets/app-template.
//
//   node new-app.mjs --target <dir> --code AZ-104 --title "Microsoft Azure Administrator"
//                    [--title-de "..."] [--course AZ-104T00] [--lang en|de] [--catalog file.json] [--repo owner/name] [--keep-sample]
//
//   --target       new folder for the app; must not exist yet or be empty
//   --code         exam code, e.g. AZ-104
//   --title        official exam title (English)
//   --title-de     German title; defaults to the English one, as Microsoft rarely localizes exam titles
//   --course       official course number, e.g. AZ-104T00
//   --lang         default language of UI and content (en or de), default en
//   --catalog      JSON from `learn-catalog.mjs <COURSE> --out file.json`: pre-fills src/content/course.ts
//   --repo         GitHub repository of the app (owner/name): feedback links open new issues there; it must be
//                  public for others to report. Without it the app shows no feedback links until
//                  feedback.issuesUrl in src/content/exam.json is set.
//   --keep-sample  keep the sample content (three modules of AI-103) instead of starting empty
//
// Plain Node 22+, no dependencies.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toCourseTs } from './learn-catalog.mjs'

const TEMPLATE = fileURLToPath(new URL('../assets/app-template/', import.meta.url))
/** Build output, installs and local reports never travel with the template. */
const SKIP = new Set(['node_modules', 'dist', 'dist-lessons', 'audit-diagrams', 'test-results', 'playwright-report', 'coverage', '.vite', '.DS_Store'])

/** Doc set labels for source links that fit most exams; add exam-specific ones in exam.json. */
const GENERIC_DOCSETS = [
  { prefix: '/training/', label: 'Training' },
  { prefix: '/rest/api/', label: 'REST API' },
  { prefix: '/python/api/', label: 'Python SDK' },
  { prefix: '/dotnet/api/', label: '.NET API' },
  { prefix: '/cli/azure/', label: 'Azure CLI' },
  { prefix: '/powershell/', label: 'PowerShell' },
]

/** Targets for a complete app; the sample keeps its own, smaller ones. */
const FULL_TARGETS = { minQuestions: 200, minPerBullet: 2, minPerModule: 3, minCases: 3, domainShareTolerance: 3 }

function fail(message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

function usage(message) {
  if (message) console.error(`Error: ${message}\n`)
  console.error(
    'Usage: node new-app.mjs --target <dir> --code AZ-104 --title "..." [--title-de "..."] [--course AZ-104T00] [--lang en|de] [--catalog file.json] [--repo owner/name] [--keep-sample]',
  )
  process.exit(2)
}

function parseArgs(argv) {
  const opts = { target: '', code: '', title: '', titleDe: '', course: '', lang: 'en', catalog: '', repo: '', keepSample: false }
  const value = (i, name) => {
    const v = argv[i]
    if (v === undefined || v.startsWith('--')) usage(`${name} needs a value`)
    return v
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--target') opts.target = value(++i, a)
    else if (a === '--code') opts.code = value(++i, a)
    else if (a === '--title') opts.title = value(++i, a)
    else if (a === '--title-de') opts.titleDe = value(++i, a)
    else if (a === '--course') opts.course = value(++i, a)
    else if (a === '--lang') opts.lang = value(++i, a)
    else if (a === '--catalog') opts.catalog = value(++i, a)
    else if (a === '--repo') opts.repo = value(++i, a)
    else if (a === '--keep-sample') opts.keepSample = true
    else if (a === '--help' || a === '-h') usage()
    else usage(`unknown argument ${a}`)
  }
  if (!opts.target) usage('--target is required')
  if (!opts.code) usage('--code is required')
  if (!opts.title.trim()) usage('--title is required')
  opts.code = opts.code.trim().toUpperCase()
  if (!/^[A-Z]{2,4}-\d{2,4}[A-Z]?$/.test(opts.code)) usage(`--code "${opts.code}" should look like AZ-104`)
  opts.course = opts.course.trim().toUpperCase()
  if (opts.course && !/^[A-Z]{2,4}-[0-9A-Z]{3,8}$/.test(opts.course)) usage(`--course "${opts.course}" should look like AZ-104T00`)
  if (opts.lang !== 'en' && opts.lang !== 'de') usage('--lang must be en or de')
  if (opts.catalog && opts.keepSample) usage('--catalog replaces the sample course map; use it without --keep-sample')
  opts.repo = opts.repo
    .trim()
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/(\.git|\/)$/, '')
  if (opts.repo && !/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9._-]+$/.test(opts.repo)) usage(`--repo "${opts.repo}" should look like owner/name`)
  return opts
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const writeJson = (file, data) => writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)

function readCatalog(file) {
  let data
  try {
    data = readJson(resolve(file))
  } catch (e) {
    fail(`cannot read --catalog ${file}: ${e.message}`)
  }
  if (!data?.course || !Array.isArray(data.learningPaths)) fail(`--catalog ${file} is not output of learn-catalog.mjs (course and learningPaths missing)`)
  return data
}

const DOMAINS_SKELETON = `import type { Domain } from '../lib/types.ts'

/**
 * The exam's skills outline: domains with their official weight ranges, skill groups and bullets.
 * TODO: copy it from the study guide (exam.json links.studyGuide), version "Skills measured as of …"
 * (exam.json skillsOutlineDate). English bullet text verbatim; German text is a translation.
 * Bullet ids ("1.2.3" = domain 1, group 2, bullet 3) are the app's own numbering.
 *
 * Shape of one domain:
 *
 *   {
 *     id: 'D1',
 *     title: { en: '<domain title from the study guide>', de: '<German title>' },
 *     short: { en: '<two or three words>', de: '<zwei, drei Wörter>' },
 *     weight: [20, 25], // official range in percent
 *     icon: 'cloud', // a Fluent icon from src/components/icons.generated.ts (add more in scripts/gen-icons.mjs)
 *     groups: [
 *       {
 *         id: '1.1',
 *         title: { en: '<skill group>', de: '<Skill-Gruppe>' },
 *         bullets: [{ id: '1.1.1', en: '<bullet, verbatim>', de: '<Übersetzung>' }],
 *       },
 *     ],
 *   },
 */
export const domains: Domain[] = []
`

const COURSE_SKELETON = `import type { CourseModule, LearningPath } from '../lib/types.ts'

/**
 * The official course: learning paths in course order, each with its modules, and the skills-outline bullets
 * each module teaches. TODO: run learn-catalog.mjs <COURSE-NUMBER> --ts (exam-prep-app skill) and paste its draft
 * here, or fill it by hand from the course and learning path pages on Microsoft Learn. Then map every module to
 * its bullets (skills: ['1.1.1', …]).
 *
 * Shape:
 *
 *   learningPaths: [{ id: 'path-id', uid: 'learn.…', title: '…', url: 'https://learn.microsoft.com/…/paths/…/', modules: ['module-id'] }]
 *   modules: [{ id: 'module-id', uid: 'learn.…', title: '…', url: 'https://learn.microsoft.com/…/modules/…/',
 *               minutes: 45, pathId: 'path-id', units: ['Introduction', …], skills: ['1.1.1'] }]
 */
export const CATALOG_RETRIEVED = ''

export const learningPaths: LearningPath[] = []

export const modules: CourseModule[] = []
`

function main() {
  const opts = parseArgs(process.argv.slice(2))
  const target = resolve(opts.target)
  if (!existsSync(TEMPLATE)) fail(`template not found at ${TEMPLATE}`)
  const rel = relative(TEMPLATE, target)
  if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) fail('--target must not be inside the template')
  if (existsSync(target) && readdirSync(target).length) fail(`${target} is not empty; choose a new or empty folder`)
  const catalog = opts.catalog ? readCatalog(opts.catalog) : null

  mkdirSync(target, { recursive: true })
  cpSync(TEMPLATE, target, { recursive: true, filter: (src) => !SKIP.has(basename(src)) && !src.endsWith('.tsbuildinfo') })

  const code = opts.code
  const codeLower = code.toLowerCase()
  const badge = code.match(/-(\d+)/)[1]
  const appName = `${code} Prep`
  const courseNumber = opts.course || catalog?.course?.number?.toUpperCase() || ''
  const content = join(target, 'src', 'content')
  const sample = readJson(join(content, 'exam.json'))

  const todo = ['links.practiceAssessment: find the official practice assessment on the exam page (links.examPage) and add its link']
  if (!opts.keepSample) todo.push('skillsOutlineDate: set the date of the study guide version ("Skills measured as of …") the outline follows')
  todo.push('exam: check minutes and questions on the exam page; exam length differs by exam level')
  if (!opts.keepSample) {
    todo.push('codeLanguage: set the language of the exam’s code (for example Python or PowerShell), or leave it empty')
    todo.push('legacyNames: list renamed or retired product names the exam’s products had, so the validator rejects them')
  }
  if (!courseNumber) todo.push('courseNumber, courseTitle, links.course: add the official course if the exam has one')
  else if (!catalog) todo.push('courseTitle: add the official English course title (learn-catalog.mjs prints it)')

  const exam = {
    $schema: './schema/exam.schema.json',
    todo,
    code,
    title: { en: opts.title.trim(), de: (opts.titleDe || opts.title).trim() },
    appName,
    shortName: code,
    badge,
    storageKey: `${codeLower}-prep:v1`,
    defaultLang: opts.lang,
    skillsOutlineDate: opts.keepSample ? sample.skillsOutlineDate : '',
    courseNumber,
    courseTitle: catalog?.course?.title ?? '',
    codeLanguage: opts.keepSample ? sample.codeLanguage : '',
    exam: { ...sample.exam },
    links: {
      examPage: `https://learn.microsoft.com/credentials/certifications/exams/${codeLower}/`,
      studyGuide: `https://learn.microsoft.com/credentials/certifications/resources/study-guides/${codeLower}`,
      course: courseNumber ? `https://learn.microsoft.com/training/courses/${courseNumber.toLowerCase()}/` : '',
      practiceAssessment: '',
      examSandbox: 'https://aka.ms/examdemo',
    },
    feedback: { issuesUrl: opts.repo ? `https://github.com/${opts.repo}/issues/new` : '' },
    community: [],
    legacyNames: opts.keepSample ? sample.legacyNames : [],
    sourceDocsets: opts.keepSample ? sample.sourceDocsets : GENERIC_DOCSETS,
    targets: opts.keepSample ? sample.targets : FULL_TARGETS,
  }
  writeJson(join(content, 'exam.json'), exam)

  const pkgFile = join(target, 'package.json')
  const pkg = readJson(pkgFile)
  pkg.name = `${codeLower}-prep`
  pkg.description = `Study app for Microsoft exam ${code}: ${opts.title.trim()}`
  writeJson(pkgFile, pkg)
  const lockFile = join(target, 'package-lock.json')
  if (existsSync(lockFile)) {
    const lock = readJson(lockFile)
    lock.name = pkg.name
    if (lock.packages?.['']) lock.packages[''].name = pkg.name
    writeJson(lockFile, lock)
  }

  const readme = join(target, 'README.md')
  if (existsSync(readme)) writeFileSync(readme, readFileSync(readme, 'utf8').replace(/^# .*$/m, `# ${appName}`))

  const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const fontSize = +(12.5 * Math.min(1, 3 / Math.max(3, badge.length))).toFixed(2)
  writeFileSync(
    join(target, 'public', 'favicon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0f6cbd"/><text x="16" y="21" text-anchor="middle" font-family="Segoe UI, system-ui, -apple-system, Helvetica, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff">${escapeXml(badge)}</text></svg>\n`,
  )

  if (!opts.keepSample) {
    for (const dir of ['lessons', 'questions', 'cards', 'cases']) {
      const path = join(content, dir)
      rmSync(path, { recursive: true, force: true })
      mkdirSync(path, { recursive: true })
      writeFileSync(join(path, '.gitkeep'), '')
    }
    writeFileSync(join(content, 'domains.ts'), DOMAINS_SKELETON)
    writeFileSync(join(content, 'course.ts'), catalog ? toCourseTs(catalog) : COURSE_SKELETON)
    writeJson(join(content, 'source-titles.json'), {})
  }

  const modules = catalog ? catalog.learningPaths.reduce((a, p) => a + p.modules.length, 0) : 0
  const shown = relative(process.cwd(), target) || '.'
  console.log(`✓ Created ${appName} in ${shown}${opts.keepSample ? ' (with the sample content)' : ''}`)
  if (catalog) console.log(`  course.ts pre-filled from ${catalog.course.number}: ${catalog.learningPaths.length} learning paths, ${modules} modules`)
  if (opts.repo) console.log(`  feedback links open new issues in https://github.com/${opts.repo} (the repository must be public)`)
  console.log(`
Next steps:
  1. cd ${shown} && npm ci
  2. Work through the "todo" list in src/content/exam.json (npm run validate shows what is open) and delete it.
  3. ${opts.keepSample ? 'Replace the sample outline in' : 'Copy the skills outline into'} src/content/domains.ts from the study guide:
     ${exam.links.studyGuide}
  4. ${catalog ? 'Check src/content/course.ts and map every module to its skill bullets (skills).' : courseNumber ? `Draft src/content/course.ts: node <skill>/scripts/learn-catalog.mjs ${courseNumber} --ts` : 'Fill src/content/course.ts with the learning paths and modules the exam builds on.'}
  5. Write lessons, questions, flashcards and case studies (docs/content-guide.md); check each module with
     npm run validate -- --only <module-id>
  6. npm run icons:pwa renders the app icons with the badge "${badge}" (first: npx playwright install chromium).
  7. npm run dev to look at it; npm run check and npm run build before you publish.${
    opts.repo
      ? ''
      : `
  8. Feedback links are off: add --repo or set feedback.issuesUrl in src/content/exam.json once the repository
     exists (https://github.com/<owner>/<name>/issues/new); it must be public for others to report.`
  }`)
}

main()
