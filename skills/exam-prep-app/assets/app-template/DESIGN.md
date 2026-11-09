---
name: Exam Prep App
description: "Default visual system of a Microsoft Learn–style study app for one Microsoft certification exam, whose craft lives in the guided path and the step-through diagrams."
colors:
  # Neutrals (Fluent 2)
  bg: "#f5f5f5"
  surface: "#ffffff"
  surface-alt: "#fafafa"
  surface-sunken: "#f0f0f0"
  line: "#e0e0e0"
  line-soft: "#ebebeb"
  line-strong: "#d1d1d1"
  line-firm: "#c7c7c7" # literal in components.css, pages.css and zettel.css; no custom property
  ink: "#242424"
  ink-2: "#424242"
  ink-3: "#616161"
  ink-disabled: "#bdbdbd"
  # Brand (Fluent 2 web brand ramp)
  brand: "#0f6cbd"
  brand-hover: "#115ea3"
  brand-press: "#0f548c"
  brand-ink: "#0f548c"
  brand-tint: "#ebf3fc"
  brand-tint-2: "#cfe4fa"
  brand-soft: "#96c6fa"
  brand-wash: "#f5f9fe" # literal in components.css and content.css; no custom property
  # Mastery ramp of the skills map (literals in pages.css and components.css)
  mastery-seen: "#dbe9fa"
  mastery-seen-line: "#b4d6fa"
  mastery-proficient: "#62abf5"
  mastery-proficient-line: "#479ef5"
  mastery-proficient-ink: "#0a2e4a"
  # Status
  ok: "#107c10"
  ok-ink: "#0e700e"
  ok-tint: "#f1faf1"
  ok-line: "#9fd89f"
  bad: "#c50f1f"
  bad-ink: "#b10e1c"
  bad-tint: "#fdf3f4"
  bad-line: "#eeacb2"
  warn: "#bc4b09"
  warn-tint: "#fff9f5"
  warn-line: "#fdcfb4"
  mark: "#c48a00"
  # Exam domains by position in the skills outline (fill · ink · tint); a seventh domain starts over at d1
  d1: "#0f6cbd"
  d1-ink: "#0f548c"
  d1-tint: "#ebf3fc"
  d2: "#038387"
  d2-ink: "#026367"
  d2-tint: "#e6f4f4"
  d3: "#c239b3"
  d3-ink: "#8e2483"
  d3-tint: "#faeef8"
  d4: "#498205"
  d4-ink: "#3b6b04"
  d4-tint: "#eef6e6"
  d5: "#ca5010"
  d5-ink: "#9c3d0a"
  d5-tint: "#fdf0e8"
  d6: "#8764b8"
  d6-ink: "#5c2e91"
  d6-tint: "#f7f4fb"
  # Diagram tones (fill · stroke · ink)
  tone-user-fill: "#fff8e6"
  tone-user-stroke: "#b98200"
  tone-user-ink: "#6e4d00"
  tone-app-fill: "#ebf3fc"
  tone-app-stroke: "#0f6cbd"
  tone-app-ink: "#0f548c"
  tone-platform-fill: "#f0effc"
  tone-platform-stroke: "#5b5fc7"
  tone-platform-ink: "#3d3f99"
  tone-model-fill: "#e6f4f4"
  tone-model-stroke: "#038387"
  tone-model-ink: "#025b5e"
  tone-data-fill: "#eef1f4"
  tone-data-stroke: "#52657a"
  tone-data-ink: "#34495e"
  tone-tool-fill: "#fdf0e8"
  tone-tool-stroke: "#ca5010"
  tone-tool-ink: "#8a3707"
  tone-safety-fill: "#fdf3f4"
  tone-safety-stroke: "#c50f1f"
  tone-safety-ink: "#8e0a16"
  tone-external-fill: "#f0f7e9"
  tone-external-stroke: "#498205"
  tone-external-ink: "#355e04"
  tone-neutral-fill: "#ffffff"
  tone-neutral-stroke: "#8a8a8a"
  tone-neutral-ink: "#424242"
  diagram-dim-ink: "#858585" # literal in content.css; no custom property
  # Code (VS Code Light+)
  code-bg: "#f7f7f7"
  tok-keyword: "#0000ff"
  tok-string: "#a31515"
  tok-comment: "#008000"
  tok-number: "#098658"
  tok-call: "#795e26"
  tok-class: "#1f6e86"
  tok-builtin: "#795e26"
typography:
  display:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "36px"
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.01em"
  section:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: "30px"
  subheadline:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
  title:
    fontFamily: "'Segoe UI Variable Display', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
  diagram-title:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
  stem:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "26px"
  lead:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "27px"
  reading:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "24px"
  item:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  body-strong:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
  meta:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
  caption:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  chip:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    letterSpacing: "0.02em"
  badge:
    fontFamily: "'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "20px"
  code:
    fontFamily: "'Cascadia Code Variable', 'Cascadia Code', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: "21px"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  tile: "6px"
  circle: "50%"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s8: "32px"
  s10: "40px"
  s12: "48px"
  s16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-primary-active:
    backgroundColor: "{colors.brand-press}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-alt}"
  button-subtle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  button-subtle-hover:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
  button-subtle-on:
    textColor: "{colors.brand}"
  button-danger:
    backgroundColor: "{colors.bad}"
    textColor: "{colors.surface}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "32px"
  button-danger-hover:
    backgroundColor: "{colors.bad-ink}"
  button-disabled:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-disabled}"
  button-small:
    padding: "0 10px"
    height: "28px"
  button-large:
    padding: "0 20px"
    height: "40px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    size: "28px"
  icon-button-hover:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
  icon-button-large:
    size: "40px"
  app-mark:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    rounded: "7px"
    size: "32px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px 24px 24px"
  lesson-body:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "24px 32px 32px"
  callout:
    backgroundColor: "{colors.surface-alt}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  callout-exam:
    backgroundColor: "{colors.brand-wash}"
  callout-warn:
    backgroundColor: "{colors.warn-tint}"
  domain-chip-d0:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-2}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d1:
    backgroundColor: "{colors.d1-tint}"
    textColor: "{colors.d1-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d2:
    backgroundColor: "{colors.d2-tint}"
    textColor: "{colors.d2-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d3:
    backgroundColor: "{colors.d3-tint}"
    textColor: "{colors.d3-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d4:
    backgroundColor: "{colors.d4-tint}"
    textColor: "{colors.d4-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d5:
    backgroundColor: "{colors.d5-tint}"
    textColor: "{colors.d5-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  domain-chip-d6:
    backgroundColor: "{colors.d6-tint}"
    textColor: "{colors.d6-ink}"
    typography: "{typography.chip}"
    rounded: "{rounded.sm}"
    padding: "0 7px"
    height: "20px"
  skill-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
    height: "20px"
  tag:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    padding: "0 6px"
    height: "20px"
  tag-brand:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  status-pill:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-2}"
    rounded: "11px"
    padding: "0 8px"
    height: "22px"
  status-pill-on:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  status-pill-ok:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok-ink}"
  status-pill-bad:
    backgroundColor: "{colors.bad-tint}"
    textColor: "{colors.bad-ink}"
  toggle-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "15px"
    padding: "0 12px"
    height: "30px"
  toggle-chip-pressed:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    padding: "6px 14px"
  segmented-option-pressed:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "34px"
  count-badge:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
    typography: "{typography.badge}"
    rounded: "10px"
    padding: "0 6px"
    height: "20px"
  topnav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.body}"
    padding: "0 12px"
    height: "56px"
  topnav-link-hover:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink}"
  topnav-link-active:
    textColor: "{colors.brand}"
    typography: "{typography.body-strong}"
  tabbar-link:
    textColor: "{colors.ink-3}"
    typography: "{typography.badge}"
    padding: "8px 0 6px"
  tabbar-link-active:
    textColor: "{colors.brand}"
  menu-link:
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "44px"
  menu-link-active:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand}"
  station-dot:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.circle}"
    size: "20px"
  station-dot-done:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  station-dot-next:
    backgroundColor: "{colors.surface}"
    size: "28px"
  stepper-dot:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.circle}"
    size: "28px"
  stepper-dot-current:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  stepper-dot-done:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand}"
  choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  choice-hover:
    backgroundColor: "{colors.brand-wash}"
  choice-picked:
    backgroundColor: "{colors.brand-tint}"
  choice-correct:
    backgroundColor: "{colors.ok-tint}"
  choice-wrong:
    backgroundColor: "{colors.bad-tint}"
  choice-letter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.sm}"
    size: "24px"
  choice-letter-picked:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  session-bar:
    backgroundColor: "{colors.surface}"
  session-bar-correct:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok-ink}"
  session-bar-wrong:
    backgroundColor: "{colors.bad-tint}"
    textColor: "{colors.bad-ink}"
  diagram-frame:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  diagram-canvas:
    backgroundColor: "{colors.surface-alt}"
    padding: "12px 16px"
  diagram-edge-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "10px"
    padding: "0 9px"
    height: "20px"
  diagram-edge-label-focus:
    textColor: "{colors.brand-ink}"
  diagram-step-dot:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.circle}"
    size: "28px"
  diagram-step-dot-done:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  diagram-step-dot-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  diagram-narration:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.ink-2}"
    typography: "{typography.reading}"
    padding: "12px 20px 16px"
  diagram-summary:
    backgroundColor: "{colors.brand-wash}"
    rounded: "{rounded.md}"
    padding: "16px 10px"
  diagram-summary-tile:
    rounded: "{rounded.lg}"
    size: "46px"
  meter:
    backgroundColor: "{colors.surface-sunken}"
    rounded: "4px"
    height: "8px"
  meter-large:
    rounded: "6px"
    height: "12px"
  skill-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-3}"
    rounded: "{rounded.tile}"
    width: "44px"
    height: "36px"
  skill-tile-seen:
    backgroundColor: "{colors.mastery-seen}"
    textColor: "{colors.brand-ink}"
  skill-tile-proficient:
    backgroundColor: "{colors.mastery-proficient}"
    textColor: "{colors.mastery-proficient-ink}"
  skill-tile-mastered:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
  code-block:
    backgroundColor: "{colors.code-bg}"
    textColor: "{colors.ink}"
    typography: "{typography.code}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  inline-code:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1px 5px"
  code-blank:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "26px"
  feedback-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  feedback-link-hover:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.brand}"
  feedback-link-icon:
    textColor: "{colors.ink-2}"
    size: "28px"
  exam-clock:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
    rounded: "14px"
    padding: "0 10px"
    height: "28px"
  exam-clock-low:
    backgroundColor: "{colors.bad-tint}"
    textColor: "{colors.bad-ink}"
  zettel-box:
    backgroundColor: "{colors.surface-alt}"
    rounded: "{rounded.md}"
    padding: "10px 12px 12px"
  zettel-box-goal:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  zettel-divider:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 12px 8px 14px"
    height: "56px"
  zettel-divider-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.sm}"
    padding: "0 10px"
    height: "20px"
  zettel-divider-path:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.ink}"
  zettel-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  zettel-stage-pill-1:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-2}"
    rounded: "8px"
    padding: "0 7px"
    height: "18px"
  zettel-stage-pill-2:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-ink}"
  zettel-stage-pill-3:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface}"
  zettel-rate-miss:
    backgroundColor: "{colors.bad-tint}"
    textColor: "{colors.bad-ink}"
    rounded: "{rounded.sm}"
    height: "52px"
  zettel-rate-hit:
    backgroundColor: "{colors.ok-tint}"
    textColor: "{colors.ok-ink}"
    rounded: "{rounded.sm}"
    height: "52px"
---

# Design System: Exam Prep App

## Overview

**Creative North Star: "The Category Standard, Played Straight"**

This is the template's default visual system for a study app for one Microsoft certification exam: a Microsoft Learn–style app assembled from Fluent 2 parts. A #f5f5f5 ground, white panels lifted by soft two-part shadows, one brand blue, the Segoe UI stack for everything you read and Cascadia Code for everything you type. It does not reinvent the category; it plays it straight and puts the craft in the guided path, in the step-through diagrams and, as PRODUCT.md puts it, in "the precision of every state."

The visual system stays the same from exam to exam; everything exam-specific comes from content files. `src/content/exam.json` names the app (`appName`, `shortName`, the `badge` in the header mark and the app icons), sets the default language, the exam length, the pass guideline and the code language, and holds the official links. `src/content/domains.ts` holds the skills outline (domains with their weights, skill groups, bullets and one Fluent icon per domain), and `src/content/course.ts` the learning paths and modules of the official course. Every UI string lives in the typed dictionaries `src/i18n/en.ts` and `src/i18n/de.ts`. Labels quoted in this document are the English ones, with the German counterpart in parentheses where its length matters for layout.

The density is a study desk's: data-dense where the learner checks where they stand (the guided path, readiness meters, the skills map, tables) and generous where they read (prose held near 54 characters at 15–17px). Picture first: every lesson opens on a hand-built SVG diagram whose nodes are typed by tone and whose steps light one part at a time while the rest recedes but stays legible. Every screen keeps the next step in view: the "Up next" card, the Review count in the navigation, the session bar's single "Next".

Two things are rejected on purpose. The generic card-grid dashboard template: the home is a guided path beside a next-step column, not a grid of stat tiles. And gamification: no achievement badges, streak pressure or confetti. The craft bar is set by well-made learning products such as Microsoft Learn, Khan Academy and Duolingo, without the game layer.

**Key Characteristics:**
- Fluent 2 neutrals: a #f5f5f5 ground with white panels at 8px corners on the soft shadow-4.
- One brand blue (#0f6cbd) for "act here" and "you are here"; status green and red appear only after an answer is revealed (the one exception: the exam clock turns red in its last 10 minutes).
- Six domain hues, assigned by a domain's position in the skills outline, and nine diagram tones for node types, always paired with words.
- Segoe UI stack, sentence case, no uppercase labels, tabular numerals for every count.
- Signatures: the step-through diagram (typed tones, six shapes, measured labels, focus/context/dim), the guided path of stations and the flashcard box (three compartments, exact counts, the card that flies into its compartment).
- Two languages, one layout: the EN/DE toggle switches the UI and the content together. German copy runs longer, so buttons, labels and diagram nodes are sized and checked for both.
- Phones get a five-tab bar plus a Menu; below 1100px the Menu also holds the secondary sections; sticky parts stick only while they fit.

**Where it lives.** `src/styles/tokens.css` holds the custom properties; `base.css` the reset, links, the focus ring, inline code and the reduced-motion switch; `components.css` the shell, buttons, chips, meters, callouts, form controls, tables, the Menu and the tab bar; `content.css` diagrams, code, questions and sessions; `pages.css` the pages, the breakpoints and the touch targets; `zettel.css` the flashcards. The flashcard feature keeps its German name in code: the German UI calls it Zettelkasten (and its stages "Fach 1" to "Fach 3"), its classes use the `zbox` and `zk-` prefixes, a compartment is a `Fach`, and the front matter's `zettel-` components belong to it.

**Names.** The colour names in this document (Fluent Ground, Quiet Wash, Sunken Grey, Brand Wash, Firm Line, Receded Text Grey and the rest) and every rule title are this document's own descriptive names; the front matter lists each colour under its CSS custom-property name where one exists. The CSS is the source of truth: where this document and the CSS disagree, the CSS wins and this document gets fixed.

## Colors

Fluent 2's light palette played straight: near-white neutrals, one saturated brand blue, and colour spent only on meaning (domains, node types, verdicts).

### Primary
- **Fluent Brand Blue** (#0f6cbd): primary buttons, the active nav link and its 3px underline, the current stepper step and the next station, the active diagram step dot and lit arrow, focus rings, the count badge, the app mark and links. Hover darkens to #115ea3, press to #0f548c.
- **Brand Ink** (#0f548c): text on brand tints (tags, toggle chips, code blanks, the exam clock, done step dots, index tabs, stage 3 counts).
- **Brand Tint** (#ebf3fc) and **Brand Tint Deep** (#cfe4fa): picked answers, done steps, answered exam cells, the paper of stage 3 in the card box and the "Next up" tag; Tint Deep also borders the brand-wash containers and the lesson's flashcard bridge, and is the text-selection colour.
- **Brand Soft** (#96c6fa): the first level of the mastery bar, the card edges and split-bar segment of stage 2, the ring of the box's forward chips and the ruled line under a card's head.
- **Brand Wash** (#f5f9fe): a literal, not a custom property. The quiet blue containers: diagram narration, the home thumbnail, exam callouts, answer hover, empty matching slots.
- **Mastery ramp** (literals from the Fluent brand ramp, named by the skills-map legend): Seen tiles #dbe9fa on #b4d6fa; Proficient tiles #62abf5 on #479ef5 with #0a2e4a numbers; Mastered is Fluent Brand Blue with white numbers. #479ef5 also fills the mastery bar's middle level and Leitner box 4.

### Secondary
Six domain hues, each a fill · ink · tint triple (`--d1` … `--d6`). A domain takes the hue of its position in the skills outline (`domainHue` in `src/content/outline.ts`), not of its id, so any exam gets distinct colours whatever its domains are called:

| Slot | Fill | Ink | Tint |
|---|---|---|---|
| 1, blue (the brand blue itself) | #0f6cbd | #0f548c | #ebf3fc |
| 2, teal | #038387 | #026367 | #e6f4f4 |
| 3, magenta | #c239b3 | #8e2483 | #faeef8 |
| 4, green | #498205 | #3b6b04 | #eef6e6 |
| 5, orange | #ca5010 | #9c3d0a | #fdf0e8 |
| 6, purple | #8764b8 | #5c2e91 | #f7f4fb |

A seventh domain starts over at hue 1. Three class families carry the hues, with N = 1–6: `.domain-N` sets the chip variables (domain chips, pressed domain filter chips), `.bg-domain-N` paints fills (readiness meters, due stack-bar segments and legend dots, exam report bars) and `.ink-domain-N` colours icons (readiness rows, skills-map rows). N = 0 is the neutral grey of a domain id the outline doesn't know: a Tertiary Ink fill, Secondary Ink text and a Sunken Grey tint. Fills draw bars, dots and icons; -ink sets domain-chip text; -tint backs domain chips and pressed domain filters, with the fill as their border. Each domain names its own Fluent icon in `src/content/domains.ts`; that icon, in the domain fill, marks the domain on the readiness card and the skills map.

### Tertiary
- **Diagram tones**: nine node types, each fill · stroke · ink, named in the diagram legend: Person (`user`, amber), Your app / SDK (`app`, blue), Platform service (`platform`, indigo; German "Plattformdienst"), Model (`model`, teal), Data / index (`data`, slate), Tool / function (`tool`, orange), Safety / guardrail (`safety`, red), External system (`external`, green) and Other (`neutral`, grey). `platform` marks the managed platform service the exam centres on and its resources; `app` marks the learner's own code and SDK calls. Fills are pale, strokes saturated at 1.5px, and the ink colours group titles and the thumbnail's tile glyphs.
- **Receded Text Grey** (#858585): the one colour dimmed diagram text takes; it keeps at least 3:1 on the canvas.

### Neutral
- **Fluent Ground** (#f5f5f5): the page behind everything, and the installed app's background colour.
- **Fluent Surface** (#ffffff): panels, bars, controls, choices, diagram frames; white text on brand and status fills uses the same value, and so does the installed app's theme colour.
- **Quiet Wash** (#fafafa): hover fills, the diagram canvas, callouts, pools, the card box tray and zebra rows.
- **Sunken Grey** (#f0f0f0): meter tracks, inline code, tags, stage 1 pills, subtle-button and menu-row hover, disabled buttons.
- **Hairline** (#e0e0e0) and **Soft Hairline** (#ebebeb): container borders, dividers, table rows.
- **Control Line** (#d1d1d1): borders of buttons, chips, selects, choices and segmented controls, the card box tray and its walls, learning-path dividers in the flashcard index, and the pass-guideline line on Progress.
- **Firm Line** (#c7c7c7): a literal for secondary-button hover borders, unstarted station rings, unstarted skill tiles and stage 1 of the card box (card edges and split-bar segments).
- **Fluent Ink** (#242424), **Secondary Ink** (#424242), **Tertiary Ink** (#616161), **Disabled Ink** (#bdbdbd): headings and body; explanations and secondary copy; meta, captions, labels and the card box's return path; disabled controls and drag grips.

### Status
- **Correct** (#107c10, ink #0e700e, tint #f1faf1, line #9fd89f) and **Wrong** (#c50f1f, ink #b10e1c, tint #fdf3f4, line #eeacb2): revealed answers, the session bar, feedback banners, results, flashcard verdicts and rating buttons. Wrong tint and ink also mark the exam clock in its last 10 minutes; Wrong Line fills Leitner box 1, and simulations that reached the pass guideline show as Correct bars on Progress.
- **Trap Orange** (#bc4b09, tint #fff9f5, line #fdcfb4): warning callouts, the icons of the "Exam traps" list and the card editor's line that names missing answer options.
- **Marked Amber** (#c48a00): questions marked for review in the exam (the ring and the flag in the overview).

### Code
VS Code Light+ on #f7f7f7: keywords #0000ff, strings #a31515, comments #008000 in italics, numbers #098658, calls, builtins and decorators #795e26, classes #1f6e86. The highlighter knows one language: code blocks are highlighted when exam.json `codeLanguage` is "Python" (as in the sample); any other language renders as plain Fluent Ink text.

### Named Rules
**The You-Are-Here Rule.** Brand blue means "act here" or "you are here": a primary button, the current step, the next station, the lit arrow, the focus ring. It never decorates.

**The Domain Hue Rule.** The six domain hues identify exam domains and nothing else, and a domain's hue follows its position in the skills outline. Domain-coloured text uses its -ink step on its -tint; icons, bars and dots use the fill.

**The Verdict Rule.** Green and red appear only after an answer is revealed, and always with an icon and a word (a check or dismiss circle plus "Correct!", "Partly correct" or "Not quite", "Right!" or "Wrong" on a flashcard; screen readers hear "correct" or "wrong" beside each marked option), never colour alone. The single exception is the exam clock, which takes the Wrong tint and ink in its last 10 minutes; the remaining time stays readable as text.

**The Typed Tone Rule.** In diagrams colour encodes node type, never order or emphasis. Emphasis belongs to the step state, and every diagram carries a legend of the tones it uses.

## Typography

**Display Font:** Segoe UI Variable Display (with Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial)
**Body Font:** Segoe UI Variable Text (with the same fallbacks)
**Label/Mono Font:** Cascadia Code Variable (SIL Open Font License 1.1), bundled through @fontsource-variable/cascadia-code (with Cascadia Code, ui-monospace, SFMono-Regular, Menlo, Consolas)

**Character:** Fluent's own voice. Segoe UI's open, neutral forms carry every role, with the Display optical size only on headings and a slight negative tracking there; Cascadia Code, ligatures off, carries every identifier. Segoe UI is not bundled, so it renders where it is installed and the platform UI face stands in elsewhere. The diagram's text metrics (`src/lib/text-metrics.ts`) were measured with the wider macOS system face, so labels fit with room to spare on Windows.

### Hierarchy
- **Display** (600, 28px/36px, −0.015em; 24px/32px on phones): page titles.
- **Headline** (600, 24px/32px, −0.01em; 20px/28px on phones): the module title in "Up next".
- **Section** (600, 22px/30px): lesson section headings, and the question on a flashcard in a round (18px/26px on phones).
- **Subheadline** (600, 20px/28px): learning-path titles on Learn.
- **Title** (600, 18px/24px): panel titles and the app name in the top bar.
- **Diagram title** (600, 16px/22px, text face): diagram titles; feedback-banner titles use 16px/600 too.
- **Stem** (400, 17px/26px; 16px/24px on phones; ~54ch): question stems.
- **Lead** (400, 16px/27px, ~54ch): the lesson's opening paragraph.
- **Reading** (400, 15px/24px): callout text, diagram narration, explanations, traps and takeaways, the next-card summary.
- **Item** (600, 15px/22px): module rows, glossary terms, code-sample and case-panel titles, narration titles, the question on an index card. Answer text uses the same 15px/22px at 400.
- **Body** (400, 14px/20px) and **Body strong** (600): the default; buttons, Today titles, path-group titles and subheads are Body strong.
- **Meta** (400, 13px/18px): table-of-contents links, Today meta lines and the card box's rule captions.
- **Label** (600, 12px/16px, Tertiary Ink): table heads, rail-box titles and card kinds.
- **Caption** (400, 12px/16px): meta lines, legends, notes, the footer.
- **Chip** (700, 11.5px, +0.02em): domain chips. Skill chips use 11.5px at 600.
- **Badge** (600, 11px/20px): the count badge; tab-bar labels, index tabs and stage pills use 11px/600 too.
- **Code** (400, 13.5px/21px, Cascadia): code blocks. Inline code sits at 0.88em on Sunken Grey.

### Named Rules
**The Reading Measure Rule.** Prose holds near 54ch: the lesson lead, callouts, traps and takeaways, the question stem, the explanation. Diagram narration and caption run to 56ch, per-option explanations to 56ch plus their 64px indent. A flashcard question holds 34ch (40ch above answer options) and its lesson text 62ch. Explanatory text never runs the full panel width.

**The Sentence-Case Rule.** Nothing is uppercased: titles, buttons, tabs and labels are sentence case in both languages. Codes stay as written (the DE and EN of the language toggle, exam codes, domain ids, the badge). The only positive tracking in the system is the domain chip's +0.02em.

**The Tabular Numbers Rule.** Every number that counts or changes (badges, chips, step dots, percentages, timers, scores, skill ids, dates, compartment counts) uses tabular numerals.

## Layout

One 1240px column (`--page-max`) with 24px side padding (32px top, 48px bottom) holds white panels that float on the ground 20px apart. The 56px top bar (`--topbar-h`) is full-bleed and sticky; in-page anchors land 72px below the top edge. `--read-max` holds 760px, the width of the narrow columns; the box panel and editor of a flashcard index page and the end-of-round screens use the same 760px as a literal.

- **Home:** a two-column grid. The guided path sits in a 300–400px column on the left; the right column (1fr) stacks "Up next", then the Flashcards panel, then a two-up pair, "Today" and "Exam readiness" (German "Prüfungsbereitschaft"), stretched to equal height. The right column sticks 76px from the top only while it fits the window (measured: viewport wider than 1100px and column height plus 84px within the window height); otherwise it scrolls with the page. At 1100px and below the grid collapses and the next-step column moves above the path; at 900px the pair stacks.
- **Lesson:** a white reading panel (24px top, 32px sides and bottom) beside a 260px sticky rail with "On this page" and "Skills from the study guide", 32px apart; sections are 40px apart (32px on phones). The glossary flows in two balanced columns of at least 280px. At 1100px the rail disappears; on phones the panel runs edge to edge with no corners, no shadow and 16px padding.
- **Sessions and exam:** practice, review and a flashcard round run in a 900px column over a fixed bottom bar; the exam runner uses a 1040px body between a sticky header (under the top bar) and a fixed bottom bar. On phones these routes hide the tab bar and footer.
- **Flashcards:** the overview puts the box panel (320–420px) beside the "Index" (1fr); at 1100px the index drops below, and the box panel and an open editor sit side by side while they fit (at least 380px each). An index page holds the compact box with its actions (at most 760px), then the module's cards in an auto-fill grid of at least 340px columns.
- **Progress and Coverage:** one column of full-width panels with no sidebar. Progress stacks the skills map, the module table, past simulations and data export/import; Coverage gives each domain its table, then modules → questions. Wide tables sit in a keyboard-focusable region that scrolls sideways when needed.
- **Grids:** Practice is 1.5fr beside a column of at least 260px; Review, exam setup and Resources are two-up. All stack at 900px.
- **Rhythm:** a 4px base (4, 8, 12, 16, 20, 24, 32, 40, 48, 64). Components use 8–16 inside, panels and grid cells sit 20 apart, panels pad 24, lesson sections sit 40 apart.
- **Breakpoints:** 1100px (home and flashcards single column, lesson rail hidden, Progress and Resources move into the Menu), 900px (two-up grids stack), 760px (phone shell: tab bar, tighter padding, scrolling diagram canvas, the round's box becomes a strip), 560px (tables restack, index dividers and the home box panel restack, the card editor's option pairs stack), 420px (stepper labels move under the dots) and the 380px `summary` container query of the thumbnail.
- **Phones:** pages pad 20px 16px with 104px of bottom clearance above the safe-area-aware tab bar. Shell padding never drops below the notch insets: the top bar, pages, tab bar and the session and exam bars pad with `max(<padding>, env(safe-area-inset-left/right))`, so nothing slides under the camera housing when a phone is held sideways. Short, narrow windows (760px wide or less and 500px high or less) get a 48px top bar and a compact tab bar with icon and label side by side.
- **Installed app:** the same site installs as a PWA (standalone, white theme colour, the exam.json badge on the app icons) and works offline; nothing in the layout depends on running installed.

### Named Rules
**The Sticky-Only-If-It-Fits Rule.** A column sticks only while all of it fits the window; nothing may end up out of reach. Case-study panels cap their height and scroll inside.

**The No-Sideways-Page Rule.** The page itself never scrolls sideways, down to 320px. Only diagram canvases, code blocks and, above 560px, wide tables scroll inside their own frame; grid tracks that hold questions, results or code are `minmax(0, 1fr)` so a long line can't widen them.

**The Next-Step-First Rule.** When columns collapse, "Up next" moves to the top.

**The Finger-Size Rule.** Where the main pointer is a finger, targets are at least 44px tall: buttons, segmented controls, selects, list and table links, breadcrumbs, the "Answer" disclosure of an index card. Icon buttons, diagram step dots, filter chips and skills tiles are at least 40px, and each whole guided-path station is one tap target. Selects and text fields use 16px text so iOS never zooms the page on focus, and keyboard hints hide.

## Elevation & Depth

Depth is Fluent's two-part shadow: a 2px ambient blur at 12% plus a key shadow at 14% that grows with elevation. Panels rest at shadow-4, hover and lift go to shadow-8, the Menu flyout uses shadow-16, and index cards sit at shadow-2. These are the CSS custom properties `--shadow-2`, `--shadow-4`, `--shadow-8` and `--shadow-16`; the front matter has no shadow group, so their values are listed below. Inside a panel everything rests flat on hairlines and tints, and the bars (top bar, tab bar, session and exam bars) are flat white with a 1px hairline edge.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 0 2px rgb(0 0 0 / 0.12), 0 1px 2px rgb(0 0 0 / 0.14)`): index cards on a flashcard index page.
- **Rest** (`box-shadow: 0 0 2px rgb(0 0 0 / 0.12), 0 2px 4px rgb(0 0 0 / 0.14)`): panels and the lesson body.
- **Lift** (`box-shadow: 0 0 2px rgb(0 0 0 / 0.12), 0 4px 8px rgb(0 0 0 / 0.14)`): the hovered thumbnail, a hovered skills tile, the tile tooltip, the card in a flashcard round.
- **Flyout** (`box-shadow: 0 0 2px rgb(0 0 0 / 0.12), 0 8px 16px rgb(0 0 0 / 0.14)`): the Menu panel.
- **Diagram focus** (`filter: drop-shadow(0 3px 6px rgb(0 0 0 / 0.16))`): the nodes a step lights.
- **Selection ring** (`box-shadow: inset 0 0 0 1px` in the state colour): picked, correct and wrong answers double their 1px border inward.

### Named Rules
**The Soft Fluent Shadow Rule.** Depth uses only the shipped Fluent ramp: never a hard offset shadow, never a heavier custom one.

**The Flat-Inside Rule.** Inside a panel, containers rest flat; shadow appears there only in response to the learner (the hovered thumbnail, the focused diagram node).

## Shapes

Gentle Fluent corners: 8px on containers, 4px on controls. Circles mark sequence and position, half-height pills mark status and counts, and 12px belongs to the diagram's own forms.

- **Containers** (8px): panels, callouts, choices, diagram frames, code blocks, explanations, the case panel, result items, the thumbnail, the card box tray, index dividers and cards.
- **Controls** (4px): buttons, selects, segmented controls, chips, tags, answer letters, ordering items, exam overview cells, inline code, tooltips, index tabs (top corners only).
- **Circles:** stations, stepper and diagram step dots, the narration number, module indexes, legend dots, ordering position numbers, the card box's forward chips.
- **Pills** (half the height): count badge (20px tall), status pill (22px), exam clock (28px), toggle chips (30px), meters (8px and 12px), diagram edge labels (20px); stage pills (18px) round at 8px.
- **Diagram forms:** nodes at 8px, groups at 12px with a 6/4 dash, thumbnail tiles at 12px, skills tiles at 6px, legend swatches at 3px; the app mark is a 32px square at 7px.
- **Borders:** 1px hairlines throughout; 1.5px for diagram strokes, thumbnail tiles and the card box tray; 2px for station rings and the path rail. In the interface a dashed border means open or missing: the empty answer zone, an empty matching slot, an unresolved code blank, the correct option the learner missed, an empty compartment. In diagrams dashes mark group containment and authored dashed edges; the card box draws its return path dashed.
- The active tab's 3px underline has 2px top corners.

### Named Rules
**The Two-Radius Rule.** 8px contains, 4px controls; anything rounder is a position marker, a status pill or a diagram form.

## Motion

Calm and functional: colour changes are quick, step changes ease a little slower, and two motions are authored, the diagram's step-through and the flashcard's flight. Nothing bounces, nothing scales on hover, nothing celebrates.

- **Tokens:** `--dur-fast` (150ms) for hover and state colour changes (buttons, choices, the thumbnail's border and lift, skills tiles, index dividers); `--dur` (280ms) for diagram step changes, feedback banners and verdicts, and the session bar taking its verdict tint; `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) for both.
- **Rise:** feedback banners and the session verdict fade in from 6px below over 280ms.
- **Step-through:** a step's shapes, arrows, labels and text fade and recolour over 280ms; a lit arrow's 8/6 dashes flow toward its head (0.9s per cycle, linear, the only loop); Play advances every 4.2s.
- **Flashcard flight:** after "Next" or a rating the card flies into its new compartment (460ms, `cubic-bezier(0.55, 0, 0.2, 1)`), the compartment flashes once on landing (640ms) and its count settles from 1.22× (520ms). A card without options turns in from −70° (320ms). Details are under Flashcards.
- **Lift:** a hovered skills tile rises 1px.
- **Scrolling:** on phones the diagram canvas scrolls smoothly to each step's nodes, and a checked flashcard option scrolls into view when it sits under the bar.
- **Reduced motion:** `base.css` collapses every animation and transition to 0.001ms with one iteration and turns smooth scrolling off; scripted motion reads the same preference, so a flashcard lands at once and scrolls jump.

### Named Rules
**The Motion-Means-Change Rule.** Motion shows a change of state the learner caused (a step lit, an answer revealed, a card moved) and nothing else. With reduced motion every state is still reached and still readable; only the movement goes.

## Components

### Buttons
Calm and exact: Fluent buttons that change colour on hover (150ms) and never lift or scale.
- **Shape:** gently squared (4px), 32px tall by default, 28px small, 40px large; 1px border; 14px/600 text (13px small, 15px large) with a 6px gap to a 16–18px Fluent icon, an arrow on forward actions. On touch screens (coarse pointer) every button is at least 44px tall (large 48px).
- **Primary:** brand fill, white text; hover #115ea3, press #0f548c. One per region: the next-card action, "Check", "Next", "Start lesson".
- **Secondary:** white with a Control Line border and Fluent Ink text; hover Quiet Wash with a Firm Line border.
- **Subtle:** transparent with Secondary Ink; hover Sunken Grey and Fluent Ink. Its on state ("Marked" in the exam, "Marked as read" in a lesson) turns the text brand.
- **Danger:** red fill, white text, hover red ink; destructive actions only, and always as the second step: the first button only asks ("Reset" before "Delete progress", "All back to stage 1" before "Put back", "Delete" before "Delete for good"), with a subtle "Cancel" beside it.
- **Disabled:** Sunken Grey fill, Hairline border, Disabled Ink text, not-allowed cursor.
- **Focus:** a 2px brand outline at 2px offset. Joined controls (segmented controls and the DE/EN toggle) clip anything outside their buttons, so there focus is drawn inside: a 2px Fluent Ink outline at −2px with a 1px white inner line, visible on white and on brand fills.
- **Icon buttons:** 28px (40px large) transparent squares at 4px in Secondary Ink; hover Sunken Grey, disabled Disabled Ink.

### Chips and Tags
- **Domain chip:** 20px, 4px corners, domain tint fill and domain ink text, 11.5px/700 with +0.02em, showing the domain id ("D2").
- **Skill chip:** 20px, white with a Control Line border, 11.5px/600, showing a skill-bullet id ("1.2.3").
- **Tag:** 20px on Sunken Grey, 12px/600; the brand variant ("Next up", "Next round") is Brand Tint with Brand Ink.
- **Status pill:** a 22px pill at 12px/600 on Sunken Grey; on, ok and bad variants take the brand, correct and wrong tint with their ink ("Read" on Learn, "Guideline reached" and "Below guideline" in the simulation history).
- **Filter chip:** a 30px pill, white with a Control Line border, 13px/600; hover darkens the border and text. Pressed is Brand Tint with a brand border and Brand Ink; a pressed domain filter takes its domain tint, fill border and ink.

### Cards / Containers
- **Panel:** white, 8px, shadow-4, padded 20px 24px 24px (16px on phones). The title is 18px/24px display 600; a head row can carry a 600-weight brand link with a chevron at the right ("Index", "Skills map").
- **Callout:** Quiet Wash with a Hairline, 8px, 12px 16px padding and a 20px icon. The exam variant ("How the exam tests it" in a lesson) is Brand Wash with a Brand Tint Deep border and a brand icon; the warning variant (a running simulation, the submit question, coverage gaps) takes the trap tint, line and icon colour.
- **"Today" card:** rows of a 22px brand icon, a title with meta, and a small button, divided by hairlines: "Due reviews" with "Review", "Quick round" (10 mixed questions) with "Start", "Exam simulation" (length from exam.json, last score) with "Simulation". The due row adds an 8px segment bar in domain fills (2px gaps) with a dot legend, and its button turns primary when something is due.
- **"Exam readiness" card:** one row per domain: the domain's own 20px icon in its fill, short name and weight, a tabular percentage and an 8px meter in the domain fill; a caption explains that "retained" means answered correctly across reviews, not just clicked. Its head links to the "Skills map".
- **Explanation, inline quiz, case panel, result item:** white or Quiet Wash with a Hairline at 8px, never a shadow.

### Empty States
A freshly scaffolded app without content renders instead of crashing, and every empty state names the file that fills it. "Up next" says "No content yet" over a line that points to `src/content/course.ts` (learning paths and modules) and `src/content/domains.ts` (the skills outline); the guided path, Learn and Coverage show an empty block (a 28px brand glyph above Secondary Ink text, 12px apart); "Exam readiness" and the skills map show the same hint as a caption. "Start simulation" stays disabled with a note until the question bank has questions, and the flashcard index says that own cards work anyway.

### Inputs / Fields
- **Select:** 34px, white, Control Line border with a Tertiary Ink bottom edge (Fluent's underline), 4px, 14px.
- **Text field** (the card editor): white, Control Line border with a Tertiary Ink bottom edge that turns brand on focus, 4px, 16px/22px; single-line fields and selects there are 40px tall.
- **Segmented control:** a joined 4px group with Control Line dividers, 13px/600 Secondary Ink, 6px 14px padding; hover Quiet Wash; pressed is a brand fill with white text. The exam setup's length choice ("Full" or "Compact") spans its panel. The DE/EN toggle in the top bar is built the same way, with 4px 10px padding and a 40px minimum width (44×36px on touch screens).
- **Matching slot:** a select drawn as a dashed brand slot on Brand Wash until it is filled ("Choose a value …"), then a solid Control Line border and 600 weight.
- **Code blank:** an inline 26px select with a dashed brand border on Brand Tint, Cascadia 13px/600, on code lines 30px apart (32px tall at 16px on touch screens); it resolves to solid green or red.
- **Ordering:** a pool ("Actions") on Quiet Wash and a dashed Control Line answer zone; items are 4px white rows with a grip, a 22px Brand Tint position number and up/down icon buttons as the keyboard alternative to dragging.

### Navigation
- **Top bar:** 56px, white, hairline below, sticky. The app mark (a 32px brand square at 7px with exam.json `badge` in white 12.5px/700 display, for example "103"; a badge longer than three characters shrinks to fit, and the favicon and app icons repeat the mark) sits beside exam.json `appName` in 18px/600 display. Links (Home, Learn, Practice, Exam, Review, Flashcards, Progress, Resources) are 14px Secondary Ink with 12px side padding; hover is Quiet Wash with rounded top corners; active is brand at 600 with a 3px brand underline inset 12px. The DE/EN toggle sits at the right and switches the UI and the content together.
- **Routes:** `/` (Home), `/learn`, `/practice`, `/exam`, `/review`, `/cards` (Flashcards), `/progress`, `/resources` and `/coverage`, under hash routing.
- **Medium widths (1100px and below):** Progress and Resources leave the top bar so the links never crowd; the "Menu" button appears at the right and its flyout lists them with Coverage.
- **Review badge:** a 20px brand pill with the number of due reviews in white 11px/600. On phones it becomes an 8px brand dot with a 2px white ring on the tab icon.
- **Phones (760px and below):** the links hide. A fixed bottom tab bar holds Home, Learn, Practice, Exam and Review as 22px Fluent icons (filled when active) over 11px/600 labels, Tertiary Ink, active brand; the five columns share the width equally, which leaves room for the longest German label ("Wiederholen"). The header's "Menu" (a 40px icon button that turns into a close icon) opens a 220px flyout (4px padding, 8px corners, hairline, shadow-16) with Flashcards, Progress, Resources and Coverage as 44px rows with 20px icons; hover Sunken Grey, the active row Brand Tint with brand text; Escape or a tap outside closes it. Flashcards is also one tap away in its home panel, right under "Up next".
- **Breadcrumb:** 13px Tertiary Ink with 14–16px chevrons.
- **"On this page":** a 1px hairline track with 13px/18px Secondary Ink links; hover draws a brand edge and brand text; the current section gets a 2px brand edge, Fluent Ink at 600 and `aria-current="location"`. The current section is the last one whose heading has passed 56px plus 25% of the window height, or the last section once the page is scrolled to the end.

**The Next-Step Signal Rule.** The Review count stays in the navigation on purpose: it is Product Principle 1 ("Always show the next step") in the chrome, a pointer to due work rather than a reward.

### Icons
- **Interface glyphs:** Fluent UI System Icons (MIT License), the 20px regular and filled variants. `npm run icons` (`scripts/gen-icons.mjs`) extracts the ones the app uses from `@fluentui/svg-icons` into `src/components/icons.generated.ts`, and `<Icon>` draws them on a 20px viewBox in currentColor, decorative unless given a label. Sizes: 14–16px in links, chips and small buttons, 16–18px in buttons, 20px in callouts, lists, the Menu and readiness rows, 22px in the tab bar and the "Today" rows, 28px in empty states and session verdicts. An active tab swaps to the filled variant.
- **Domain icons:** each domain in `src/content/domains.ts` names one glyph from this set; a glyph the app doesn't have yet goes into the generator's list first.
- **Thumbnail glyphs:** one Fluent glyph per diagram tone, described under the thumbnail.
- **Official product icons:** optional and not shipped; see the step-through diagram.

### Guided Path (signature)
The home's left column, under "Learning path" and its meta line ("Course <number> · n modules · n questions · d of n done"): one group per learning path of the official course, one station per module on a vertical rail.
- **Rail:** a 2px Hairline connector from dot to dot that turns brand once the station is done.
- **Dots** (20px): untouched is a 2px Firm Line ring on white; started is a brand ring half filled with Brand Tint Deep; done is a brand disc with a white 14px check; next grows to 28px, a brand ring around a brand core with a 4px Brand Tint halo, with a 600-weight title and the "Next up" tag.
- **Text:** the module title at 14px/20px (hover brand), then a 12px/16px Tertiary Ink meta line ("Module 2 · 18 questions · 6/18 answered").
- **Module stepper** (in the next card): "Lesson", "Questions", "Review" as 28px circles joined by 2px lines. The current step is a brand fill with a brand label; a done step is Brand Tint with a brand check, and its line turns brand. At 420px and below the 12px labels move under the circles so all three steps fit.

### Next-Step Card and Diagram Thumbnail
"Up next" (German "Als Nächstes dran") stacks the headline module title, a meta line ("Module 2 of 3 · <learning path> · about 25 min on Learn"), the stepper, then the diagram thumbnail beside the summary (1.25fr to 1fr; the summary is the lesson's first sentence at 15px/24px Secondary Ink), then the large primary action ("Start lesson", "Practice n questions" or "Review n mistakes"), with a secondary "Go straight to the questions" while the lesson is unread. Once every module is done it offers "Start the exam simulation" and, when exam.json links one, the "Official practice assessment"; without content it shows the empty state.

The thumbnail restates the lesson's first diagram as three tone tiles:
- Brand Wash with a Brand Tint Deep border, 8px, 16px 10px padding; hover turns the border brand and lifts it to shadow-8.
- Tiles are 46px at 12px corners: tone fill, 1.5px tone stroke and, centred in the tile, a 24px glyph. By default that is the Fluent glyph of the node's tone, tinted with the tone ink: person (user), window (app), cloud (platform), brain (model), database (data), wrench (tool), shield (safety), globe (external), cube (neutral). A node that carries a registered official product icon shows that icon instead. Labels are 13px/18px/600, subs 12px/16px Tertiary Ink, centred.
- It starts where the step-through starts and follows real arrows; it draws an 18px arrow only where the diagram has an edge, otherwise it leaves a plain 18px gap.
- The authors' `\n` line breaks are kept. Natural words hyphenate only from 10 characters (`hyphenate-limit-chars: 10 4 4`); code tokens never hyphenate and wrap only at ".", "/", "_" and camelCase seams; a non-breaking space before "·" keeps separators off line starts.
- Below a 380px container width (the `summary` container query) it switches to one tile per row: a 40px tile on the left, label and sub on the right, arrows turned to point down.

### Step-Through Diagram (signature)
Hand-built SVG diagrams drawn from data in the lesson file on a 960-wide canvas, at least one per lesson, in the lesson's "The big picture" section; the first one also feeds the home thumbnail.
- **Frame:** white, Hairline, 8px. A head (title 16px/22px/600, caption 14px/20px Tertiary Ink at 56ch), a Quiet Wash canvas with a 16px dot grid (#e3e3e3) between soft hairlines, controls, narration, legend.
- **Nodes:** the nine typed tones with a pale fill and 1.5px tone stroke; label 14px/600 Fluent Ink, sub 12px Tertiary Ink. Shapes: box (8px), pill, store (a cylinder), doc (a 14px folded corner), actor (a box for a person or device) and diamond (14px points). Groups take their tone's fill at 55%, a 1px 6/4 dashed stroke, 12px corners and a 12.5px/600 title in tone ink.
- **Icons:** the template ships no official product icons, so a node draws its label lines centred on its axis, with no icon slot. Official product icons (for example the Azure Architecture Icons) are optional: a scaffolded app may add unaltered SVGs under their terms to `src/assets/diagram-icons/` with a `NOTICE.md`, register them in `src/content/diagram-icons.ts` and set a node's `icon` prop. The icon then sits at 18px beside the label, 6px before it and centred with the label lines as one group, so label lines budget 24px more width; sub lines still run the full width below. A dimmed node greys its icon and fades it to 45%.
- **Arrows:** 1.5px #8a8a8a with 7px triangular heads, optionally two-headed or dashed (5/4). They start and end on each shape's drawn outline.
- **Labels:** node text is measured with the real font and checked to fit each shape in each language. Edge labels are white 20px pills (10px corners, Hairline, 11.5px/600 Secondary Ink).
- **Step states:** focus thickens the stroke to 2.5px and adds the drop shadow; a lit group turns its border solid at 2px; a lit arrow turns brand, 2.5px, dashed 8/6 and flowing, and its label gets a brand border with Brand Ink text. Context keeps the endpoints of a lit arrow at full strength. Dim fades shapes to 32%, arrows to 25%, label pills to 60% and groups to 55%, while all text turns Receded Text Grey. Changes ease over 280ms.
- **Controls:** "Back" (secondary, small), numbered 28px step dots (done Brand Tint, active brand), "Step by step" then "Next" (primary, small), "Play"/"Pause" (subtle, 4.2s per step) and, once a step is lit, "Whole picture" (subtle; back to the whole picture). Arrow keys step through, Escape returns to the whole picture.
- **Narration:** a Brand Wash panel under a Brand Tint Deep rule, at least 76px tall: a 22px brand number and a 15px/22px/600 title, then 15px/24px Secondary Ink text at 56ch, announced politely to screen readers. Before the first step it holds a 14px Tertiary Ink hint ("4 steps. Start with “Step by step” or use the arrow keys in the diagram.").
- **Legend:** 12px Tertiary Ink with 14×10px swatches (3px corners, tone fill and 1.5px stroke) for the tones the diagram uses.
- **Phones:** the drawing keeps a 640px minimum width and the canvas scrolls sideways under a "Swipe the diagram sideways" hint. Each step scrolls to its own nodes; arrow endpoints join the view, nearest first, only while everything still fits, and otherwise the view aligns left on the step's nodes.
- **Quality gate:** the content validator (`npm run validate`) and a Playwright render audit (`npm run audit:diagrams`, with the dev server running) enforce text fit in every shape and both languages (a registered icon included), arrow contact, label placement, no edges through nodes or group titles, no overlapping nodes, clean group nesting and canvas bounds. With icons, the validator accepts only registered ids and the audit checks that each icon has its image, sits inside its shape and stays clear of the text. A diagram ships only at 0 errors in EN and DE.

**The Optional-Icon Rule.** Diagrams read without product icons: tone, shape and label carry the meaning, and the thumbnail falls back to the tone's Fluent glyph. When an app adds official icons, they appear only inside diagrams and their thumbnail, only on a node that names that product, unaltered and at their own proportions: never cropped, flipped, rotated or distorted, never recoloured beyond the step-through's dim state, and never standing for this app. The app's own mark stays the badge square.

**The Readable Recede Rule.** When a step lights its parts, the rest recedes but stays legible: fills and strokes fade, text only turns Receded Text Grey (at least 3:1), and the endpoints of a lit arrow stay at full strength as context.

**The Twenty-Pixel Rule.** An edge label sits on its arrow only when at least 20px of arrow stays visible on each side; otherwise it moves beside the arrow (above or right first, then below or left), clear of nodes, group titles, other labels and other arrows. Arrow length is measured between the two shapes' drawn outlines, so a label pill of width w stays on a straight horizontal arrow only if the outlines are at least w + 40px apart (its height + 40px on a vertical arrow). When a label finds no free spot at all, `npm run validate` fails and reports the arrow length it would need.

**The Real-Edge Rule.** The thumbnail draws an arrow only where the diagram has an edge between those two nodes; everywhere else it leaves a plain gap.

### Flashcards (signature)
A Leitner card box with three compartments, stage 1 to stage 3. The front of a card asks a question with four exam-style answer options; the back reveals the right one and briefly explains every option. A right answer moves the card one stage forward, a wrong one sends it back to stage 1, and the goal is every card in stage 3. There are no time intervals: a round deals up to 20 open cards (modules whose lesson is read come first) and runs until each of them stands in stage 3. The box is prefilled with one card per concept, exam trap and takeaway of every lesson, the learner adds their own, and it stays separate from Review, whose five boxes bring questions back on a schedule.
- **The box ("Your box"):** a 1.5px Control Line tray on Quiet Wash, 8px, cut into three equal compartments by 1.5px walls. An axis line above names the ends ("back · start", "front · goal", 11px/600 Tertiary Ink). Each compartment shows "Stage n" (12px/600 Secondary Ink), its exact count (24px/30px display 600, tabular; stage 3 in Brand Ink) and its cards as a stack of 1px card edges: Firm Line on white in stage 1, Brand Soft on white in stage 2, brand on Brand Tint in stage 3. Stack height follows the square root of the count, at least 8%, so a few cards stay visible beside hundreds; an empty compartment shows a dashed "empty" slot. A 20px white circle with a 1.5px Brand Soft ring and a brand forward arrow sits on each wall. The compact box (home panel, index page, round, end screen) uses 20px counts, 36px stacks and 18px circles.
- **The rule, drawn:** the full box (overview) adds a caption above ("**Right** – the card moves one stage forward", the arrow beside it) and a 1.5px dashed Tertiary Ink return path below that runs from stage 3 and stage 2 back to an arrowhead under stage 1 ("**Wrong** – back to stage 1"). Captions are 13px/18px Tertiary Ink with the bold verb in Fluent Ink: they explain, they are not links. Under the box the overview adds the tally ("n of m cards stand at the front"), a brand meter of the share in stage 3, the large primary "Round with n cards", a secondary "New card" and, once no card is open, the subtle "All back to stage 1".
- **Index** (German "Register"): one index divider per learning path and per module, in course order, plus one for "Your own cards". A divider is a white 8px row at least 56px tall with a Hairline (Control Line and Quiet Wash for a learning path) and a 20px tab on top (11px/600 Brand Ink, "Module n" or "Own"; 12px Fluent Ink, "Path n"); module tabs stagger across four positions like the dividers of a real box. The row holds title and meta ("17 cards · 3 at the front"), an 8px split bar in the three stage colours (Firm Line, Brand Soft, brand; 2px gaps) and a small secondary "Study". The whole module row opens its index page, and its border turns Brand Soft on hover; a finished divider turns its tab brand with a check and shows "All at the front". A brand "Next round" tag marks the dividers the next mixed round deals from. The index head carries the legend of the three stage colours.
- **Cards:** on an index page each card is a white 8px index card on shadow-2: a head with the kind ("Concept", "Exam trap", "Takeaway", "Own card"), a stage pill ("Stage 1" on Sunken Grey, "Stage 2" on Brand Tint, "Stage 3" in brand) and, for starter cards, a Tertiary Ink "Take out of the box" icon button, ruled off by a 1px Brand Soft line; then the question (15px/22px/600) and a disclosed "Answer" (the right option beside a green check, then the lesson text). Own cards end with "Edit" and "Delete" ("Delete" asks first). Cards taken out of the box wait in a "Taken out of the box (n)" disclosure with "Put back".
- **A round:** the session column shows a progress bar of the round's cards in stage 3 ("n/m at the front"), the scope ("Mixed round", a module, a learning path or "Own cards"), the compact box (on phones a slim strip of three counters, so the card keeps the screen) and one card: white, 8px, Hairline, shadow-8, with a head (Brand Soft rule) that names the side ("Front · question", 12px/700 Brand Ink), the module and kind, and the stage pill. The front shows the question in 22px/30px display (18px/26px on phones) and the four options as the shared choice rows of the questions (A–D letter boxes, shuffled anew each time a card comes back). The bar says "Choose an answer." and holds "Check" (primary, disabled until an option is picked). Checking reveals in place, like a practice question: the head turns to "Back · answer", the options take the Correct, Wrong and missed states with each option's short reason beneath it, and a disclosure "From the lesson" holds the lesson text; the bar takes the Correct or Wrong tint with the verdict ("Right!" or "Wrong" and where the card goes, such as "The card moves to stage 2.") and "Next", which sends the card on its flight. Keys: 1–4 or A–D pick, Enter checks and continues; the key hint hides on touch screens. The checked option scrolls into view when it sits under the bar. The learner's own cards without options keep the turn-and-rate card: "Show answer" (Space or Enter), then "Didn’t know" ("back to stage 1" beneath) and "Knew it" ("on to stage n" or "stays in stage 3" beneath) as 52px Wrong- and Correct-tinted buttons (keys 1 and 2). The round ends on "Round complete" with the compact box and, while cards are still open, "Next round".
- **Motion:** after "Next" (or a rating) the card flies into the compartment it now belongs to (460ms, `cubic-bezier(0.55, 0, 0.2, 1)`: translate to the compartment's centre, scale 0.12, fade to 20%), and only on landing do the counts, the stacks and the progress bar change while the compartment flashes once (640ms brand inset ring and 14% brand wash fading out) and its count settles from 1.22×. Turning a card without options rotates it in from −70° (320ms, ease-out); cards with options reveal in place. Reduced motion skips the flight and the turn; the card lands at once.
- **Editor:** inline, never a modal: "Front · question" and "Back · answer and why" as 16px textareas; a disclosure "Answer options like on the exam" (Quiet Wash, 8px) with the "Right option" and three "Wrong option n" fields, each beside its "Why wrong?" (stacked on phones); a module select grouped by learning path, a hint that code goes in backticks, then "Put in stage 1" (primary) and "Cancel". With the right option and at least two wrong ones the card is asked as multiple choice; a half-filled set names what is missing in Trap Orange and keeps the save button disabled. After saving, the form stays open for the next card and confirms "It’s in stage 1."
- **Home panel and lesson bridge:** the home panel sits under "Up next" with the compact box (a link to the overview), the tally of cards in stage 3 ("n of m cards at the front", the number in 22px display), the rule in one line and secondary actions only (a secondary "Round with n cards" and a subtle "New card"), so it never competes with the next-step card's primary action. After "Takeaways" every lesson shows a Brand Tint bridge: how many of the lesson's cards are in the box and how many already stand in stage 3, with "Study the cards" (or "Open the index").

**The Front-and-Back Rule.** On their own, "front" and "back" describe the box: stage 3 is the front (the goal), stage 1 the back (the start). A card's sides are always named with what they hold, "Front · question" and "Back · answer", so the two meanings never collide. German keeps them apart with different words: vorne and hinten for the box, Vorderseite and Rückseite for the card.

**The Exact-Count Rule.** The box states every compartment's exact number; stacks only show proportion. Counts change when the card lands, never while it is still in the air.

### Questions
- **Meta row:** domain chip, type ("Single choice", "Multiple choice", "Ordering", "Matching", "Code completion"), difficulty ("Basics", "Apply", "Analyze") and skill ("Skill 1.2.3", with the bullet text as its tooltip) in 12px Tertiary Ink.
- **Stem:** 17px/26px at 54ch.
- **Choice:** white, Control Line border, 8px, 12px 14px padding, 15px/22px, with a 24px letter box (A, B, C …) over a hidden native radio or checkbox. Hover is a brand border on Brand Wash; picked is a brand border with the inset ring on Brand Tint and a brand-filled letter. Revealed: correct is a green border, ring and Correct tint with a green letter; missed (correct but not picked) is a dashed green border; wrong is a red border, ring and Wrong tint; the rest turn Secondary Ink. A 20px check or dismiss circle sits at the right, and each option's explanation (14px/20px Secondary Ink) follows at a 50px indent (14px on phones). A multiple-choice question says how many to pick ("Choose 2 answers · 1/2 chosen", 13px/600 Tertiary Ink) and stops at that number.
- **Ordering, matching, code completion:** revealed items, rows and blanks take the Correct or Wrong border and tint; ordering and code completion add a Quiet Wash reveal block ("Correct order", "Solution"), and a wrong matching row names the right value ("Correct: …").
- **Feedback:** inline banners (the lesson's "Mini quiz") take the Correct or Wrong tint with its line colour and a 16px/600 title in the state ink ("Correct!", "Partly correct", "Not quite"), rising in over 280ms.
- **Session bar:** a fixed white bottom bar with a hairline: a Tertiary Ink hint ("Choose your answer." or "Ready to check.") and the large primary "Check", disabled until the answer is complete. On reveal the whole bar takes the Correct or Wrong tint, the verdict (18px/24px bold plus a 13px sub, "The question moves up one box." or "It goes into your reviews.") takes the state ink, and the large primary "Next" ("Results" after the last question) sits at the right.
- **Case study:** a sticky Quiet Wash panel beside the question (0.9fr, at least 260px, to 1.4fr) that caps its height and scrolls inside; static above the question on phones.

### Exam
- **Setup:** "How it works" holds the length choice ("Full" takes exam.json `exam.questions` and `exam.minutes`; "Compact" takes half of both), four rules with 20px brand icons and the large primary "Start simulation". "Distribution of this simulation" lists each domain's chip, title, weight range and question count. Counts follow the midpoints of the official weight ranges; a domain without questions is skipped, and a domain with fewer questions than its share gives what it has while the rest is split over the other domains by weight. A case study with at least three questions, when the bank has one, comes at the end. A simulation still running shows as a warning callout with "Resume" and "Discard".
- **Runner:** a sticky exam header under the top bar holds the title, the tabular position ("Question 3 of 50"), the clock pill (Brand Tint and Brand Ink at 700 with an 18px timer icon, the Wrong tint in the last 10 minutes) and a small secondary "Overview". The bottom bar holds "Back" (secondary), "Mark for review" (subtle; its on state reads "Marked" with a filled flag, and on phones it shows the icon only) and "Next" (primary).
- **Overview:** 40px cells at 4px in an auto-fill grid; answered is Brand Tint, marked a Marked Amber ring with a 12px filled flag, current a 2px brand outline. "Submit exam" asks first in a warning callout ("Submit now?", with the number of open questions) with "Submit now" and "Keep working".
- **Results:** the title says whether the pass guideline was reached ("Guideline reached: n % of the points" or "Still below the guideline: …"); a 14px score line carries the guideline mark at exam.json `passPercent` (70 in the sample), a 2px Fluent Ink tick under an 11px/700 label; domain report bars use the domain fills; expandable result items hold every question with its explanation. The "/1000" figure in the subtitle is a linear conversion and says that it is not an official scaled score.
- **Past simulations** (Progress): 32px bars in a 180px chart, Correct green where the guideline was reached and Brand Soft below it, over a 1px Control Line at the guideline. The line's height is the CSS custom property `--pass`, set from `passPercent`.

### Skills Map and Meters
- **Skills tiles:** 44×36px (40×34px on phones, 40px tall on touch screens), 6px corners, 11px/700 tabular skill ids. "Not started" is white with a Firm Line border and Tertiary Ink; "Seen", "Proficient" and "Mastered" follow the mastery ramp. Hover lifts a tile 1px to shadow-8 and shows an ink tooltip (white 12px/16px, 4px corners, at most 280px) with the bullet, its level and the last result; a tile opens practice for exactly that skill. Each row starts with the domain's icon on a 36px, 8px-corner square tinted 10% toward the domain colour, then the domain title and a caption with its id and weight range ("<id> · <from>–<to> %"); rows stack at 900px.
- **Meters:** an 8px (12px large) Sunken Grey track with a fully rounded fill in the domain or brand colour; the 72×6px mastery bar steps Brand Soft, #479ef5, brand.
- **Leitner boxes** (Review): five bars, "Box 1" to "Box 5", over their intervals ("now", "1 d", "3 d", "7 d", "21 d"); box 1 in the Wrong line colour, boxes 2 and 3 Brand Tint Deep, box 4 #479ef5, box 5 brand.

### Code
Code blocks sit on #f7f7f7 inside a Hairline frame, under a white bar with a 12px/600 Tertiary Ink language label and a subtle "Copy" button that confirms "Copied". The label is exam.json `codeLanguage` ("Python" in the sample; "Text" when it is empty). Cascadia 13.5px/21px, tab size 4; Python is highlighted with the VS Code Light+ tokens, comments in italics, and any other language renders as plain text. A code block scrolls sideways inside its frame and takes keyboard focus. Inline code is 0.88em on Sunken Grey with 1px 5px padding and 4px corners, and may wrap anywhere.

### Feedback Links
Every place where content can be wrong carries a quiet "Feedback" link that opens a prefilled GitHub issue: the question meta row (in an exam, a slim row of its own above the stem), lesson section heads, diagram captions, the bars of lesson code samples, card heads in the index (icon only) and the foot of a card in a round, so the card's header stays readable. The link is 12px/600 Tertiary Ink with the 16px person-feedback icon, right-aligned in its row (auto margin), with a Sunken Grey wash and brand ink on hover. Below 560px tight rows show the icon only; the accessible name always starts with "Feedback" and names the target ("Feedback on this question", "Feedback zu dieser Frage"), and a click doesn't reach the row or card beneath it. On touch the target grows to 44px with negative vertical margins, so the row keeps its height. In running text (the footer) it is a plain brand link. It never takes button weight: it sits beside content, not in the learner's path. Without `feedback.issuesUrl` in exam.json none of these render, including the footer line.

### Tables
Rows at 14px/20px with 10px 12px padding and Soft Hairline dividers; heads 12px/16px/600 Tertiary Ink; row hover Quiet Wash. Comparison tables zebra-stripe in Quiet Wash and keep a 560px minimum width, scrolling inside their region. At 560px and below every table (`.stack-table`: lesson comparisons, coverage, module progress) restacks into one card per row: the row header on top, then a 12px/600 Tertiary Ink column label beside each value. The header row stays in the markup for screen readers, and explicit table roles keep VoiceOver reading a table.

## Do's and Don'ts

### Do:
- **Do** put content on white panels (8px, shadow-4) on the #f5f5f5 ground, 20px apart.
- **Do** keep brand blue for the next action and the current position, and use -ink text on -tint fills for every tinted label.
- **Do** pair every verdict colour with an icon and a word, and show it only after the answer is revealed.
- **Do** colour a domain by its position in the skills outline (`domainHue`) through `.domain-N`, `.bg-domain-N` and `.ink-domain-N`; a domain id never picks its own colour.
- **Do** take every UI string from `src/i18n/en.ts` and `src/i18n/de.ts` (the same keys; TypeScript enforces it), and check every layout in both languages, because German runs longer.
- **Do** build every concept diagram from the nine typed tones and six shapes, with a legend, numbered steps, narration and the focus, context and dim states, and ship it only at 0 validator and render-audit errors in EN and DE.
- **Do** hold prose near 54ch (56ch for diagram narration and captions).
- **Do** draw interface icons from the generated Fluent set (20px viewBox, currentColor); `.icon` never shrinks in a flex row, so an icon keeps its size when the text beside it wraps.
- **Do** keep the Review due count in the navigation (a dot on phones): it shows the next step.
- **Do** make sticky columns conditional on fitting the window, and let "Up next" lead when columns collapse.
- **Do** keep every question type keyboard-operable: radios behind the letters, up/down buttons for ordering, selects for matching and code blanks.
- **Do** honour reduced motion: the build collapses every transition and animation, the flowing arrow and smooth scrolling included; a flashcard lands without its flight.
- **Do** ask before a reset: "Reset" and "All back to stage 1" first reveal a Danger action and "Cancel".
- **Do** name the destination on every flashcard verdict and rating ("The card moves to stage 2.", "back to stage 1"), so the rule is where the learner acts.
- **Do** explain every option of a flashcard once it is checked, right or wrong, in one short sentence.
- **Do** let an empty screen name the file that fills it.

### Don't:
- **Don't** build the generic card-grid dashboard template; the home is a guided path beside a next-step column.
- **Don't** add achievement badges, streak pressure or confetti.
- **Don't** use domain hues for status or decoration, or green and red before an answer is revealed (the exam clock's last 10 minutes are the only exception).
- **Don't** use hard offset shadows or anything outside the Fluent shadow ramp, and don't shadow containers that rest inside a panel.
- **Don't** uppercase labels or track them out; the domain chip's +0.02em is the only positive tracking.
- **Don't** let colour carry meaning alone in a diagram; tones always come with text labels and a legend.
- **Don't** draw a thumbnail arrow where the diagram has no edge, hyphenate code tokens, or start a line with "·".
- **Don't** route an arrow through a node or a group title, or sit an edge label on an arrow that would show less than 20px on either side.
- **Don't** dim diagram text below Receded Text Grey (#858585).
- **Don't** call a card's sides just "front" and "back"; label them "Front · question" and "Back · answer", because front and back on their own mean the box.
- **Don't** use Microsoft logos or imply endorsement; the app's mark is the badge square, and the footer says it is not an official Microsoft product. Official product icons are optional: when an app adds them under their published terms, they appear only in diagrams and the thumbnail, beside the name of the product they stand for.
