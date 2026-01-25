---
title: "CSS :has() - The Parent Selector We Waited 20 Years For"
excerpt: CSS finally lets us select parents based on children. This changes everything.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - CSS
  - Frontend
  - Web Development
coverImage: /blog/css-has-selector-guide.svg
featured: false
---

# CSS :has() - The Parent Selector We Waited 20 Years For

For two decades, CSS developers have asked: "How do I select a parent element based on its children?"

The answer was always: "You can't. Use JavaScript."

That changed. The `:has()` selector is here, it works in all modern browsers, and it's one of the most significant CSS features in years.

Let me show you what's now possible.

## The Basic Idea

`:has()` selects an element if it contains something matching the selector inside the parentheses.

```css
/* Select any <a> that contains an <img> */
a:has(img) {
  display: block;
}

/* Select any <form> that contains an invalid input */
form:has(input:invalid) {
  border-color: red;
}

/* Select any <article> that contains a <video> */
article:has(video) {
  aspect-ratio: 16/9;
}
```

That's parent selection. Something we could never do in CSS before.

## Real Examples That Matter

### 1. Form Validation States

Style the whole form based on whether it's valid:

```css
/* Add a green border when all inputs are valid */
form:has(input:valid):not(:has(input:invalid)) {
  border: 2px solid green;
}

/* Show the submit button only when form is valid */
form:has(input:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}
```

No JavaScript needed. The form reacts to input state automatically.

### 2. Card Layouts

Style cards differently based on their content:

```css
/* Cards with images get different layout */
.card:has(img) {
  display: grid;
  grid-template-rows: 200px 1fr;
}

.card:not(:has(img)) {
  padding: 2rem;
}

/* Cards with videos get play button overlay */
.card:has(video)::after {
  content: '▶';
  position: absolute;
  /* ... */
}
```

One card component, multiple layouts, zero JavaScript.

### 3. Navigation Highlighting

Highlight nav items when their dropdown is open:

```css
/* Style parent nav item when dropdown is visible */
.nav-item:has(.dropdown:hover),
.nav-item:has(.dropdown:focus-within) {
  background: var(--highlight);
}
```

Previously this required JavaScript event listeners.

### 4. Table Row Styling

Style entire rows based on cell content:

```css
/* Highlight rows with checked checkboxes */
tr:has(input[type="checkbox"]:checked) {
  background: var(--selected-bg);
}

/* Style rows containing "error" status */
tr:has(td.status--error) {
  color: red;
  border-left: 3px solid red;
}
```

### 5. Figure Captions

Adjust figure layout based on caption presence:

```css
/* Center image when there's no caption */
figure:not(:has(figcaption)) img {
  margin-inline: auto;
}

/* Add border only when caption exists */
figure:has(figcaption) {
  border: 1px solid var(--border);
  padding: 1rem;
}
```

### 6. Dark Mode Without JavaScript

Toggle styles based on a checkbox or radio:

```css
/* If dark mode toggle is checked, apply dark theme */
body:has(#dark-mode-toggle:checked) {
  --bg: #1a1a1a;
  --text: #ffffff;
  --accent: #64b5f6;
}
```

```html
<input type="checkbox" id="dark-mode-toggle" />
<label for="dark-mode-toggle">Dark Mode</label>
```

Pure CSS theme switching.

## The Previous Sibling Selector

`:has()` enables something else we never had: selecting previous siblings.

```css
/* Select the <h2> that comes BEFORE an <img> */
h2:has(+ img) {
  margin-bottom: 0;
}

/* Select any <p> that comes before an <ul> */
p:has(+ ul) {
  margin-bottom: 0.5rem;
}
```

The `+` is the adjacent sibling combinator. `h2:has(+ img)` means "an h2 that has an img as its next sibling."

This was literally impossible before.

## Combining :has() with Other Selectors

`:has()` composes with everything:

```css
/* Article that contains heading level 2 AND a figure */
article:has(h2):has(figure) { }

/* Article that contains heading level 2 OR a figure */
article:has(h2, figure) { }

/* Article that doesn't contain any images */
article:not(:has(img)) { }

/* First child that contains a link */
:first-child:has(a) { }

/* Hovered element that contains focused input */
div:hover:has(input:focus) { }
```

## Practical Component Patterns

### Quantity Queries

Style based on number of children:

```css
/* Grid with exactly 1 item */
.grid:has(> :nth-child(1):last-child) {
  grid-template-columns: 1fr;
}

/* Grid with exactly 2 items */
.grid:has(> :nth-child(2):last-child) {
  grid-template-columns: repeat(2, 1fr);
}

/* Grid with 3+ items */
.grid:has(> :nth-child(3)) {
  grid-template-columns: repeat(3, 1fr);
}
```

### Conditional Spacing

Remove margin when certain elements are adjacent:

```css
/* No margin between consecutive paragraphs in a blockquote */
blockquote p:has(+ p) {
  margin-bottom: 0.5em;
}

/* No margin on last element before figure */
*:has(+ figure) {
  margin-bottom: 0;
}
```

### State-Based Siblings

Show/hide elements based on sibling state:

```css
/* Show error message when sibling input is invalid */
input:invalid + .error-message {
  display: block;
}

/* But also style the label BEFORE the input */
label:has(+ input:invalid) {
  color: red;
}
```

## Performance Considerations

`:has()` is powerful, but it's also potentially expensive. The browser has to check whether descendants match, which can be slow on large documents.

**Good (fast):**
```css
/* Direct child checks */
.card:has(> img) { }

/* Simple descendant checks */
form:has(input:invalid) { }
```

**Potentially slow:**
```css
/* Complex descendant checks on large lists */
.item:has(.deeply .nested .selector span.target) { }

/* :has() in universal selectors */
*:has(.something) { }
```

Best practices:
- Use direct child selectors (`>`) when possible
- Keep the selector inside `:has()` simple
- Avoid `:has()` on elements that appear thousands of times

In practice, modern browsers optimize well. I haven't hit performance issues in real apps. But be mindful with very dynamic content.

## Browser Support

As of 2025, `:has()` works in:
- Chrome 105+ ✅
- Safari 15.4+ ✅
- Firefox 121+ ✅
- Edge 105+ ✅

That's all modern browsers. You can use it today.

For legacy support, `:has()` degrades gracefully—the rule just doesn't apply. Structure your CSS so the base experience works without `:has()`, then enhance:

```css
/* Base styles (works everywhere) */
.card {
  padding: 1rem;
}

/* Enhanced styles (modern browsers) */
.card:has(img) {
  padding: 0;
}
```

## The JavaScript We Can Delete

Here's code I've removed since `:has()` shipped:

```javascript
// BEFORE: JavaScript to add class based on children
document.querySelectorAll('.card').forEach(card => {
  if (card.querySelector('img')) {
    card.classList.add('card--has-image');
  }
});

// AFTER: Just CSS
// .card:has(img) { }
```

```javascript
// BEFORE: JavaScript for form validation styling
form.addEventListener('input', () => {
  const isValid = form.checkValidity();
  form.classList.toggle('form--valid', isValid);
});

// AFTER: Just CSS
// form:has(input:invalid) { }
// form:has(input:valid):not(:has(input:invalid)) { }
```

Less JavaScript = faster page loads, simpler debugging, better accessibility (CSS is applied immediately, JavaScript waits for execution).

## My Take

`:has()` is one of those features where you wonder how we survived without it. I'm using it constantly now:

- Form validation styling
- Conditional layouts
- State-based sibling styling
- Reducing JavaScript for UI state

It's not experimental anymore. It's not "check caniuse first." It's standard CSS that works everywhere.

If you haven't played with `:has()` yet, open your dev tools and start experimenting. You'll find uses immediately.

---

*Kevin Powell has an excellent YouTube video walking through `:has()` use cases. Worth watching if you want more examples.*
