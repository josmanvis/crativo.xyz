# crativo.xyz — Design System

> **Concept: the instrument datasheet.** Jose builds instruments that make hidden
> state legible (a HUD for a DJ controller, a Touch Bar designer, kiosks, a
> virtual keyboard). The site is presented the same way: a printed spec sheet
> for a precise machine, with one live signal colour used only for *state*.

This file is the single source of truth for visual decisions. Every colour,
font, spacing value and component style comes from here. Motion lives in
[`docs/animation-map.md`](docs/animation-map.md).

---

## 1. Metaphors (from the Invention Gate)

| | Metaphor | What it means at rest |
|---|---|---|
| Physical sensation | **A machined control surface** — rubber pads with a firm detent | Square corners, hard edges, controls that look pressable, no soft blur |
| Materiality | **An instrument datasheet** — warm paper, dense ink, ruled grid, part numbers | Off-white paper, hairline rules, monospace metadata, catalogue numbering |
| Emotional trigger | **"Oh, *that's* what it's doing"** — hidden state made legible | Every surface reports real data; the HUD strip narrates what you point at |

**Never:** gradients-as-decoration, glassmorphism, glows, emoji as icons,
rounded "pill" chips, drop shadows, more than one accent colour.

---

## 2. Colour tokens

Defined in `src/app/globals.css` as CSS variables and exposed to Tailwind via
`@theme inline` (`bg-paper`, `text-ink`, `border-rule`, …).

| Token | Paper (default) | Night | Use |
|---|---|---|---|
| `--paper` | `#F1EFE8` | `#0E0E0D` | Page background |
| `--paper-2` | `#E7E4DA` | `#171715` | Raised surfaces, HUD, inline code |
| `--ink` | `#111110` | `#ECEAE3` | Primary text, borders of controls, ink panels |
| `--graphite` | `#55544E` | `#A3A198` | Secondary text (6.6:1 on paper, 7.6:1 on night) |
| `--rule` | `ink @ 14%` | `ink @ 16%` | Hairlines and grid guides |
| `--signal` | `#FF4A1C` | `#FF5A2E` | **Live state only**: LEDs, active markers, progress |
| `--signal-ink` | `#C2340B` | `#FF7A55` | Signal-coloured *text* (≥4.5:1) |
| `--screen` | `#141412` | `#050505` | "Display" bezels for images and code |

Rules:
- Body text is always `--ink` or `--graphite`. Never lighter.
- `--signal` is never used for text under 24px — use `--signal-ink`.
- Theme is chosen by `data-theme="night"` on `<html>`, persisted in
  `localStorage['crativo-theme']`. Paper is the default for everyone — it is
  the identity — and night is an opt-in via the nav switch.

---

## 3. Typography

| Role | Family | Settings |
|---|---|---|
| Display | **Archivo** (variable, `wdth` 62–125) | `font-stretch: 125%`, weight 800, tracking `-0.04em`, leading `0.88` |
| Headings | Archivo | `font-stretch: 112%`, weight 700, tracking `-0.025em` |
| Body | Archivo | `font-stretch: 100%`, weight 400, 17–18px / 1.6 |
| Labels, metadata, HUD | **JetBrains Mono** | 11–12px, uppercase, tracking `0.08em` |

Fluid scale (`clamp`):

| Token | Value |
|---|---|
| `.t-wordmark` | `clamp(4.5rem, 20.5vw, 21rem)` |
| `.t-display` | `clamp(3rem, 9vw, 8.5rem)` |
| `.t-title` | `clamp(2.25rem, 5.5vw, 5rem)` |
| `.t-h2` | `clamp(1.75rem, 3.6vw, 3rem)` |
| `.t-lede` | `clamp(1.125rem, 1.6vw, 1.375rem)` |
| `.t-label` | `11px` mono uppercase |

**Descender safety:** every display class carries `padding-bottom: 0.18em` and
`overflow: visible`. Mask reveals use `clip-path` on the element itself so the
padding stays inside the visible box.

---

## 4. Layout

- Container: `max-width: 1440px`, gutters `16px` (mobile) / `32px` (≥768px).
- 12-column grid, `24px` gap. Faint column guides are drawn behind content on
  ≥1024px (`.guides`).
- Vertical rhythm in multiples of 8px; sections separated by a full-bleed
  hairline and a **section header** (`§ 01 — INDEX` label + title).
- Fixed nav: 56px. Fixed HUD strip: 32px. Body reserves both.
- Full-screen sections use `100dvh`.

---

## 5. Components

| Component | Spec |
|---|---|
| **Nav** | Paper bar, bottom hairline. Wordmark left, mono links right with numeric prefixes (`01 WORK`). Active link shows a signal LED. Theme switch is a two-position toggle. Mobile: `MENU` button opens a full-screen ink panel. |
| **HUD strip** | Fixed bottom, `--paper-2`, top hairline, mono 11px. `● MODE` · readout · scroll % · local clock. |
| **Section header** | Mono label row (`§ 02`, title, count) above a hairline; title in `.t-h2`. |
| **Spec row** | Grid row with hairline bottom rule: part number (mono) · title · meta columns · arrow. Hover: paper-2 fill, arrow shifts 4px. |
| **Selector** | Row of square mono buttons; active = ink fill + signal LED. Press = `scale(0.97)`. |
| **Button** | Square, 1px ink border, mono uppercase label. Primary = ink fill, paper text. Hover inverts. |
| **Field** | Bottom-border-only input; mono label above; focus = 2px ink rule + signal LED in label. |
| **Display bezel** | `--screen` panel with 1px rule and mono caption bar; holds images and code. |
| **LED** | 8px square, `--signal` when live, `--rule` when idle. |

Icons: **Lucide only**, `stroke-width 1.5`, 16–20px.

Focus: `outline: 2px solid var(--signal); outline-offset: 3px` on
`:focus-visible` everywhere.
