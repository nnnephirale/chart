# Where things live

One map of the code: the file to edit for each job and what it owns. Design rules are in [DESIGN-NOTES.md](DESIGN-NOTES.md); the chart-making recipe is in [AGENTS.md](AGENTS.md). `tests/docs-map.test.mjs` fails when a source file is missing from this map or the map names a file that is gone.

## Build

Edit `src/`, never the built pages. `node scripts/build.mjs` writes each page as one self-contained .html that opens with a double-click (no server, no dependencies). Run `npm test` (or `node --test tests/*.test.mjs`) before committing.

| File | Owns |
|---|---|
| `scripts/build.mjs` | Joins `src/page.html` and its `@@ path` lines into the built pages; `--check` reports stale pages; refuses to overwrite a page edited by hand (`--force` overrides). |
| `scripts/.built.json` | The sha256 of each page as last built, for the hand-edit guard. Written by the build. |
| `tests/build.test.mjs` | Fails when a built page differs from a fresh build of `src/`. |
| `tests/docs-map.test.mjs` | Fails when this map misses a source file or names one that is gone. |
| `package.json` | `npm run build` and `npm test`. No dependencies. |
| `.prettierrc.json` | Formatting for `src/css` and `src/js` (`npx prettier --write src/css src/js`). `.prettierignore` keeps `src/js/01-content.js` as JSON and leaves `src/page.html` alone. |

Built pages:

| Page | What it is |
|---|---|
| `lu-chart-desktop.html` | Lu's chart, the reference page. Built from `src/`. |
| `index.html` | The same page, which GitHub Pages serves. Built from `src/`. |
| `lu-chart.html`, `lu-chart-ios.html`, `lim-chart.html` | Older originals, not built and not linked from anywhere. Leave them untouched unless asked. |

## The page

`src/page.html` is the HTML: the head, the body markup (hero, sections, the Retrograde modal), one `@@ css/…` line per stylesheet inside `<style>`, and one `@@ js/…` line per script inside `<script>`.

The script files are not modules. `page.html` opens one closure (`(() => { 'use strict';`), the files run inside it in name order and share its scope, so a constant or function in any file is visible to the files after it, and `page.html` closes the closure after the last one. The number prefixes keep the original order; a new file takes a number between its neighbours.

| JS file | Owns |
|---|---|
| `src/js/01-content.js` | `CONTENT`, all of the page's copy, as JSON: stories, cheat codes, clusters, features, questions, callouts, intros, notes, the side-panel cards and planet tags. |
| `src/js/02-core.js` | Media flags (`RM` reduced motion, `TOUCH`, `PHONE`), `$` and `$$`, `T()` (text-presentation glyphs). |
| `src/js/03-chart-data.js` | The chart's data: `ASC`, `MC`, `CUSPS`, `CUSP_TXT`, `PLANETS`, `ANGLES`, `ASPECTS`; the fixed tables `SIGNS`, `EL`, `ELHEX`, `HOUSES`, `ATYPE`; lookups (`houseOf`, `signOf`, `aspectsOf`, `other`, `signTxt`, `houseSign`). |
| `src/js/04-state-segmented.js` | Focus state `S` (hover, lock, mode, tab, filter) with `same`, `parse`, `key`; `segmented()`, the gliding-lozenge and underline control. |
| `src/js/05-wheel.js` | Drawing the wheel SVG: house and sign sectors, cusps and axes, fanned planet glyphs, aspect lines and conjunction arcs, ink-centred glyphs, the centre label, `setMode`. |
| `src/js/06-describe.js` | `describe(f)`: name, position and lines for any focus, shared by the centre label, inspector and captions. |
| `src/js/07-phone-zoom.js` | The phone wheel camera (`frameOf`, `zoomTo`, `zoomSync`) and the ‹ › stepper (`stops`, `stepBy`). |
| `src/js/08-highlight.js` | `paint()`, the one focus model applied everywhere; hover and hit-testing by mode (`wheelHit`); lock and release (`pin`, `unpin`); the Retrograde modal; page-wide click and key handling. |
| `src/js/09-inspector.js` | The side panel: link spans, list rows, `renderFocus` (detail cards), the mode lists and tabs (`chooseMode`), sign ordering (`SIGNS_BY_COUNT`), aspect filters, underline rows that scroll, `showOnChart`. |
| `src/js/10-sections.js` | The sections below the chart: Placements by house, house cards, strength bars, element and mode donuts, the aspect grid and ranked list, clusters, stories, features, cheat codes, questions, intros. |
| `src/js/11-reveal-jump.js` | Fade-up on scroll (bars and donuts fill) and smooth in-page jumps with a flash. |
| `src/js/12-rail.js` | The desktop section rail: icons, scroll-spy, the gliding dot, `jump()`. |
| `src/js/13-phone-info.js` | The phone info area under the wheel: "Your chart" rest state (Sun, Moon, Rising tiles, signature cards parsed from the `stelliums` callout) and `infoRender`. |
| `src/js/14-phone-sheets.js` | Phone sheets: open and close, sheet history (back and forward), the swipeable index, long-press to open it. |
| `src/js/15-phone-rest.js` | The rest-of-chart sheet on phones (`openRest`, `closeRest`), Safari theme colour, the auto-hiding sheet bar. |
| `src/js/16-boot.js` | First render: readies the zoom, the info area and `paint()`. |
| `src/js/17-plate.js` | The hero's WebGL plate shader and its colour palette; pauses offscreen. |

| CSS file | Owns |
|---|---|
| `src/css/01-tokens-base.css` | The header comment, `:root` tokens (ink, wash, element and aspect colours, ease and spring), base element styles. |
| `src/css/02-type.css` | The type system (labels, titles, prose). |
| `src/css/03-page-rail.css` | Page grid and the section rail with its dot. |
| `src/css/04-sections.css` | Section spacing, cards, lift on hover, the reveal transition. |
| `src/css/05-hero.css` | Hero head, the plate (and its CSS gradient fallback), glass cards, toolbar, legend, the segmented control. |
| `src/css/06-wheel.css` | The wheel SVG: camera, layers, mode emphasis. |
| `src/css/07-inspector.css` | The inspector: mode tabs, lists, rows, links, detail cards, planet tags. |
| `src/css/08-tables.css` | Placements table rows, tags, ℞ buttons. |
| `src/css/09-modal.css` | The Retrograde modal and the "Show on chart" buttons. |
| `src/css/10-houses-strength.css` | House cards, two-column grids, strength bars, donuts. |
| `src/css/11-aspects.css` | The aspect grid and ranked list. |
| `src/css/12-stories-codes.css` | Clusters, stories, features, cheat codes, questions, footer. |
| `src/css/13-responsive.css` | Breakpoints at 1180, 960 and 640px. |
| `src/css/14-desktop.css` | Desktop (≥961px): full-screen chart, wheel sized to the window, the icon rail. |
| `src/css/15-phone.css` | Phone (≤960px): chart screen, info area, bottom tabs, sheets, index, the rest-of-chart sheet. |
| `src/css/16-reduced-motion.css` | Turning motion off under reduced motion. |

## Lu-specific parts

What changes from one person's chart to the next, and where it sits today:

| What | Where |
|---|---|
| Name, birth date, time and place, footer, the three fact-stating section titles, the phone sheet bar title | `src/page.html` |
| The header comment's name | `src/css/01-tokens-base.css` |
| The plate's CSS fallback gradient | `src/css/05-hero.css` |
| The phone page background behind the plate (`#123540`) | `src/css/15-phone.css` |
| All copy | `src/js/01-content.js` |
| Positions, cusps, angles, aspects | `src/js/03-chart-data.js` |
| Strength bars and balance donuts | `src/js/10-sections.js` |
| The plate's shader palette | `src/js/17-plate.js` |
