# Content policy

These rules protect the learner, the exam program and the people who publish the app. Follow them literally.

## No dumps, no leaked or official question material

- The [Microsoft Certification Exam – Candidate Agreement](https://learn.microsoft.com/credentials/support/certification-exam-candidate-agreement) forbids "using braindump material or unauthorized publication of exam questions with or without answers".
- The [exam and assessment lab security policy](https://learn.microsoft.com/credentials/support/exam-and-assessment-lab-security-policies) lists "using brain dump sites to prepare for the exam" as fraudulent activity that can lead to bans and revoked credentials.
- Never search for, open, quote or learn from dump sites, "actual exam questions" collections, leaked questions or forum threads that recall exam items. If a user provides such material, refuse to use it and explain why.
- **Official practice material is off limits for copying.** That covers the knowledge-check questions at the end of Learn modules and the official Practice Assessment. Link to them so learners use them on Learn. Never reproduce, translate or closely paraphrase their questions, options or explanations.

## Original content grounded in current documentation

- Write every lesson text, question, option, explanation and card yourself, in your own words, from facts on current learn.microsoft.com pages you actually read in this session.
- Every question cites at least one learn.microsoft.com URL that supports the answer and its explanations. Set `lastVerified` to the date you checked the sources.
- Prefer Learn pages: product docs, how-tos, SDK and REST references, Learn modules and the study guide. For code, Learn's code samples (`microsoft_code_sample_search`) and the official SDK reference pages come first.
- Community material (blogs, videos, study crams) may point you to topics, but it is never a source. Confirm every fact on Learn before you use it.
- Don't copy longer passages from Learn either. Summarize, restructure and illustrate. Short quotes of names, parameters, limits and error messages are fine.

## Currency

Products, SDKs, APIs and models change constantly. Before you write about a feature, check:

- its **current name**. Add renamed products to `legacyNames` in `exam.json`; the validator then rejects the old name unless the text explicitly calls it a former name;
- its **status**: preview or generally available. Mark previews as such, and never let a status tag appear only in the correct option;
- its **limits, defaults and retirement dates**. For Azure OpenAI and Foundry models, the template's model-currency check reads the public [model retirement schedule](https://learn.microsoft.com/azure/foundry/openai/concepts/model-retirement-schedule); run `npm run models:refresh` and keep `model-lifecycle.json` current;
- **SDK surface**: package names, client classes, method names and parameters, against the current reference.

Time-bound facts need a date ("retires on December 16, 2026"), so the text stays true and the validator can flag it later. Never write options that will silently become correct after a date, for example "X has already retired" when X retires next month.

## When Learn contradicts itself

It happens: a how-to and a reference page disagree, or an overview lags a release. Then:

1. Prefer the more specific and more recent page (the REST or SDK reference over a migration guide, the product page over a general overview).
2. Phrase the lesson so it stays true under both readings, for example "usually file URLs" instead of "only URLs".
3. Make sure no question or card depends on the disputed detail.
4. List the conflict in the app README under "Unverified or conflicting facts", and in your report.

## Honest framing

- The app is an unofficial study aid, not affiliated with or endorsed by Microsoft. Say so in the README and on the Resources page.
- Never call questions "real" or "actual" exam questions. The app's exam score is a linear percentage, not the official scaled score.
- Product names are trademarks of their owners and are used only to describe the products.

## Diagrams, icons and images

- Diagrams are precise SVG built from data in the lesson files. They are never generated images, because generated images can't be checked for correctness.
- Official product icons may appear in diagrams under their publishers' terms; see [diagrams.md](diagrams.md). Never use lookalike or unofficial icons.
- Decorative header images are optional. If you add any, they must not contain text, logos or people, and must not look like product screenshots.

## Privacy

The app has no backend, no account and no tracking. Progress lives in the browser's `localStorage`, with export and import as JSON. Don't add analytics without the user's explicit request.
