# Publishing and sharing

## Create the repository

Ask the user for the repository name and visibility; private is fine for a personal study app. Then, from the app folder:

```sh
git init -b main
git add -A
git commit -m "Study app for <EXAM>"
gh repo create <owner>/<name> --private --source . --push   # or --public
```

Commit in sensible steps after that: scaffold and configuration, content per learning path, cards, review fixes, documentation.

## Enable GitHub Pages

The template contains `.github/workflows/pages.yml`, which runs `npm ci`, `npm run check` and `npm run build`, then deploys `dist/`. Turn Pages on with GitHub Actions as the source:

```sh
gh api -X POST repos/<owner>/<name>/pages -f build_type=workflow   # once
gh workflow run pages.yml   # or push to main
gh run watch
```

GitHub Pages on a private repository depends on the account's plan; the call fails with a clear message if Pages isn't available. The app uses relative asset paths and a hash router, so it works under any repository name, on a custom domain, and when opened locally from `npm run preview`.

## Feedback from learners

Every question, lesson section, diagram, code sample and card has a "Feedback" link. It opens a new GitHub issue that already names the item, quotes its text, and records the page, the language and the app version.

- `feedback.issuesUrl` in `exam.json` must point to `https://github.com/<owner>/<name>/issues/new`. Scaffolding with `--repo <owner>/<name>` sets it; when it's empty, the app shows no feedback links.
- Other learners can only open issues in a **public** repository, and they need a GitHub account. In a private repository only collaborators can report.
- Create the label the links apply: `gh label create feedback --repo <owner>/<name> --description "Reported from the app"`. GitHub applies it only for people with triage access, so it's a convenience for you.
- Triage reports like review findings: check the claim on Learn, fix it, refresh `lastVerified`, and close the issue with the commit.

Before you make a repository public, check its whole history for things that shouldn't be public: secrets, local paths, and internal package-registry URLs in `package-lock.json` (every `resolved` URL should be on `registry.npmjs.org`).

## README of the app

The template's README has placeholders. Before release, fill in:

- the live URL, plus how to run locally (`npm install`, `npm run dev`) and test (`npm run check`);
- the exam, skills-outline date, course number and the date you last checked Learn;
- question counts per domain and per learning path, the type and difficulty mix, the case studies and the card count. `npm run validate` prints them;
- the content policy: original content, sources, no dumps, no copies of official practice questions, unofficial;
- unverified or conflicting facts;
- credits: Fluent UI System Icons (MIT), and official product icons with their terms, if used.

## Share

- Send the live URL. On a phone, "Add to Home Screen" installs the app, which then works offline.
- Progress lives in each browser's `localStorage`, separately per device and address. Learners move progress with **Progress → Export/Import**.
- Colleagues who want their own copy for another exam should use this skill, not fork the app. A fork carries the old content.

## Keep it current

- Re-run `npm run check:learn` and `npm run check:links` monthly, and whenever the exam page announces an update.
- When the study guide changes, update `domains.ts` and `course.ts`, add or retire content, refresh `lastVerified` for the questions you re-checked, and regenerate `docs/coverage.md`.
- For exams about AI models, run `npm run models:refresh` so the validator knows the current retirement dates.
