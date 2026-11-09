import type { CardFile, CaseFile, CaseStudy, Lesson, Question, QuestionFile, StarterCard, Zettel } from '../lib/types.ts'
import { outline } from './outline.ts'

const questionFiles = import.meta.glob<QuestionFile>('./questions/*.json', { eager: true, import: 'default' })
const caseFiles = import.meta.glob<CaseFile>('./cases/*.json', { eager: true, import: 'default' })
const lessonFiles = import.meta.glob<{ lesson: Lesson }>('./lessons/*.ts', { eager: true })
const cardFiles = import.meta.glob<CardFile>('./cards/*.json', { eager: true, import: 'default' })

const moduleOrder = new Map(outline.orderedModules.map((m, i) => [m.id, i]))

export const questions: Question[] = Object.values(questionFiles)
  .flatMap((f) => f.questions)
  .sort((a, b) => (moduleOrder.get(a.module) ?? 99) - (moduleOrder.get(b.module) ?? 99) || a.id.localeCompare(b.id))

export const questionById = new Map(questions.map((q) => [q.id, q]))

export const cases: CaseStudy[] = Object.values(caseFiles).flatMap((f) => f.cases)
export const caseById = new Map(cases.map((c) => [c.id, c]))

export const lessons: Lesson[] = Object.entries(lessonFiles)
  .filter(([path]) => !path.split('/').pop()!.startsWith('_'))
  .map(([, mod]) => mod.lesson)
  .filter(Boolean)
export const lessonByModule = new Map(lessons.map((l) => [l.module, l]))

/** Modules in official course order (learning path order). */
export const orderedModules = outline.orderedModules

export function questionsForModule(moduleId: string): Question[] {
  return questions.filter((q) => q.module === moduleId)
}

export function questionsForBullet(bulletId: string): Question[] {
  return questions.filter((q) => q.skill === bulletId)
}

const KIND_ORDER = { concept: 0, trap: 1, takeaway: 2 } as const

function resolveCard(c: StarterCard, lesson: Lesson): Zettel | null {
  const { kind, index } = c.source
  if (kind === 'concept') {
    const concept = lesson.concepts[index]
    return concept ? { id: c.id, module: lesson.module, kind, front: c.front, back: c.back ?? concept.text, term: concept.term, choices: c.choices } : null
  }
  const text = (kind === 'trap' ? lesson.traps : lesson.takeaways)[index]
  return text ? { id: c.id, module: lesson.module, kind, front: c.front, back: c.back ?? text, choices: c.choices } : null
}

const cardsByModule = new Map(Object.values(cardFiles).map((f) => [f.module, f.cards]))

/** The prefilled Zettelkasten: one card per concept, exam trap and takeaway of every lesson, in course order. */
export const starterZettel: Zettel[] = orderedModules.flatMap((m) => {
  const lesson = lessonByModule.get(m.id)
  if (!lesson) return []
  return [...(cardsByModule.get(m.id) ?? [])]
    .sort((a, b) => KIND_ORDER[a.source.kind] - KIND_ORDER[b.source.kind] || a.source.index - b.source.index)
    .map((c) => resolveCard(c, lesson))
    .filter((z): z is Zettel => z !== null)
})
