# Brief: delta check (one round only)

> Fill in the `{{…}}` placeholders and send this to the **same** reviewer who did the first review of these modules.

## What changed

The authors of your modules ({{MODULE_IDS}}) finished a fix pass:

{{AUTHOR_SUMMARY}}

The summary lists findings applied or rejected with reasons, items restructured (for example 2×2 option sets or rebalanced lengths), and lesson changes.

## Tasks

1. **Your findings.** For each finding in `{{SCRATCH}}/review-{{GROUP}}.json`, read the current item and confirm it was applied correctly, or that the author's reason for deviating holds.
2. **Spot check.** Pick about 8 items you did NOT review before, spread across your modules, and prefer the restructured ones. Run the same checks as in your first review: key, distractors, reasons, currency, code, giveaways, language.
3. **Report only material findings:** a wrong or incomplete key, a defensible distractor, a factually wrong reason, a language mismatch that changes the meaning, or a new giveaway. Give each one a complete replacement. Skip style polish.

## Output

Write `{{SCRATCH}}/delta-{{GROUP}}.json`:

```json
{ "group": "{{GROUP}}", "checked": ["…"], "findingsVerified": [{ "id": "{{GROUP}}-01", "status": "ok | not-applied | wrong", "note": "" }], "findings": [ … ], "notes": "" }
```

Entries in `findings` use the same shape as in the first review. Don't edit repository files. There is no further round.
