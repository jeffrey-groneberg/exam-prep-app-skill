import type { CourseModule, Domain, DomainId, LearningPath, SkillBullet } from '../lib/types.ts'
import { domains } from './domains.ts'
import { CATALOG_RETRIEVED, learningPaths, modules } from './course.ts'

/** The exam's skills outline (domains.ts) and the official course (course.ts) the content maps onto. */
export interface Outline {
  domains: Domain[]
  learningPaths: LearningPath[]
  modules: CourseModule[]
}

export interface OutlineBullet extends SkillBullet {
  domain: DomainId
  group: string
}

/** Lookups over an outline; the app uses the real one, tests pass their own. */
export function indexOutline(o: Outline) {
  const allBullets: OutlineBullet[] = o.domains.flatMap((d) => d.groups.flatMap((g) => g.bullets.map((b) => ({ ...b, domain: d.id, group: g.id }))))
  const moduleById = new Map(o.modules.map((m) => [m.id, m]))
  return {
    ...o,
    allBullets,
    bulletById: new Map(allBullets.map((b) => [b.id, b])),
    domainById: new Map(o.domains.map((d) => [d.id, d])),
    moduleById,
    pathById: new Map(o.learningPaths.map((p) => [p.id, p])),
    /** Modules in course order: learning path by learning path, ids without a module left out. */
    orderedModules: o.learningPaths.flatMap((p) => p.modules).flatMap((id) => moduleById.get(id) ?? []),
  }
}

export type OutlineIndex = ReturnType<typeof indexOutline>

export const outline: OutlineIndex = indexOutline({ domains, learningPaths, modules })

export { CATALOG_RETRIEVED, domains, learningPaths, modules }
export const { allBullets, bulletById, domainById, moduleById, pathById } = outline

/** Domain hues in the design system (tokens.css --d1 … --d6); a seventh domain starts over at the first hue. */
export const DOMAIN_HUES = 6

/** Hue slot 1–6 of a domain, by its position in the outline (0 for an unknown id: neutral grey). */
export function domainHue(id: DomainId): number {
  const i = domains.findIndex((d) => d.id === id)
  return i < 0 ? 0 : (i % DOMAIN_HUES) + 1
}

/** Midpoint of a domain's official weight range, in percent. */
export function domainMidpoint(id: DomainId): number {
  const d = domainById.get(id)
  return d ? (d.weight[0] + d.weight[1]) / 2 : 0
}
