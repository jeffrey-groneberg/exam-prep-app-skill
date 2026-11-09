/**
 * Model currency: flags content that presents retired or deprecated Foundry models as current.
 * Data comes from a snapshot of Learn's model retirement schedule (scripts/model-lifecycle.ts).
 */

export interface ModelVersion {
  version: string
  lifecycle: 'GA' | 'Preview' | 'Deprecated' | 'Legacy' | 'Retired'
  retirement: string
  replacement: string
}

export interface ModelLifecycle {
  source: string
  retrieved: string
  /** Documented exceptions, e.g. models the product docs still present as available. */
  overrides: Record<string, { status: 'available'; note: string }>
  models: Record<string, ModelVersion[]>
}

export type ModelStatus = 'available' | 'deprecated' | 'retired'

const ALIVE = new Set(['GA', 'Preview'])
const FRAMING = /retir|deprecat|legacy|replac|formerly|successor|migrat|instead|no longer|end of life|eingestellt|abgekündigt|veraltet|ersetz|Nachfolger|migrier|stattdessen|nicht mehr/i

export function modelStatus(name: string, data: ModelLifecycle, today: string): ModelStatus {
  if (data.overrides[name]) return 'available'
  const versions = data.models[name] ?? []
  const pending = (v: ModelVersion) => !/^\d{4}-\d{2}-\d{2}$/.test(v.retirement) || v.retirement > today
  if (versions.some((v) => ALIVE.has(v.lifecycle) && pending(v))) return 'available'
  if (versions.some((v) => (v.lifecycle === 'Deprecated' || v.lifecycle === 'Legacy') && pending(v))) return 'deprecated'
  return 'retired'
}

export interface ModelFinding {
  model: string
  status: Exclude<ModelStatus, 'available'>
  detail: string
}

/**
 * Finds retired or deprecated model ids in free text. Ids of three characters or fewer (o1, o3, tts)
 * are skipped because they collide with option ids and abbreviations; mentions next to words such as
 * "retired", "deprecated" or "replace" count as deliberate.
 */
export function findOutdatedModels(text: string, data: ModelLifecycle, today: string): ModelFinding[] {
  const lower = text.toLowerCase()
  const findings = new Map<string, ModelFinding>()
  for (const name of Object.keys(data.models)) {
    if (name.length <= 3 || findings.has(name)) continue
    const status = modelStatus(name, data, today)
    if (status === 'available') continue
    const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![\\w.-])${escaped}(?![\\w]|[.-]\\w)`, 'g')
    for (const m of lower.matchAll(re)) {
      const window = text.slice(Math.max(0, m.index - 140), m.index + name.length + 140)
      if (FRAMING.test(window)) continue
      const versions = data.models[name]
      const detail = versions.map((v) => `${v.version} ${v.lifecycle} → ${v.retirement}${v.replacement && v.replacement !== '—' ? `, replacement ${v.replacement}` : ''}`).join('; ')
      findings.set(name, { model: name, status, detail })
      break
    }
  }
  return [...findings.values()]
}

/** Serializes a content object for scanning, leaving out ids, links and diagram wiring. */
export function scanText(value: unknown): string {
  const skip = new Set(['id', 'sources', 'url', 'focus', 'from', 'to', 'caseId', 'module', 'skill', 'skills', 'answer', 'correct'])
  return JSON.stringify(value, (k, v) => (skip.has(k) ? undefined : v))
}
