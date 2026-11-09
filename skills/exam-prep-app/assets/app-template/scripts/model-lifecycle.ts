/**
 * Snapshots Learn's model retirement schedule into src/content/model-lifecycle.json, which the
 * content validator uses to reject retired or deprecated models.
 *
 *   npm run models:refresh            # fetch the live schedule and update the snapshot
 *   node scripts/model-lifecycle.ts --check
 *                                     # report content that the LIVE schedule marks as outdated
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { findOutdatedModels, scanText, type ModelLifecycle, type ModelVersion } from '../src/content/model-currency.ts'

const SOURCE = 'https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/model-retirement-schedule'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const content = join(root, 'src', 'content')
const snapshotFile = join(content, 'model-lifecycle.json')

const decode = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#x2014;|&mdash;/g, '—').replace(/&[a-z#0-9]+;/gi, ' ').trim()

async function fetchSchedule(): Promise<Record<string, ModelVersion[]>> {
  const res = await fetch(SOURCE, { headers: { 'user-agent': 'exam-prep-model-lifecycle' }, signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${SOURCE}`)
  const html = await res.text()
  const models: Record<string, ModelVersion[]> = {}
  for (const [, row] of html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => decode(m[1]))
    if (cells.length !== 5 || !/^(GA|Preview|Deprecated|Legacy|Retired)$/.test(cells[2])) continue
    const [model, version, lifecycle, retirementRaw, replacement] = cells
    const retirement = retirementRaw.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? retirementRaw
    const key = model.toLowerCase()
    ;(models[key] ??= []).push({ version, lifecycle: lifecycle as ModelVersion['lifecycle'], retirement, replacement })
  }
  if (Object.keys(models).length < 50) throw new Error(`Parsed only ${Object.keys(models).length} models — page layout changed?`)
  return models
}

const list = (dir: string, ext: string) => (existsSync(join(content, dir)) ? readdirSync(join(content, dir)).filter((f) => f.endsWith(ext) && !f.startsWith('_')) : [])

async function contentTexts(): Promise<Array<{ where: string; text: string }>> {
  const out: Array<{ where: string; text: string }> = []
  for (const f of list('questions', '.json')) {
    const data = JSON.parse(readFileSync(join(content, 'questions', f), 'utf8')) as { questions: Array<{ id: string }> }
    for (const q of data.questions) out.push({ where: q.id, text: scanText(q) })
  }
  for (const f of list('cases', '.json')) {
    const data = JSON.parse(readFileSync(join(content, 'cases', f), 'utf8')) as { cases: Array<{ id: string }> }
    for (const c of data.cases) out.push({ where: c.id, text: scanText(c) })
  }
  for (const f of list('lessons', '.ts')) {
    const { lesson } = (await import(pathToFileURL(join(content, 'lessons', f)).href)) as { lesson: { module: string } }
    out.push({ where: `lesson ${lesson.module}`, text: scanText(lesson) })
  }
  return out
}

const previous = existsSync(snapshotFile) ? (JSON.parse(readFileSync(snapshotFile, 'utf8')) as ModelLifecycle) : undefined
const models = await fetchSchedule()
const today = new Date().toISOString().slice(0, 10)

if (process.argv.includes('--check')) {
  const live: ModelLifecycle = { source: SOURCE, retrieved: today, overrides: previous?.overrides ?? {}, models }
  const problems = (await contentTexts()).flatMap(({ where, text }) => findOutdatedModels(text, live, today).map((f) => `- ${where}: ${f.status} model "${f.model}" (${f.detail})`))
  if (problems.length) {
    console.error(`✗ The live retirement schedule marks models used in the content as outdated:\n${problems.join('\n')}`)
    process.exit(1)
  }
  console.log(`✓ No retired or deprecated models in the content (live schedule, ${Object.keys(models).length} models).`)
} else {
  const snapshot: ModelLifecycle = { source: SOURCE, retrieved: today, overrides: previous?.overrides ?? {}, models }
  writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 1) + '\n')
  console.log(`Wrote ${Object.keys(models).length} models to ${snapshotFile}`)
}
