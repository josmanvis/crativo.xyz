---
title: "CSS Container Queries: The Complete Guide"
excerpt: "Everything you need to know about container queries - syntax, use cases, fallbacks, combining with custom properties, and real-world patterns."
category: tutorials
publishedAt: 2025-01-24
tags: ["css", "container-queries", "responsive-design", "web-development", "frontend"]
coverImage: /blog/css-container-queries.svg
featured: true
readingTime: "22 min"
---

# CSS Container Queries: The Complete Guide

For over a decade, we've been building responsive layouts with media queries. They work, but they have a fundamental limitation: they respond to the viewport, not to the container.

This creates awkward situations. You build a beautiful card component that looks great at various viewport sizes. Then you drop it into a sidebar—and it breaks. The card doesn't know it's in a narrow container. It only knows the viewport is 1200px wide.

Container queries fix this. Components can now respond to their parent's size, not the viewport. It's the feature we've been requesting since 2011.

This is everything you need to know to use them effectively.

## The Problem Container Queries Solve

Consider this card component:

```css
.card {
  display: grid;
  gap: 1rem;
}

/* Viewport-based responsive */
@media (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

At viewport widths above 600px, the card shows image and content side-by-side. Below 600px, they stack.

Now imagine this card in three different contexts:

```
┌──────────────────────────────────────────────────────────────────┐
│                         Viewport: 1200px                         │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│     Main Content Area          │         Sidebar                 │
│     (800px wide)               │         (350px wide)            │
│                                │                                 │
│  ┌─────────┬────────────────┐  │  ┌─────────┬──────────────┐    │
│  │  Image  │  Card Content  │  │  │  Image  │ Card Content │    │
│  │         │                │  │  │         │              │    │
│  └─────────┴────────────────┘  │  └─────────┴──────────────┘    │
│                                │                                 │
│     ✓ Looks great              │     ✗ Too cramped!             │
│                                │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

The viewport is 1200px, so both cards get the side-by-side layout. But the sidebar card is crammed into 350px—it should stack!

With container queries:

```css
.card-container {
  container-type: inline-size;
}

.card {
  display: grid;
  gap: 1rem;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}
```

Now the card responds to its container, not the viewport:

```
┌──────────────────────────────────────────────────────────────────┐
│                         Viewport: 1200px                         │
├────────────────────────────────┬─────────────────────────────────┤
│                                │                                 │
│     Main Content Area          │         Sidebar                 │
│     (800px wide)               │         (350px wide)            │
│                                │                                 │
│  ┌─────────┬────────────────┐  │  ┌──────────────────────────┐  │
│  │  Image  │  Card Content  │  │  │        Image             │  │
│  │         │                │  │  ├──────────────────────────┤  │
│  └─────────┴────────────────┘  │  │      Card Content        │  │
│                                │  └──────────────────────────┘  │
│     ✓ Side-by-side (>400px)    │     ✓ Stacked (<400px)         │
│                                │                                 │
└────────────────────────────────┴─────────────────────────────────┘
```

This is the paradigm shift. Components become truly self-contained.

## Basic Syntax

### Defining a Container

First, establish a containment context:

```css
.container {
  container-type: inline-size;
}
```

`container-type` values:
- `inline-size` — Query the container's inline dimension (width in horizontal writing modes)
- `size` — Query both inline and block dimensions (width and height)
- `normal` — No containment, but allows `container-name` for style queries

**Important:** You cannot query an element based on its own size. You must wrap it in a container.

```css
/* ❌ This won't work */
.card {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { /* Can't query itself! */ }
}

/* ✅ This works */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { /* Queries the parent container */ }
}
```

### Naming Containers

When you have nested containers, name them to be specific:

```css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.card-wrapper {
  container-type: inline-size;
  container-name: card;
}

/* Query specific container */
@container sidebar (min-width: 300px) {
  .sidebar-widget { /* ... */ }
}

@container card (min-width: 400px) {
  .card { /* ... */ }
}
```

### Shorthand

Combine type and name:

```css
.container {
  container: sidebar / inline-size;
  /* Equivalent to:
     container-name: sidebar;
     container-type: inline-size;
  */
}
```

### Query Syntax

Container queries use similar syntax to media queries:

```css
/* Width-based */
@container (min-width: 400px) { }
@container (max-width: 600px) { }
@container (width >= 400px) { }
@container (400px <= width <= 800px) { }

/* Height-based (requires container-type: size) */
@container (min-height: 300px) { }

/* Combining conditions */
@container (min-width: 400px) and (max-width: 800px) { }
@container (min-width: 400px) or (min-height: 300px) { }
@container not (min-width: 400px) { }

/* Named container */
@container card (min-width: 400px) { }
```

## Container Query Units

Container queries introduce new units relative to the query container:

| Unit | Description |
|------|-------------|
| `cqw` | 1% of container's width |
| `cqh` | 1% of container's height |
| `cqi` | 1% of container's inline size |
| `cqb` | 1% of container's block size |
| `cqmin` | Smaller of `cqi` or `cqb` |
| `cqmax` | Larger of `cqi` or `cqb` |

These are incredibly useful for fluid typography and spacing:

```css
.container {
  container-type: inline-size;
}

.card-title {
  /* Font size scales with container width */
  font-size: clamp(1rem, 4cqi, 2rem);
}

.card-padding {
  /* Padding scales with container */
  padding: 2cqi;
}
```

**Visualization of container units:**

```
┌─────────────────────────────────────────────┐
│                Container                     │
│                                             │
│  ←─────────── 100cqi (width) ──────────────→│
│                                             │
│  ↑                                          │
│  │                                          │
│  │ 100cqb                                   │
│  │ (height)                                 │
│  │                                          │
│  ↓                                          │
│                                             │
│  1cqi = 1% of container inline size         │
│  1cqb = 1% of container block size          │
│                                             │
└─────────────────────────────────────────────┘
```

## Real-World Patterns

### Pattern 1: Responsive Card Component

The canonical use case—a card that adapts to any container:

```css
/* Container setup */
.card-container {
  container-type: inline-size;
}

/* Base card styles (mobile-first) */
.card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card__image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  width: 100%;
}

.card__content {
  padding: 1rem;
}

.card__title {
  font-size: 1.125rem;
  margin: 0 0 0.5rem;
}

.card__description {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Medium container: horizontal layout */
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
  
  .card__image {
    width: 40%;
    aspect-ratio: 1;
  }
  
  .card__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

/* Large container: enhanced layout */
@container (min-width: 600px) {
  .card__image {
    width: 300px;
  }
  
  .card__title {
    font-size: 1.5rem;
  }
  
  .card__content {
    padding: 1.5rem;
  }
}
```

```html
<div class="card-container">
  <article class="card">
    <img class="card__image" src="image.jpg" alt="">
    <div class="card__content">
      <h3 class="card__title">Card Title</h3>
      <p class="card__description">Description text here</p>
    </div>
  </article>
</div>
```

### Pattern 2: Navigation Component

A navigation that adapts from icons to full labels:

```css
.nav-container {
  container-type: inline-size;
}

.nav {
  display: flex;
  gap: 0.25rem;
}

.nav__item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: #64748b;
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav__item:hover {
  background-color: #f1f5f9;
}

.nav__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.nav__label {
  display: none;
}

/* Show labels when container has space */
@container (min-width: 500px) {
  .nav__item {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
  
  .nav__label {
    display: block;
    font-size: 0.875rem;
  }
}

/* Full navigation bar style */
@container (min-width: 700px) {
  .nav {
    gap: 0.5rem;
  }
  
  .nav__item {
    padding: 0.75rem 1.5rem;
  }
  
  .nav__label {
    font-size: 1rem;
  }
}
```

### Pattern 3: Data Table to Cards

Tables that transform into cards on narrow containers:

```css
.table-container {
  container-type: inline-size;
}

/* Default: Card layout for narrow containers */
.data-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-header {
  display: none; /* Hide header in card view */
}

.data-cell {
  display: flex;
  flex-direction: column;
}

.data-cell::before {
  content: attr(data-label);
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

/* Table layout for wider containers */
@container (min-width: 600px) {
  .data-table {
    display: table;
    width: 100%;
    border-collapse: collapse;
  }
  
  .data-header {
    display: table-header-group;
    background: #f8fafc;
  }
  
  .data-header .data-cell {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .data-row {
    display: table-row;
    box-shadow: none;
    border-radius: 0;
  }
  
  .data-row:not(.data-header) {
    border-bottom: 1px solid #e2e8f0;
  }
  
  .data-cell {
    display: table-cell;
    padding: 1rem;
    vertical-align: middle;
  }
  
  .data-cell::before {
    display: none; /* Hide labels in table view */
  }
}
```

### Pattern 4: Hero Section Variations

A hero component that transforms based on available space:

```css
.hero-container {
  container-type: inline-size;
}

/* Compact: stacked, centered */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  gap: 1.5rem;
}

.hero__content {
  max-width: 500px;
}

.hero__title {
  font-size: clamp(1.5rem, 5cqi, 3rem);
  line-height: 1.2;
  margin: 0 0 1rem;
}

.hero__description {
  font-size: clamp(1rem, 2.5cqi, 1.25rem);
  color: #64748b;
  margin: 0 0 1.5rem;
}

.hero__image {
  width: 100%;
  max-width: 400px;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 1rem;
}

/* Medium: side-by-side */
@container (min-width: 700px) {
  .hero {
    flex-direction: row;
    text-align: left;
    padding: 3rem 2rem;
    gap: 3rem;
  }
  
  .hero__content {
    flex: 1;
  }
  
  .hero__image {
    flex: 1;
    max-width: 50%;
  }
}

/* Large: enhanced spacing and sizing */
@container (min-width: 1000px) {
  .hero {
    padding: 4rem 3rem;
    gap: 4rem;
  }
  
  .hero__image {
    max-width: 500px;
    aspect-ratio: 1;
    border-radius: 1.5rem;
  }
}
```

### Pattern 5: Sidebar Widget Grid

Widgets that adapt to sidebar width:

```css
.widget-container {
  container-type: inline-size;
  container-name: widget;
}

.widget-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

.widget {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.widget__title {
  font-size: 0.875rem;
  text-transform: uppercase;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.widget__value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

/* Two columns when wider */
@container widget (min-width: 350px) {
  .widget-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* Span featured widget */
  .widget--featured {
    grid-column: span 2;
  }
}

/* Three columns for large containers */
@container widget (min-width: 500px) {
  .widget-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .widget--featured {
    grid-column: span 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
```

## Combining with Custom Properties

Container queries and custom properties are a powerful combination:

### Fluid Scaling with Container Units

```css
.responsive-component {
  container-type: inline-size;
  
  /* Define scale factors */
  --scale: 1;
  --space: 1rem;
  --text-base: 1rem;
}

@container (min-width: 400px) {
  .responsive-component {
    --scale: 1.25;
    --space: 1.25rem;
    --text-base: 1.125rem;
  }
}

@container (min-width: 600px) {
  .responsive-component {
    --scale: 1.5;
    --space: 1.5rem;
    --text-base: 1.25rem;
  }
}

/* Components use the variables */
.responsive-component .heading {
  font-size: calc(var(--text-base) * 1.5);
}

.responsive-component .body {
  font-size: var(--text-base);
}

.responsive-component .card {
  padding: var(--space);
  gap: calc(var(--space) * 0.75);
}
```

### Theme Switching Based on Container

```css
.themed-container {
  container-type: inline-size;
  
  /* Default theme */
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  --accent: #3b82f6;
}

/* Dark theme for narrow containers (e.g., sidebar) */
@container (max-width: 300px) {
  .themed-container {
    --bg-primary: #1e293b;
    --text-primary: #f1f5f9;
    --accent: #60a5fa;
  }
}

.themed-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-left: 3px solid var(--accent);
}
```

### Dynamic Grid Columns

```css
.grid-container {
  container-type: inline-size;
  --columns: 1;
}

@container (min-width: 300px) {
  .grid-container { --columns: 2; }
}

@container (min-width: 500px) {
  .grid-container { --columns: 3; }
}

@container (min-width: 700px) {
  .grid-container { --columns: 4; }
}

.auto-grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: 1rem;
}
```

## Container Style Queries

Beyond size queries, CSS is introducing **style queries**—query based on custom property values:

```css
.card-container {
  container-name: card;
}

/* Apply styles based on custom property value */
@container card style(--variant: featured) {
  .card {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
  }
}

@container card style(--variant: compact) {
  .card {
    padding: 0.5rem;
  }
  
  .card__title {
    font-size: 0.875rem;
  }
}
```

Usage:

```html
<div class="card-container" style="--variant: featured">
  <div class="card">Featured card!</div>
</div>

<div class="card-container" style="--variant: compact">
  <div class="card">Compact card</div>
</div>
```

**Note:** Style queries are newer and have less browser support than size queries. Check compatibility before using in production.

## Fallback Strategies

Container queries have excellent modern browser support (Chrome 105+, Firefox 110+, Safari 16+), but you might need fallbacks:

### Feature Detection with @supports

```css
/* Base styles (works everywhere) */
.card {
  display: flex;
  flex-direction: column;
}

/* Media query fallback */
@media (min-width: 600px) {
  .card {
    flex-direction: row;
  }
}

/* Container query enhancement */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  /* Reset media query styles */
  .card {
    flex-direction: column;
  }
  
  @container (min-width: 400px) {
    .card {
      flex-direction: row;
    }
  }
}
```

### Progressive Enhancement Pattern

```css
/* 1. Mobile-first base */
.component {
  /* Default narrow layout */
}

/* 2. Media query for browsers without container query support */
@media (min-width: 768px) {
  .component {
    /* Assume component is wide when viewport is wide */
  }
}

/* 3. Container query overrides for modern browsers */
@supports (container-type: inline-size) {
  .component-wrapper {
    container-type: inline-size;
  }
  
  /* Reset to base styles */
  .component {
    /* Default narrow layout */
  }
  
  /* Apply based on actual container size */
  @container (min-width: 500px) {
    .component {
      /* Wide layout */
    }
  }
}
```

### JavaScript Polyfill (if absolutely necessary)

```javascript
// Check for support
if (!CSS.supports('container-type', 'inline-size')) {
  // Load polyfill or implement fallback
  import('container-query-polyfill');
}
```

The [container-query-polyfill](https://github.com/GoogleChromeLabs/container-query-polyfill) from Google Chrome Labs works well but adds JavaScript overhead.

## Performance Considerations

Container queries are generally performant, but understand the implications:

### Containment Side Effects

`container-type: inline-size` establishes **layout**, **style**, and **inline-size containment**:

```css
.container {
  container-type: inline-size;
  /* Equivalent to: */
  /* contain: layout style inline-size; */
}
```

This means:

1. **Layout containment** — The container is an independent formatting context. Internal floats, margins, and such don't escape.

2. **Size containment** (inline) — The container's inline size cannot depend on its descendants. This is required for container queries to work (no circular dependencies).

**Practical impact:**

```css
/* ⚠️ This won't work as expected */
.container {
  container-type: inline-size;
  width: fit-content; /* Wants to size based on content */
}
/* Container will have 0 width because it can't measure content */

/* ✅ Give the container an explicit or percentage width */
.container {
  container-type: inline-size;
  width: 100%;
}
```

### Block Size Queries

If you need to query height, use `container-type: size`:

```css
.container {
  container-type: size;
  height: 400px; /* Must have explicit height */
}

@container (min-height: 300px) {
  .content {
    /* Tall container styles */
  }
}
```

**Warning:** `size` containment requires the element to have a defined size in both dimensions. It can't size to content.

### Nesting Containers

You can nest containers, but be mindful:

```css
.outer {
  container-type: inline-size;
  container-name: outer;
}

.inner {
  container-type: inline-size;
  container-name: inner;
}

/* Query nearest container (inner) */
@container (min-width: 300px) {
  .element { /* ... */ }
}

/* Query specific container */
@container outer (min-width: 600px) {
  .element { /* ... */ }
}
```

## Comparison: Media Queries vs Container Queries

| Aspect | Media Queries | Container Queries |
|--------|---------------|-------------------|
| Responds to | Viewport size | Container size |
| Use case | Page layout | Component layout |
| Nesting | Can't query parent | Queries parent container |
| Browser support | Universal | Modern browsers |
| Setup | None | Needs `container-type` |
| Performance | Very fast | Fast (with containment) |

**When to use each:**

```css
/* Media queries: Page-level layout */
@media (min-width: 768px) {
  .page-layout {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
}

/* Container queries: Component-level layout */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

They work together beautifully. Media queries handle the macro layout, container queries handle the micro.

## Building a Component Library with Container Queries

Here's how to architect reusable components:

### 1. Establish Container Conventions

```css
/* _containers.css */

/* Generic container wrapper */
.cq-container {
  container-type: inline-size;
}

/* Named containers for specific contexts */
.cq-sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.cq-main {
  container-type: inline-size;
  container-name: main;
}

.cq-card {
  container-type: inline-size;
  container-name: card;
}
```

### 2. Component Breakpoint Tokens

```css
/* _tokens.css */
:root {
  /* Component breakpoint tokens */
  --bp-card-sm: 300px;
  --bp-card-md: 450px;
  --bp-card-lg: 600px;
  
  --bp-nav-compact: 400px;
  --bp-nav-full: 600px;
}
```

### 3. Self-Contained Components

```css
/* _card.css */

/* Card automatically becomes a container query target */
.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.card__media {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Container query variants */
@container (min-width: 400px) {
  .card {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .card__media {
    flex: 0 0 40%;
    aspect-ratio: 1;
  }
  
  .card__body {
    flex: 1;
    justify-content: center;
  }
}

@container (min-width: 600px) {
  .card {
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .card__media {
    flex: 0 0 250px;
  }
}
```

### 4. Utility Classes for Containers

```css
/* _utilities.css */

/* Quick container setup */
.contain-inline { container-type: inline-size; }
.contain-size { container-type: size; }

/* Named containers */
[data-container] {
  container-type: inline-size;
  container-name: attr(data-container);
}
```

Usage:

```html
<div data-container="sidebar">
  <nav class="sidebar-nav">...</nav>
</div>
```

## Debugging Container Queries

### Chrome DevTools

1. Open DevTools → Elements panel
2. Select a container element
3. Look for the "container" badge in the DOM tree
4. The Styles panel shows which `@container` rules apply
5. Resize the container to see queries trigger

### Firefox DevTools

Firefox has excellent container query debugging:
1. Select the container
2. The "container" badge appears
3. Hover over `@container` rules to highlight the queried container

### Manual Debugging

Add a visual indicator:

```css
.container {
  container-type: inline-size;
  position: relative;
}

/* Debug: show container width */
.container::after {
  content: "Container: " attr(style);
  position: absolute;
  top: 0;
  right: 0;
  background: black;
  color: lime;
  font-size: 10px;
  padding: 2px 4px;
  font-family: monospace;
}

/* Or use resize observer in JS to show actual width */
```

## Common Gotchas

### 1. Container Can't Query Itself

```css
/* ❌ Won't work */
.element {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .element { /* Querying itself! */ }
}

/* ✅ Need a wrapper */
.element-container {
  container-type: inline-size;
}
@container (min-width: 400px) {
  .element { /* Queries parent */ }
}
```

### 2. Intrinsic Sizing Conflicts

```css
/* ❌ Container has no size without content */
.container {
  container-type: inline-size;
  width: fit-content;
}

/* ✅ Give it explicit sizing */
.container {
  container-type: inline-size;
  width: 100%;
}
```

### 3. Unnamed Container Query Ambiguity

```css
.outer { container-type: inline-size; }
.inner { container-type: inline-size; }

/* This queries .inner (nearest container) */
@container (min-width: 500px) {
  .element { }
}

/* Be explicit with names if you need the outer */
.outer { container-name: outer; }
@container outer (min-width: 500px) {
  .element { }
}
```

### 4. Z-Index and Stacking

Containment creates a new stacking context:

```css
.container {
  container-type: inline-size;
  /* This also creates a stacking context */
}

/* Elements inside can't z-index above container siblings */
```

## The Future: Container Units Everywhere

Container units (`cqi`, `cqb`, etc.) work outside container queries too:

```css
.container {
  container-type: inline-size;
}

/* Use container units in regular styles */
.responsive-text {
  font-size: clamp(1rem, 4cqi, 2.5rem);
  padding: 2cqi;
  margin-bottom: 3cqi;
}
```

This enables fluid scaling without breakpoints:

```css
.fluid-card {
  --padding: clamp(1rem, 4cqi, 2rem);
  --gap: clamp(0.75rem, 2cqi, 1.5rem);
  --title-size: clamp(1.25rem, 4cqi, 2rem);
  --body-size: clamp(0.875rem, 2cqi, 1.125rem);
  
  padding: var(--padding);
  gap: var(--gap);
}

.fluid-card__title {
  font-size: var(--title-size);
}

.fluid-card__body {
  font-size: var(--body-size);
}
```

## Wrapping Up

Container queries fundamentally change how we build components. Instead of asking "how wide is the viewport?", we ask "how wide is my container?" Components become truly portable.

Key takeaways:

1. **Container queries respond to parent size** — Not the viewport
2. **Establish containment** — Use `container-type: inline-size`
3. **Name containers** — Avoid ambiguity with `container-name`
4. **Container units scale fluidly** — `cqi`, `cqb`, etc.
5. **Works with media queries** — Macro vs micro layout
6. **Mind the containment** — Size containment has implications
7. **Progressive enhancement** — Support is excellent, but fallbacks exist

The era of viewport-dependent components is ending. Build components that adapt to where they live.

---

*Questions about container queries? I'm always happy to dive deeper into specific use cases. Check out my other CSS articles or reach out on Twitter.*
