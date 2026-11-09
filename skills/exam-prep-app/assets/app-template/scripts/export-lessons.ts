/**
 * Exports every lesson as Markdown (one file per module) for reading offline or reader-testing.
 *
 *   node scripts/export-lessons.ts [outDir] [en|de]
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Lang, Lesson, Text } from '../src/lib/types.ts'
import { moduleById } from '../src/content/outline.ts'
import { exam } from '../src/config.ts'
import { de } from '../src/i18n/de.ts'
import { en } from '../src/i18n/en.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(process.argv[2] ?? join(root, 'dist-lessons'))
const lang = (process.argv[3] === 'de' ? 'de' : 'en') as Lang
const t = (v: Text | undefined) => (v === undefined ? '' : typeof v === 'string' ? v : v[lang])
const s = (lang === 'de' ? de : en).lesson.sections

mkdirSync(outDir, { recursive: true })
const dir = join(root, 'src', 'content', 'lessons')
let n = 0
for (const f of (existsSync(dir) ? readdirSync(dir) : []).filter((f) => f.endsWith('.ts') && !f.startsWith('_')).sort()) {
  const { lesson } = (await import(pathToFileURL(join(dir, f)).href)) as { lesson: Lesson }
  const mod = moduleById.get(lesson.module)
  const md: string[] = []
  md.push(`# ${mod?.title ?? lesson.module}`, '', `Official module: ${mod?.url}`, '')
  md.push(`## ${s.about}`, '', t(lesson.summary), '')
  md.push(`**${(lang === 'de' ? de : en).lesson.examFocus}:** ${t(lesson.examFocus)}`, '')
  md.push(`## ${s.diagrams}`, '')
  for (const d of lesson.diagrams) {
    md.push(`### ${t(d.title)}`, '')
    if (d.caption) md.push(t(d.caption), '')
    md.push(`Elements: ${d.nodes.map((n) => `${t(n.label).replace(/\n/g, ' ')}${n.sub ? ` (${t(n.sub).replace(/\n/g, ' ')})` : ''}`).join('; ')}`, '')
    d.steps.forEach((s, i) => md.push(`${i + 1}. **${t(s.title)}** — ${t(s.text)}`))
    md.push('')
  }
  md.push(`## ${s.concepts}`, '')
  for (const c of lesson.concepts) md.push(`- **${c.term}**: ${t(c.text)}`)
  md.push('')
  if (lesson.comparison) {
    md.push(`## ${t(lesson.comparison.title)}`, '')
    md.push(`| ${lesson.comparison.columns.map(t).join(' | ')} |`, `|${lesson.comparison.columns.map(() => '---').join('|')}|`)
    for (const row of lesson.comparison.rows) md.push(`| ${row.map(t).join(' | ')} |`)
    md.push('')
  }
  md.push(`## ${s.code}`, '')
  for (const c of lesson.code) {
    md.push(`### ${t(c.title)}`, '', '```' + (exam.codeLanguage ?? '').toLowerCase(), c.code, '```', '')
    for (const note of c.notes) md.push(`- ${t(note)}`)
    md.push('')
  }
  md.push(`## ${s.traps}`, '')
  for (const x of lesson.traps) md.push(`- ${t(x)}`)
  md.push('', `## ${s.takeaways}`, '')
  for (const x of lesson.takeaways) md.push(`- ${t(x)}`)
  md.push('', `## ${s.sources}`, '')
  for (const s of lesson.sources) md.push(`- [${s.title}](${s.url})`)
  writeFileSync(join(outDir, `${lesson.module}.md`), md.join('\n') + '\n')
  n++
}
console.log(`Exported ${n} lessons (${lang}) to ${outDir}`)
