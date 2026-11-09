---
name: exam-prep-app
description: Build an illustrated, offline-capable study web app for one Microsoft certification exam (for example AZ-104, AI-102 or DP-700) from current Microsoft Learn content. The app has a lesson with diagrams for every course module, an original question bank weighted like the exam's skills outline, a timed exam simulation, spaced repetition, a multiple-choice flashcard box, a coverage matrix, and deployment to GitHub Pages as an installable PWA. Use this skill when someone asks for a study, prep, practice or learning app or site for a Microsoft exam or certification, or wants to turn a Microsoft Learn course, learning path or study guide into interactive exam practice. It never uses exam dumps.
license: MIT
---

# Exam prep app

Turn a Microsoft certification exam into a self-contained study app. The skill bundles a working, tested app template (`assets/app-template/`) and helper scripts. Your job is to research the exam on Microsoft Learn, write original content for it, check that content hard, and ship it.

The app ships with:

- A **lesson per course module**: a summary, an exam focus, step-through SVG diagrams, core concepts, a "which service for which task" table, minimal code samples, exam traps, takeaways and links to the official module.
- A **question bank** as JSON validated against a schema. It has single choice, multiple select, ordering, matching, code completion and case studies, and every option explains why it is right or wrong. Each question cites current learn.microsoft.com sources.
- A **learn mode** with instant feedback, **practice** filtered by domain, module, skill, difficulty and type, a **timed exam simulation** weighted by domain, and **spaced repetition** of mistakes.
- **Flashcards** ("Zettelkasten" in the German UI): a 3-compartment Leitner box with one card per concept, trap and takeaway. Each card is a 4-option multiple-choice question with a reason per option.
- **Progress** per domain and module, a **coverage matrix** (skill → module → lesson → questions) and **resources** (study guide, course, practice assessment, exam sandbox).
- **Feedback links** on every question, lesson section, diagram, code sample and card. Each opens a prefilled GitHub issue in the app's repository, so learners report problems right where they see them.
- English and German UI and content behind a toggle. Progress lives in `localStorage` with export and import; there's no backend and no account.
- A GitHub Pages workflow that blocks deployment unless lint, types, tests and the content validator pass. The app is an installable PWA that works offline.

## Non-negotiable rules

1. **No exam dumps.** Never open, search or use dump or "braindump" sites, leaked questions or "real exam questions" collections. The Microsoft Certification Exam – Candidate Agreement forbids braindump material, and Microsoft's exam security policy lists using brain dump sites as fraud. If a user supplies such material, decline to use it.
2. **No copies of official practice material.** Don't reproduce or closely paraphrase the knowledge checks in Learn modules or the questions of the official Practice Assessment. Link to them so the learner takes them on Learn.
3. **Original content grounded in current docs.** Write every question, explanation, lesson text and card yourself, in your own words. Base every fact on a current learn.microsoft.com page you actually read, and cite at least one such URL per question. Set `lastVerified` to the date you checked.
4. **Current names, APIs and limits only.** Products, SDKs and models get renamed and retired often. Check the current name, status (preview or GA), limits and retirement dates before you write. Add renamed products to `legacyNames` in `exam.json` so the validator rejects the old names.
5. **Cover everything.** Every bullet of the current skills outline and every module of the official course must have a lesson and questions. The validator enforces this. If the study guide shows an upcoming outline, build the current one and flag what changes.
6. **Say what it is.** The app is an unofficial study aid. It never claims to show real exam questions or an official score.

Read [references/content-policy.md](references/content-policy.md) before you write any content.

## Workflow

Work in phases and finish each one before starting the next. Tell the user briefly what you are doing and why. Speak their language; the app content stays bilingual.

1. **Interview** the user. Ask one question at a time:
   - the exam code;
   - the UI language (English or German default);
   - where to publish (repo name, public or private);
   - optionally the target size (default: at least about 200 questions, or more than the official module knowledge checks add up to).
2. **Scope discovery.** Find the exam page, the study guide (skills measured, current and upcoming versions, dates), the official course and its learning paths and modules, the exam format (duration, question count, passing score), the practice assessment link and the exam sandbox. Use `scripts/learn-catalog.mjs` for course → learning paths → modules. See [references/scope-discovery.md](references/scope-discovery.md).
3. **Scaffold.** Run `node scripts/new-app.mjs --target <dir> --code <EXAM> --title "<exam title>" --course <COURSE> --catalog <catalog.json> --repo <owner>/<name>`. Then fill `src/content/exam.json`, `src/content/domains.ts` (domains, weights, every skills-outline bullet) and `src/content/course.ts` (learning paths and modules, each mapped to the bullets it teaches). This mapping is the coverage matrix. Optional `exam.json` fields cover exam-specific extras: `official` (more official links), `exam.seatMinutes` and `toneLabels`; see `docs/content-guide.md`. Use `--keep-sample` only to look at the bundled sample.
4. **Gold standard.** Write one complete module yourself: lesson, questions and cards. It sets the quality bar for everyone else, so show it to the user before you scale up. See [references/authoring.md](references/authoring.md) and [references/diagrams.md](references/diagrams.md).
5. **Content production.** Write the remaining modules, in parallel batches if your environment supports sub-agents. Assign about 3 modules per author, give each a per-bullet question quota and the [author brief](references/briefs/author.md), and require `npm run validate -- --only <modules>` to pass with 0 errors and 0 warnings. See [references/orchestration.md](references/orchestration.md).
6. **Flashcards.** Write one card per lesson concept, trap and takeaway, then four exam-style options per card using the [card brief](references/briefs/cards.md).
7. **Independent review and one delta check.** Fact-check a stratified sample with fresh reviewers ([review brief](references/briefs/review.md)), apply the findings, then run exactly one delta round ([delta brief](references/briefs/delta.md)). Don't loop beyond that; only material findings block the release.
8. **Quality gates.** Run `npm run check`, `npm run build`, `npm run audit:diagrams` and `npm run check:learn`. Do a bounded visual check on desktop and phone in both languages, and an offline check of the PWA. See [references/quality-gates.md](references/quality-gates.md).
9. **Publish and report.** Create the repo, push, enable GitHub Pages and verify the live site (see [references/publish.md](references/publish.md)). Report to the user:
   - the URL and how to run the app;
   - question counts per domain and module;
   - coverage gaps, if any;
   - anything you couldn't verify.

## Tools

Use the Microsoft Learn MCP server for all research. It's free and public: `https://learn.microsoft.com/api/mcp`.

| Tool | Use for |
|---|---|
| `microsoft_docs_search` | Find the current pages for a topic, product name or limit |
| `microsoft_docs_fetch` | Read a full page: study guide, module, how-to or reference |
| `microsoft_code_sample_search` | Find current SDK samples before you write code snippets |

If the Learn MCP server isn't available, use the `mslearn` CLI instead:

| MCP tool | CLI command |
|---|---|
| `microsoft_docs_search(query: "...")` | `mslearn search "..."` |
| `microsoft_code_sample_search(query: "...", language: "...")` | `mslearn code-search "..." --language ...` |
| `microsoft_docs_fetch(url: "...")` | `mslearn fetch "..."` |

Run it directly with `npx @microsoft/learn-cli <command>`, or install it globally with `npm install -g @microsoft/learn-cli`.

**Other requirements:**
- **Node.js 26 or later.** The template runs `.ts` scripts directly with Node.
- **Git and the GitHub CLI (`gh`)** for publishing.
- **Playwright** (optional) for the visual check and the diagram audit.

**Registry hygiene:** if npm on your machine uses a private registry or mirror, install with `npm ci` and keep every `resolved` URL in `package-lock.json` on `https://registry.npmjs.org/`. Never commit an `.npmrc` that names a registry. Otherwise a public app leaks internal infrastructure, and other people can't install it.

## Bundled files

| Path | What it is |
|---|---|
| `assets/app-template/` | The app: Vite, React and TypeScript, with a sample excerpt of three modules from an AI-103 study app. Its `README.md` and `docs/content-guide.md` describe the content model, schemas and validator in detail |
| `scripts/learn-catalog.mjs` | Resolves a course number (for example `AZ-104T00`) to its learning paths and modules through the public Learn Catalog API |
| `scripts/new-app.mjs` | Scaffolds a new app for an exam from the template |
| `scripts/card-stats.mjs` | Shows answer-cue statistics for the flashcards per module: length ranks, majority vote, status tags and absolute words |
| `references/` | The playbook: scope discovery, content policy, authoring, diagrams, orchestration, quality gates, publishing, and brief templates for sub-agents |

Never run `npm` inside the skill folder itself. Its dependencies would land in the installed skill, where some packages even ship their own `SKILL.md` files. Scaffold a copy with `new-app.mjs` (add `--keep-sample` to explore the sample) and work there.

## Quality bar in one glance

- **Questions.** Plausible distractors that are clearly wrong, and a reason for every option. A mix of types and difficulties. Domain shares inside the exam weights. No answer visible by its form.
- **Cards.** The key isn't recognizable by length, by a status tag, by being the only option without "only/always/never", or by majority vote. Use the 2×2 pattern for two-part answers. The validator checks this across the whole deck.
- **Diagrams.** No text overflow, no arrow crossing a node, no hidden labels, in both languages. Checked by the validator and `audit:diagrams`.
- **Facts.** Every claim matches a current Learn page. When Learn contradicts itself, phrase the claim so it holds for both readings and note it in the README.
