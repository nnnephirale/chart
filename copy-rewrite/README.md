# Copy rewrite: handoff report

Status as of 2026-10-02. This folder holds everything needed to continue rewriting the chart's copy in a new session.

## Goal

Rewrite every explanation on `lu-chart-desktop.html` so casual to semi-serious astrology hobbyists enjoy it and a middle schooler can follow it. The larger aim is a repeatable process: paste a new astro.com "delineated Walter Pullen" (Astrolog) output and get a chart page that follows the same writing and design rules.

## Files here

| File | What it is |
|---|---|
| `source-lu-astrolog.txt` | The parts of Lu's astro.com output the copy draws on: body delineations, positions and cusps, ranked aspects, power tables. |
| `research-houses.md` | Deep notes on all 12 houses for this chart: traditional names, cusp signs, where each ruler sits, cross-house patterns (most rulers land in the 2nd). |
| `research-aspects-1.md`, `research-aspects-2.md` | Sign- and house-specific notes on all 24 aspects (incl. Pluto–North Node and the Chiron oppositions) plus contacts to the angles, with sources and disagreements flagged. |
| `research-digest.md` | Mainstream meanings from beginner-friendly sources (Cafe Astrology, AstroTwins, Chani, Astrology King, Wikipedia), with URLs. Use it for facts and write the copy in your own words. |

## Writing rules (all confirmed by the user)

The user's voice now lives in the shared `writing-voice` skill (dotclaude); copies of it and the humanizer sit in `rules/`, next to `rules/writing.md`, the general version of the rules below. Refresh the copies when the skills change. Load it with `humanizer` for every draft; it overrides the older "simple and short" reading of the rules below.

- **Reader:** casual to semi-serious hobbyists. A middle schooler must understand it easily, nothing more complex.
- **Address the reader as "you".**
- **Mainstream modern Western astrology only.** No esoteric astrology: no Bailey rays, esoteric or hierarchical rulers, mantrams or "soul ray". That material was removed from the page on 2026-10-02.
- **Run every draft through the `humanizer` skill.** No dashes, no stock AI words, no forced groups of three, no "not X but Y", no one-line closers.
- **Keep the intensity** (2026-10-02). Plain words, but never a flattened paraphrase: the reader should feel awe and recognition. For stories, features and questions, read the chart and surface your own findings. Psychological depth (wound, gift, shadow, destiny) is welcome; only Bailey-style esoteric material is out. Avoid the AI-texture words the user flagged: carry/carrying, loud/loudest, container.
- **Everyday words, joined-up sentences** (2026-10-02). Use connectors (and, so, because, while, which) and colons to link related facts; avoid runs of short statement-like sentences. No figurative "carry/carrying". These are now in the humanizer skill as §7a and §12.
- **Short sentences and everyday words.** Explain any astrology word in passing, e.g. "Astrologers call Aries an 'away game' for Venus (the word is detriment)."
- **Facts only from the astro.com text or the research digest.** Invent nothing. Where sources are weak (Saturn opposite Chiron), keep it short and general.
- **Weight notes** from astro.com ("minor part", "major part", "difficult to express") are kept only when the power table and the chart's shape back them up. A singleton (the only planet in an element) counts as a focus point.
- **Generational planets** (Uranus, Neptune, Pluto, and the slow aspects between them) say plainly that an age group shares them, then say why it matters for this person.
- **Retrograde is common and not bad.** Frame it as inward and in your own way.

## Where the copy goes

The planet, sign, house and aspect copy is side-panel text. It shows up as descriptors on a card when that item is in focus (hovered or locked), not as long blocks on the page. Write it for hobbyists: short, plain, about "you".

## Card structure

- **What it is:** one general line. It's the same for every chart, so it can live in the template.
- **In your chart:** two to five sentences for this person's sign, house and stand-out facts.
- **Tag:** a short plain label replacing the old jargon note (e.g. "Domicile ✓ — dominant" → "At home in Scorpio · your strongest planet").

## Progress

The draft files (`01-planets.md`, `02-signs.md`, `03-page-sections.md`) were deleted on 2026-10-02 at the user's request; the live copy in `lu-chart-desktop.html` is now the only source.

| Area | Status | Notes |
|---|---|---|
| Planets (12 bodies + Asc, MC) | On the site | `CONTENT.cards.planets` and `pnotes`. |
| Signs | On the site | `CONTENT.cards.signs`. |
| Houses | On the site (2026-10-02) | `CONTENT.cards.houses`, from `research-houses.md`. Written straight to the site at the user's request. |
| Aspects | On the site (2026-10-02) | `CONTENT.cards.aspects`: a line per aspect type plus a reading per pair. 24 aspects now: added Pluto conjunct North Node (0°35', mean node) and Chiron opposite the Moon (1°26') and Mars (2°24'). |
| Page sections | On the site | Clusters, stories, features, cheat codes, questions, callouts, intros, notes in `CONTENT`. |
| All | To do | The hint line and section headings in the All list. |
| Retrograde modal | To do | The `#rxModal` text predates these rules. The car analogy only fits outer planets, and "almost always" should become "usually" (mean vs true node). |

**Process for new copy:** read the source and the research, draft with `writing-voice` + `humanizer`, then (unless the user says to go straight to the site) show before/after samples first.

## Decisions (2026-10-02)

- Generational planets say up front that an age group shares them.
- Weight notes from astro.com stay only when the power table and the chart's shape back them up (Venus's "minor part" was dropped; it's the fire singleton and ranks 6th of 13).
- Ascendant and Midheaven are in the list; the tab is named Placements.
- Node: the page uses astro.com's mean node (Pluto–North Node 0°35'; the true node gives 1°50').
- Uranus–Neptune cycle: about 171 years (orbital average; Astrology King's 168 is off).

## Bookmarked (user will come back to it)

- **Voice pass over all page copy** (2026-10-02). Apply the `writing-voice` grammar moves (infinitive subjects, absolute comparatives, joined-up sentences, conditional mood for interpretations) to everything on the page, Planets and Signs cards included, and show the full before/after set before it goes live. Sample shown to the user:
  - "…so you tend to make your own way and set your own agenda. The hard part is letting other people in and letting them help, because so little of your chart faces them." → "…so you would tend to make your own way and set your own agenda, and one of the harder parts would be to let other people in and let them help, since so little of your chart faces them."
  - "…part of your life's work is letting yourself feel something all the way through…" → "…part of your life's work would be to let yourself feel something all the way through…"
  - "…your instinct is to handle everything yourself, and you're good enough at it…" → "…your instinct would be to handle everything yourself, and you'd be good enough at it…"

## Open questions

- **Lilith's aspects** (answered 2026-10-19). astro.com computes none: with Chiron and Lilith switched on, its power table scores 0.0 aspects for Chiron, Lilith, the node, Asc and MC alike. Computed from the page's positions: Uranus square 1°43', Mercury sextile 2°51' (wider: Neptune square 4°12', Asc square 4°55'). Waiting on the user: add the two tight ones to `ASPECTS` and the grid, and approve the Lilith and Chiron card samples.
- **Which power table** (2026-10-19). The second paste's planet table includes Chiron and Lilith and moves Mars from 5th to 2nd (10.29%, just ahead of Neptune) and the Sun from 10th of 13 to 11th of 15. The page still uses the first table. The new sign, element and house tables weren't pasted, so switching only the planet table would mix two settings.

## Known data issues

- **Chiron and Lilith come from astro.com** once they're switched on in the chart settings (second paste, 2026-10-19). It confirms Chiron in Virgo in the 8th, and retrograde, which the page now shows. Ask for the same settings when pasting new charts.
- **Mars sits about 10′ past the 2nd-house cusp,** and Venus 2°16' before the 3rd, so a slightly different birth time would move them.
- **astro.com lists no aspects to the angles or the nodes.** The closest it leaves out: Venus sextile Ascendant 0°53', Saturn trine MC 2°03', Chiron sextile MC 1°54'. Not on the page yet.
- **Open with the user:** how gently to handle the mother/early-home theme that three Moon aspects point to (currently left out), and whether to use evolutionary-astrology "soul" language for the node (currently not used).

## Where the copy lives in `lu-chart-desktop.html`

| Search for | What it holds |
|---|---|
| `"cards"` in `CONTENT` | Side-panel descriptors: `planets` and `signs` (`what`, `chart`, signs also `tag`), `houses` (array of 12 with `tag`), `aspects` (`types` lines plus `pairs` keyed "Planet|Planet" with `tag` and `chart`). |
| `const CONTENT` | All long-form copy (stories, codes, configs, features, prompts, callouts, intros, notes) and `pnotes`, the planet tags. |
| `function describe(` | Card titles and subheadings for planets, signs, houses and aspects. |
| `function renderFocus(` | Builds the side-panel cards from `CONTENT.cards`. |
| `const HINT` | The one-line hints at the top of each list. |
| `id="rxModal"` | The retrograde modal text. |
| `const HOUSES` | The one-word house themes. |

## Not done yet: the reusable pipeline

The page still has Lu's data typed in by hand. To make "paste raw data → new chart" work, the agreed order is:
1. Settle the voice for every area. That's this folder's job.
2. Split the page into a shared template plus `charts/<name>.json`.
3. Write a parser for the Astrolog text. It should skip midpoints, map lines, Arabic parts, planetary moons and rays.
4. Add a project CLAUDE.md for the workflow. A short one now exists and points here.
5. Commit, and add a STARTTHIS shortcut.

## Prompt to start the next session

> Continue the Lu chart copy. Read `copy-rewrite/README.md` first, load `writing-voice` and `humanizer`, then pick up the Bookmarked voice pass or the remaining To do rows.
