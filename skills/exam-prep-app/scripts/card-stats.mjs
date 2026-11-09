#!/usr/bin/env node
// Answer-cue statistics for multiple-choice cards: can a test-wise learner guess the key from the form of the options?
// Usage: node card-stats.mjs <cards-dir> [module,module,...] [--list]
// Reports per module and for the whole deck:
//   - the key's length rank (longest / 2nd / 3rd / shortest), averaged over the languages present; chance is 25 % each
//   - "central" cards: one option clearly shares the most words with the others; how often that option is the key
//   - keys that are the only option without "only/always/never" and status tags that only the key carries
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const args = process.argv.slice(2)
const dir = args.find((a) => !a.startsWith('--'))
if (!dir) {
  console.error('Usage: node card-stats.mjs <cards-dir> [module,module,...] [--list]')
  process.exit(1)
}
const only = args.filter((a) => !a.startsWith('--'))[1]?.split(',').filter(Boolean)
const list = args.includes('--list')

const STOP = new Set('the and for with from that this you your can not only into than then when which who what use uses using via per its are der die das und oder ist sind mit für von den dem des nicht nur du dein deine wird werden kann'.split(' '))
const ABSOLUTE = /\b(?:only|always|never|nur|immer|nie|niemals)\b/i
const STATUS = /\((?:preview|public preview|GA|generally available|legacy|classic|deprecated|retired|veraltet|eingestellt|abgekündigt)\)/i
const words = (s) => new Set(s.toLowerCase().replace(/[^\p{L}\p{N}_.\-]+/gu, ' ').split(' ').map((w) => w.replace(/^[.-]+|[.-]+$/g, '')).filter((w) => w.length > 2 && !STOP.has(w)))
const overlap = (a, b) => {
  let i = 0
  for (const w of a) if (b.has(w)) i++
  const u = a.size + b.size - i
  return u === 0 ? 0 : i / u
}
const pct = (x, n) => (n ? `${Math.round((100 * x) / n)}%` : '–')

const total = { n: 0, ranks: [0, 0, 0, 0], central: 0, centralKey: 0 }
const rows = []
const flagged = []
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const mod = file.replace(/\.json$/, '')
  if (only && !only.includes(mod)) continue
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  const m = { n: 0, ranks: [0, 0, 0, 0], central: 0, centralKey: 0 }
  for (const card of data.cards ?? []) {
    const choices = card.choices
    if (!Array.isArray(choices) || choices.length < 3) continue
    const key = choices.findIndex((o) => o.correct === true)
    if (key < 0) continue
    m.n++
    const langs = Object.keys(choices[0].text ?? {})
    for (const lang of langs) {
      const len = choices.map((o) => (o.text?.[lang] ?? '').length)
      const longer = len.filter((l, i) => i !== key && l > len[key]).length
      m.ranks[Math.min(longer, 3)] += 1 / langs.length
    }
    const sets = choices.map((o) => words(o.text?.en ?? Object.values(o.text ?? {})[0] ?? ''))
    const score = sets.map((s, i) => sets.reduce((sum, t, j) => (j === i ? sum : sum + overlap(s, t)), 0) / (sets.length - 1))
    const top = score.indexOf(Math.max(...score))
    const second = Math.max(...score.filter((_, i) => i !== top))
    if (score[top] - second > 0.04) {
      m.central++
      if (top === key) {
        m.centralKey++
        flagged.push(`${card.id}: the key is the central option (majority vote)`)
      }
    }
    for (const lang of langs) {
      const abs = (o) => ABSOLUTE.test(o.text?.[lang] ?? '')
      if (!abs(choices[key]) && choices.every((o, i) => i === key || abs(o))) flagged.push(`${card.id} (${lang}): the key is the only option without only/always/never`)
    }
    const tagged = choices.filter((o) => Object.values(o.text ?? {}).some((t) => STATUS.test(t)))
    if (tagged.length > 0 && tagged.every((o) => o.correct)) flagged.push(`${card.id}: only the key carries a status tag`)
  }
  rows.push(`${mod.padEnd(28)} ${String(m.n).padStart(4)}  ${m.ranks.map((r) => pct(r, m.n).padStart(5)).join(' ')}   ${String(m.central).padStart(3)} / ${pct(m.centralKey, m.central)}`)
  total.n += m.n
  total.central += m.central
  total.centralKey += m.centralKey
  m.ranks.forEach((r, i) => (total.ranks[i] += r))
}

console.log(`${'module'.padEnd(28)} ${'cards'.padStart(4)}  longest  2nd   3rd  short   central / key`)
console.log(rows.join('\n'))
console.log(`${'ALL'.padEnd(28)} ${String(total.n).padStart(4)}  ${total.ranks.map((r) => pct(r, total.n).padStart(5)).join(' ')}   ${String(total.central).padStart(3)} / ${pct(total.centralKey, total.central)}`)
console.log('\nTargets: each length rank between 15 % and 35 % (deck: longest ≤ 33 %, two longest ≤ 60 %); central option = key in ≤ 50 % of central cards.')
if (flagged.length) {
  console.log(`\n${flagged.length} card(s) with a cue${list ? ':' : ' (use --list to show them)'}`)
  if (list) for (const f of flagged) console.log(`  ${f}`)
}
