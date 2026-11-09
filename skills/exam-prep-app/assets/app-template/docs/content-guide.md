# Content guide

How the lessons, questions, flashcards and case studies of this app are researched, written and validated. Every contributor, human or agent, follows this guide. The validator (`npm run validate`) enforces most of it; the rest is judgement.

## 1. Content policy (non-negotiable)

- **Original only.** Write every question, option, explanation, card and lesson yourself. Do not copy or closely paraphrase Microsoft Learn module knowledge checks, module assessments or the official practice assessment; link to them instead.
- **No dumps.** Never open, read or use exam dump or brain-dump sites. They violate the Microsoft Certification Exam Agreement.
- **Current docs only.** Ground every fact in a current `learn.microsoft.com` page that you actually opened during this research. Product documentation beats training-module pages: modules show what the course teaches, but when a module and a product doc disagree, the product doc wins. The Microsoft Learn MCP server (`microsoft_docs_search`, `microsoft_docs_fetch`, `microsoft_code_sample_search`) is the easiest way to search and read them.
- **Current names.** If the docs say something was renamed, use the new name. An old name may appear only when the text frames it as a former name ("formerly …", "previously …", "renamed", "retired", "classic", "legacy"; German "früher", "ehemals", "umbenannt", …). Put the renames of your exam's products into `exam.json` `legacyNames` so the validator rejects them.
- **Current models.** Never present a retired or deprecated model as the solution. `src/content/model-lifecycle.json` is a snapshot of Learn's model retirement schedule (`npm run models:refresh`); the validator rejects outdated model ids unless the sentence frames them as retired, deprecated or replaced.
- **Preview features** are fine when the docs present them as commonly used; say "(preview)" where the docs do.
- **Keep a facts table.** Add a short table of the platform facts you verified (current names, endpoints, SDK versions, roles, retirement dates, with their date) to this guide, so every author uses the same facts. Update it on every content pass.

## 2. Exam setup

1. `src/content/exam.json`: code, title, names, links, exam format, `skillsOutlineDate`, `legacyNames`, `sourceDocsets` and `targets`. Work through its `todo` list and delete the list when it's empty. `feedback.issuesUrl` is the "new issue" address of the app's public GitHub repository (`https://github.com/<owner>/<repo>/issues/new`): every question, lesson section, diagram, code sample and card then gets a feedback link that opens a prefilled issue. Leave it empty until the repository exists; the app then shows no feedback links.
2. `src/content/domains.ts`: copy the skills outline from the study guide. Domain ids are `D1`, `D2`, … in study-guide order; `weight` is the official range in percent; `icon` is a Fluent icon name from `src/components/icons.generated.ts` (add more in `scripts/gen-icons.mjs` and run `npm run icons`). Bullet text in English is verbatim; ids are `<domain>.<group>.<bullet>`, e.g. `2.1.3`.
3. `src/content/course.ts`: the official course. `node <skill>/scripts/learn-catalog.mjs <COURSE-NUMBER> --ts` prints a draft from the Learn Catalog API. Map every module to the bullets it teaches (`skills`); every bullet needs at least one module. Each module sits in exactly one learning path, and its `pathId` names that path.
4. `npm run check:learn` compares both with the live catalog and study guide.

## 3. Lessons

File: `src/content/lessons/<module-id>.ts`, exporting `export const lesson: Lesson = { … }` (pure data, `import type` only). The app renders it in this order:

1. `summary` — 3–5 sentences that explain the topic from the ground up.
2. `examFocus` — how the exam probes this module's skills.
3. `diagrams` — 1–2 step-through diagrams, the big picture first (rules below).
4. `concepts` — 4–7 terms: the English term and a 1–3 sentence explanation.
5. `comparison` — optional "which service or option for what" table; every row has as many cells as there are columns.
6. `code` — 1–2 minimal samples in the exam's `codeLanguage`, each with 1–3 notes.
7. `traps` — 3–5 exam traps; `takeaways` — 3–5 short rules.
8. `sources` — 2–5 Learn pages with their titles.

Minimums the validator enforces: summary ≥ 40 characters, exam focus ≥ 30, at least one diagram, three concepts, one code sample, two traps and three takeaways, and Learn URLs as sources. Define a shared term once per lesson, at first use, in the same words everywhere.

**Lesson items are append-only.** Flashcards point at lesson items by position (`concepts[2]`, `traps[0]`, …). Add new concepts, traps and takeaways at the **end** of their list and give each a card. Never insert, reorder or delete items without fixing the cards; if you change an item's text, check that its card still fits.

## 4. Questions

File: `src/content/questions/<module-id>.json`, one per module, validated against `src/content/schema/question-file.schema.json`.

- `id`: `q-<module-id>-NN`, two digits, continuing the numbering of the file.
- `domain` must be the domain of `skill`. `skill` is the primary skills-outline bullet; `skills` may list secondary bullets.
- `difficulty`: 1 recall a fact, 2 apply it to a short scenario, 3 analyze a scenario with trade-offs. Aim for roughly 25 % / 50 % / 25 %.
- Type mix: about 45 % `single`, 20 % `multi`, 10–15 % each of `order`, `match` and `code`.
  - `single`: 3–6 options, usually 4; exactly one correct.
  - `multi`: 4–6 options, at least two correct and at least one wrong. Say how many in the stem: "Which TWO …" / "Welche ZWEI …".
  - `order`: 3–7 items listed in the correct order; the app shuffles them.
  - `match`: 2–6 prompts and at least two targets, ideally 3–4 prompts and 4–5 targets with one distractor.
  - `code`: a short template (≤ 15 lines) with 1–4 blanks `{{b1}}`, each used once, with 3–5 options and exactly one correct.
- Stems are scenario-first and exam-like ("Your company …", "You need to …"; German "Dein Unternehmen …", "Du musst …"). One clear ask, no trick negations, no "all of the above".
- Distractors are plausible: real products, parameters and methods that fit a different scenario. Don't invent APIs unless the option's reason says it doesn't exist.
- Every option, item, prompt and blank option has a `why` (1–2 sentences) saying why it is right or wrong; `explanation` states the takeaway rule.
- `sources`: 1–3 specific Learn URLs that prove the correct answer; open each one. `lastVerified`: the date you checked them (`YYYY-MM-DD`, never in the future).
- Bilingual: `en` in clear exam English; `de` in natural German that keeps product, API and parameter names in English. Code stays identical.
- Markup: markdown-lite only, `**bold**` and `` `code` ``. No HTML and no line breaks inside options.

**Case studies:** `src/content/cases/<case-id>.json` (schema `case-file.schema.json`) with a scenario of 150–300 words (company, current environment, requirements, constraints) and 3–5 questions that point to it with `caseId`. The scenario must be needed to answer them. The simulation picks a case only when it has at least three questions.

## 5. Flashcards

File: `src/content/cards/<module-id>.json` (schema `card-file.schema.json`): exactly one card per lesson concept, exam trap and takeaway.

- `id` is `z-<module-id>-<concept|trap|takeaway>-<n>` and `source` is `{ "kind": …, "index": n - 1 }`, the item's position in the lesson.
- `front` asks a question that ends with "?" in both languages, under 160 characters.
- `back` answers it. Trap and takeaway cards need one; concept cards use the lesson's concept text unless that text points at the page ("see the table"), then they carry their own back. Backs restate the lesson; they add no new facts.
- `choices`: exactly four options `a`–`d`, exactly one correct, each with a `why` of at least 15 characters that says why it is right or wrong. Option texts are unique per language and stay under 220 characters, reasons under 320.
- No "all/none of the above", no references to the page ("the table below", "the first code sample").

**Answer-cue rules.** A test-wise learner must not find the key by its form:
- The key must not be clearly longer than every distractor (more than 15 % and 12 characters longer is a warning).
- A status tag such as "(preview)" or "(GA)" must not appear only on the key.
- The key must not be the only option without an absolute word ("only", "always", "never"; "nur", "immer", "nie").
- Across the whole deck the key may be the longest option in at most a third of the cards and one of the two longest in at most 60 %.
- The "central" option, the one sharing the most words with the others, may be the key in at most half of the cards that have one. Build distractors with the **2×2 pattern**: for a two-part answer, one distractor gets the first part wrong, one the second and one both.

Learners can also write their own cards in the app; those live in their browser and are part of the export.

## 6. Diagrams

A diagram is data: `width`, `height`, `nodes`, optional `groups`, `edges` and `steps`. The renderer, the validator and the render audit share one geometry (`src/lib/geometry.ts`) and measured font widths (`src/lib/text-metrics.ts`), so what validates is what users see.

- **Canvas:** width 960; when a diagram needs room, make it taller, not wider. Coordinates are top-left.
- **Nodes:** `w` ≥ 120 is a good start (minimum 60 × 30), `h` 56–80. As a rough guide a label line holds `(w − 16) / 7.4` characters and a sub line `(w − 16) / 6.2`; pills, diamonds and stores lose room to their curves, and a node with an official icon loses 24 px per label line. The validator reports the exact width or height a line needs. Break lines with `\n`. Product names are plain strings; generic words get `{ en, de }`.
- **Tones** encode meaning, always together with a label: `user` people, `app` your code or SDK, `platform` the cloud platform's resources and services, `model` models and deployments, `data` stores, indexes and files, `tool` tools, functions and MCP servers, `safety` guardrails, identity and security, `external` external systems and the web, `neutral` anything else.
- **Shapes:** `box` (default), `pill` (events, messages), `store` (databases, indexes, storage), `doc` (documents, files), `actor` (people), `diamond` (decisions).
- **Icons** are optional: `icon: '<id>'` shows an official product icon registered in `src/content/diagram-icons.ts` (see `src/assets/diagram-icons/NOTICE.md`). Without icons, the home thumbnail shows a Fluent glyph per tone.
- **Edges** start and end on each shape's drawn outline, so leave at least 40 px between connected nodes; under 20 px the arrowhead hides the arrow. Use `via` points for detours, `dashed` for optional or asynchronous flows, `bidir` for two-way traffic.
- **Edge labels** are pills 20 px high; they sit on their arrow when 20 px of arrow stays visible on each side, otherwise beside it, clear of nodes, group titles, other labels and arrows. A label without a free spot is an error. Keep labels at 18 characters or fewer.
- **Groups** show containment. Keep 20 px of padding; a node sits fully inside or outside a group; groups nest but never partly overlap; the top 30 px of a group belong to its title.
- **Layout:** flows go left to right or top to bottom, in rows and columns, so straight arrows never cross a node. The validator fails arrows through nodes or group titles, arrows drawn on top of each other (a shared trunk that fans out from one source or into one target is fine), overlapping nodes, nodes outside the canvas and text that doesn't fit.
- **Steps:** 3–6 per diagram (at least 2), each explaining one idea in 1–3 sentences and focusing the nodes, edges and groups it talks about. The endpoints of a lit arrow stay readable as context, but name every node the step talks about in its `focus`.

After diagram changes, run the render audit: `npm run dev`, then `npm run audit:diagrams -- audit-diagrams http://localhost:5173/ <module-id>`, and look at the PNGs it writes.

## 7. Sources and page titles

- Cite the specific Learn page that proves the fact, in `en-us`, without tracking parameters.
- `npm run sources:titles` fetches the title of every URL cited by a question into `src/content/source-titles.json`; the app shows "<doc set>: <page title>" as link text. `npm run validate` warns about cited URLs without a title.
- `exam.json` `sourceDocsets` maps Learn path prefixes (without locale) to doc set labels, e.g. `{ "prefix": "/azure/key-vault/", "label": "Key Vault" }`; unknown pages get "Learn".
- `npm run check:links` checks that every cited URL still resolves.

## 8. Validate as you go

| Command | When |
|---|---|
| `npm run validate -- --only <module-id>[,<module-id>…]` | After every lesson, question file or card file; checks those modules and skips global coverage |
| `npm run validate` | Before a commit: everything, including coverage of every bullet and module and the deck-wide card cues |
| `npm run validate -- --matrix` | Also writes `docs/coverage.md` |
| `npm run audit:diagrams` | After diagram changes (needs `npm run dev`) |
| `npm run check:learn` | Before a content pass and before the exam date: catalog, study guide and model retirement drift |
| `npm run check` | Before publishing: lint, type check, tests and validation |

Fix warnings too: they point at thin coverage (`exam.json` `targets`), giveaway options and open setup tasks.

## 9. Workflow per module

1. Research: open the training module and its units, then the product docs and code samples it builds on.
2. Write the lesson, then its flashcards, then the questions (and case questions where a case covers the module).
3. Run `npm run sources:titles` for new sources and `npm run validate -- --only <module-id>` until it reports no errors or warnings.
4. Check the diagrams with the render audit and read the lesson once in each language in the app.
5. Don't edit files that belong to another module while someone else works on it.
