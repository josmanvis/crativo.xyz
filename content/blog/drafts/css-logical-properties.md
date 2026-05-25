---
title: "CSS Logical Properties: Stop Using Margin-Left"
date: "2026-05-25"
description: "Physical CSS properties are holding your layouts back. It's time to think logically about space, text direction, and component design."
tags: ["CSS", "Web Development", "Layout"]
image: "/blog/css-logical-properties.svg"
---

Physical CSS properties are holding your layouts back. If you're still writing `margin-left` or `padding-top`, you're building fragile interfaces that break the moment your content translates to a right-to-left (RTL) language or switches writing modes. 

It's time to stop thinking in terms of physical screen directions (top, bottom, left, right) and start thinking logically (block and inline).

## The Problem: Physical Properties

Let's look at the old way. You're building a simple button with an icon. The icon needs some space between it and the text.

```css
.button .icon {
  margin-right: 8px; /* The physical approach */
}
```

It looks fine, right? Until your company decides to launch an Arabic version of the site. Arabic is read right-to-left. Now, your icon has margin on its right side, pushing against the left edge of the button, while the text sits uncomfortably close to its left side.

To fix it, you write a hack:

```css
.button .icon {
  margin-right: 8px;
}

[dir="rtl"] .button .icon {
  margin-right: 0;
  margin-left: 8px;
}
```

Multiply this by a hundred components, and your CSS is bloated, hard to maintain, and prone to visual bugs.

## The Solution: Logical Properties

Enter CSS Logical Properties. Instead of tying space to the physical screen, we tie it to the flow of the text.

- **Block**: The direction blocks stack (vertical in English, top-to-bottom).
- **Inline**: The direction text flows within a line (horizontal in English, left-to-right).

Instead of `margin-right`, we use `margin-inline-end`.

```css
.button .icon {
  margin-inline-end: 8px; /* The logical approach */
}
```

That's it. No `[dir="rtl"]` hacks. If the user's system or the HTML `dir` attribute switches to RTL, the browser automatically applies the margin to the left side of the icon, because the "end" of the inline direction has swapped.

![Logical vs Physical Box Model](/blog/css-logical-properties-inline.svg)

## Replacing the Physical Box Model

Here's a cheat sheet for replacing physical properties with their logical counterparts.

### Margins and Padding

- `margin-top` → `margin-block-start`
- `margin-bottom` → `margin-block-end`
- `margin-left` → `margin-inline-start`
- `margin-right` → `margin-inline-end`
- `margin: 10px 20px;` (vertical, horizontal) → `margin-block: 10px; margin-inline: 20px;`

### Borders

- `border-top` → `border-block-start`
- `border-bottom` → `border-block-end`
- `border-left` → `border-inline-start`
- `border-right` → `border-inline-end`
- `border-radius: 4px 4px 0 0;` (top-left, top-right, bottom-right, bottom-left) → `border-start-start-radius`, `border-start-end-radius`, etc.

### Sizing (Width and Height)

- `width` → `inline-size`
- `height` → `block-size`
- `max-width` → `max-inline-size`
- `min-height` → `min-block-size`

Let's look at a real-world card component using purely logical properties:

```css
.card {
  inline-size: 100%;
  max-inline-size: 400px;
  padding-block: 2rem;
  padding-inline: 1.5rem;
  border-inline-start: 4px solid var(--accent-color);
  margin-block-end: 1rem;
}
```

This card is now bulletproof. If you drop it into an English site, it has a left border and max-width. Drop it into a Hebrew site, it has a right border. Drop it into a vertical Japanese writing mode (`writing-mode: vertical-rl;`), the border appears on the top, and the text flows vertically. The component adapts to the content, not the screen.

## Why This Matters Now

You might be thinking, "I don't build multi-lingual sites, why should I care?"

Because logical properties map closer to how flexbox and grid work. When you use flexbox, you think in terms of `justify-content` (main axis) and `align-items` (cross axis). Logical properties use the same mental model.

When you write `margin-inline-start: auto;` in a flex container, it perfectly aligns with how flexbox handles space distribution, regardless of the `flex-direction`.

It's time to deprecate physical properties in your mind. Set up a linter rule to warn against them. Your future self—and your global user base—will thank you.
