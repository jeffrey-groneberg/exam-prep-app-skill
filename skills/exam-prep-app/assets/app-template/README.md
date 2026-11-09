# Exam Prep App

A study app for one Microsoft certification exam. It follows the exam's official skills outline and course: an illustrated lesson for every module, original practice questions with an explanation for every option, a timed exam simulation weighted by domain, spaced repetition of mistakes, flashcards and a progress view. Everything runs in the browser, with no backend and no account. It installs as an app (PWA) and works offline.

Everything exam-specific lives in a few content files, so the same app serves any exam. The template ships with sample content: three modules of course AI-103T00 (`agents-vscode`, `custom-tools`, `mcp-tools`) and one case study.

> [!IMPORTANT]
> Not an official Microsoft product. Questions are original and grounded in current Microsoft Learn documentation; they are not exam questions and no dumps are used. See [Content policy](#content-policy).

## Quick start

Requires Node.js 22.18 or later.

```bash
npm ci          # install exactly the versions in package-lock.json
npm run dev     # http://localhost:5173
```

Progress is stored per browser and per address, so stick to one address while you study (see [Progress and privacy](#progress-and-privacy)). Port 5173 is fixed: if it's taken, the dev server stops with a message instead of moving to another port with an empty progress.

## What the app offers

| Section | What you do there |
|---|---|
| **Home** | See what's up next on the guided path (lesson → questions → review of mistakes), start today's reviews, a quick round of 10 questions or the exam simulation, and check your readiness per domain. |
| **Learn** | One illustrated lesson per official module: what it's about, how the exam tests it, step-through diagrams, core concepts, a comparison table, code, exam traps, takeaways, a mini quiz and the sources. |
| **Practice** | Learning mode with instant feedback and an explanation for every option. Filter by domain, module, skill, difficulty, question type and status. |
| **Exam** | A timed simulation: questions and minutes from `exam.json`, weighted by domain, with a case study at the end, or a compact version with half of both. Results per domain afterwards. |
| **Review** | Questions you got wrong come back on the Leitner principle: five boxes, due after 0, 1, 3, 7 and 21 days. |
| **Flashcards** | A Leitner card box with three stages (*Zettelkasten* in the German UI), prefilled with one card per concept, exam trap and takeaway of every lesson, plus your own cards. Each card is answered like the exam with one of four options, and every option explains why it is right or wrong. Right moves a card one stage forward, wrong sends it back to stage 1; the goal is every card in stage 3. |
| **Progress** | A skills map per domain and module; export, import or reset your progress. |
| **Coverage** | The coverage matrix: skill → module → lesson → questions. |
| **Resources** | Exam page, study guide, course, practice assessment, exam sandbox, the learning paths and modules on Learn, and facts for exam day. |

The UI and the content are bilingual (English and German). The language toggle in the header switches both; the default comes from `exam.json`. Product, API and SDK names stay English in both languages.

## Commands

Everything after `--` is passed on to the script.

| Command | Purpose |
|---|---|
| `npm run dev` | Development server on <http://localhost:5173> |
| `npm run build` | Type check and static build to `dist/` |
| `npm run preview` | Serve the build like production, with the offline service worker, on <http://localhost:4173> (separate progress) |
| `npm run check` | Lint, type check, tests and content validation: the gate before publishing |
| `npm run lint` · `npm run typecheck` · `npm test` | The parts of `check` on their own |
| `npm run validate` | Validate questions, lessons, diagrams, flashcards, cases, models and coverage |
| `npm run validate -- --only mod-a,mod-b` | Validate only these modules and skip the global coverage checks (for partial runs while writing) |
| `npm run validate -- --matrix` | Also write `docs/coverage.md` |
| `npm run audit:diagrams` | Render every lesson diagram in Chromium, in English and German, and check text overflow, arrows, labels and steps. Needs `npm run dev` running and, once, `npx playwright install chromium`. Writes PNGs and `report.json` to `audit-diagrams/` |
| `npm run check:learn` | Compare the course map and skills outline with the live Learn catalog and study guide, and the content's model ids with the live model retirement schedule |
| `npm run check:links` | Check that every cited learn.microsoft.com URL still resolves |
| `npm run sources:titles` | Fetch the page title of every cited Learn URL into `src/content/source-titles.json` |
| `npm run models:refresh` | Refresh the snapshot of the model retirement schedule (`src/content/model-lifecycle.json`) |
| `npm run export:lessons` | Export all lessons as Markdown to `dist-lessons/` (`-- <dir> de` for German) |
| `npm run icons` | Regenerate the Fluent UI icon module after adding icon names to `scripts/gen-icons.mjs` |
| `npm run icons:pwa` | Render `public/favicon.svg` and the app icons from the badge in `exam.json` (needs Playwright's Chromium) |

## Project structure

```text
src/
  content/
    exam.json            exam configuration: names, links, feedback, exam format, storage key, legacy names, targets
    domains.ts           skills outline: domains, weights, skill groups and bullets (EN + DE)
    course.ts            official course: learning paths and modules with units and mapped skills
    outline.ts           lookups over domains and course (bullet, module and path by id, domain hues)
    lessons/<module>.ts  one lesson per module: text, diagrams, code, traps, takeaways
    questions/<module>.json  questions per module
    cards/<module>.json  flashcards: one per concept, exam trap and takeaway of the lesson
    cases/<case>.json    case studies
    schema/              JSON schemas for exam.json, questions, cases and cards
    validate.ts          the content validator
    diagram-icons.ts     registry of optional official product icons (empty in the template)
    model-lifecycle.json snapshot of the model retirement schedule
    source-titles.json   page titles of cited Learn URLs
  i18n/                  UI dictionaries en.ts and de.ts (same keys, enforced by TypeScript and a test)
  lib/                   scoring, exam builder, Leitner review, flashcards, progress, storage, diagram geometry, feedback URLs
  components/            diagram renderer, question types, sessions, code highlighting, feedback links, icons
  pages/                 Home, Learn, Lesson, Practice, Exam, Review, Flashcards, Progress, Coverage, Resources
  styles/                design tokens and styles (see DESIGN.md)
  assets/diagram-icons/  optional official product icons with their NOTICE.md
public/                  favicon and app icons
scripts/                 validator CLI, Learn and link checks, model snapshot, source titles, exports, icons, diagram audit
tests/                   Vitest: engine, validator, content, UI in both languages, empty states
docs/content-guide.md    authoring rules for lessons, questions, cards, cases and diagrams
.github/workflows/       pages.yml: check, build and publish to GitHub Pages
```

## Content model

| File | Holds |
|---|---|
| `src/content/exam.json` | The single source of truth outside the content: `code`, `title {en, de}`, `appName`, `shortName`, `badge`, `storageKey`, `defaultLang`, `skillsOutlineDate`, `courseNumber`, `courseTitle`, `codeLanguage`, `exam {minutes, questions, passPercent}`, `links {examPage, studyGuide, course, practiceAssessment, examSandbox}`, `feedback {issuesUrl}`, `community`, `legacyNames`, `sourceDocsets`, `targets`. An optional `todo` list holds open setup tasks; `npm run validate` warns while any remain. Schema: `src/content/schema/exam.schema.json`. |
| `src/content/domains.ts` | The skills outline from the study guide: domains `D1`, `D2`, … with their weight range, a Fluent icon, skill groups and bullets. English bullets are verbatim; bullet ids like `2.1.3` are the app's own numbering. A domain's colour follows its position (six hues, then they repeat). |
| `src/content/course.ts` | The official course from the Learn catalog: learning paths in order, modules with title, URL, minutes, unit titles and the bullets each module teaches (`skills`). The skill's `learn-catalog.mjs` prints a draft. |
| `src/content/lessons/<module>.ts` | `export const lesson: Lesson`: summary, exam focus, step-through diagrams, concepts, an optional comparison, code samples, exam traps, takeaways and sources. |
| `src/content/questions/<module>.json` | Questions of five types (single, multi, order, match, code), each mapped to a domain, a skill bullet and the module, with a reason for every option, sources and `lastVerified`. |
| `src/content/cards/<module>.json` | One flashcard per lesson concept, trap and takeaway, with four options and a reason for each. |
| `src/content/cases/<case>.json` | Case studies; questions point to them with `caseId`. |

The rules for writing each of these are in [docs/content-guide.md](docs/content-guide.md).

## Content policy

1. **Original questions only.** Every question, explanation and lesson is written from scratch. No exam dumps or brain-dump sites are read or used; that would violate the Microsoft Certification Exam Agreement.
2. **No copies of official practice questions.** Learn module knowledge checks and the official practice assessment are not reproduced or closely paraphrased. The app links to them instead.
3. **Current documentation only.** Every question cites at least one current learn.microsoft.com page and carries `lastVerified`, the date it was last checked against its sources. The app shows the page title as the link text.
4. **Current names.** Renamed or retired product names (`exam.json` `legacyNames`) are rejected unless the text frames them as former names.
5. **Current models.** Model ids are checked against a snapshot of the model retirement schedule; retired or deprecated models are rejected unless the text frames them as such.
6. **Every option explained.** Each answer option says why it is right or wrong.
7. **No guarantee.** The exam may ask about things the app doesn't cover, and services change quickly. When in doubt, the linked documentation wins.

## Quality gates

- `npm run validate` fails on any error: missing correct answers, reasons, sources or localized text; unknown skills, modules or cases; skills-outline bullets or modules without questions; lessons without diagrams, concepts, traps or takeaways; lesson items without exactly one flashcard; flashcard options that give the answer away (length, status tags, absolute words, word overlap, deck-wide); outdated names or models; and diagram geometry (text that doesn't fit, arrows through nodes or titles, overlapping arrows, labels without a free spot). Warnings point at thin coverage (`targets` in `exam.json`) and open setup tasks.
- `npm test` covers scoring, the exam builder, Leitner review, flashcards, the validator, the real content against `exam.json` targets, every main page in both languages (no UI string of one language on the other's screens), empty states and the feedback links (with and without an issues URL).
- `npm run audit:diagrams` measures the rendered diagrams in a real browser.
- `npm run check` runs lint, type check, tests and validation; the Pages workflow runs it before every deployment.

## Publish on GitHub Pages

`.github/workflows/pages.yml` runs `npm ci`, `npm run check` and `npm run build` on every push to `main` and deploys `dist/` to GitHub Pages. Enable Pages with **Settings → Pages → Source: GitHub Actions**. You can also start the workflow by hand under **Actions → Deploy to GitHub Pages → Run workflow**.

The build uses relative paths and hash routing, so `dist/` also works on any other static host and in a sub-folder. `index.html` asks search engines not to index the site (`noindex`).

**Install as an app:** the build includes a web app manifest and a service worker. After the first visit the app works offline; only links to Microsoft Learn need a connection. Install it from the browser: Safari on iPhone and iPad via **Share → Add to Home Screen**, Chrome on Android via **Install app**, Edge and Chrome on desktop via the install icon in the address bar. A new version loads on the next start.

## Reporting problems

Every question, lesson section, diagram, lesson code sample and flashcard has a quiet **Feedback** link, and the footer has one for the app in general. It opens a new GitHub issue that already says where the problem is: question or card ID, module, skill or diagram step, a quote of up to 160 characters, the page address, the content language and the app version (the commit of the build). The learner only describes what's wrong. The issue text follows the app's language and carries the label `feedback`.

The links open `feedback.issuesUrl` from `exam.json`, the "new issue" address of the app's repository (`https://github.com/<owner>/<repo>/issues/new`; `new-app.mjs --repo <owner>/<repo>` fills it in). Leave it empty and the app shows no feedback links. The repository must be public so learners can open issues there, and reporters need a GitHub account. The sample points at the repository of the exam-prep-app skill.

## Progress and privacy

Progress lives only in the browser's `localStorage`, under the key `storageKey` from `exam.json`: answered questions, review boxes, read lessons, simulations, flashcard stages and your own cards. It is separate per browser and per address (the published site, `localhost:5173` and `localhost:4173` each have their own); an installed iPhone app has its own storage too. There is no server, no account and no tracking. **Progress → Export** saves everything, including your own cards, as JSON; **Import** restores it on any device. **Reset** clears the progress; your own cards stay and start again in stage 1.

## Design

The look follows Microsoft Learn and Fluent 2: Segoe UI, quiet surfaces, one brand blue and a colour per exam domain. Diagrams are hand-built SVGs with measured labels that are placed so they never cover arrows. Details are in [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md).

## Credits

- UI icons: [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) by Microsoft, MIT License.
- Code font: [Cascadia Code](https://github.com/microsoft/cascadia-code), SIL Open Font License 1.1.
- The footer line "Built with the exam-prep-app agent skill" links the skill's repository; set `SKILL_CREDIT_URL` in `src/config.ts` to `''` to drop it.
- Official product icons in diagrams are optional and not included. If you add any (for example the [Azure Architecture Icons](https://learn.microsoft.com/azure/architecture/icons/)), use them under their terms and list them in [src/assets/diagram-icons/NOTICE.md](src/assets/diagram-icons/NOTICE.md).
