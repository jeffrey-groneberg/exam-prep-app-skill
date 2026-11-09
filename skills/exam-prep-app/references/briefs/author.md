# Brief: author lessons and questions

> Fill in the `{{…}}` placeholders before you hand this brief to an author.

## Context

You're writing content for a study app for Microsoft exam {{EXAM_CODE}} ({{EXAM_TITLE}}). Today is {{TODAY}}, and the app root is `{{APP_DIR}}`.

- **Learners** prepare for the exam and need explanations from the ground up, with visuals.
- **Content** is bilingual: English, the exam language, and {{SECOND_LANGUAGE}}.
- **Gold standard:** `{{GOLD_LESSON}}` and `{{GOLD_QUESTIONS}}`. Match their structure, depth and tone.
- **Rules:** read `{{APP_DIR}}/docs/content-guide.md` for the exact schemas and rules.

## Your modules and quotas

{{MODULE_TABLE}}

The table lists module ID, the official module URL, the skills-outline bullets mapped to it, and the minimum number of primary questions per bullet.

## Non-negotiable

- **Original content only.** Never use exam-dump sites, leaked questions or "real exam" collections. Never copy or closely paraphrase Learn knowledge checks or the official Practice Assessment.
- **Current facts only.** Base every fact on current learn.microsoft.com pages that you read with the Microsoft Learn MCP tools (`microsoft_docs_search`, `microsoft_docs_fetch`, `microsoft_code_sample_search`) or the `mslearn` CLI. Check names, preview or GA status, limits, defaults and retirement dates. Never write a product name listed in `legacyNames` in `exam.json`.
- **Verified code.** Code uses the current SDK in {{CODE_LANGUAGE}}. Check every class, method and parameter against the reference or official samples.

## Steps

1. For each module, read the official module, all units, then the docs and samples it relies on.
2. Write the lesson (`src/content/lessons/<module>.ts`):
   - summary, exam focus, 1–2 step-through diagrams;
   - concepts, a comparison table, minimal code with notes;
   - traps, takeaways, sources.

   Lesson items are append-only once cards exist.
3. Write the questions (`src/content/questions/<module>.json`):
   - **Quotas:** meet the per-bullet quotas.
   - **Mix:** about 45% single, 20% multi, 10–15% each of order, match and code; difficulty about 25/50/25.
   - **Style:** scenario-first stems, plausible distractors that are clearly wrong, a `why` for every option, 1–3 source URLs that prove the key, and `lastVerified: "{{TODAY}}"`.
{{CASE_STUDY_INSTRUCTION}}
4. Run `npm run validate -- --only {{MODULE_IDS}}` until it shows 0 errors and 0 warnings for your modules. Errors in other modules aren't yours.
5. If you changed diagrams and the dev server runs at `{{DEV_URL}}`, run `npm run audit:diagrams -- {{SCRATCH}}/audit {{DEV_URL}} {{MODULE_IDS}}` and look at the PNGs.

## Rules

- Write only your modules' files. Don't run git commands that change state.
- Use `{{SCRATCH}}` for helper scripts and temporary files, not the app repo or `/tmp`.

## Report

Keep it short:
- lessons written, and questions per module, type and difficulty;
- anything ambiguous in the docs and how you resolved it;
- facts where Learn pages disagree, with both URLs;
- every non-obvious fact with the URL you verified it on.
