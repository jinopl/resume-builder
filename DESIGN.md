---
name: Resume Builder
description: A free, private, browser-only resume builder laid out like a friendly textbook, one numbered colour chapter per section.
colors:
  ink: "#1d3557"
  muted: "#52637a"
  placeholder: "#6b7684"
  page: "#ffffff"
  stage: "#f1f4f8"
  surface: "#ffffff"
  surface-2: "#f7f9fc"
  field: "#ffffff"
  hover: "#eef2f7"
  chip: "#e9eef5"
  border: "#dbe2eb"
  border-strong: "#b9c5d4"
  accent: "#1d5fa3"
  accent-soft: "#e8f1fb"
  primary: "#1f7a4d"
  primary-hover: "#186640"
  on-primary: "#ffffff"
  on-color: "#ffffff"
  brand: "#1f4e79"
  danger: "#b42318"
  danger-soft: "#fdecea"
  warn: "#8a5a00"
  warn-soft: "#fff6dd"
  warn-border: "#f0d58a"
  note-text: "#5c4400"
  ok: "#1f7a4d"
  ok-soft: "#e6f4ec"
  ch-blue: "#1d5fa3"
  ch-violet: "#6d44b8"
  ch-ochre: "#9a5f00"
  ch-leaf: "#3d7a1f"
  ch-coral: "#c2452d"
  ch-cyan: "#0e7490"
  ch-magenta: "#a83a7d"
  ch-maroon: "#8c1d40"
  ch-slate: "#4f5d73"
  try-bg: "#fff7e0"
  try-title: "#7a5200"
  try-text: "#4a3a10"
  try-icon-bg: "#f2a900"
  try-icon: "#3d2a00"
  know-bg: "#eaf3fb"
  know-border: "#c7dcf1"
  know-title: "#1d5fa3"
  know-text: "#1d3557"
  paper: "#ffffff"
  paper-ghost: "#e9ecf0"
  paper-ghost-text: "#5d6877"
typography:
  chapter-number:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.2
  subheading:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  coach:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.88rem"
    fontWeight: 600
    lineHeight: 1.45
  small:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.45
  hint:
    fontFamily: "Mukta, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  paper: "2px"
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  menu: "14px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "3.5": "14px"
  "4": "16px"
  "4.5": "18px"
  "5": "20px"
  "6": "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.hover}"
  pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  pill-open:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
  pill-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  segmented:
    backgroundColor: "{colors.chip}"
    rounded: "{rounded.pill}"
    padding: "3px"
  segmented-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    padding: "7px 18px"
  tab:
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    padding: "7px 16px"
  tab-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
  chapter-band:
    textColor: "{colors.on-primary}"
    typography: "{typography.headline}"
    padding: "14px 20px"
  chapter-tile:
    textColor: "{colors.on-primary}"
    rounded: "7px"
    size: "28px"
  panel-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title}"
    padding: "11px 20px"
  coach-try:
    backgroundColor: "{colors.try-bg}"
    textColor: "{colors.try-text}"
    typography: "{typography.coach}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  coach-know:
    backgroundColor: "{colors.know-bg}"
    textColor: "{colors.know-text}"
    typography: "{typography.coach}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
  score-tile:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    size: "92px"
---

# Design System: Resume Builder

## Overview

**Creative North Star: "The Friendly Textbook"**

The app is laid out like a school textbook that wants you to pass. Every resume section is a numbered chapter with its own solid colour band, a contents list shows which chapters are done, and coaching sits inside each chapter in tinted "Try this" and "Do you know?" boxes. The tone is warm and capable rather than corporate: white pages, navy ink, one confident green for the action that moves you forward.

Density is calm. Forms sit on white in a two-column field grid, the real PDF sits on a soft grey stage beside them, and the colour is concentrated in a few places (chapter tiles, chapter bands, coaching boxes) so it orients rather than decorates. The navy ink carries everything that is not a chapter: the 3px rule under the header, the active tab and document switch, the appendix bands on the Design and Check panels, the score tile.

The system rejects the category's default of grey cards with one accent and grade-style scoring, and it rejects childish devices (cartoons, stickers). The PDF templates are a separate visual system and never take the app's colours.

**Key Characteristics:**
- Nine solid chapter colours, each always carrying white type, fixed across light and dark themes.
- Navy ink (#1d3557) as the structural colour: header rule, active states, appendix bands.
- Leaf green reserved for the forward action and for "done".
- Two kinds of coaching box, marigold for an action, pale blue for a fact.
- One family, Mukta, self-hosted, with heavy tabular numerals for chapter and score numbers.
- Flat app surfaces; only the white PDF paper and floating layers cast shadows.

## Colors

White pages and navy ink, punctuated by a numbered set of saturated chapter colours and two coaching tints.

### Primary
- **Leaf Green** (primary): Download PDF, Start my resume, the "Check" next-chip, the checkbox accent colour. Hover deepens to primary-hover. The same green is the `ok` colour for done ticks and success notices.
- **Navy Ink** (ink): body text in light mode, and the structural colour of the world: the header's 3px rule, active tab, active document segment, panel bands, score tile. In dark mode text turns to #e6e9ee and the rule lightens to #3d5a85.

### Secondary
- **Textbook Blue** (accent): links, focus outlines, open list items, selected gallery and font options, open File menu. Its soft tint (accent-soft) marks the current rail item and hover in menus. Dark mode lifts it to #8dbcf0 for contrast on dark surfaces.
- **R Monogram Blue** (brand): the "R" logo tile only. A brand commitment; do not reuse it for UI.

### Tertiary: chapter colours
Nine solid colours, assigned per section in `src/editor/chapters.ts`: Personal details blue, Summary violet, Work ochre, Education leaf, Projects coral, Skills cyan, Certifications magenta, Awards maroon, Languages slate. The cover letter reuses blue, violet and leaf for The job, Recipient and Letter. White on each measures 5.0:1 (coral) to 8.9:1 (maroon). Chapter leaf (#3d7a1f) is deliberately distinct from the leaf-green primary. The values are identical in both theme blocks.

### Coaching tints
- **Marigold "Try this"** (try-bg, try-title, try-text, try-icon-bg, try-icon): a pale marigold box with a solid marigold (#f2a900) round icon and dark brown pencil.
- **Pale Blue "Do you know?"** (know-bg, know-border, know-title, know-text): a pale blue box with a solid chapter-blue bulb icon. The example banner is the same box at chapter scale, with a know-border outline.

### Neutral
- **Page White** (page, surface, field): editor column, rail, cards, inputs.
- **Stage Grey** (stage): the background behind the PDF preview.
- **Mist** (surface-2, hover, chip): collapsed list rows and gallery cards, hover fills, segmented track and count chips.
- **Hairline / Strong Hairline** (border, border-strong): card and divider lines; button and input strokes.
- **Slate Muted** (muted, placeholder): labels, secondary text, placeholders.
- **Status** (danger, warn, note-text and their soft fills): errors, warnings, inline notes and the dev channel badge.
- **Paper** (paper, paper-ghost, paper-ghost-text): the always-white PDF page and thumbnails, and the grey bars of the empty-preview ghost.

### Named Rules
**The Chapter Colour Rule.** A chapter colour is only ever a solid fill under white type: rail tile, chapter band, next-chapter chip, Check issue tile, and the chapter's tinted border (30% mixed into the hairline). Never use a chapter colour as text on white or as a pale tint, and never assign one section two colours.

**The White-on-Colour Floor.** Every chapter colour, and any colour added to that set, keeps white text at 4.5:1 or above in both themes.

**The Navy Appendix Rule.** Anything structural that is not a chapter (Design and Check panel bands, active tab, active document switch, score tile, header rule) is navy ink, not a chapter colour.

**The One Green Rule.** Leaf green marks the single forward action in view and the "done" state. It is not a decorative accent.

**The Both Blocks Rule.** Every app colour is a CSS variable defined in both `:root` and `:root[data-theme='dark']` in `src/styles.css`. A new colour is added to both blocks, never hard-coded in component CSS.

**The White Paper Rule.** The preview page and template thumbnails are always #ffffff in every theme, because they show the real PDF.

## Typography

**Display Font:** Mukta (with system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Body Font:** Mukta, same stack

**Character:** One humanist sans with an Indian design heritage and Devanagari roots, used at five weights (400 to 800). Friendly and legible at form sizes, and heavy enough at 800 to make chapter numbers feel like textbook chapter openers.

### Hierarchy
- **Chapter number** (800, 2.5rem, line-height 1, tabular numerals): the large numeral in an open chapter band. 1.6rem when the chapter is closed, 1.9rem under 480px. The score number uses the same voice (800, 2.4rem).
- **Headline** (700, 1.6rem, 1.2): chapter title in the band. 1.1rem closed, 1.2rem under 480px. The band's subtitle is 500 at 0.92rem.
- **Title** (700, 1.2 to 1.25rem, 1.2): panel band titles, card headers, the app name in the header.
- **Subheading** (700, 1.15rem): sub-groups inside a chapter (Online profiles), rail "Contents" title, example-banner heading.
- **Body** (400, 1rem, 1.45): form values, issue text (0.95rem), coaching text (0.95rem, 1.5). Long prose in the banner caps at 62ch.
- **Label** (600, 0.88rem, muted): field labels. Buttons, tabs and rail items are 600 at body size.
- **Small / Hint** (0.85rem / 0.82rem, muted): save status, rail progress, field hints and errors.

### Named Rules
**The One Family Rule.** Mukta is the only typeface in the app, self-hosted through @fontsource (no font CDN, in keeping with the no-requests promise). Weights 400, 500, 600, 700 and 800 only.

**The Heavy Numeral Rule.** Chapter numbers, rail tiles, issue tiles and the score use weight 800 with tabular numerals; numbers are how the user navigates.

## Layout

**Desktop (above 1100px):** a full-height app shell. Header grid of three columns (brand and save status, centred document switch, toolbar) over a 3px navy rule. Below it a three-column grid: a 236px chapter rail, the form column (flexible), and the preview column (minimum 360px, 0.9fr) on the grey stage. Each column scrolls on its own; the Edit / Design / Check tabs are sticky at the top of the form column.

**Up to 1100px:** the rail becomes a horizontal strip of 32px chapter tiles above both columns, with "You are on …" progress text beside it; names are hidden visually but kept for screen readers; the current tile gets a 2px ink ring and done tiles carry a small green tick badge.

**Up to 960px:** one column. One chapter open at a time, the rest collapse to compact bands; the preview becomes its own tab; the header PDF button moves to a fixed bottom bar (Preview and a wider Download PDF, 48px tall, safe-area aware). Icon buttons grow from 34px to 40px.

**Up to 760px:** the header wraps and the document switch spans the full width on its own row; the File menu docks to 16px side gutters.

**Up to 480px:** the save status shortens, the dev badge hides, chapter type steps down. Field grids drop to one column at 520px.

**Spacing rhythm:** 4, 8, 12, 14, 16, 18, 20 and 24px. Gutters are 24px on desktop, 20px at the strip breakpoint and 16px on phones. Chapters stack 18px apart (10px on phones); chapter bodies pad 18px 20px; field grids gap 14px vertically and 16px horizontally.

## Elevation & Depth

The app is flat. Depth comes from colour blocks (bands, tiles, the grey stage against white) and hairlines, not shadows. Shadows appear only on things that physically float or are paper.

### Shadow Vocabulary
- **Paper** (`box-shadow: 0 1px 3px rgba(29,53,87,.12), 0 8px 24px rgba(29,53,87,.09)`): the PDF preview page and template thumbnails.
- **Menu** (`box-shadow: 0 12px 32px -8px rgba(29,53,87,.24), 0 2px 6px rgba(29,53,87,.08)`): the File menu.
- **Bar** (`box-shadow: 0 -4px 16px rgba(29,53,87,.1)`): the phone bottom bar.
- **Lift** (`box-shadow: 0 1px 2px rgba(29,53,87,.12)`): the green Download pill and the active document segment.

Dark mode swaps every shadow to black at higher opacity.

### Named Rules
**The Paper Lifts, The App Stays Flat Rule.** Chapters, panels, cards and fields never cast shadows. Only paper and floating layers do.

## Shapes

Gently rounded throughout. Containers (chapters, panels, cards, gallery items, the example banner) use 12px. Coaching boxes, notices and Check rows use 10px. Buttons, inputs, tabs, rail items and icon buttons use 8px. Number tiles are small rounded squares (7px rail tile, 6px issue tile and next chip). The File pill, document switch, swatches and count chips are full pills. The File menu is 14px. The PDF paper is nearly square-cornered (2px), and coaching icons and done marks are circles.

Chapter cards clip their band to the top corners (overflow hidden) so the colour reads as the top of a page.

## Components

### Buttons
Solid and plain, no gradients.
- **Shape:** 8px corners, 40px tall, 16px side padding, weight 600.
- **Primary:** leaf green fill, white text; hover deepens to primary-hover.
- **Secondary:** white surface with a strong hairline; hover fills with the hover grey.
- **Ghost:** transparent, no border (the "Add" buttons, in accent blue).
- **Link button:** accent blue, underlined with a 3px offset.
- **Focus:** a 2px accent outline at 2px offset, app-wide.

### Pills (header toolbar)
The header's own button family: full-pill, 40px, hairline border. The File pill turns accent-soft with an accent border while its menu is open. The Download PDF pill is green with the lift shadow. The theme toggle is a 40px round icon pill.

### Document switch
A chip-grey pill track with 3px padding; the active segment (Resume or Cover letter) is navy ink with white text and the lift shadow. Centred in the desktop header; full width under 760px.

### Tabs
Edit / Design / Check sit sticky above the form column: muted text, 8px corners, the active tab filled navy with white text. A marigold count chip shows the number of open issues.

### Chapter rail
"Contents" with a "n of m done" line, then one row per chapter: a 28px solid chapter-colour tile with the white number, the name, and a green tick when done. The current chapter row is accent-soft. Hidden sections fade the tile to 45% and mute the name.

### Chapter (signature component)
A white card with 12px corners and a border tinted 30% toward its chapter colour. The top band is the solid chapter colour with white type: the heavy numeral, the title with a white done disc, a one-line subtitle, and on the right (desktop) a solid white "Next: n Title" pill with its text in the chapter colour at weight 700, hover mixing 12% of the chapter colour into the white. The body holds the coaching box, the field grid or list editor, and a "Next chapter" link ending in a small chip of the next chapter's colour (green "Check" after the last chapter). On phones the whole band is a toggle with a rotating chevron.

### Coaching boxes
One per chapter at most, at the top of the chapter body. 10px corners, 12px 14px padding, a 28px round icon, a bold lead-in.
- **Try this:** marigold tint, marigold icon disc with a pencil, for an action to take.
- **Do you know?:** pale blue tint, chapter-blue icon disc with a bulb, for a fact worth knowing.

### Panels
Design and Check pages use the chapter shape with a navy "appendix" band (11px 20px, title type) instead of a chapter colour, over a plain hairline-bordered body.

### Inputs / Fields
- **Style:** white field, strong hairline, 8px corners, 9px 12px padding; muted 600 label above, hint below.
- **Hover:** border darkens to muted.
- **Focus:** accent border plus a 2px accent outline at 30% strength.
- **Error:** danger border and a danger hint line.
- **Target:** when the Check tab routes to a field, a 3px accent ring at 35% strength holds on it.

### List editor
Entries are hairline-separated rows with a rotating chevron, the entry title (accent blue when open) and muted icon buttons (move up, move down, remove; remove hovers to danger). The open entry's fields indent 26px.

### Check tab
A navy score tile (92px, 12px corners, heavy numeral over "out of 100") beside the explanation. Issues are grouped by severity with a small square dot (danger, warn, accent) and a count chip; each issue row leads with the issue's chapter tile so the user sees where it lives, and links to the field with an arrow that turns accent on hover. Starter tasks show circular marks that fill green when done.

### Navigation (header and phone bar)
White header, 3px navy rule beneath. Brand block: the R monogram tile, the app name (700, 1.2rem) and a muted "Saved only on this device" line with a green lock. On phones a fixed white bottom bar carries Preview and Download PDF at 48px.

## Do's and Don'ts

### Do:
- **Do** give every new resume section a chapter colour from the existing set, used as a solid fill with white type at 4.5:1 or above.
- **Do** add every new colour as a token in both `:root` and `:root[data-theme='dark']` in `src/styles.css`.
- **Do** use navy ink for structural, non-chapter emphasis (active tab, appendix bands, score tile).
- **Do** keep leaf green for the forward action and done marks only.
- **Do** keep coaching to one box per chapter, marigold for an action, pale blue for a fact.
- **Do** keep the preview page and thumbnails white in every theme.
- **Do** use Mukta at weights 400 to 800 and tabular numerals for navigation numbers.
- **Do** follow the 1100 / 960 / 760 / 480px breakpoints: strip of tiles, then one column with one chapter open and a fixed bottom bar.

### Don't:
- **Don't** colour the PDF templates (`src/templates/`) with app theme tokens; they are a separate visual system with their own ATS rules, including no letter-spacing in the PDFs.
- **Don't** use chapter colours as text colour or as pale tints, or reuse the R monogram blue for UI.
- **Don't** add shadows to chapters, panels, cards or fields.
- **Don't** colour the score like a grade (red, amber, green); the score tile is navy.
- **Don't** add a second typeface or load fonts from a CDN.
- **Don't** add cartoons, stickers or mascots; the textbook is friendly, not childish.
