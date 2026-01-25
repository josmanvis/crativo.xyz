---
title: "SSR vs SSG vs ISR: Choosing the Right Rendering Strategy"
excerpt: Three acronyms, three mental models. Here's when to use each.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - React
  - Next.js
  - Performance
  - Architecture
coverImage: /blog/ssr-ssg-isr-guide.svg
featured: false
---

# SSR vs SSG vs ISR: Choosing the Right Rendering Strategy

When I started with Next.js, the rendering options confused me. SSR, SSG, ISR, CSR—alphabet soup that seemed to mean "pick one and hope you're right."

After building dozens of Next.js apps, I've developed intuition for which rendering strategy to use when. Let me share it.

## The Mental Models

### CSR (Client-Side Rendering)

The browser downloads JavaScript, then JavaScript builds the page.

```
User requests page
→ Server sends empty HTML + JS bundle
→ Browser downloads JS
→ JS executes, fetches data
→ JS renders the page
→ User sees content (finally)
```

**Pros:** Simple deployment (any static host), good for highly interactive apps.
**Cons:** Slow initial load, bad SEO, flash of empty content.

This is what Create React App gives you. It's falling out of favor for public-facing apps.

### SSR (Server-Side Rendering)

The server renders HTML for every request.

```
User requests page
→ Server fetches data
→ Server renders HTML
→ User sees content immediately
→ JS loads, page becomes interactive
```

**Pros:** Fast first paint, SEO-friendly, always fresh data.
**Cons:** Server cost (every request = compute), TTFB depends on data fetch time.

```tsx
// Next.js App Router - this component runs on server
async function ProductPage({ params }) {
  // This runs on every request
  const product = await db.products.findUnique({
    where: { slug: params.slug },
  });
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
    </div>
  );
}
```

### SSG (Static Site Generation)

Pages are rendered at build time, served as static files.

```
At build time:
→ Build script fetches data
→ Build script renders HTML
→ HTML files deployed to CDN

At request time:
→ User requests page
→ CDN serves pre-built HTML
→ User sees content instantly
```

**Pros:** Fastest possible load time, cheapest to host, CDN caching.
**Cons:** Data can be stale, rebuild needed for updates, build time grows with pages.

```tsx
// Next.js App Router - static by default
async function BlogPost({ params }) {
  // This runs at BUILD time, not request time
  const post = await getPostFromCMS(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// Tell Next.js which pages to pre-render
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### ISR (Incremental Static Regeneration)

Static pages that revalidate periodically.

```
First request:
→ Serve cached static page
→ In background: check if stale
→ If stale: regenerate page
→ Next request gets fresh page

Or on-demand:
→ CMS webhook triggers revalidation
→ Specific page regenerates
→ New version served immediately
```

**Pros:** Static speed + eventual freshness, no full rebuild needed.
**Cons:** Complexity, potential for stale content.

```tsx
// Next.js App Router - revalidate every 60 seconds
async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return <ProductDetails product={product} />;
}

// Revalidate this page every 60 seconds
export const revalidate = 60;
```

Or on-demand revalidation:

```tsx
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const { path, secret } = await request.json();
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

## Decision Framework

Here's my actual decision process:

### Start with the data question

**How often does this data change?**

| Frequency | Strategy |
|-----------|----------|
| Never (legal pages, docs) | SSG |
| Rarely (blog posts, products) | SSG or ISR |
| Frequently (stock prices, comments) | SSR |
| User-specific (dashboards, profiles) | SSR |
| Real-time (chat, live scores) | CSR + WebSocket |

### Then consider personalization

**Is the content the same for everyone?**

- **Yes:** SSG or ISR (cacheable)
- **No:** SSR or CSR (can't cache at edge)

Personalized content breaks CDN caching. If user A and user B see different things, you can't serve a static file.

### Then consider SEO

**Does this page need to rank in search engines?**

- **Yes:** SSG, ISR, or SSR (not CSR)
- **No:** Any strategy works

Google can render JavaScript, but it's slower and less reliable. For important SEO pages, server-render them.

## Real Examples

### E-commerce Product Page

```
Data changes: When inventory/price updates (hourly?)
Personalization: None (everyone sees same product)
SEO: Critical
→ ISR with 1-hour revalidation, or on-demand revalidation when product updates
```

```tsx
async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  return <ProductDetail product={product} />;
}

export const revalidate = 3600; // 1 hour

// Pre-render popular products at build
export async function generateStaticParams() {
  const popular = await getPopularProducts(100);
  return popular.map(p => ({ slug: p.slug }));
}
```

### User Dashboard

```
Data changes: Constantly (user's own data)
Personalization: Completely (each user sees their data)
SEO: None (requires login)
→ SSR with authentication
```

```tsx
async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  const userData = await getUserData(session.user.id);
  return <DashboardView data={userData} />;
}
```

### Blog

```
Data changes: When author publishes (rarely)
Personalization: None
SEO: Critical
→ SSG with on-demand revalidation
```

```tsx
async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}

// On-demand revalidation when CMS publishes
// POST /api/revalidate { path: '/blog/my-post' }
```

### Live Sports Scores

```
Data changes: Every few seconds
Personalization: None
SEO: Moderate
→ SSG shell + CSR for live data
```

```tsx
// Server component: static shell
async function GamePage({ params }) {
  const game = await getGame(params.id);  // Basic info, SEO
  
  return (
    <div>
      <h1>{game.homeTeam} vs {game.awayTeam}</h1>
      <LiveScore gameId={game.id} />  {/* Client component */}
    </div>
  );
}

// Client component: live updates
'use client';
function LiveScore({ gameId }) {
  const { score } = useLiveScore(gameId);  // WebSocket/polling
  return <ScoreBoard score={score} />;
}
```

## The Hybrid Reality

Modern apps mix strategies. In Next.js App Router, this happens naturally:

```tsx
// Static wrapper (SSG)
async function ProductPage({ params }) {
  const product = await getProduct(params.slug);  // Cached
  
  return (
    <div>
      {/* Static content */}
      <h1>{product.name}</h1>
      <ProductImages images={product.images} />
      <ProductDescription text={product.description} />
      
      {/* Dynamic content (SSR, runs on each request) */}
      <Suspense fallback={<Skeleton />}>
        <InventoryStatus productId={product.id} />
      </Suspense>
      
      {/* Interactive content (CSR) */}
      <AddToCartButton product={product} />
    </div>
  );
}

// This component opts out of caching
async function InventoryStatus({ productId }) {
  const inventory = await getInventory(productId);
  return <span>{inventory.quantity} in stock</span>;
}

// Force dynamic
export const dynamic = 'force-dynamic';  // On InventoryStatus
```

## Common Mistakes

### 1. SSR Everything

I see this a lot: every page is SSR because "we might need fresh data." But SSR has cost—every request hits your server.

If your marketing pages are SSR, you're paying for compute on content that doesn't change.

**Fix:** Default to static, opt into dynamic only when needed.

### 2. SSG Everything

The opposite mistake: static everything, then wonder why users see stale prices.

**Fix:** Use ISR for content that changes, SSR for content that must be fresh.

### 3. Ignoring Build Time

SSG means every page is built at build time. If you have 100,000 products, that's 100,000 pages to render. Builds take hours.

**Fix:** Only pre-render high-traffic pages. Use ISR for long-tail pages (render on first request, then cache).

```tsx
// Only pre-render top 1000 products
export async function generateStaticParams() {
  const products = await getTopProducts(1000);
  return products.map(p => ({ slug: p.slug }));
}

// Other products render on-demand
export const dynamicParams = true;
```

### 4. ISR Stale Content

ISR can show stale content. User updates their profile, refreshes, sees old data because the cached page hasn't revalidated.

**Fix:** Use on-demand revalidation for user-triggered changes, or skip caching for mutable pages.

## The Simple Rule

When in doubt:

1. **Can this page be the same for everyone?** → Start with SSG/ISR
2. **Is it user-specific or real-time?** → Use SSR
3. **Is the interactive bit a small part of a larger page?** → Static page + client island

Premature optimization is real here too. Start simple, measure, optimize where it matters.

---

*The Next.js docs on rendering are comprehensive. Read them after you have the mental model—they'll make more sense.*
