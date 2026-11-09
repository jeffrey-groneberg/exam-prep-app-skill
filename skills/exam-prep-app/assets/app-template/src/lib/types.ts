import type { DiagramIconId } from '../content/diagram-icons.ts'
import type { IconName } from '../components/icons.generated.ts'

export type Lang = 'de' | 'en'

/** Localized content string. Product, API and SDK names stay English in both languages. */
export interface L10n {
  en: string
  de: string
}

export type Text = string | L10n

/** Domain id from src/content/domains.ts, by convention D1, D2, … in the order of the study guide. */
export type DomainId = string

export interface SkillBullet {
  /** e.g. "1.1.1" = domain 1, skill group 1, bullet 1 */
  id: string
  /** Official English wording from the study guide (exam.json skillsOutlineDate). */
  en: string
  de: string
}

export interface SkillGroup {
  /** e.g. "1.1" */
  id: string
  title: L10n
  bullets: SkillBullet[]
}

export interface Domain {
  id: DomainId
  title: L10n
  short: L10n
  /** Official weight range in percent, e.g. [25, 30]. */
  weight: [number, number]
  /** Fluent UI icon beside the domain (src/components/icons.generated.ts). */
  icon: IconName
  groups: SkillGroup[]
}

export interface LearningPath {
  id: string
  uid: string
  title: string
  url: string
  /** Module ids in official order. */
  modules: string[]
}

export interface CourseModule {
  id: string
  uid: string
  /** Official English module title. */
  title: string
  url: string
  minutes: number
  pathId: string
  /** Official unit titles in order (from the Learn catalog). */
  units: string[]
  /** Skills-outline bullets this module primarily teaches. */
  skills: string[]
}

export type QuestionType = 'single' | 'multi' | 'order' | 'match' | 'code'
export type Difficulty = 1 | 2 | 3

export interface ChoiceOption {
  id: string
  text: L10n
  correct: boolean
  /** Why this option is right or wrong. */
  why: L10n
}

export interface OrderItem {
  id: string
  text: L10n
  /** Why the item sits at this position. */
  why: L10n
}

export interface MatchPrompt {
  id: string
  prompt: L10n
  /** Target id that matches this prompt. */
  answer: string
  why: L10n
}

export interface MatchTarget {
  id: string
  text: L10n
}

export interface CodeBlankOption {
  id: string
  /** Code token shown in the drop-down, e.g. "responses.create". */
  code: string
  correct: boolean
  why: L10n
}

export interface CodeBlank {
  /** Placeholder id used as {{id}} in the template. */
  id: string
  options: CodeBlankOption[]
}

interface QuestionBase {
  id: string
  type: QuestionType
  domain: DomainId
  /** Primary skills-outline bullet id, e.g. "2.1.6". */
  skill: string
  /** Optional secondary bullets the question also exercises. */
  skills?: string[]
  /** Module id from the course map. */
  module: string
  difficulty: Difficulty
  /** Optional case study this question belongs to. */
  caseId?: string
  stem: L10n
  /** Optional Python/JSON/YAML snippet shown with the stem. */
  code?: string
  /** Overall takeaway shown after answering. */
  explanation: L10n
  /** Current learn.microsoft.com URLs backing the facts. */
  sources: string[]
  /** ISO date the facts were last checked against the docs. */
  lastVerified: string
}

export interface SingleQuestion extends QuestionBase {
  type: 'single'
  options: ChoiceOption[]
}

export interface MultiQuestion extends QuestionBase {
  type: 'multi'
  options: ChoiceOption[]
}

export interface OrderQuestion extends QuestionBase {
  type: 'order'
  /** Items in the correct order; the UI shuffles them. */
  items: OrderItem[]
}

export interface MatchQuestion extends QuestionBase {
  type: 'match'
  prompts: MatchPrompt[]
  targets: MatchTarget[]
}

export interface CodeQuestion extends QuestionBase {
  type: 'code'
  /** Code template with {{blankId}} placeholders. */
  template: string
  blanks: CodeBlank[]
}

export type Question = SingleQuestion | MultiQuestion | OrderQuestion | MatchQuestion | CodeQuestion

export interface CaseStudy {
  id: string
  title: L10n
  /** Markdown-lite scenario: company, current state, requirements, constraints. */
  scenario: L10n
  modules: string[]
}

export interface QuestionFile {
  $schema?: string
  module: string
  questions: Question[]
}

export interface CaseFile {
  $schema?: string
  cases: CaseStudy[]
}

/* ---------- Lessons & diagrams ---------- */

export type Tone = 'user' | 'app' | 'platform' | 'model' | 'data' | 'tool' | 'safety' | 'external' | 'neutral'

export type NodeShape = 'box' | 'pill' | 'store' | 'doc' | 'actor' | 'diamond'

export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: Text
  sub?: Text
  /** Optional official product icon registered in src/content/diagram-icons.ts, shown beside the label. */
  icon?: DiagramIconId
  tone: Tone
  shape?: NodeShape
}

export interface DiagramGroup {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: Text
  tone?: Tone
}

export interface DiagramEdge {
  id: string
  from: string
  to: string
  label?: Text
  dashed?: boolean
  bidir?: boolean
  /** Optional intermediate points for orthogonal routing. */
  via?: Array<[number, number]>
}

export interface DiagramStep {
  title: L10n
  text: L10n
  /** Node, group or edge ids highlighted during this step. */
  focus: string[]
}

export interface Diagram {
  id: string
  title: L10n
  caption?: L10n
  width: number
  height: number
  groups?: DiagramGroup[]
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  steps: DiagramStep[]
}

export interface Concept {
  /** English term as used in the exam, e.g. "Prompt agent". */
  term: string
  text: L10n
}

export interface CompareTable {
  title: L10n
  columns: L10n[]
  /** Each row: cells may be plain strings (names) or L10n. */
  rows: Text[][]
}

export interface CodeSample {
  title: L10n
  code: string
  /** Short notes explaining the important lines. */
  notes: L10n[]
}

export interface SourceLink {
  title: string
  url: string
}

export interface Lesson {
  module: string
  summary: L10n
  /** How the exam tends to probe this module's skills. */
  examFocus: L10n
  diagrams: Diagram[]
  concepts: Concept[]
  comparison?: CompareTable
  code: CodeSample[]
  traps: L10n[]
  takeaways: L10n[]
  sources: SourceLink[]
}

/* ---------- Zettelkasten (Leitner card box) ---------- */

/** Lesson item a starter card asks about. */
export type ZettelKind = 'concept' | 'trap' | 'takeaway'

/** One starter card in src/content/cards/<module>.json. */
export interface StarterCard {
  /** z-<module>-<kind>-<index + 1> */
  id: string
  source: { kind: ZettelKind; index: number }
  /** The question on the front. */
  front: L10n
  /**
   * The answer on the back. Concept cards usually have none, because the lesson's concept text is the
   * answer; they carry one only when that text points at the page ("the table below").
   */
  back?: L10n
  /** Exam-style answer options: four, exactly one correct, each with a short reason why it is right or wrong. */
  choices: ChoiceOption[]
}

export interface CardFile {
  module: string
  cards: StarterCard[]
}

/** A card as the app shows it: a starter card resolved against its lesson, or one the learner wrote. */
export interface Zettel {
  id: string
  /** Module the card belongs to; own cards may have none. */
  module: string | null
  kind: ZettelKind | 'own'
  front: Text
  back: Text
  /** Concept cards: the term, shown above the answer. */
  term?: string
  /** Answer options for a multiple-choice round; cards without them are turned and rated by the learner. */
  choices?: ChoiceOption[]
}

/* ---------- Exam configuration (src/content/exam.json) ---------- */

export interface ExamLinks {
  /** Exam page on Microsoft Learn. */
  examPage: string
  studyGuide: string
  /** Official course; empty when there is none. */
  course: string
  /** Official practice assessment; empty until known. */
  practiceAssessment: string
  examSandbox: string
}

/** A link on the Resources page; a plain-string title stays the same in both languages (an official title). */
export interface ResourceLink {
  title: Text
  url: string
  note?: Text
}

export interface LegacyName {
  /** Regular expression source. */
  pattern: string
  flags?: string
  current: string
}

export interface ExamTargets {
  minQuestions: number
  minPerBullet: number
  minPerModule: number
  minCases: number
  /** Percentage points a domain's share of the bank may fall below the lower end of its weight range. */
  domainShareTolerance: number
}

export interface ExamConfig {
  /** Open setup tasks; the validator warns while any remain. */
  todo?: string[]
  code: string
  title: L10n
  appName: string
  shortName: string
  badge: string
  storageKey: string
  defaultLang: Lang
  /** ISO date of the skills outline version ("Skills measured as of …"). */
  skillsOutlineDate: string
  courseNumber?: string
  courseTitle?: string
  /** Language of code samples and code questions; "Python" is highlighted. */
  codeLanguage?: string
  /** seatMinutes: optional seat time of the real exam, shown on Resources. */
  exam: { minutes: number; questions: number; passPercent: number; seatMinutes?: number }
  links: ExamLinks
  /** Feedback links open a prefilled issue here; without an issuesUrl the app shows none. */
  feedback?: { issuesUrl?: string }
  /** Further official Microsoft pages for this exam (certification page, exam prep video …). */
  official?: ResourceLink[]
  community: ResourceLink[]
  legacyNames: LegacyName[]
  /** Exam-specific names for diagram tones in the legend, e.g. platform: "Foundry platform". */
  toneLabels?: Partial<Record<Tone, L10n>>
  sourceDocsets: Array<{ prefix: string; label: string }>
  targets: ExamTargets
}
