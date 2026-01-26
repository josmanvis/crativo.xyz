---
title: "Why I Still Use Next.js in 2025 (And You Probably Should Too)"
excerpt: "Despite the hype around new frameworks, Next.js remains my go-to. Here's my honest take after shipping dozens of production apps."
category: hot-takes
publishedAt: 2024-10-22
tags:
  - Next.js
  - React
  - Frameworks
  - Web Development
coverImage: /blog/why-nextjs-2025.svg
featured: false
seo:
  title: "Why Next.js in 2025 | Framework Comparison from a Senior Developer"
  description: "An honest comparison of Next.js vs other frameworks in 2025. Real-world experience from a developer with 21 years in the industry."
  keywords: ["Next.js 2025", "React frameworks", "Next.js vs Remix", "web development frameworks", "best React framework"]
---

# Why I Still Use Next.js in 2025 (And You Probably Should Too)

Every month there's a new "Next.js killer." First it was Remix. Then Astro. Then SvelteKit. Now it's whatever showed up on Hacker News this week.

I've tried them all. I keep coming back to Next.js. Not because it's perfect—it's definitely not—but because it lets me ship faster than anything else.

## The Case Against Next.js (That I Hear Constantly)

Let me acknowledge the criticisms:

1. **"It's too complex now"** — App Router is a paradigm shift. Learning curve is real.
2. **"Vercel lock-in"** — You can self-host, but it's not as smooth.
3. **"Server Components are confusing"** — They are. At first.
4. **"The caching is insane"** — No argument here. It's aggressive.

All valid. All things I've cursed at. And yet...

## Why I Keep Choosing It

### 1. The Ecosystem Is Unmatched

```bash
npx create-next-app@latest my-app
cd my-app
npm install @prisma/client next-auth tailwindcss
# You're basically done
```

Every pain point has a solution. Auth? NextAuth (now Auth.js). Database? Prisma. Styles? Tailwind works out of the box. Forms? React Hook Form + Zod. The pieces fit together because everyone builds for Next.js first.

With other frameworks, you're often pioneering integrations. That's fun as a learning exercise. It's not fun when you're trying to ship.

### 2. File-Based Routing Is Actually Great

I know some developers hate it. I love it.

```
app/
├── page.tsx           # /
├── about/page.tsx     # /about
├── blog/
│   ├── page.tsx       # /blog
│   └── [slug]/page.tsx # /blog/:slug
└── api/
    └── webhooks/route.ts # /api/webhooks
```

The URL structure IS the file structure. No router config. No mental mapping. Junior developers can figure out where code lives in seconds.

### 3. Server Components Changed How I Think

I was skeptical of Server Components. Then I built an app with them:

```tsx
// This runs on the server. No API layer needed.
async function ProductPage({ params }) {
  const product = await db.product.findUnique({ 
    where: { id: params.id } 
  });
  
  return (
    <div>
      <h1>{product.name}</h1>
      <AddToCartButton id={product.id} /> {/* Client Component */}
    </div>
  );
}
```

The database query runs at request time. The product data never hits the client bundle. The interactive button is a tiny client component. It's... elegant.

### 4. The Performance Defaults Are Excellent

Out of the box, Next.js gives you:
- Automatic code splitting
- Image optimization
- Font optimization
- Static generation where possible
- Edge-ready (if you want it)

I don't have to think about performance until I need to. The defaults are fast enough for most apps.

### 5. Incremental Adoption Is Possible

You don't have to go all-in on App Router. You can:
- Keep your Pages Router code working
- Migrate route by route
- Mix and match as needed

I have a production app that's 70% App Router, 30% Pages Router. It works fine.

## The Things I Still Don't Love

### Caching Is a Nightmare

```tsx
// This might be cached. Or not. Depends on... things.
const data = await fetch('https://api.example.com/data');

// Force no cache
const freshData = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});

// Or use unstable_noStore
import { unstable_noStore } from 'next/cache';
unstable_noStore();
```

The caching behavior is powerful but unpredictable. I've spent hours debugging why data wasn't updating, only to find an aggressive cache somewhere.

### The Error Messages Could Be Better

```
Error: Cannot read property 'map' of undefined
  at ProductList (./components/ProductList.tsx)
```

Which `map`? What's undefined? The stack traces in development could be more helpful.

### Deployment Complexity Outside Vercel

Self-hosting Next.js is possible but not trivial:

```bash
# Build
next build

# Run (you need a Node server)
next start

# Or standalone mode
# next.config.js: output: 'standalone'
```

If you're deploying to AWS/GCP/anywhere else, you're setting up Node servers, handling caching, managing ISR... Vercel makes this invisible, but that's part of their business model.

## Compared to Alternatives

| Framework | Best For | Trade-off |
|-----------|----------|-----------|
| **Next.js** | Full-stack apps, teams | Complexity, Vercel lock-in vibes |
| **Remix** | Forms, progressive enhancement | Smaller ecosystem |
| **Astro** | Content sites, blogs | Not for heavy interactivity |
| **SvelteKit** | Developer experience | Smaller talent pool |

I reach for Astro for content sites. I'd consider Remix for form-heavy apps. But for anything else? Next.js.

## My Next.js Stack in 2025

```json
{
  "framework": "Next.js 15",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "database": "PostgreSQL + Prisma",
  "auth": "Auth.js (NextAuth)",
  "validation": "Zod",
  "forms": "React Hook Form",
  "deployment": "Vercel (usually)"
}
```

This stack has served me well for:
- Marketing sites
- SaaS applications
- Internal tools
- API backends
- Everything at crativo.xyz

## The Bottom Line

Is Next.js perfect? No. Is it the best framework? Depends on your needs.

But it's the framework where I spend the least time fighting and the most time building. After 21 years of chasing shiny new tools, that's worth a lot.

Pick whatever helps you ship. For me, that's still Next.js.

---

*Currently shipping Next.js apps at ON24 and for personal projects. My portfolio runs on it. So does this blog.*
