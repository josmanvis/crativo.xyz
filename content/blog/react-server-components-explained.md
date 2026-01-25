---
title: React Server Components Explained (For Real This Time)
excerpt: RSC confused me for months. Here's the mental model that finally made it click.
category: deep-dives
publishedAt: 2025-01-13
tags:
  - React
  - RSC
  - Next.js
  - Architecture
coverImage: /blog/react-server-components-explained.svg
featured: false
---

# React Server Components Explained (For Real This Time)

I've been writing React for nearly a decade. I thought I understood it. Then Server Components came along and made me feel like a junior developer again.

The problem isn't that RSC is hard—it's that the mental model is genuinely different from everything React taught us before. And the explanations out there? They either assume you already get it, or they drown you in implementation details that don't help you understand *why*.

Let me try to do better.

## What React Server Components Actually Are

Here's the simplest explanation I can give: Server Components are React components that only ever run on the server. They never run in the browser. They can't have state. They can't use effects. They're just functions that return JSX.

"But Jose," you say, "isn't that just SSR?"

No. And this is where it gets interesting.

With traditional SSR, the server renders your components to HTML, sends that HTML to the browser, and then React "hydrates" those components—attaching event handlers, restoring state, making them interactive. The component code runs on both server *and* client.

With Server Components, the component code only runs on the server. The client never sees it. Instead of sending JavaScript that reconstructs the component, the server sends the *result* of the component—a serialized representation of the UI that React can render directly.

```tsx
// This is a Server Component (the default in Next.js 13+)
async function BlogPost({ slug }: { slug: string }) {
  // This runs ONLY on the server
  const post = await db.posts.findUnique({ where: { slug } });
  
  // This code never ships to the browser
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

That `db.posts.findUnique` call? It's not running in an API route or a `getServerSideProps`. It's running directly in your component. The database query, the ORM, none of that JavaScript goes to the browser.

## Why This Matters

### 1. Smaller Bundles

Here's a real example. Say you're building a markdown blog. With Client Components, you'd do something like:

```tsx
'use client';

import { marked } from 'marked';  // 32KB minified
import DOMPurify from 'dompurify';  // 15KB minified
import hljs from 'highlight.js';    // 35KB+ minified

function BlogPost({ content }) {
  const html = DOMPurify.sanitize(marked(content));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

That's 80KB+ of JavaScript your users have to download and parse just to render a blog post. With Server Components:

```tsx
// Server Component - runs on server only
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

async function BlogPost({ slug }) {
  const post = await getPost(slug);
  const html = DOMPurify.sanitize(marked(post.content));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

Same code, but the browser never downloads marked, DOMPurify, or highlight.js. Zero JavaScript. The client just receives the rendered HTML.

### 2. Direct Data Access

With Client Components, fetching data means:

1. Render loading state
2. Make API call
3. Wait for response
4. Update state
5. Re-render with data

With Server Components:

1. Fetch data
2. Return JSX

No loading states (the page just takes longer to load). No API layer (you access the database directly). No waterfalls (you can fetch in parallel at multiple levels of your component tree).

```tsx
// Server Component
async function Dashboard() {
  // These run in parallel
  const [user, posts, analytics] = await Promise.all([
    getUser(),
    getPosts(),
    getAnalytics(),
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} />
      <AnalyticsChart data={analytics} />
    </div>
  );
}
```

### 3. Secrets Stay Secret

Server Components can access environment variables, API keys, database credentials—anything that should never touch the client. This isn't new (SSR could do this), but it's more ergonomic. The boundary is cleaner.

## The Mental Model Shift

Here's what finally made it click for me: think of Server Components as a *new layer* in your application.

Before RSC, the architecture was:
```
Browser ←→ API ←→ Database
```

With RSC, it's:
```
Browser ←→ Server Components ←→ Database
           ↓
     Client Components (where needed)
```

Server Components are the default. They're where most of your app lives. Client Components are the escape hatch for interactivity.

## When to Use Client Components

The rule is simple: use Client Components when you need browser APIs or React features that require client-side state.

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| Fetch data | ✅ | ✅ (with useEffect/SWR) |
| Access backend resources | ✅ | ❌ |
| useState / useReducer | ❌ | ✅ |
| useEffect | ❌ | ✅ |
| Event handlers (onClick, etc.) | ❌ | ✅ |
| Browser APIs (localStorage, etc.) | ❌ | ✅ |
| Custom hooks with state | ❌ | ✅ |

In practice, this means:

```tsx
// Server Component (default)
async function ProductPage({ id }) {
  const product = await getProduct(id);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={id} /> {/* Client Component */}
    </div>
  );
}

// Client Component (opt-in)
'use client';

import { useState } from 'react';

function AddToCartButton({ productId }) {
  const [adding, setAdding] = useState(false);
  
  async function handleClick() {
    setAdding(true);
    await addToCart(productId);
    setAdding(false);
  }
  
  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

The product data fetching happens on the server. The interactive button is a Client Component. Best of both worlds.

## The Gotchas Nobody Warns You About

### 1. "use client" Is Contagious (Downward)

When you mark a component with `'use client'`, every component it imports is also a Client Component. The boundary is at the import, not the file.

```tsx
'use client';

import { ProductCard } from './ProductCard';  // This is now a Client Component
import { formatPrice } from './utils';         // This code ships to client
```

This means you need to think about where to draw the client boundary. Push it as far down as possible.

### 2. You Can't Import Server Components into Client Components

This doesn't work:

```tsx
'use client';

import { ServerThing } from './ServerThing';  // ❌ Error

function ClientThing() {
  return <ServerThing />;
}
```

But you *can* pass Server Components as children:

```tsx
// This works
function Page() {
  return (
    <ClientWrapper>
      <ServerThing />  {/* ✅ Passed as children */}
    </ClientWrapper>
  );
}
```

### 3. Props Between Server and Client Must Be Serializable

You can't pass functions, classes, or other non-serializable values from Server to Client Components:

```tsx
// Server Component
function Page() {
  const handleClick = () => console.log('clicked');
  
  return <ClientButton onClick={handleClick} />;  // ❌ Functions aren't serializable
}
```

This forces you to keep interactivity self-contained in Client Components.

### 4. Async Components Are Server-Only

The `async function Component()` pattern only works in Server Components:

```tsx
// ✅ Server Component
async function ServerThing() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ❌ Client Component - can't be async
'use client';
async function ClientThing() {  // This won't work
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## My Take After Living With RSC

I've been using Next.js 13/14 with the App Router (which is built on RSC) for over a year now. Here's my honest assessment:

**The Good:**
- Bundle sizes are genuinely smaller
- Data fetching is more intuitive once you get it
- The composition model is elegant
- Performance is excellent out of the box

**The Rough:**
- The mental model takes time to internalize
- Error messages can be cryptic
- Some ecosystem libraries don't work yet
- Testing is more complex

**The Verdict:**

RSC is the future of React, and it's worth learning. But it's not magic, and it's not simple. It's a different paradigm that trades immediate accessibility for better performance at scale.

Start small. Build a blog or a simple dashboard with Server Components. Feel the friction. Then appreciate what it unlocks. That's how I learned it, and I think that's how most people will.

---

*The best explanation I found was Dan Abramov's original RFC. It's long but worth reading if you want to go deeper. The Next.js docs are also excellent once you have the mental model.*
