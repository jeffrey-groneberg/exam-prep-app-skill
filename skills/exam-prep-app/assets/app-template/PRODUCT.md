# Product

A study app for one Microsoft certification exam. This brief describes the template; everything exam-specific (code, title, app name, badge, links, exam length, pass guideline, code language, default language) comes from `src/content/exam.json`, the skills outline from `src/content/domains.ts` and the course map from `src/content/course.ts`.

## Platform

web

## Stack

Vite + React 19 + TypeScript static single-page app with hash routing. No backend and no accounts; progress is persisted in the browser's `localStorage` under exam.json `storageKey`. It runs locally with one command, builds to static files for any host (a GitHub Pages workflow is included) and installs as a PWA that works offline after the first visit.

## Users

A learner preparing for one Microsoft certification exam who wants visual explanations: a concept shown as a diagram, step by step, before it is explained in prose. Hands-on experience with the exam's products may be thin, so lessons explain from the ground up. The learner studies in longer sessions on a laptop or desktop and in short question or flashcard rounds on a phone.

## Product Purpose

Prepare the learner to pass the exam by covering every bullet of the official skills outline (as of exam.json `skillsOutlineDate`) and every module of the official course (exam.json `courseNumber`) with illustrated lessons, an original question bank, a timed exam simulation, spaced repetition of mistakes, flashcards and a progress view. Success: no uncovered bullet or module, facts that match current Microsoft Learn documentation, and the learner always knows what to do next.

## Positioning

A guided, illustrated path through the official exam scope. Every lesson is built around a step-through diagram; every question is original, mapped to a skills-outline bullet and a course module, and backed by at least one current learn.microsoft.com source with the date it was last checked (`lastVerified`). It is not a dump: it uses no dump or brain-dump sites and does not copy or closely paraphrase Microsoft Learn knowledge checks or the official practice assessment; it links to them instead. It is not an official Microsoft product and says so in its footer.

## Operating Context

- **Exam facts:** the domains and their official weight ranges come from the study guide (`src/content/domains.ts`); exam length, question count and the app's pass guideline from exam.json `exam` (`minutes`, `questions`, `passPercent`). The app passes on what Microsoft publishes about its role-based exams: most have 40–60 questions; the score is scaled, 700 of 1000 passes, and it doesn't necessarily equal 70 % of the points; questions with several parts usually give one point per correct part, and wrong answers cost nothing; Microsoft Learn can be opened in a split window during role-based exams while the clock keeps running. The pass guideline is the app's own yardstick, not the official score.
- **Official companions the app links to** (exam.json `links`): the exam page, the study guide, the official course with its learning paths and modules (whose knowledge checks stay on Learn), the official practice assessment and the exam sandbox. Community material (exam.json `community`) is optional and marked as not official; points taken from it enter the content only after current Learn documentation confirms them, in the app's own words.
- **Study loop:** the home screen shows what is next on a guided path: lesson → questions → review of mistakes. Beside it, flashcards offer short rounds, and the exam simulation tests under exam conditions.
- **Sample content:** the template ships three course modules (lessons, questions and flashcards) and one case study so every screen has something to show; a scaffolded app replaces them with its own exam's content.

## Capabilities and Constraints

- **Two languages:** every UI string lives in typed dictionaries (`src/i18n/en.ts`, `src/i18n/de.ts`, same keys), and lessons, questions and cards carry English and German text. The EN/DE toggle switches the UI and the content together; exam.json `defaultLang` sets the language a new learner starts in. Product, API and SDK names stay English in both languages.
- **Lessons:** one per course module, in course order: what it's about, how the exam tests it, step-through diagrams, core concepts, an optional "which service for what" comparison, minimal code samples in exam.json `codeLanguage`, exam traps, takeaways, a mini quiz, and sources with a link to the official module.
- **Question types:** single choice, multiple choice (the stem says how many answers are right), ordering, matching (drag and drop with a keyboard alternative), code completion in exam.json `codeLanguage`, and case studies (several questions on one scenario that stays beside the question). Every question carries a domain, a skills-outline bullet, a module, a difficulty (1–3), an explanation for every option, at least one current learn.microsoft.com source and a `lastVerified` date.
- **Practice:** learning mode with instant feedback and an explanation for every option, filtered by domain, module, difficulty, question type and status.
- **Exam simulation:** timed and weighted by domain (midpoints of the official weight ranges), with the full length and minutes from exam.json and a "Compact" option at half of both; domains without questions are skipped and a domain with fewer questions than its share gives what it has. No feedback until submitting; questions can be marked for review and reached from an overview; a case study comes at the end; results show each domain against the pass guideline.
- **Review:** spaced repetition of questions on the Leitner principle with five boxes: a wrong answer comes back right away, right answers move up a box and return after 1, 3, 7 and 21 days.
- **Flashcards** (German UI: Zettelkasten): a Leitner card box with three stages, prominent on the home screen. The front of a card asks a question answered like on the exam: four options, exactly one correct. After checking, every option shows a short reason why it is right or wrong, and the lesson text is one tap away. Right: the card moves one stage forward; wrong: back to stage 1; the goal is every card in stage 3. No time intervals: a round cycles until all of its cards stand in stage 3. The box is prefilled with one card per concept, exam trap and takeaway of every lesson (original questions and options, reasons grounded in the lesson text), plus the learner's own cards, which can carry their own options or else are turned over and self-rated; starter cards can be taken out of the box and put back. The flashcards are separate from Review, which keeps its five timed boxes.
- **Progress, Coverage, Resources:** a skills map with one tile per outline bullet, progress per domain and module, past simulations, and export/import of progress and own cards as JSON; a coverage matrix from bullet to module, lesson and questions; official links, exam-day facts and where the content comes from.
- **Data:** progress and own cards stay in the learner's browser; there is no server and no tracking. Resetting deletes progress, while own cards stay and start again in stage 1.
- **Empty start:** a freshly scaffolded app without content shows "No content yet" states that name the files to fill, instead of crashing.
- **Content policy:** no exam dumps or brain-dump sites; no copying or close paraphrasing of Learn knowledge checks or the official practice assessment; only current documentation; renamed or retired products never appear under outdated names (exam.json `legacyNames`), and retired models are not presented as current.
- **Content validator** (`npm run validate`): fails on a question without its correct answers (exactly one for single choice, at least two for multiple choice), an option, item or blank without its explanation, a missing or non-Learn source URL, a missing or future `lastVerified` date, a skill bullet outside the question's domain, an unknown module or bullet, any skills-outline bullet without a module or without questions, any module without a lesson or without questions, any lesson concept, trap or takeaway without exactly one flashcard, a flashcard without four options, exactly one of them correct and each with a reason, a correct option that gives itself away by its form, missing English or German text, outdated product names, and any diagram whose text doesn't fit its shapes, whose arrows run through nodes or group titles, or whose labels find no free spot. Fewer questions per bullet or module than exam.json `targets` asks for is a warning.

## Brand Commitments

Use current Microsoft product names exactly as current Microsoft Learn documentation writes them. The app is a study tool, not a Microsoft product, and must not imply endorsement: no Microsoft logos; the app's mark is a brand-blue square with the exam.json `badge`.

Visual direction: the category standard, played straight and executed at full craft, a clean learning app in the Microsoft Learn and Fluent 2 style. The craft bar is set by well-made learning products such as Microsoft Learn, Khan Academy and Duolingo, without gamification (no badges, streak pressure or confetti). It must not look like a generic dashboard template: craft lives in the guided path, the diagrams and the precision of every state. DESIGN.md describes the visual system.

## Evidence on Hand

- The course structure comes from the Microsoft Learn catalog (the retrieval date is in `src/content/course.ts`) and the skills outline from the official study guide (exam.json `skillsOutlineDate`); the app shows both dates on Resources.
- No testimonials, pass rates or usage statistics exist; none may be invented.

## Product Principles

1. Always show the next step: the learner never has to wonder what to study now.
2. Picture first: every concept gets a diagram or comparison before prose.
3. Exam-true: weights, timing, scoring and terminology mirror the real exam and current docs.
4. Traceable: every fact links to a current Learn source and every question is original.
5. Honest progress: progress reflects retained knowledge (spaced repetition), not clicks.

## Accessibility & Inclusion

Diagrams carry text labels, a legend and step narration that screen readers announce, never colour alone, and each diagram has a text alternative listing its steps. Every question type is keyboard-operable, including matching and ordering; diagrams step with the arrow keys, and flashcards answer with 1–4 or A–D and Enter. Verdicts pair colour with an icon and a word. Focus stays visible, and a skip link leads to the content. Motion respects reduced-motion preferences. Touch targets are at least 44px tall (40px for icon buttons, step dots, chips and tiles). Layouts work down to smartphone width for short rounds without the page scrolling sideways, and they respect the notch insets of phones held sideways. The page language follows the language toggle, and content carries its own `lang`.
