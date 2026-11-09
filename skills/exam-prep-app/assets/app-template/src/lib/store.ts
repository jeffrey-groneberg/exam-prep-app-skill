import { useSyncExternalStore } from 'react'
import type { Lang } from './types.ts'
import type { Answer } from './scoring.ts'
import { applyResult, type CardState } from './srs.ts'
import type { ExamSummary } from './exam.ts'
import { applyZettel, newOwnId, type OwnZettel, type ZettelState } from './zettel.ts'
import { exam } from '../config.ts'

export interface ExamSession {
  id: string
  startedAt: string
  /** Epoch ms when the timer runs out. */
  endsAt: number
  questionIds: string[]
  caseId: string | null
  caseQuestionIds: string[]
  answers: Record<string, Answer>
  marked: string[]
  current: number
  minutes: number
}

export interface ExamRecord {
  id: string
  finishedAt: string
  minutesUsed: number
  minutes: number
  questionIds: string[]
  answers: Record<string, Answer>
  summary: ExamSummary
}

export interface ProgressState {
  version: 1
  lang: Lang
  cards: Record<string, CardState>
  lessonsRead: Record<string, string>
  exams: ExamRecord[]
  activeExam: ExamSession | null
  /** Zettelkasten: compartment and tally per card id. Cards without an entry sit in compartment 1. */
  zettel: Record<string, ZettelState>
  /** Cards the learner wrote. */
  ownZettel: OwnZettel[]
  /** Starter cards the learner took out of the box. */
  hiddenZettel: string[]
}

/** localStorage key from exam.json; each exam app keeps its own progress. */
export const STORAGE_KEY = exam.storageKey
const KEY = STORAGE_KEY

export function initialState(): ProgressState {
  return { version: 1, lang: exam.defaultLang, cards: {}, lessonsRead: {}, exams: [], activeExam: null, zettel: {}, ownZettel: [], hiddenZettel: [] }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Fills fields that older saves and exports lack, so they load without losing anything. */
export function normalizeState(parsed: Partial<ProgressState>): ProgressState {
  const s = { ...initialState(), ...parsed }
  if (s.lang !== 'de' && s.lang !== 'en') s.lang = exam.defaultLang
  if (!isRecord(s.cards)) s.cards = {}
  if (!isRecord(s.lessonsRead)) s.lessonsRead = {}
  if (!Array.isArray(s.exams)) s.exams = []
  if (!isRecord(s.zettel)) s.zettel = {}
  if (!Array.isArray(s.ownZettel)) s.ownZettel = []
  if (!Array.isArray(s.hiddenZettel)) s.hiddenZettel = []
  return s
}

function load(): ProgressState {
  try {
    const raw = globalThis.localStorage?.getItem(KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    if (parsed.version !== 1) return initialState()
    return normalizeState(parsed)
  } catch {
    return initialState()
  }
}

let state: ProgressState = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}

function set(next: ProgressState) {
  state = next
  persist()
  listeners.forEach((l) => l())
}

export const store = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setLang(lang: Lang) {
    set({ ...state, lang })
  },
  recordAnswer(questionId: string, score: number, now: Date = new Date()) {
    set({ ...state, cards: { ...state.cards, [questionId]: applyResult(state.cards[questionId], score, now) } })
  },
  markLessonRead(moduleId: string, read = true) {
    const lessonsRead = { ...state.lessonsRead }
    if (read) lessonsRead[moduleId] = new Date().toISOString()
    else delete lessonsRead[moduleId]
    set({ ...state, lessonsRead })
  },
  startExam(session: ExamSession) {
    set({ ...state, activeExam: session })
  },
  updateExam(patch: Partial<ExamSession>) {
    if (!state.activeExam) return
    set({ ...state, activeExam: { ...state.activeExam, ...patch } })
  },
  abandonExam() {
    set({ ...state, activeExam: null })
  },
  finishExam(record: ExamRecord, scores: Record<string, number>, now: Date = new Date()) {
    const cards = { ...state.cards }
    for (const [id, score] of Object.entries(scores)) cards[id] = applyResult(cards[id], score, now)
    set({ ...state, cards, activeExam: null, exams: [record, ...state.exams].slice(0, 30) })
  },
  answerZettel(id: string, knew: boolean, now: Date = new Date()) {
    set({ ...state, zettel: { ...state.zettel, [id]: applyZettel(state.zettel[id], knew, now) } })
  },
  /** Puts cards back into compartment 1. */
  resetZettel(ids: string[]) {
    const zettel = { ...state.zettel }
    for (const id of ids) delete zettel[id]
    set({ ...state, zettel })
  },
  addOwnZettel(input: Pick<OwnZettel, 'front' | 'back' | 'module' | 'choices'>, now: Date = new Date()): string {
    const id = newOwnId(now)
    set({ ...state, ownZettel: [...state.ownZettel, { id, ...input, createdAt: now.toISOString() }] })
    return id
  },
  updateOwnZettel(id: string, patch: Partial<Pick<OwnZettel, 'front' | 'back' | 'module' | 'choices'>>) {
    set({ ...state, ownZettel: state.ownZettel.map((z) => (z.id === id ? { ...z, ...patch } : z)) })
  },
  deleteOwnZettel(id: string) {
    const zettel = { ...state.zettel }
    delete zettel[id]
    set({ ...state, zettel, ownZettel: state.ownZettel.filter((z) => z.id !== id) })
  },
  setZettelHidden(id: string, hidden: boolean) {
    const rest = state.hiddenZettel.filter((h) => h !== id)
    set({ ...state, hiddenZettel: hidden ? [...rest, id] : rest })
  },
  /** Clears the learning progress; the learner's own cards stay, back in compartment 1. */
  reset() {
    set({ ...initialState(), lang: state.lang, ownZettel: state.ownZettel, hiddenZettel: state.hiddenZettel })
  },
  exportJson(): string {
    return JSON.stringify(state, null, 2)
  },
  importJson(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as ProgressState
      if (parsed.version !== 1 || typeof parsed.cards !== 'object') return false
      set({ ...normalizeState(parsed), activeExam: null })
      return true
    } catch {
      return false
    }
  },
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

export function useLang(): Lang {
  return useProgress().lang
}
