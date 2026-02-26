---
title: "I Replaced My Entire Backend with Edge Functions (Mistakes Were Made)"
excerpt: "The journey of going all-in on serverless edge. What worked, what failed, and why I still have a VPS for some things."
category: deep-dives
publishedAt: 2026-02-26
tags:
  - serverless
  - edge-computing
  - cloudflare-workers
  - architecture
coverImage: /blog/edge-functions-mistakes.svg
featured: false
seo:
  title: "Replacing My Backend with Edge Functions: Lessons Learned"
  description: "I went all-in on serverless edge functions. Here's what worked, what didn't, and why I still need a VPS sometimes."
  keywords: ["serverless", "edge functions", "cloudflare workers", "vercel edge", "serverless architecture"]
---

# I Replaced My Entire Backend with Edge Functions (Mistakes Were Made)

It started with a simple observation: my Node.js backend was idle 99% of the time. I was paying for a VPS that sat there doing nothing, waiting for requests that came in bursts.

"Serverless," I thought. "That's the answer. Only pay for what you use."

So I migrated everything to edge functions. Cloudflare Workers, Vercel Edge, the whole thing. Every API route became an edge function. The database moved to Turso. Redis became Upstash.

Six months later, I have regrets. Not total regrets—some things work beautifully. But enough regrets that I want to share what I learned.

## What Worked: The Good Stuff

**Cold starts are basically gone**

Edge functions start in milliseconds. Not the 500ms+ cold starts of traditional Lambda. My API responses went from "acceptable" to "snappy."

**Global distribution is automatic**

My users in Singapore see the same latency as users in Virginia. The code runs at the edge, close to them. This is genuinely magical.

**The billing model is fair**

I pay for requests, not idle time. My backend costs went from $20/month (VPS) to... actually about the same, but now it scales automatically.

**Deployment is dead simple**

Push to git, done. No SSH, no docker compose, no server updates. The platform handles everything.

## What Didn't Work: The Regrets

**The database problem**

Edge functions run in isolation. Each request spins up a new context. That means no connection pooling, no persistent connections, no background jobs.

Every database query requires a new connection. With Turso/libsql, this is fine—they're designed for it. With a traditional Postgres? Forget it. The connection overhead will kill your performance.

I spent weeks debugging why my edge functions were slow before realizing: they were spending 80% of their time connecting to the database.

**WebSocket connections? Good luck**

Edge functions are ephemeral. They can't hold open connections. If you need WebSockets, real-time updates, or SSE, you need a different solution.

My notification system? Had to move it to a separate service. My real-time collaboration feature? Same thing. The "serverless" architecture immediately required a server.

**Local development is a lie**

`wrangler dev` and `vercel dev` are impressive, but they don't perfectly replicate production. I had bugs that only appeared in production. Debugging was a nightmare of console.log and redeploy.

**The timeout trap**

Edge functions have strict CPU time limits. Cloudflare Workers: 10ms CPU time (can be increased, but costs more). Vercel Edge: similar constraints.

Most of the time this is fine. But then you need to process a large file, or generate a PDF, or resize an image, and suddenly you're hitting timeout errors.

For those tasks, I had to... spin up a VPS.

## The Architecture I Ended Up With

After six months of iteration, here's what actually works:

**Edge functions for:**
- API routes that query the database and return JSON
- Authentication checks and session management
- Static asset serving (though a CDN is better)
- Light computation and transformation

**Traditional server for:**
- Background jobs and scheduled tasks
- WebSocket connections
- Long-running processes (file processing, PDF generation)
- Anything that needs persistent state

**Hybrid approach:**

```
User Request → Edge Function (auth, routing)
           → If simple query → Edge DB (Turso)
           → If complex → Proxy to VPS
           → If real-time → WebSocket server
```

This isn't simpler. It's more complex than what I started with. But it's what actually works.

## The Cost Reality

I thought serverless would be cheaper. It isn't.

My old VPS: $20/month for everything.
My new setup: 
- Cloudflare Workers: $5/month
- Turso: $10/month  
- Upstash Redis: $10/month
- VPS (for the stuff that doesn't fit): $12/month

Total: $37/month. Nearly double what I was paying before.

The difference is scalability. If my traffic spikes 100x, the serverless parts handle it automatically. The VPS would fall over. That's what I'm paying for.

## What I'd Do Differently

**Don't migrate everything at once**

I did a "big bang" migration over a weekend. Stupid. Should have migrated one route at a time, learned from each one, then proceeded.

**Test with production-like data early**

My test database had 100 records. Production had 100,000. Edge functions that were instant locally crawled in production because of connection overhead.

**Keep the VPS at first**

Don't decommission your server until you're sure everything works. I was without a fallback when things broke.

**Read the limits documentation carefully**

I hit CPU limits, memory limits, request body size limits—all documented, all ignored by me. RTFM, seriously.

## When Edge Functions Shine

Despite my complaints, there are use cases where edge functions are genuinely the best choice:

- **High-traffic APIs** with simple CRUD operations
- **Global applications** where latency matters
- **Authentication proxies** that validate tokens and route requests
- **Static site augmentation** where you need just a little server logic
- **Multi-tenant applications** that need isolation

If your use case fits these constraints, edge functions are amazing. The problem is when you try to force everything into that model.

## The Pragmatic Takeaway

Edge functions are a tool, not a religion. They're great for some things and terrible for others. The mistake was treating them as a complete replacement for traditional backends.

My current approach: start with edge functions for new projects, but accept that some features will need a server. Don't fight the constraints. Work with them.

The serverless dream—no servers, infinite scale, pay only for usage—is partially true. What they don't mention is that you'll probably still need a server somewhere.

---

*Still using a VPS? Still valid. The future is hybrid, not pure serverless.*