# Scope discovery

Goal: before you write any content, know exactly what the exam measures and which official training teaches it. Record the results in the scaffolded app:

- `exam.json`: code, titles, links, exam format;
- `domains.ts`: domains, weights, skill bullets;
- `course.ts`: learning paths, modules, and the bullet mapping.

Work only from Microsoft Learn: use the MCP tools `microsoft_docs_fetch` and `microsoft_docs_search`, or the `mslearn` CLI.

## 1. Exam page

Fetch `https://learn.microsoft.com/credentials/certifications/exams/<code-lowercase>/`, for example `.../exams/az-104/`. Note:

- the full exam title and the role description, which tell you the audience and the tone of the scenarios;
- the **Important** box: passing score, beta status, and dates of upcoming English and localized updates;
- the link to the **study guide**, usually in a "Tip" box;
- the official **course** under "Prepare for the exam" or similar, and the self-paced learning paths;
- the **Practice Assessment** link, if the exam has one, under "Practice for the exam". Don't guess this link; copy it from the page. Some exams have none;
- the **exam sandbox**, `https://aka.ms/examdemo`, where candidates try the exam UI.

## 2. Study guide (skills measured)

Fetch `https://learn.microsoft.com/credentials/certifications/resources/study-guides/<code-lowercase>`.

- **Skills at a glance:** the domains with their weight ranges, for example "Implement … (25–30%)".
- **Skills measured:** for each domain, its groups and bullet points. These bullets are what the coverage matrix and the validator enforce.
- **Versions:** the page can list two versions, for example "Skills measured as of <date>" and "Skills measured prior to <date>", or a change log for an upcoming update. Build the version that is valid **today** and record its date in `exam.json`. If an update is announced, note which bullets change, tell the user, and mention it in the app's README.
- **Numbering:** number the bullets yourself as `<domain>.<group>.<n>` (for example `2.3.4`) and say in the README that the app assigns these numbers. Keep each bullet's text as a short label for the coverage matrix and link to the study guide. Don't copy any other study-guide prose.
- **Language and audience:** the guide also lists the programming language candidates are expected to use, if any (for example "Candidates develop in Python"). Write code samples in that language.

## 3. Course, learning paths and modules

The instructor-led course number is usually the exam code plus `T00`, for example `AZ-104T00`; some use `T01` or later. The exam page links it. Resolve it:

```sh
node <skill>/scripts/learn-catalog.mjs AZ-104T00 --out catalog.json
node <skill>/scripts/learn-catalog.mjs AZ-104T00 --ts   # prints a draft course.ts
```

- **Catalog API.** The script reads the public, anonymous Learn Catalog API: `https://learn.microsoft.com/api/catalog/?type=courses,learningPaths,modules`. A course's `study_guide` lists its learning paths, and each learning path lists its modules. Microsoft calls this API legacy, superseded by the authenticated Learn Platform API.
- **Fallback.** If the script fails, fetch `https://learn.microsoft.com/training/courses/<course-lowercase>/` and each learning path page, and read the modules from them.
- **No course.** Some exams, mostly Fundamentals, have only learning paths linked from the exam page or study guide. Use those.
- **Module details.** For each module, fetch its page and note the title, URL, units and learning objectives. You need them for the mapping in step 5 and for writing the lesson.

## 4. Exam format

Read [Exam duration and exam experience](https://learn.microsoft.com/credentials/support/exam-duration-exam-experience). As of late 2026 it says:

| Exam type | Exam duration |
|---|---|
| Fundamentals | 45 minutes |
| Associate and expert role-based, without labs | 100 minutes |
| Associate and expert role-based, may contain labs | 120 minutes |
| Microsoft Office Specialist (MOS) | 50 minutes |

Most exams have 40–60 questions, and the passing score is 700, as stated on each exam page. Re-read the page instead of trusting this table, and set `exam.minutes`, `exam.questions` and `exam.passPercent` in `exam.json`.

Map the official question types to the app's types:

| Official type | App type |
|---|---|
| Multiple choice | `single` or `multi` |
| Build list | `order` |
| Drag and drop | `match` |
| Hot area, active screen | `code` (fill-in dropdowns) or `match` |
| Case studies | a case with at least 2 questions |
| Labs | not simulated; point to the module's hands-on exercises |

The app's score is a linear percentage, **not** Microsoft's scaled score. Say so in the UI and README.

## 5. Map skills to modules (the coverage matrix)

In `course.ts`, give every module the IDs of the bullets it teaches.

- Every bullet needs at least one module, and every module at least one bullet.
- Decide from the module's learning objectives and units, not from its title alone.
- If a bullet isn't taught by any module, still map it to the closest module, write the lesson section and questions from the docs, and list the gap in your final report.

Show the user the matrix (bullets per module, modules per bullet) before you start content production.

## 6. Sanity checks

- The bullet count matches the study guide, and the domain weights sum to a sensible range.
- Every module URL resolves; the template's `npm run check:links` checks this later.
- `npm run check:learn` compares the configured course and study guide with the live pages. Run it once now and again before release.
- Keep a `scope` note in the app README: the skills-outline date, the course number, the module count, and the date you checked.
