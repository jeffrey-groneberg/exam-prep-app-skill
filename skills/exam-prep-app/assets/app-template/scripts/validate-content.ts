/**
 * Content validator CLI.
 *
 *   npm run validate                          # full validation incl. coverage (fails on errors)
 *   npm run validate -- --only mod-a,mod-b    # check selected modules only, skip global coverage
 *   npm run validate -- --matrix              # also write docs/coverage.md
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Ajv2020 } from 'ajv/dist/2020.js'
import type { CardFile, CaseFile, Lesson, QuestionFile } from '../src/lib/types.ts'
import { validateContent, type ContentBundle } from '../src/content/validate.ts'
import type { ModelLifecycle } from '../src/content/model-currency.ts'
import { domains, learningPaths, moduleById } from '../src/content/outline.ts'
import { exam } from '../src/config.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(root, 'src', 'content')

function readJsonDir<T>(dir: string): Array<{ file: string; data: T }> {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => {
      const path = join(dir, f)
      try {
        return { file: `src/content/${dir.split('/').pop()}/${f}`, data: JSON.parse(readFileSync(path, 'utf8')) as T }
      } catch (e) {
        console.error(`✗ ${path}: invalid JSON — ${(e as Error).message}`)
        process.exit(1)
      }
    })
}

async function loadLessons(): Promise<ContentBundle['lessons']> {
  const dir = join(contentDir, 'lessons')
  if (!existsSync(dir)) return []
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && !f.startsWith('_')).sort()
  const out: ContentBundle['lessons'] = []
  for (const f of files) {
    try {
      const mod = (await import(pathToFileURL(join(dir, f)).href)) as { lesson?: Lesson; default?: Lesson }
      const lesson = mod.lesson ?? mod.default
      if (!lesson) {
        console.error(`✗ src/content/lessons/${f}: must export \`lesson\``)
        process.exitCode = 1
        continue
      }
      out.push({ file: `src/content/lessons/${f}`, lesson })
    } catch (e) {
      console.error(`✗ src/content/lessons/${f}: failed to load — ${(e as Error).message}`)
      process.exitCode = 1
    }
  }
  return out
}

const args = process.argv.slice(2)
const onlyIdx = args.indexOf('--only')
const only = onlyIdx >= 0 ? (args[onlyIdx + 1] ?? '').split(',').filter(Boolean) : undefined
const writeMatrix = args.includes('--matrix')
const quiet = args.includes('--quiet')

const files = readJsonDir<QuestionFile>(join(contentDir, 'questions'))
const cases = readJsonDir<CaseFile>(join(contentDir, 'cases')).flatMap((c) => c.data.cases)
const lessons = await loadLessons()
const cardFiles = readJsonDir<CardFile>(join(contentDir, 'cards'))

const lifecycleFile = join(contentDir, 'model-lifecycle.json')
const modelLifecycle = existsSync(lifecycleFile) ? (JSON.parse(readFileSync(lifecycleFile, 'utf8')) as ModelLifecycle) : undefined
const report = validateContent({ files: files.map(({ file, data }) => ({ file, data })), cases, lessons, cards: cardFiles }, { only, modelLifecycle })

// JSON Schema check (same schemas editors use via "$schema").
const ajv = new Ajv2020({ allErrors: true, strict: false })
const checkExam = ajv.compile(JSON.parse(readFileSync(join(contentDir, 'schema', 'exam.schema.json'), 'utf8')))
if (!checkExam(exam)) report.errors.push({ level: 'error', where: 'src/content/exam.json', message: `JSON schema: ${ajv.errorsText(checkExam.errors)}` })
for (const task of exam.todo ?? []) report.warnings.push({ level: 'warning', where: 'src/content/exam.json', message: `open setup task: ${task}` })
const checkQuestions = ajv.compile(JSON.parse(readFileSync(join(contentDir, 'schema', 'question-file.schema.json'), 'utf8')))
const checkCases = ajv.compile(JSON.parse(readFileSync(join(contentDir, 'schema', 'case-file.schema.json'), 'utf8')))
for (const { file, data } of files) {
  if (only && !only.includes(data.module)) continue
  if (!checkQuestions(data)) report.errors.push({ level: 'error', where: file, message: `JSON schema: ${ajv.errorsText(checkQuestions.errors)}` })
}
for (const { file, data } of readJsonDir<CaseFile>(join(contentDir, 'cases'))) {
  if (!checkCases(data)) report.errors.push({ level: 'error', where: file, message: `JSON schema: ${ajv.errorsText(checkCases.errors)}` })
}
const checkCards = ajv.compile(JSON.parse(readFileSync(join(contentDir, 'schema', 'card-file.schema.json'), 'utf8')))
for (const { file, data } of cardFiles) {
  if (only && !only.includes(data.module)) continue
  if (!checkCards(data)) report.errors.push({ level: 'error', where: file, message: `JSON schema: ${ajv.errorsText(checkCards.errors)}` })
}
const cardsPerModule = new Map(cardFiles.map(({ data }) => [data.module, data.cards.length]))

// Explanations show fetched page titles; flag cited URLs that `npm run sources:titles` hasn't seen yet.
const titlesFile = join(contentDir, 'source-titles.json')
const titled = existsSync(titlesFile) ? (JSON.parse(readFileSync(titlesFile, 'utf8')) as Record<string, string>) : {}
const untitled = new Set(files.flatMap(({ data }) => data.questions.flatMap((q) => q.sources.map((s) => s.split('#')[0]))).filter((u) => !(u in titled)))
if (untitled.size) report.warnings.push({ level: 'warning', where: 'src/content/source-titles.json', message: `${untitled.size} cited URL(s) have no page title yet — run npm run sources:titles` })

const total = Object.values(report.moduleCounts).reduce((a, b) => a + b, 0)
if (!quiet) {
  console.log(`\n${exam.appName} content — ${total} questions, ${lessons.length} lessons, ${cases.length} case studies, ${report.cardCount} flashcards`)
  console.log('Questions per domain:', domains.map((d) => `${d.id} ${report.domainCounts[d.id] ?? 0}`).join(' · ') || '–')
  console.log('Question types:', Object.entries(report.typeCounts).map(([k, v]) => `${k} ${v}`).join(' · ') || '–')
  console.log('Difficulty:', Object.entries(report.difficultyCounts).map(([k, v]) => `${k} ${v}`).join(' · ') || '–')
  if (report.cues?.cards) {
    const pct = (x: number) => `${Math.round(x * 100)} %`
    const [l1, l2, l3, l4] = report.cues.lengthRanks
    console.log(`Card answer cues: key by length longest ${pct(l1)} · 2nd ${pct(l2)} · 3rd ${pct(l3)} · shortest ${pct(l4)} · central option is the key in ${pct(report.cues.centralKey)} of ${report.cues.centralCards} (chance 25 % each)`)
  }
  if (only) {
    console.log(`Scope: ${only.join(', ')}`)
    for (const m of only) console.log(`  ${m}: ${report.moduleCounts[m] ?? 0} questions, ${cardsPerModule.get(m) ?? 0} cards, lesson ${lessons.some((l) => l.lesson.module === m) ? '✓' : '✗'}`)
  }
}

for (const w of report.warnings) console.warn(`⚠ ${w.where}: ${w.message}`)
for (const e of report.errors) console.error(`✗ ${e.where}: ${e.message}`)

if (writeMatrix && !only) {
  const lines: string[] = []
  lines.push('# Coverage matrix', '')
  const outlineDate = exam.skillsOutlineDate
    ? new Date(`${exam.skillsOutlineDate}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : 'unknown'
  lines.push(`Generated by \`npm run validate -- --matrix\`. Exam ${exam.code}. Skills outline: *skills measured as of ${outlineDate}*.${exam.courseNumber ? ` Course: ${exam.courseNumber}.` : ''}`, '')
  lines.push(`Total: **${total} questions**, **${lessons.length} lessons**, **${cases.length} case studies**, **${report.cardCount} flashcards**.`, '')
  lines.push('| Domain | Weight | Questions |', '|---|---|---|')
  for (const d of domains) lines.push(`| ${d.id} ${d.title.en} | ${d.weight[0]}–${d.weight[1]} % | ${report.domainCounts[d.id] ?? 0} |`)
  lines.push('', '## Skill bullet → module → lesson → questions', '')
  lines.push('| Bullet | Skill | Modules (lesson ✓) | Questions (primary + secondary) |', '|---|---|---|---|')
  for (const row of report.coverage) {
    const mods = row.modules.map((m) => `${m}${row.lessons.includes(m) ? ' ✓' : ''}`).join(', ')
    lines.push(`| ${row.bullet} | ${row.text} | ${mods} | ${row.primary} + ${row.secondary} |`)
  }
  lines.push('', '## Module → questions and flashcards', '')
  lines.push('| Learning path | Module | Questions | Cards |', '|---|---|---|---|')
  for (const p of learningPaths) {
    for (const m of p.modules) lines.push(`| ${p.title} | [${moduleById.get(m)?.title}](${moduleById.get(m)?.url}) | ${report.moduleCounts[m] ?? 0} | ${cardsPerModule.get(m) ?? 0} |`)
  }
  mkdirSync(join(root, 'docs'), { recursive: true })
  writeFileSync(join(root, 'docs', 'coverage.md'), lines.join('\n') + '\n')
  console.log('Wrote docs/coverage.md')
}

if (report.errors.length) {
  console.error(`\n${report.errors.length} error(s), ${report.warnings.length} warning(s).`)
  process.exit(1)
}
console.log(`\n✓ Content valid (${report.warnings.length} warning(s)).`)
