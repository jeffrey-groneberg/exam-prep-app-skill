# Brief: flashcards with exam-style options

> Fill in the `{{…}}` placeholders before you hand this brief to an author.

## Context

The study app for Microsoft exam {{EXAM_CODE}} (app root `{{APP_DIR}}`, today {{TODAY}}) has flashcards ("Zettelkasten" in the German UI): a Leitner box with three compartments.

- Every card asks a question with **four exam-style options, exactly one correct**, and **every option has a short reason** why it is right or wrong.
- A right answer moves the card one compartment forward; a wrong one sends it back to compartment 1.
- The cards come from the lessons: one per concept, trap and takeaway.

## Input

- Lessons in `src/content/lessons/<module>.ts`: `concepts[{term, text}]`, `traps[]`, `takeaways[]`. They are already fact-checked.
- `docs/content-guide.md` has the card schema and the card ID convention `z-<module>-<kind>-<index+1>`.

## Your modules

{{MODULE_IDS}}

## Step 1: fronts and backs

Skip this step if the cards already exist.

- **One card per lesson item,** in lesson order: concepts, then traps, then takeaways. `source: { kind, index }`, where `index` is the 0-based position.
- **Front:** one precise question ending in "?", at most 120 characters. Ask what the exam tests: the decision, distinction, limit, correct name or consequence. Never reveal the answer, and vary how questions start.
- **Concept cards have no `back`;** the lesson's concept text is the answer, so write the front so that this text answers it.
- **Trap and takeaway cards** need a `back` that answers the front faithfully from the lesson item, in 1–3 sentences, with no new facts.

## Step 2: options

Add `choices` to every card: exactly 4 options with ids `a`–`d` and exactly one `correct: true`. Each option has `text {en, {{L2}}}` and `why {en, {{L2}}}`.

**The key**
- Answers the whole front, faithful to the card's answer.
- Concise: aim for at most 160 characters, never more than 220.

**Distractors**
- Plausible mistakes learners really make: the contrast the lesson draws, a confusable service, role, parameter, limit or default, a half-truth with the wrong half, or a swapped order.
- **Each must be clearly and verifiably wrong** according to a lesson in the app or a current Learn page you checked. If you can't prove it wrong, pick another.
- No "all/none of the above", no jokes, no options that are wrong only because of a typo.

**Reasons**
- One sentence each, 15–320 characters.
- For the key: the deciding fact. For a distractor: what is wrong, plus the true fact.
- Vary the openings. Label a distractor "Partly right" only if part of it is really right.

**Form must not give the key away** (the validator enforces this)
- No status tag such as "(preview)" or "(retired)" only on the key. Tag distractors accurately too, or move the status into the reason.
- The key is never the only option without "only", "always" or "never".
- **Length spread:** across your modules, the key is the longest, second, third and shortest option in roughly a quarter of the cards each, with every rank between 15% and 35%. Keep keys crisp and give two or three distractors a plausible wrong detail. Measure with `node {{SKILL_DIR}}/scripts/card-stats.mjs {{APP_DIR}}/src/content/cards {{MODULE_IDS}}`.
- **No majority vote.** For two-part answers use the 2×2 pattern: one distractor wrong in part 1, one wrong in part 2, one wrong in both, with the same wrong values reused. For three or more parts, let two distractors share a wrong value.

**Time-bound facts:** never write a distractor that will become true later, such as "X has already retired" when X retires next month.

**Language:** English and {{SECOND_LANGUAGE}} say the same thing. Product, API and role names stay in English, and inline code goes in backticks as in the lesson.

## Write and check

- Write with one shared Node helper so formatting stays stable: 2-space JSON, `$schema` first, and the key order `id, source, front, back, choices`.
- Run `npm run validate -- --only {{MODULE_IDS}}` until it shows 0 errors and 0 warnings.
- Write only your modules' card files. No state-changing git commands; use `{{SCRATCH}}` for helpers.

## Report

Keep it short:
- cards per module;
- cards where one clearly correct option was hard to form, and how you resolved them;
- distractors you verified on Learn, with their URLs;
- your length-rank table.
