/**
 * Fetches the page title of every learn.microsoft.com URL cited by a question and writes
 * src/content/source-titles.json, so explanations can show real titles instead of URL slugs.
 *
 *   npm run sources:titles
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { QuestionFile } from '../src/lib/types.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const content = join(root, 'src', 'content')
const outFile = join(content, 'source-titles.json')

const urls = new Set<string>()
const questionDir = join(content, 'questions')
for (const f of existsSync(questionDir) ? readdirSync(questionDir).filter((f) => f.endsWith('.json')) : []) {
  const data = JSON.parse(readFileSync(join(content, 'questions', f), 'utf8')) as QuestionFile
  for (const q of data.questions) for (const s of q.sources) urls.add(s.split('#')[0])
}

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

async function title(url: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'exam-prep-source-titles' }, signal: AbortSignal.timeout(20000) })
      if (res.status === 429) {
        await res.body?.cancel()
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
        continue
      }
      if (!res.ok) {
        await res.body?.cancel()
        return null
      }
      const html = await res.text()
      const og = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1]
      const tag = html.match(/<title>([^<]*)<\/title>/)?.[1]?.replace(/\s*\|\s*Microsoft Learn\s*$/, '')
      const raw = og ?? tag
      return raw ? decode(raw).trim() : null
    } catch {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  return null
}

const list = [...urls].sort()
const raw = new Map<string, string>()
let index = 0
async function worker() {
  while (index < list.length) {
    const url = list[index++]
    const t = await title(url)
    if (t) raw.set(url, t)
  }
}
await Promise.all(Array.from({ length: 6 }, worker))

// "Page - Docset" titles: strip suffixes that recur across pages (docset names such as "Training").
const suffixCount = new Map<string, number>()
for (const t of raw.values()) {
  const i = t.lastIndexOf(' - ')
  if (i > 0) suffixCount.set(t.slice(i + 3), (suffixCount.get(t.slice(i + 3)) ?? 0) + 1)
}
const titles: Record<string, string> = {}
for (const url of list) {
  const t = raw.get(url)
  if (!t) continue
  const i = t.lastIndexOf(' - ')
  titles[url] = i > 0 && (suffixCount.get(t.slice(i + 3)) ?? 0) >= 3 ? t.slice(0, i) : t
}

writeFileSync(outFile, JSON.stringify(titles, null, 2) + '\n')
const missing = list.filter((u) => !titles[u])
console.log(`Wrote ${Object.keys(titles).length} of ${list.length} titles to ${outFile}`)
if (missing.length) console.log(`No title for:\n${missing.map((u) => `- ${u}`).join('\n')}`)
