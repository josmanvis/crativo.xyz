---
title: "Building Accessible Web Applications (It's Not That Hard)"
excerpt: "Accessibility isn't a feature. It's a baseline. And it's way easier than most developers think."
category: tutorials
publishedAt: 2024-10-08
tags:
  - Accessibility
  - Web Development
  - HTML
  - React
coverImage: /blog/accessible-web-apps-not-hard.svg
featured: false
seo:
  title: "Web Accessibility Guide | Accessible React Applications"
  description: "Practical guide to building accessible web applications. Learn WCAG basics, ARIA attributes, and accessible React patterns."
  keywords: ["web accessibility", "a11y", "accessible React", "WCAG", "ARIA", "screen reader development"]
---

# Building Accessible Web Applications (It's Not That Hard)

I used to think accessibility was complicated. Specialized. Something for "accessibility experts" to worry about later.

Then I met a developer who was blind. He used a screen reader daily. Watching him navigate the web changed my perspective entirely.

Most accessibility work isn't hard. We just don't do it because we don't think about it.

## Why This Matters

15% of the world's population has some form of disability. That's over a billion people. Many of them use the web differently:

- **Vision impairments:** Screen readers, magnification, high contrast
- **Motor impairments:** Keyboard navigation, switch devices, voice control
- **Hearing impairments:** Captions, visual alternatives to audio
- **Cognitive impairments:** Clear language, consistent navigation, reduced motion

Accessible design helps everyone. Keyboard navigation helps power users. Captions help people in noisy environments. Clear language helps non-native speakers.

## The Basics (That We Keep Getting Wrong)

### Use Semantic HTML

This is 80% of the battle:

```html
<!-- Bad -->
<div class="btn" onclick="submit()">Submit</div>

<!-- Good -->
<button type="submit">Submit</button>
```

The button element gives you for free:
- Keyboard focusability
- Enter/Space activation
- Proper role announcement
- Form submission behavior

The div gives you nothing. You'd have to manually add `tabindex`, `role="button"`, keyboard handlers, and more.

### Semantic HTML Cheat Sheet

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>

<!-- Main content -->
<main>...</main>

<!-- Articles/Posts -->
<article>
  <header>
    <h1>Title</h1>
    <time datetime="2024-10-08">October 8, 2024</time>
  </header>
  ...
</article>

<!-- Sections with headings -->
<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
  ...
</section>

<!-- Form groups -->
<fieldset>
  <legend>Shipping Address</legend>
  ...
</fieldset>
```

### Every Image Needs Alt Text

```html
<!-- Decorative (skip) -->
<img src="decoration.png" alt="" />

<!-- Informative (describe) -->
<img src="chart.png" alt="Sales increased 40% from January to March" />

<!-- Functional (describe function) -->
<img src="search.png" alt="Search" />
```

The alt text should convey the *purpose* of the image, not just describe it:

```html
<!-- Bad -->
<img src="warning.png" alt="Yellow triangle icon" />

<!-- Good -->
<img src="warning.png" alt="Warning: This action cannot be undone" />
```

### Form Labels Are Non-Negotiable

```html
<!-- Bad (no connection) -->
<input type="email" placeholder="Email" />

<!-- Good (proper label) -->
<label for="email">Email address</label>
<input type="email" id="email" />

<!-- Also good (wrapping) -->
<label>
  Email address
  <input type="email" />
</label>
```

Placeholder text is not a label. It disappears when you type.

## ARIA: Use Sparingly

ARIA (Accessible Rich Internet Applications) attributes add accessibility information. But:

> No ARIA is better than bad ARIA.

Native HTML elements have built-in accessibility. ARIA should fill gaps, not replace proper HTML.

### When ARIA Helps

```jsx
// Custom component that acts like a button
<div 
  role="button"
  tabIndex={0}
  aria-label="Close dialog"
  onClick={handleClose}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClose();
  }}
>
  <CloseIcon />
</div>

// Better: just use a button
<button onClick={handleClose} aria-label="Close dialog">
  <CloseIcon />
</button>
```

### Live Regions

For dynamic content updates:

```jsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

When `statusMessage` changes, screen readers announce it. Use `polite` for non-urgent updates, `assertive` for urgent ones.

### Accessible Modals

```jsx
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      // Trap focus inside modal
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

## Keyboard Navigation

Every interactive element must be keyboard accessible:

```jsx
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              onChange(tabs[(index + 1) % tabs.length].id);
            }
            if (e.key === 'ArrowLeft') {
              onChange(tabs[(index - 1 + tabs.length) % tabs.length].id);
            }
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### Focus Management

Focus should follow user action:

```jsx
function SearchResults({ results }) {
  const resultsRef = useRef();
  
  useEffect(() => {
    // Focus results region when search completes
    resultsRef.current?.focus();
  }, [results]);

  return (
    <div 
      ref={resultsRef}
      tabIndex={-1}
      role="region"
      aria-label="Search results"
    >
      {results.map(result => ...)}
    </div>
  );
}
```

### Skip Links

Let keyboard users bypass navigation:

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- Style to show only on focus -->
<style>
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  z-index: 100;
}
</style>
```

## Color and Contrast

### Minimum Contrast Ratios

- Normal text: 4.5:1
- Large text (18px+ or 14px+ bold): 3:1
- UI elements: 3:1

Use tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### Don't Rely on Color Alone

```jsx
// Bad: status only indicated by color
<span className={isError ? 'text-red' : 'text-green'}>
  {message}
</span>

// Good: status indicated by text and color
<span className={isError ? 'text-red' : 'text-green'}>
  {isError ? '✗ Error: ' : '✓ Success: '}{message}
</span>
```

## Testing Accessibility

### Automated Testing

```bash
npm install -D axe-core @axe-core/react
```

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import axe from '@axe-core/react';

if (process.env.NODE_ENV !== 'production') {
  axe(React, ReactDOM, 1000);
}
```

This logs accessibility violations to the console.

### Manual Testing

1. **Keyboard only:** Unplug your mouse. Can you complete all tasks?
2. **Screen reader:** Try VoiceOver (Mac), NVDA (Windows), or JAWS
3. **Zoom:** Browser zoom to 200%. Does the layout still work?
4. **Reduced motion:** Enable "Reduce motion" in OS settings

### The 5-Minute Audit

1. Tab through the page. Can you see where focus is?
2. Are all form fields labeled?
3. Do images have alt text?
4. Can you understand the page without color?
5. Is there sufficient color contrast?

If you answer "no" to any of these, start there.

## Common React Patterns

### Accessible Button

```jsx
function Button({ children, loading, ...props }) {
  return (
    <button
      {...props}
      aria-busy={loading}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner aria-hidden="true" />
          <span className="sr-only">Loading</span>
        </>
      ) : children}
    </button>
  );
}
```

### Accessible Form

```jsx
function Form() {
  const [errors, setErrors] = useState({});

  return (
    <form>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={errors.email ? 'true' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>
    </form>
  );
}
```

## Start Today

You don't need to be an accessibility expert. Start with:

1. Use semantic HTML
2. Add alt text to images
3. Label your forms
4. Test with keyboard

That alone puts you ahead of 90% of websites.

Accessibility isn't charity. It's engineering quality. Build for everyone.

---

*Building for the web means building for everyone. It always has.*
