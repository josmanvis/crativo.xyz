---
title: "The API-First Startup Trap: Building Something Nobody Asked For"
excerpt: "A confession. I built APIs for imaginary users. Don't make my mistake. Build the UI first, validate with real people, then abstract."
category: thoughts
publishedAt: 2026-02-26
tags:
  - startup
  - api
  - product
  - mistakes
coverImage: /blog/api-first-trap.svg
featured: false
seo:
  title: "The API-First Trap: Why You Should Build UI Before APIs"
  description: "I spent months building APIs nobody used. Here's why API-first is often a trap for solo developers and early startups."
  keywords: ["api first", "startup mistakes", "product development", "build ui first", "developer trap"]
---

# The API-First Startup Trap: Building Something Nobody Asked For

I spent three months building the perfect API.

Clean REST endpoints. GraphQL alternative. WebSocket support. Rate limiting. Authentication. Authorization. Documentation auto-generated from OpenAPI specs. A Python SDK. A JavaScript SDK. Even a PHP SDK because... why not?

Then I launched. Crickets.

Zero users. Zero interest. Three months of work that solved nobody's problem.

This is the API-first trap. And I fell for it hard.

## The Appeal of API-First

The logic seems sound:

1. APIs are reusable
2. If I build a good API, people will build on it
3. Developers love APIs
4. I can build multiple frontends on the same backend
5. API-first is "proper" architecture

It appeals to engineers because we love abstraction. We love solving the general case. We love the idea of building something that could power anything.

That's exactly why it's a trap.

## The Problem: Imaginary Users

When you build an API first, you're building for hypothetical users doing hypothetical things.

"What if someone wants to..." - this phrase is a red flag. You're not building for a real need. You're building for a possible need.

I imagined developers would use my API for:
- Mobile apps
- Integrations
- Internal tools
- Competing frontends

None of these users existed. None of them were asking for my API. I was solving problems I imagined, not problems people had.

## The UI Reality Check

A UI forces you to make choices. A UI requires you to:
- Understand the user's actual workflow
- Make the happy path obvious
- Handle errors gracefully
- Show, not tell, what your product does

An API lets you avoid all of this. Everything is "flexible." Every decision can be "configured by the user."

That flexibility is actually ambiguity. You haven't decided what your product is. You've offloaded that decision to imaginary future users.

## What I Should Have Done

**1. Start with a single interface**

One specific use case. One specific user. One specific way to solve their problem.

A CLI tool. A web form. A mobile app. Something concrete.

**2. Get it in front of real users**

Before abstracting, validate. Do people actually want this? Will they pay for it? Does it solve a real pain point?

**3. Abstract when you see patterns**

Once multiple users are asking for the same thing in different contexts, then build the API. The API emerges from real needs, not imagined ones.

**4. Build SDKs when developers ask**

Don't pre-build SDKs. If developers want to use your API, they'll tell you what they need. Build what's asked for.

## The Sunk Cost

The hardest part was admitting those three months were wasted. The API was technically excellent. It was well-designed, well-documented, well-tested.

It was also useless.

I kept trying to "make it work" — building frontends for my own API, trying to create use cases. More time wasted.

Eventually, I killed it. A hard lesson: sometimes good work is still the wrong work.

## When API-First Actually Makes Sense

To be fair, API-first isn't always wrong:

**You're selling to developers**

If your customer is a developer who will integrate your API into their product, API-first might make sense. But even then, have specific developer customers lined up before you build.

**You're building an internal platform**

When your company has multiple teams that need the same functionality, build the API first. You have internal customers who've expressed the need.

**You're Stripe or Twilio**

Some businesses are API businesses. But Stripe started with a specific use case (payments for developers), and Twilio started with a specific pain point (programmatic phone calls). They weren't solving hypotheticalअभी problems.

## The Better Approach: UI-First

Start with the most concrete interface possible:

- **CLI**: Fastest to build, most direct feedback
- **Web UI**: Visual, can be shared with non-technical users
- **Mobile app**: Specific context, specific constraints

Build the minimum thing that solves a real problem for a real person. Use it yourself. Share it with potential users. Iterate based on feedback.

Then, when patterns emerge, abstract into an API.

## Signs You're in the Trap

- You've been building for months without a user
- You're writing SDKs for languages you don't use
- Your documentation uses phrases like "you could use this for..."
- You have no concrete use cases, only possibilities
- You're building for "developers in general"

If any of these sound familiar, stop. Find a real user. Build for them specifically.

## What I'm Building Now

These days, I build backwards:

1. **Find a pain point** I experience myself
2. **Build the crudest possible solution** that works
3. **Use it myself** for at least a week
4. **Share it with 5 people** who might have the same problem
5. **Iterate based on feedback**
6. **Only then abstract** into a reusable API

My last project was a CLI tool for managing git backups on external drives. No API. No SDKs. Just a specific tool for a specific problem.

It has users. Real users. Who found it useful enough to tell others.

That's the validation I was chasing with my perfect API. I found it by building something concrete instead of something abstract.

## The Lesson

Abstraction is seductive. It feels like leverage — build once, use everywhere. But leverage without validation is just wasted effort.

Build the thing. Use the thing. Share the thing.

Abstract later. Much later. When abstraction is a response to actual demand, not anticipated demand.

---

*Planning an API-first project? Ask yourself: who's waiting for this? If you don't have a name, you don't have a user.*