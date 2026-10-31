# Astrology charts

Interactive natal-chart pages. To make a new chart from an astro.com paste, follow AGENTS.md:

@AGENTS.md

## Working on Lu's page (the reference)

The live page is `lu-chart-desktop.html`; `index.html` is the copy GitHub Pages serves. Both are built by `node scripts/build.mjs` from the shared engine in `src/` and Lu's data and copy in `people/lu/` (`chart.json`, `content.json`): edit those, never the built pages, and follow "Changing the page's code" in AGENTS.md. [ARCHITECTURE.md](ARCHITECTURE.md) maps every source file to what it owns. `lu-chart.html`, `lu-chart-ios.html` and `lim-chart.html` are older originals; leave them untouched unless asked.

Before any work on it, read:
- `DESIGN-NOTES.md`: every design and interaction rule the owner has set (modes, locking, panel, motion, colour, sign ordering). Add new rules there when the owner states them.
- `copy-rewrite/README.md`: progress on Lu's copy, open questions and known data issues.
- `rules/writing.md`, `rules/writing-voice.md` and `rules/humanizer.md`: the writing rules. Show before/after samples for approval before changing the site's copy.
