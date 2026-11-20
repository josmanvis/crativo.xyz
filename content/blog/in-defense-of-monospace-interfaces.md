---
title: "In Defense of Monospace Interfaces"
excerpt: "Monospace fonts aren't just for code. Numbers that don't jiggle, columns that line up for free, and an aesthetic that says 'this tool means business'. A love letter to the terminal look."
category: thoughts
publishedAt: "2026-06-05"
tags:
  - ui-design
  - typography
  - css
featured: false
---

I've been building a macOS dock replacement with a **brutalist terminal aesthetic**: monospace everything, hard edges, no blur-and-gradient soup. It's the kind of look people expect to be ugly, and it keeps turning out to be the opposite.

Because monospace is criminally underrated outside of code editors. Here's my case.

## Reason 1: numbers stop jiggling

In most proportional fonts, a **1** is narrower than an **8**. So when a number changes, say a clock, a timer, a price or a download percentage, the text **changes width** and everything next to it shuffles around. A ticking clock literally wobbles.

Monospace fixes it, because every character is the same width. Even if you don't want a full monospace font, you can get the same effect for digits in many fonts with one line:

```css
.clock,
.price,
.stat {
  font-variant-numeric: tabular-nums;
}
```

This is one of the highest-value, lowest-effort CSS properties in existence. Any number that updates live should have it. Your countdown timers will thank you.

## Reason 2: alignment for free

Monospace text lines up in columns without trying, because every character occupies the same grid cell. Tables of data, logs, file listings, settings and keyboard shortcuts all become instantly scannable.

That's why terminal UIs can show so much information without feeling chaotic. The grid does the organizing for you.

## Reason 3: it signals "tool, not toy"

Typography carries a tone. Rounded friendly sans-serifs say "welcome, friend." Elegant serifs say "please read this thoughtfully." Monospace says: **"this is an instrument, and it's telling you the truth."**

For dev tools, dashboards, utilities and anything data-heavy, that's exactly the right tone. It feels precise. It suggests the numbers are real.

## Reason 4: constraints make design decisions easier

With monospace you lose some typographic tools: no tight kerning, fewer weights in many families, and wide text. So you lean on the other tools: **size, case, spacing, color and rules** (lines). Uppercase labels with generous letter-spacing. Hairline dividers. One accent color used sparingly.

The result is a system with very few moving parts, which happens to be what makes a UI feel coherent.

## Where monospace is a bad idea

I'm a fan, not a fanatic.

- **Long reading.** Paragraphs of monospace are tiring. It's less efficient for reading prose, and readers notice. Use a proportional font for body text.
- **Narrow screens.** Monospace is wide, so text wraps sooner. On a watch or a small phone, that can eat valuable space.
- **Friendly consumer apps.** If your brand is warm and playful, an all-monospace UI will feel cold.

The sweet spot is a **mix**: a proportional font for reading, and monospace for labels, metadata, numbers and anything that behaves like data.

## A tiny starter kit

```css
:root {
  --font-ui: 'Archivo', system-ui, sans-serif;
  --font-data: 'JetBrains Mono', ui-monospace, monospace;
}

.label {
  font-family: var(--font-data);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.value {
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
}
```

Small uppercase mono labels over proportional values is a pattern you'll find on spec sheets, instrument panels and audio gear, and it works for a reason.

## The vibe check

Interfaces don't have to look like a glossy app store screenshot to feel premium. Sometimes the most confident design move is to strip everything back to a grid, a mono font and one bright color, and let the information be the decoration.

My dock now looks like a piece of lab equipment. It's the most "me" thing on my computer.
