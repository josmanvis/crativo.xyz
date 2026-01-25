---
title: "Edge Computing: Cutting Through the Hype"
excerpt: The edge is real, but it's not magic. Here's when it actually helps.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - Edge
  - Infrastructure
  - Performance
  - Architecture
coverImage: /blog/edge-computing-when-to-use.svg
featured: false
---

# Edge Computing: Cutting Through the Hype

Every hosting platform is selling "edge" now. Vercel, Cloudflare, Netlify, Deno Deploy—they all want you to run your code at the edge. The marketing makes it sound like magic: instant response times, global scale, infinite performance.

The reality is more nuanced. Edge computing is a real tool that solves real problems. But it's not universal, and misusing it creates new problems.

Let me cut through the hype.

## What "Edge" Actually Means

Edge computing means running code geographically close to users instead of in a central data center.

Traditional setup:
```
User in Tokyo → Central server in Virginia → Response (200ms latency)
```

Edge setup:
```
User in Tokyo → Edge server in Tokyo → Response (30ms latency)
```

That latency reduction is real. Physics doesn't negotiate. If your server is 10,000 miles away, light itself needs 50ms to make the round trip. Edge computing puts your code closer.

But—and this is crucial—"edge" isn't one thing. There are different types:

### CDN Edge

This is the original edge: caching static files (images, CSS, JS) at servers worldwide. Cloudflare, Fastly, Akamai have been doing this for decades. It's proven and you should absolutely use it.

### Edge Functions

Running actual code (JavaScript, WASM) at edge locations. This is the new hotness: Cloudflare Workers, Vercel Edge Functions, Netlify Edge, Deno Deploy.

### IoT Edge

Computing on devices themselves (cameras, sensors, etc.). Different domain, not what this post is about.

When people talk about "edge" in web development, they usually mean edge functions.

## When Edge Functions Actually Help

### 1. Authentication & Personalization at the CDN Layer

This is the killer use case. Without edge, personalized content breaks CDN caching:

```
User requests /dashboard
→ CDN can't cache it (personalized)
→ Request goes to origin server (slow)
```

With edge:
```
User requests /dashboard
→ Edge function checks auth cookie
→ If valid, fetches from cache/origin and injects user data
→ Response assembled at edge (fast)
```

```typescript
// Vercel Edge Middleware
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = request.cookies.get('session');
  
  if (!token) {
    return NextResponse.redirect('/login');
  }
  
  // Validate token at the edge (fast JWT decode)
  const user = await validateToken(token);
  
  // Add user info to headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

Auth decisions happen at the edge. The origin server never sees unauthenticated requests.

### 2. A/B Testing Without Flicker

Client-side A/B testing causes flicker—the page loads, then changes. Server-side A/B testing requires all requests to hit origin.

Edge A/B testing:
```typescript
export async function middleware(request) {
  const bucket = request.cookies.get('ab-bucket') || assignBucket();
  
  if (bucket === 'treatment') {
    // Rewrite to the treatment version
    return NextResponse.rewrite('/experiment/new-homepage');
  }
  
  return NextResponse.next();
}
```

No flicker, no origin round-trip. Users in the same bucket get the same cached response.

### 3. Geolocation Logic

Edge functions know where the request is coming from:

```typescript
export default function handler(request) {
  const country = request.geo.country;
  const city = request.geo.city;
  
  // Redirect to country-specific site
  if (country === 'DE') {
    return Response.redirect('https://de.example.com');
  }
  
  // Show localized content
  const currency = getCurrencyForCountry(country);
  const prices = getPricesIn(currency);
  
  return new Response(JSON.stringify(prices));
}
```

This happens instantly at the edge. No need to call a geolocation API.

### 4. Request Transformation

Modify requests before they hit your origin:

```typescript
// Add headers
request.headers.set('x-request-id', crypto.randomUUID());

// Strip tracking parameters for caching
const url = new URL(request.url);
url.searchParams.delete('utm_source');
url.searchParams.delete('utm_campaign');

// Rewrite URLs
if (url.pathname.startsWith('/old/')) {
  url.pathname = url.pathname.replace('/old/', '/new/');
}
```

## When Edge Functions DON'T Help

### 1. Database Queries

Your edge function might be in Tokyo, but if your database is in Virginia, you've just moved the latency:

```
User → Edge (Tokyo) → Database (Virginia) → Edge → User
```

That's potentially worse than:
```
User → Origin (Virginia, same DC as database) → User
```

The edge function adds a hop. If you're doing database work, edge might slow you down.

**The solution:** Distributed databases (PlanetScale, CockroachDB, Fauna) that have replicas at the edge. Or read replicas with eventual consistency. This adds complexity.

### 2. CPU-Intensive Work

Edge functions have strict limits:
- Cloudflare Workers: 10ms CPU time (free), 50ms (paid)
- Vercel Edge: 25 seconds wall time, limited CPU
- Deno Deploy: 50ms CPU time

Image processing, PDF generation, complex calculations—these don't fit. Use serverless functions or traditional servers.

### 3. Large Responses

Edge functions are meant for small, fast responses. Streaming a 500MB video through an edge function doesn't make sense. Use a CDN for static assets.

### 4. Long-Running Processes

Background jobs, WebSocket connections, anything that needs to run for minutes—not edge territory.

## The Cold Start Reality

Edge functions are often "cold" (not already running). Cold starts on Cloudflare Workers are ~5ms—basically instant. Vercel Edge Functions are similar.

But this is specific to edge. Traditional serverless (Lambda, Cloud Functions) can have cold starts of 100ms-1s+. Don't confuse the two.

Edge runtimes are designed differently:
- Smaller runtime (no Node.js, limited APIs)
- V8 isolates instead of containers
- Prewarmed at edge locations

This is why edge is fast. It's also why you can't use all of Node.js.

## What You Can't Use at the Edge

Edge runtimes are NOT Node.js. They're V8 isolates with Web APIs. You can't use:

- File system access (`fs`)
- Native modules (anything with C++ bindings)
- Many npm packages (if they use Node.js APIs)
- Unlimited memory/CPU

You CAN use:
- `fetch`
- Web Crypto API
- `TextEncoder`/`TextDecoder`
- `URL`, `Headers`, `Request`, `Response`
- Most pure JavaScript libraries

Before adopting edge, check if your dependencies work. Many don't.

## My Recommendation

**Use edge for:**
- Authentication/authorization middleware
- A/B testing
- Geolocation-based routing
- Bot protection
- Request/response transformation
- Static site personalization

**Don't use edge for:**
- Database-heavy operations (unless you have edge-distributed data)
- File processing
- Background jobs
- Complex business logic

**Start here:**
1. Put your static assets on a CDN (table stakes)
2. Add edge middleware for auth/personalization
3. Keep complex logic in traditional serverless/servers
4. Only move more to edge when you have a specific latency problem to solve

The edge is powerful when used right. But "run everything at the edge" is as wrong as "run everything in one server." Pick the right tool for each job.

---

*Cloudflare's blog has excellent technical posts about how Workers actually work under the hood. Worth reading if you want to go deeper.*
