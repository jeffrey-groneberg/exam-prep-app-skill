# Authoring lessons, questions, cases and cards

The scaffolded app's `docs/content-guide.md` holds the exact schemas, ID rules and validator limits. This file covers the craft. Read both before you write the gold-standard module.

## Lessons: explain from the ground up

Assume the learner knows the general field but has little hands-on experience with these products.

1. **Summary**, 3–5 sentences: what the thing is, why it exists, how the pieces fit.
2. **Exam focus**: how the exam probes this module's skills, such as decisions between services, limits, roles, sequences and code shapes. Base it on the study guide bullets mapped to the module.
3. **One or two step-through diagrams.** Start with the big picture, then a closer look at the one flow the exam loves; see [diagrams.md](diagrams.md).
4. **Concepts.** 4–8 terms, each explained in 1–3 sentences. Define every acronym and every product-specific term at first use.
5. **Comparison table.** "Which service, option or tier for which task" is where exam decisions live.
6. **Code.** 1–2 minimal samples in the exam's language, using the current SDK. Show only the architectural seam (client, call, key parameters) and explain it in 1–3 notes. Check every class, method and parameter against the current reference or Learn code samples.
7. **Traps.** 3–7 exam traps: the confusable pair, the tempting default, the limit, the retired name, the step order. Each trap states the wrong belief and the truth.
8. **Takeaways.** 3–6 short rules a learner can recall under time pressure.
9. **Sources.** 2–5 specific Learn pages, including the official module.

**Lesson items are append-only.** Each flashcard references a concept, trap or takeaway by its position. Add new items at the end of their list; never insert, reorder or delete without updating the cards.

**Do a reader test.** Have a fresh reader with no context read each lesson and list unexplained terms, contradictions and gaps; a sub-agent works well. Fix what they find. It catches much that authors don't see.

## Questions: original, scenario-first, fair

**Stems**
- Lead with the scenario: "Your company …", "You need to …". Ask one clear thing.
- For multiple select, say "Which TWO …" or "Which THREE …".
- No trick negations, no "all of the above", no trivia that the docs don't support.

**Distractors**
- Real products, parameters, roles and methods that fit a different scenario, the confusable pair from the lesson, or a half-truth with the wrong half.
- Each must be clearly and verifiably wrong. If an expert could defend it, replace it.
- Never invent fake APIs unless the explanation says plainly that they don't exist.

**Explanations**
- Every option, item, prompt and blank option gets a short `why`: why it is right, or what is wrong and what is true instead. The `explanation` states the rule to remember.

**Form must not give the answer away**
- The key is not systematically the longest, the only precise option, the only one repeating the stem's words, or the only one without "only/always/never".
- Vary which option is correct.

**Mix**
- Type: about 45% single, 20% multi, and 10–15% each of order, match and code.
- Difficulty: about 25% recall, 50% apply, 25% analyze.
- Domain shares within the study guide's weight ranges.
- Volume: at least 2 primary questions per skills-outline bullet, more for heavy domains. The default total is at least 200, or more than the official module knowledge checks add up to.

**Case studies**
- A scenario of 150–300 words covering company, current state, requirements and constraints, with 3–5 questions that need it.
- One case per learning path is a good target.

**Code questions**
- Short templates (15 lines or fewer) with 1–3 blanks and 3 options per blank, all real API members.
- The code must run against the current SDK when the blanks are filled correctly.

**Sources and `lastVerified`**
- 1–3 specific Learn URLs per question that prove the key. Open each one.
- `lastVerified` is the date you did.

## Bilingual text

- English is the exam language; write it in clear exam style. The second language (German in the template) must be natural, not a word-for-word translation, and address the learner informally ("du").
- Product, service, API, SDK, parameter and role names stay in English in both languages, exactly as Learn writes them.
- Code stays identical in both languages.
- Both languages must say the same thing. Reviewers check this.

## Flashcards

Each card is one flashcard per concept, trap and takeaway, stored in `src/content/cards/<module>.json` and asked as a 4-option multiple-choice question with a reason per option.

**Front**
- One precise question ending in "?", at most 120 characters, answerable from the card's answer.
- It asks what the exam tests: the decision, distinction, limit, correct name or consequence. It must not reveal the answer.

**Answer**
- Concept cards use the lesson's concept text as the answer.
- Trap and takeaway cards carry a `back` that restates the lesson item faithfully, with no new facts.

**Options**
- Exactly 4, exactly one correct; the app shuffles them.
- Each `why` is 15–320 characters.
- No "all/none of the above", no page references ("see the table").

**Answer-cue rules** (the validator enforces them per card and across the deck)
- **Status tags.** No tag such as "(preview)", "(GA)" or "(retired)" appears only on the key.
- **Absolute words.** The key is never the only option without "only", "always" or "never".
- **Length.** The key isn't much longer than every distractor. Across the deck, it is the longest option in at most a third of the cards, and one of the two longest in at most 60%. Aim for a spread of about a quarter per length rank: crisp keys, with two or three distractors carrying a plausible wrong detail.
- **Majority vote.** If each distractor changes exactly one part of the key, the key is the option that agrees with the majority on every part. Use the **2×2 pattern** for two-part answers: one distractor wrong in part 1, one wrong in part 2, one wrong in both, reusing the same wrong values. For answers with three or more parts, let at least two distractors share a wrong value.

Use the [card brief](briefs/cards.md) when you delegate.

## Writing workflow per module

1. Read the official module (all units), then the product docs and code samples it relies on.
2. Write the lesson, then the questions, then the cards.
3. Run `npm run validate -- --only <module>` until it shows 0 errors and 0 warnings.
4. After diagram changes, run the diagram audit; see [quality-gates.md](quality-gates.md).
5. Touch only the files of your own modules.
