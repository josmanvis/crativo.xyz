---
title: Why I Stopped Using Create React App (And What I Use Instead)
excerpt: CRA served us well for years. But it's 2025, and there are better options.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - React
  - Vite
  - Next.js
  - Build Tools
coverImage: /blog/why-i-stopped-using-create-react-app.svg
featured: false
---

# Why I Stopped Using Create React App (And What I Use Instead)

Create React App was revolutionary. I remember when it launched in 2016—finally, a way to start a React project without spending three hours configuring Webpack. It was the great equalizer: beginners and seniors could get a production-ready setup in one command.

I used CRA for years. Side projects, client work, even internal tools at the Innovation Lab. It just worked.

But here's the thing: CRA hasn't just stopped evolving. It's actively falling behind. The last meaningful update was years ago. Dependency vulnerabilities pile up. Build times bloat. And the React team themselves stopped recommending it.

It's time to move on. Let me tell you what I use instead—and why.

## The Slow Death of CRA

The warning signs were there for a while:

**2022:** Build times creeping up. Simple apps taking 30+ seconds to start in development.

**2023:** The React docs rewrite. CRA conspicuously absent from the "Start a New React Project" page. The team recommends Next.js, Remix, Gatsby instead.

**2024:** GitHub issues pile up. PRs go unmerged. Dependencies go stale.

**2025:** npm audit on a fresh CRA install shows dozens of vulnerabilities. The writing's on the wall.

The React team has been clear: for new projects, CRA isn't the answer anymore. They recommend using a framework (Next.js, Remix) or, if you want a pure SPA, something like Vite.

## What's Wrong With CRA in 2025

### It's Slow

CRA uses Webpack under the hood. Webpack is powerful but not fast. On my M1 MacBook Pro, a fresh CRA app takes about 8 seconds to start in development. Add a few dependencies, some larger pages, and you're looking at 20-30 seconds.

Every time you save a file, there's a noticeable delay before the browser updates. It's not catastrophic, but it adds up. When you're iterating quickly, those seconds feel like minutes.

### It's Bloated

A fresh CRA install in 2025:

```bash
$ du -sh node_modules
324M    node_modules
```

That's before you've written a single line of code. Before adding your router, your state management, your component library.

### It's Inflexible

CRA famously abstracts away the config. "Zero configuration" was the selling point. But when you need to customize—and you will—you have two choices:

1. **Eject:** Run `npm run eject` and suddenly you're maintaining 2000+ lines of Webpack config you don't understand.

2. **Override:** Use something like CRACO or react-app-rewired to patch the config. But these tools break with CRA updates and add another layer of complexity.

Neither option is great. The "zero config" promise becomes a prison when your needs evolve.

### It's Outdated

CRA is stuck in the Webpack 4/5 era. Meanwhile, the frontend world has moved on:

- **esbuild** proved that JavaScript bundlers could be 10-100x faster by using Go
- **Vite** brought that speed to the mainstream with a delightful developer experience
- **Turbopack** (in Next.js) pushes things even further with Rust

CRA didn't adapt. It couldn't adapt—the architecture was too tied to Webpack.

## What I Use Now

### For SPAs: Vite

If you want a simple single-page app—a dashboard, an internal tool, a side project—Vite is my default choice.

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

That's it. Dev server starts in under a second. Hot module replacement is instant. The difference is stark.

Here's a comparison on a real project I migrated:

| Metric | CRA | Vite |
|--------|-----|------|
| Dev server start | 18.3s | 0.8s |
| HMR update | 2.1s | 0.02s |
| Production build | 45s | 12s |
| node_modules size | 342MB | 89MB |

It's not a marginal improvement. It's a different experience.

The secret? Vite doesn't bundle during development. It serves your ES modules directly, letting the browser do the import resolution. It only bundles for production (using Rollup under the hood).

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

Configuration is minimal and readable. When you need to customize, you're working with a small, understandable config file—not ejected Webpack chaos.

### For Full Apps: Next.js

If I'm building anything with routing, data fetching, or SEO needs, I reach for Next.js. It's not just a React framework—it's the React framework the React team recommends.

```bash
npx create-next-app@latest my-app
```

What you get:

- File-based routing (no react-router config)
- API routes (backend and frontend in one project)
- Server Components (smaller bundles, better performance)
- Image optimization (next/image is magic)
- Automatic code splitting
- Edge/serverless deployment ready

The App Router (Next.js 13+) is built on Server Components, which I've written about elsewhere. It's a paradigm shift, but it's worth it.

```tsx
// app/posts/[slug]/page.tsx
async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <PostContent content={post.content} />
      <Comments postId={post.id} />
    </article>
  );
}
```

No useEffect. No loading states (unless you want them). No API layer between your React code and your database. It's a different way of building React apps, and it's better for most use cases.

### For Edge Cases: Other Options

**Remix:** If you care deeply about web fundamentals—progressive enhancement, form handling, proper HTTP semantics. Remix is philosophically interesting and technically solid. I've used it for a few projects and enjoyed it.

**Astro:** If you're building a content site and React is overkill for most pages. Astro's "islands" architecture lets you sprinkle interactivity where needed while shipping minimal JavaScript.

**Expo (for React Native):** Not a CRA replacement, but worth mentioning—if you're building mobile apps with React Native, Expo is the obvious choice.

## The Migration Path

If you have an existing CRA project, here's how to migrate.

### CRA to Vite

I've done this migration twice now. It takes an afternoon for a medium-sized app.

**1. Install Vite and plugins:**

```bash
npm install --save-dev vite @vitejs/plugin-react
```

**2. Create vite.config.ts:**

```tsx
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

**3. Move index.html:**

Vite expects `index.html` at the root, not in `public/`. Update the script path:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

**4. Update environment variables:**

CRA uses `REACT_APP_` prefix. Vite uses `VITE_`. Find and replace.

**5. Remove CRA dependencies:**

```bash
npm uninstall react-scripts
```

**6. Update package.json scripts:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Done. You'll probably have a few import issues to clean up, but the core migration is straightforward.

### CRA to Next.js

This is a bigger change because you're not just changing build tools—you're adopting a framework with opinions about routing, data fetching, and project structure.

I'd recommend this if:
- You need SSR or SSG
- You want API routes in the same project
- You're building something that will grow

The Next.js docs have a decent migration guide. The key changes:
- Pages go in `app/` (or `pages/` for the older Pages Router)
- Routing is file-based
- Data fetching patterns are different

## My Recommendation

**Starting a new project?**

- Simple SPA → Vite
- Full-stack app → Next.js
- Content site → Astro
- Mobile → Expo

**Have an existing CRA project?**

If it's working and you're not feeling pain, leave it. Don't migrate for the sake of migrating.

But if you're starting to feel the slowness, if every `npm audit` makes you wince, if you're fighting the configuration—it's time to migrate. Vite is the path of least resistance. Next.js is the path to more power.

**Either way, stop using CRA for new projects.** It served us well, but its time has passed. The alternatives are better in every measurable way.

---

*RIP Create React App, 2016-2023. You were good to us.*
