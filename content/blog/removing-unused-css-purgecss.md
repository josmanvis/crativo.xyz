---
title: "Slimming Down Your Bundle: Removing Unused CSS with PurgeCSS"
excerpt: "CSS bloat can kill your site's performance. Learn how PurgeCSS analyzes your content and tree-shakes your styles for a lightning-fast load time."
category: performance
publishedAt: 2026-01-28
tags:
  - CSS
  - Performance
  - PurgeCSS
  - Web Development
  - Optimization
coverImage: /blog/removing-unused-css-purgecss.svg
featured: false
seo:
  title: "Removing Unused CSS with PurgeCSS | Performance Optimization"
  description: "A comprehensive guide to using PurgeCSS to remove unused styles from your web projects, reducing bundle size and improving load speeds."
  keywords: ["PurgeCSS", "Remove unused CSS", "CSS optimization", "web performance", "frontend optimization"]
---

# Slimming Down Your Bundle: Removing Unused CSS with PurgeCSS

We've all been there. You start a project with a CSS framework like Bootstrap, Bulma, or a large utility library. You build your landing page, launch it, and then run a Lighthouse audit.

**Performance Score: 65.**
**Reduce unused CSS: Potential savings 140 KiB.**

Your user is downloading the entire framework—buttons you aren't using, grid classes you don't need, and utility helpers for scenarios that don't exist in your app.

Enter **PurgeCSS**.

## What is PurgeCSS?

PurgeCSS is a tool that removes unused CSS from your project. Think of it as "tree-shaking" for styles.

It works by:
1.  Taking your CSS files.
2.  Taking your content files (HTML, JavaScript, PHP, Vue, JSX, etc.).
3.  Scanning your content files for any class names or IDs used.
4.  Comparing those against the CSS selectors.
5.  **Deleting the CSS rules that don't match.**

The result? A CSS file that contains *only* the styles your website actually uses.

## How to Use It

While many modern frameworks (like Tailwind CSS v3+) have this concept built-in via Just-In-Time (JIT) engines, PurgeCSS is essential for:
*   Legacy projects using Bootstrap or Foundation.
*   Custom CSS architectures where "append-only" CSS has led to bloat.
*   Projects using heavy third-party UI libraries.

### Basic Setup

First, install it:

```bash
npm install --save-dev purgecss
```

You can run it via the CLI:

```bash
npx purgecss --css css/styles.css --content index.html --output dist/
```

### Configuring with PostCSS

In a modern workflow (like Next.js, Vite, or Webpack), you'll typically use PurgeCSS as a PostCSS plugin.

Install the plugin:

```bash
npm install --save-dev @fullhuman/postcss-purgecss
```

Add it to your `postcss.config.js`:

```javascript
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  plugins: [
    // ... other plugins
    purgecss({
      content: ['./src/**/*.html', './src/**/*.vue', './src/**/*.jsx'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
}
```

## The "Dynamic Class" Pitfall

PurgeCSS is dumb. It's a text scraper. It doesn't execute your JavaScript; it just reads the files.

This causes problems with dynamic class names.

**This WILL fail:**

```javascript
const color = 'red';
const buttonClass = `btn-${color}`; // PurgeCSS sees "btn-" and "red", but not "btn-red"
return <button className={buttonClass}>Click me</button>;
```

Since PurgeCSS never sees the string `"btn-red"` in your code, it assumes that class is unused and strips it from the CSS.

**How to fix it:**

1.  **Don't build strings dynamically.**
    ```javascript
    // Do this instead
    const buttonClass = isRed ? 'btn-red' : 'btn-blue';
    ```

2.  **Safelist classes.**
    If you absolutely must generate classes (e.g., from a CMS API), you can tell PurgeCSS to ignore certain patterns.

    ```javascript
    purgecss({
      content: [...],
      safelist: [/^btn-/] // Keep anything starting with "btn-"
    })
    ```

## The Impact

I recently applied PurgeCSS to a legacy marketing site built with Bootstrap 4.
*   **Original CSS:** 160kB (minified)
*   **Purged CSS:** 14kB (minified)

That is a **91% reduction**. On a 3G network, that's the difference between a site loading instantly and a user bouncing.

## Conclusion

In 2026, there is no excuse for shipping 200kB of CSS when you're only using 10kB. Whether you rely on Tailwind's JIT or configure PurgeCSS manually for other stacks, ensuring your CSS payload is lean is one of the highest ROI performance optimizations you can make.
