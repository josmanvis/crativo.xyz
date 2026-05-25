---
title: "Modern CSS Reset: What I Actually Use"
date: "2026-05-25"
description: "Eric Meyer's reset was great for 2007. In 2026, we need a smarter, minimal reset that leverages modern CSS defaults."
tags: ["CSS", "Best Practices", "Architecture"]
image: "/blog/modern-css-reset-2026.svg"
---

The goal of a CSS reset isn't to obliterate every browser default. It's to create a sane, predictable baseline. 

For years, we copy-pasted massive reset files that stripped all margins, paddings, list styles, and font sizes, only to manually add them back in a few lines later. It was exhausting.

Modern CSS is much more robust. Browsers are more consistent. We don't need a sledgehammer anymore; we need a scalpel. Here is the modern, minimal CSS reset I actually use on every project in 2026.

## 1. The Box Model Fix

This is non-negotiable. The default `content-box` model is confusing and breaks layouts when you add padding or borders. We switch everything to `border-box`.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## 2. Removing Default Margins

Browsers apply default margins to body, headings, paragraphs, and lists. We want to control spacing explicitly, usually with grid gaps or logical properties.

```css
* {
  margin: 0;
}
```
*Note: I prefer the universal selector here over explicitly listing elements. It's cleaner and catches edge cases.*

## 3. Sensible Media Defaults

Images and videos should never break out of their containers. They should also be block-level elements by default to avoid the weird inline spacing issues (the mysterious bottom gap).

```css
img,
picture,
video,
canvas,
svg {
  display: block;
  max-inline-size: 100%;
  block-size: auto;
}
```

## 4. Typography Baseline

We want typography to inherit smoothly. Form elements historically stubbornly refuse to inherit fonts. We force them to. We also prevent text size adjustments on orientation changes in iOS.

```css
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}
```

## 5. Next-Gen Root Scoping

A modern addition is utilizing the `color-scheme` property to automatically get a dark/light mode baseline for default browser UI elements (like scrollbars, inputs, and form controls). We also ensure the root takes up the full viewport height.

```css
html {
  color-scheme: dark light;
  block-size: 100%;
}

body {
  min-block-size: 100vh; /* Fallback */
  min-block-size: 100dvh; /* Modern dynamic viewport */
}
```

## 6. The `isolation` Trick

Stacking contexts in CSS can be a nightmare. `z-index` wars are fought and lost every day. We can create a new root stacking context on our framework's mount point (e.g., `#root` or `#__next`) to prevent internal `z-index` values from leaking out.

```css
#root,
#__next {
  isolation: isolate;
}
```

![CSS Reset Box Model Impact](/blog/modern-css-reset-2026-inline.svg)

## The Complete Reset

Here it is, all together, ready to copy-paste:

```css
/* 1. Use a more-intuitive box-sizing model */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 2. Remove default margin */
* {
  margin: 0;
}

/* 3. Allow percentage-based heights in the application */
html {
  block-size: 100%;
  color-scheme: dark light;
}

/* 4. Add accessible line-height and improve text rendering */
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-block-size: 100dvh;
}

/* 5. Improve media defaults */
img, picture, video, canvas, svg {
  display: block;
  max-inline-size: 100%;
  block-size: auto;
}

/* 6. Remove built-in form typography styles */
input, button, textarea, select {
  font: inherit;
}

/* 7. Avoid text overflows */
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}

/* 8. Create a root stacking context */
#root, #__next {
  isolation: isolate;
}
```

It's minimal, it's logical, and it solves 99% of layout headaches before they even begin. Stop fighting the browser; give it better instructions.
