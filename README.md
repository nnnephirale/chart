# Natal chart pages

An interactive birth-chart page: a wheel you can hover and lock, a side panel that explains every planet, sign, house and aspect, and ten stories, cheat codes and questions written from the chart itself. See the live example at [nnnephirale.github.io/chart](https://nnnephirale.github.io/chart/).

You can make one for yourself or a friend by pasting an astro.com report into a coding agent. The agent follows the recipe in [AGENTS.md](AGENTS.md), keeping the design as it is and writing the copy by the rules in [rules/](rules/).

## What you need

- **A coding agent:** [Claude Code](https://claude.com/claude-code) or [Codex](https://openai.com/codex/). Either one's normal plan covers this, with no API key needed.
- **Git**, to download this folder.
- **The birth details:** date, exact time and place.

## Make a chart

**1. Get the report from astro.com.** Enter the birth details on [astro.com](https://www.astro.com), then open the Walter Pullen (Astrolog) text report with delineations. Use Placidus houses, and switch on Chiron and Lilith under the additional objects. Select the whole text and copy it.

**2. Download this folder and open it in your agent:**

```bash
git clone https://github.com/nnnephirale/chart.git && cd chart && claude
```

Using Codex instead? Replace `claude` at the end with `codex`.

**3. Paste and ask:**

> Make a chart page for Sam from this astro.com report: *(paste the report)*

The agent shows you a few sample cards and a story first. Once you're happy with the voice, it writes the rest and saves the page as `charts/sam.html`.

**4. Open it.** Double-click the file. It runs straight from your computer, with no server.

## What's in here

| Path | What it is |
|---|---|
| `lu-chart-desktop.html` | The reference page (Lu's chart). New charts start as a copy of it. |
| `AGENTS.md` | The step-by-step recipe agents follow. Claude Code reads it through `CLAUDE.md`, Codex reads it directly. |
| `rules/writing.md` | The writing rules: who the reader is, which astrology counts, how facts are sourced. |
| `rules/writing-voice.md`, `rules/humanizer.md` | The voice the copy is written in, and the AI-writing tells it avoids. The humanizer is MIT-licensed (see `rules/humanizer-LICENSE.txt`). |
| `DESIGN-NOTES.md` | Every design and interaction rule behind the page. |
| `charts/` | Where new chart pages go. |

## Good to know

- **Birth data is personal.** Keep a friend's chart off public GitHub unless they agree.
- **The copy takes a while to write.** A full page has over 100 pieces of text, and the agent checks each one against the rules.
- **Fetching from astro.com is off the table.** Their terms allow only people using a browser, which is why you paste the report yourself.
- **The page is for fun and reflection.** Interpretations are symbolic, not predictions.
