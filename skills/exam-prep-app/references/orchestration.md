# Orchestration: producing and reviewing content at scale

A full exam means 20–40 lessons, 200+ questions and 400–600 cards. If your environment supports sub-agents (background tasks), split the work as described below. If it doesn't, do the same steps yourself, one batch at a time.

## Principles

- **Gold standard first.** Write one complete module yourself (lesson, questions, cards) and get the user's OK. Every author gets it as the reference for structure, depth and tone.
- **Complete briefs.** Sub-agents don't see your conversation. Give each one:
  - the brief template filled in, from `briefs/`;
  - the module list and the skills-outline bullets mapped to those modules, with a question quota per bullet;
  - today's date;
  - the paths of the gold-standard files;
  - the exact validator command.
- **Ownership.** Each author writes only its own modules' files. No author edits another's files, runs state-changing git commands or starts the dev server.
- **Batch size.** About 3 modules per author. 30 modules means about 10 authors in parallel.
- **Scratch space.** Sandboxed agents often can't write to `/tmp`. Give them a scratch folder inside the workspace or session folder, and keep helper scripts out of the app repo.
- **Stable formatting.** Write JSON with one shared writer (2-space indent, fixed key order) so diffs stay small and reviewable.

## Phases

1. **Authoring.** Give each author the [author brief](briefs/author.md). Done means `npm run validate -- --only <modules>` shows 0 errors and 0 warnings, plus a short report: counts, anything ambiguous, every non-obvious fact with its URL.
2. **Merge check.** Run the full `npm run validate`, which includes coverage and the deck-wide card checks, and `npm run check`. Fix cross-module issues yourself.
3. **Cards.** Give the card authors the [card brief](briefs/cards.md), usually the same authors and modules: fronts and backs first, then the four options.
4. **Independent review**, exactly one round. Fresh reviewers who didn't author the content each get the [review brief](briefs/review.md) and a stratified sample:
   - every code question and every case-study question, plus every third other question;
   - every lesson code sample;
   - every fourth card.

   Reviewers verify against Learn and write findings as JSON, each with a **complete replacement**.
5. **Apply.** Send each author the findings for its modules; the author knows the context and checks each fix against Learn before applying it. Alternatively, apply replacement options with a script and check them yourself. Fix lesson-level findings yourself, so that one person owns lesson changes and their effects on cards.
6. **Delta check**, exactly one round. The same reviewers verify that their findings were applied and spot-check about 8 restructured items they hadn't seen ([delta brief](briefs/delta.md)). Apply what they report. **Stop there.** Only material findings block the release: wrong keys, defensible distractors, factually wrong explanations, meaning-changing language mismatches, or giveaways.

## Turn repeated findings into rules

When reviewers keep reporting the same kind of problem, add a validator rule with a test instead of hoping authors remember. That is how the template got its rules for legacy names, the status-tag cue, the absolute-word cue, the deck-wide length-rank limits and the majority-vote measure. Rules are cheaper than another review round.

## Track the work

Keep a todo list with one item per batch and per phase, with dependencies: authoring, then merge check, then cards, then review, then apply, then delta, then quality gates, then publish. Mark items done only after their check passes.

## Communicate with the user

- Before production, show the coverage matrix and the gold-standard module.
- Report each phase briefly: what finished, what failed, what's next.
- Bring real decisions to the user, one question at a time: target size, language, publishing, conflicting docs. Don't ask about things the rules already decide.
