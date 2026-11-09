# Diagrams

Learners who think in pictures depend on the diagrams more than on any other part of the lesson. The template renders diagrams from data: nodes, edges, groups and steps in the lesson file. The validator measures their geometry with the renderer's own code. The exact rules (canvas width, text capacity per shape, label placement, padding) are in the scaffolded app's `docs/content-guide.md`.

## Design a diagram

- **One idea per diagram.** The first diagram of a lesson is the big picture: who calls what, where data lives, which identity is used. The second zooms into the flow the exam asks about most.
- **Flow direction:** left to right, or top to bottom. Arrange rows and columns so straight arrows never cross a node; use `via` points for detours.
- **Containment** (resource ⊃ project ⊃ agent, "your app", a virtual network) is a group, not an arrow.
- **Arrow meaning:** an arrow means a call or data flow in its direction, and the label says what moves ("query", "tokens", "SAS URL"). Use `bidir` only for real request-and-response pairs that you don't want to draw twice.
- **Tones encode roles,** and labels are always present so color is never the only cue: user, app, platform, model, data, tool, safety, external, neutral.
- **Steps:** 3–6 steps, each focusing the nodes and edges it talks about and explaining one idea in 1–3 sentences. A learner should be able to follow the flow by stepping through without reading the lesson text.
- **Both languages must fit.** German labels run about 20–30% longer than English; size nodes for the longer one.

## Check a diagram

1. Run `npm run validate -- --only <module>`. It reports overflowing text with the width or height a line needs, arrows through nodes or group titles, overlapping nodes and labels without a free spot.
2. Run the render audit with the dev server running (`npm run dev`, then `npm run audit:diagrams -- <outdir> http://localhost:5173/ <module>`). It renders every diagram in both languages in a real browser and writes PNGs. Look at them yourself: correct arrow directions, no clipped text, labels next to the arrows they describe.
3. Check content against Learn: are the components real, are the arrows pointing the right way, are the steps in the order the docs describe?

## Official product icons

Icons next to product names make diagrams far easier to scan. Use only official icon sets, under their terms:

| Icon set | Page |
|---|---|
| Azure architecture icons | https://learn.microsoft.com/azure/architecture/icons/ |
| Microsoft 365 architecture icons | https://learn.microsoft.com/microsoft-365/solutions/architecture-icons-templates |
| Dynamics 365 icons | https://learn.microsoft.com/dynamics365/get-started/icons |
| Microsoft Entra architecture icons | https://learn.microsoft.com/entra/architecture/architecture-icons |
| Microsoft Fabric icons | https://learn.microsoft.com/fabric/fundamentals/icons |
| Power Platform icons | https://learn.microsoft.com/power-platform/guidance/icons |

The Azure icon terms, as of late 2026, read: "Microsoft permits the use of these icons in architectural diagrams, training materials, or documentation. You can copy, distribute, and display the icons only for the permitted use unless granted explicit permission by Microsoft." A study app is training material, so its diagrams may use them. The guidelines also ask you not to crop, flip, rotate or distort icons, and to put the product name near the icon. The app's labels already do that.

How to add icons to a scaffolded app:

1. Show the user the icon set's terms and ask them to agree before you download the set.
2. Copy only the icons you use into the app's diagram-icon folder, with stable kebab-case names, and register them in the icon registry (see `docs/content-guide.md`).
3. List every icon with its source set, file name and the terms URL in the folder's `NOTICE.md`, and credit the set in the README.
4. Use an icon only where the node names that product. Never use a product icon for a generic concept or for your own app.

The skill repository itself doesn't redistribute any product icons. Each app downloads what it needs.
