# Quality gates

Run these before every release. The GitHub Pages workflow runs `npm run check` and `npm run build`, and blocks deployment if either fails.

## Automated

| Command | Passes when |
|---|---|
| `npm run check` | Lint, typecheck, tests and the content validator pass, the validator with **0 errors and 0 warnings** |
| `npm run build` | The production build and PWA precache succeed. A large card deck lives in its own chunk; keep every precached file under the configured size limit |
| `npm run validate -- --matrix` | Writes `docs/coverage.md` (skill → module → lesson → questions); commit it |
| `npm run audit:diagrams` | Every diagram renders in both languages without overflow or hidden arrows. Needs the dev server and Playwright. Look at the PNGs |
| `npm run check:learn` | The configured course and study guide still match the live Learn pages |
| `npm run check:links` | Every cited URL resolves |
| `npm run sources:titles` | Every cited URL has a fetched page title, which the app shows as the link text |

**The validator covers:**
- **Coverage:** every bullet has questions and every module has a lesson, questions and cards.
- **Question shape:** per-type rules, and a `why` for every option in both languages.
- **Sources:** learn.microsoft.com URLs, with a `lastVerified` date that isn't in the future.
- **Currency:** legacy product names, and retired or deprecated models.
- **Diagram geometry.**
- **Card rules,** including the answer-cue rules.

It reads the thresholds from `exam.json`.

## Visual check (bounded)

Take Playwright screenshots in one batch: Chromium at 1280×900 and WebKit with the iPhone 15 profile, in both languages. Cover:
- Home, Learn and a lesson (step through one diagram);
- a practice question after answering;
- exam start and exam result;
- a review round;
- a flashcard round after "Check";
- Progress, Coverage and Resources.

**Look for:**
- text overflow, clipped labels, or sideways scrolling on the phone;
- touch targets smaller than 44 px;
- focus that isn't visible, or low contrast;
- the other language leaking into a screen;
- empty states that don't make sense.

Fix everything you find in one batch, then confirm with at most one more batch. Don't loop beyond that.

## Content spot checks you do yourself

- Read 5 random questions per domain as a learner would. Can you answer them from the lesson and the cited page?
- Run a 10-question exam simulation and check that the domain mix follows the weights.
- In the flashcards, answer a few cards wrong on purpose and check that each reason explains the mistake.

## Offline and PWA

After the build, serve `dist/` or open the live site:
1. Load it once and reload, so the service worker controls the page.
2. Switch the browser offline and reload.
3. Open a lesson, answer a question and finish a flashcard.

Do this in both Chromium and WebKit.

## Live verification after deployment

- Wait for the Pages workflow (`gh run watch`).
- Open the live URL on desktop and the iPhone profile and check the main screens.
- Make sure the newest content is live; for example, search the page for a fact you just changed.
- Make sure the service worker serves the new version after a reload.
