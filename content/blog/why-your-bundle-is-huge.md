---
title: Why Your Bundle Is Still Huge (And How to Actually Fix It)
excerpt: I shaved 400KB off a production bundle last month. Here's everything I learned.
category: deep-dives
publishedAt: 2025-01-02
tags:
  - Performance
  - JavaScript
  - Webpack
  - Bundling
coverImage: /blog/why-your-bundle-is-huge.svg
featured: false
---

# Why Your Bundle Is Still Huge (And How to Actually Fix It)

Last month I audited a React app that was shipping 1.2MB of JavaScript. The team had "optimized" it multiple times. Code splitting. Tree shaking. Lazy loading. It was still huge.

After a week of digging, I got it down to 380KB. Not by doing anything magic—by understanding where the bloat actually comes from.

Here's everything I learned.

## Step 1: See What's Actually in There

You can't fix what you can't see. Before touching any code, analyze your bundle.

**For Webpack:**
```bash
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
};
```

**For Vite:**
```bash
npm install --save-dev rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({ open: true })
  ]
};
```

**For Next.js:**
```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});

// Then: ANALYZE=true npm run build
```

Run the analyzer and stare at that treemap. The big rectangles are your problems.

## The Usual Suspects

In my experience, bundle bloat comes from a predictable set of culprits:

### 1. Moment.js (and its locales)

Moment.js is 300KB with locales. Three hundred kilobytes. For date formatting.

```javascript
import moment from 'moment';  // 300KB ❌
```

The fix:
```javascript
// Option 1: Use date-fns (30KB, tree-shakeable)
import { format, parseISO } from 'date-fns';

// Option 2: Use dayjs (2KB moment API-compatible)
import dayjs from 'dayjs';

// Option 3: Use native Intl (0KB, built into browsers)
new Intl.DateTimeFormat('en-US').format(new Date());
```

If you must use Moment, at least strip the locales:

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
  ],
};
```

That drops it from 300KB to ~70KB.

### 2. Lodash

Lodash is well-designed but terribly for tree shaking. Importing the whole library brings in everything:

```javascript
import _ from 'lodash';  // 70KB ❌
_.get(obj, 'nested.path');
```

Fix:
```javascript
// Import specific functions
import get from 'lodash/get';  // 2KB ✅

// Or use lodash-es for tree shaking
import { get } from 'lodash-es';
```

Better yet, replace Lodash with native methods. Most of what people use Lodash for is built into JavaScript now:

```javascript
// Lodash
_.map(arr, fn)
_.filter(arr, fn)
_.find(arr, fn)
_.includes(arr, item)
_.uniq(arr)

// Native JavaScript
arr.map(fn)
arr.filter(fn)
arr.find(fn)
arr.includes(item)
[...new Set(arr)]
```

You probably don't need Lodash.

### 3. Icons Libraries

Font Awesome, Material Icons, Heroicons—icon libraries are sneaky. They seem small, but importing the whole library is devastating:

```javascript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';  // 1MB+ ❌
library.add(fas);
```

Fix:
```javascript
// Import only the icons you use
import { faUser, faHome, faCog } from '@fortawesome/free-solid-svg-icons';
```

Or switch to an icon library designed for tree shaking:
```javascript
import { UserIcon, HomeIcon, CogIcon } from '@heroicons/react/24/outline';
```

### 4. Chart Libraries

Chart.js, Highcharts, Recharts—visualization libraries are big. If you only use one chart type, you're shipping code for all of them.

```javascript
import Chart from 'chart.js/auto';  // 200KB+ ❌
```

Fix:
```javascript
// Import only what you need
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
);
```

For simpler cases, consider lightweight alternatives like uPlot (20KB) or hand-rolled SVG.

### 5. Syntax Highlighters

Prism.js and highlight.js ship grammars for hundreds of languages. If you're building a blog that only shows JavaScript, you don't need the COBOL grammar.

```javascript
// highlight.js
import hljs from 'highlight.js';  // 800KB with all languages ❌

import hljs from 'highlight.js/lib/core';  // 30KB ✅
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
```

### 6. Random "Utility" Packages

I've seen bundles bloated by:
- `is-odd` (checks if a number is odd—just use `n % 2 !== 0`)
- `left-pad` (infamous, just use `.padStart()`)
- `is-number` (just use `typeof x === 'number'`)
- `is-array` (just use `Array.isArray()`)

Audit your dependencies. Run:
```bash
npx depcheck
```

Remove anything you don't need. Be suspicious of any package that does one trivial thing.

## Code Splitting

Not everything needs to load upfront. Split your bundle by route and by feature.

### Route-Based Splitting

```javascript
// React Router
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Suspense>
  );
}
```

Now `/analytics` doesn't load until someone navigates there.

### Feature-Based Splitting

Heavy features should load on demand:

```javascript
// Load the markdown editor only when needed
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'));

function PostForm({ enableMarkdown }) {
  return (
    <form>
      {enableMarkdown ? (
        <Suspense fallback={<Textarea />}>
          <MarkdownEditor />
        </Suspense>
      ) : (
        <Textarea />
      )}
    </form>
  );
}
```

### Third-Party Splitting

Big libraries can be split too:

```javascript
// Don't import PDF.js until someone clicks "Export PDF"
const handleExportPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  doc.text('Hello', 10, 10);
  doc.save('export.pdf');
};
```

## Tree Shaking Isn't Magic

Tree shaking removes unused exports. But it only works if:

1. **You use ES modules** (import/export, not require)
2. **The library supports it** (exports named exports, not just default)
3. **There are no side effects** (or `sideEffects: false` in package.json)

Check if your library supports tree shaking. Many popular ones don't out of the box:
- ❌ Moment.js
- ❌ Lodash (use lodash-es)
- ✅ date-fns
- ✅ Ramda

If tree shaking isn't working, check for:
- CommonJS imports (`require()`)
- Barrel files that re-export everything
- Side effects in module scope

## The Nuclear Options

When you've done everything else:

### Replace React

Preact is 3KB vs React's 40KB. API is nearly identical:

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
    }
  }
};
```

### Server-Side Render Heavy Content

Some things don't need to be interactive. Render them on the server:

```javascript
// Instead of shipping a markdown parser
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{content}</ReactMarkdown>  // 30KB

// Render to HTML at build time
const html = renderMarkdownToHtml(content);
<div dangerouslySetInnerHTML={{ __html: html }} />  // 0KB
```

### Compression

Obvious but often misconfigured. Enable gzip/brotli on your server:

| Format | Size |
|--------|------|
| Uncompressed | 400KB |
| Gzip | 120KB |
| Brotli | 100KB |

That's free performance. Just turn it on.

## The Mindset Shift

The real fix isn't any single technique. It's treating bundle size as a feature, not an afterthought.

- Check bundle size in CI (fail if it grows unexpectedly)
- Set budgets (`performance.maxAssetSize` in Webpack)
- Review the bundle analyzer before every release
- Question every new dependency

My rule: if a package adds more than 10KB gzipped, it needs to justify its existence. Most can't.

---

*The first step is always the bundle analyzer. Run it today. You'll be horrified. And then you'll know what to fix.*
