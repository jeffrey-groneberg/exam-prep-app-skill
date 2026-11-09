# Brief: independent review (read-only, one round)

> Fill in the `{{…}}` placeholders before you hand this brief to a reviewer.

## Context

The study app for Microsoft exam {{EXAM_CODE}} (app root `{{APP_DIR}}`, today {{TODAY}}) was written by several authors. You review a sample once and independently. You didn't write any of it.

## Your sample

{{SAMPLE}}

For example: in modules X, Y and Z, every code question, every case-study question, every third other question, every lesson code sample, and every fourth flashcard in file order.

## Check every sampled item

1. **Answer key.** The marked answer is right according to current Microsoft Learn and answers the whole question.
2. **Distractors.** Each wrong option is clearly and verifiably wrong. Flag any that is true, partly true or defensible by an expert; the worst error is two right answers. Also flag any so absurd that it gives the answer away.
3. **Reasons and explanations.** Every `why` is accurate, fits its own option and invents nothing.
4. **Currency.** Names, preview or GA status, limits, defaults and dates are current. Flag anything time-bound that will silently become wrong.
5. **Code.** Classes, methods and parameters exist in the current SDK and are used correctly.
6. **Giveaways.** The key can't be found by form alone: much longer, the only precise option, the only one repeating the stem's words, the only one without "only/always/never", a status tag only on the key, or the majority vote across options.
7. **Language.** Both languages say the same thing, and product and API names stay in English.

Verify with the Microsoft Learn MCP tools (`microsoft_docs_search`, `microsoft_docs_fetch`, `microsoft_code_sample_search`) whenever a claim goes beyond the lesson or you're unsure. Never use dump sites, forums or videos as evidence.

## Rules

Don't edit any repository file and don't run git commands that change state.

## Output

Write `{{SCRATCH}}/review-{{GROUP}}.json`:

```json
{
  "group": "{{GROUP}}",
  "checked": ["ids of every item you reviewed"],
  "findings": [
    {
      "id": "{{GROUP}}-01",
      "severity": "error | minor",
      "item": "question, card or lesson id",
      "option": "a | b | … | key | lesson",
      "problem": "what is wrong",
      "evidence": [{ "url": "https://learn.microsoft.com/…", "quote": "short exact quote" }],
      "fix": { "text": { "en": "…", "…": "…" }, "why": { "en": "…", "…": "…" }, "correct": false }
    }
  ],
  "notes": "patterns across the sample, source conflicts, lesson-level issues"
}
```

- **`error`:** a wrong key, a second defensible answer, a factually wrong reason, outdated facts, broken code, or a giveaway.
- **`minor`:** imprecise or clumsy wording.
- **`fix`** is the complete replacement for that option in all languages. For lesson-level issues, describe the exact replacement text in `problem`.

Return a short summary: items checked, findings by severity, and one line per error.
