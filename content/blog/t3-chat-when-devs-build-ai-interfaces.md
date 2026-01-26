---
title: "T3.Chat: What Happens When Actual Devs Build AI Interfaces"
excerpt: Theo built the T3 stack. Now he's building AI chat. It shows.
category: tools
publishedAt: 2025-01-26
tags:
  - AI
  - Tools
  - Developer Experience
  - Review
coverImage: /blog/t3-chat-when-devs-build-ai-interfaces.svg
featured: false
---

# T3.Chat: What Happens When Actual Devs Build AI Interfaces

Everyone and their VC-funded cousin is building an AI chat app. Most of them are hot garbage wrapped in a waitlist.

So when Theo Browne—the guy behind create-t3-app and one of the most opinionated devs on the internet—launched T3.Chat, I paid attention.

## Who Is Theo, Anyway?

If you're in the TypeScript/Next.js world and don't know Theo, where have you been? He's the creator of the T3 Stack (Next.js, TypeScript, tRPC, Prisma, Tailwind), runs a massive YouTube channel, and has strong opinions about basically everything in web dev.

His company Ping.gg is Y Combinator backed. They also make UploadThing (file uploads that don't suck) and PicThing (background removal). The dude ships.

So when he claims to have built "the fastest AI chat app ever made," my bullshit detector was... cautiously optimistic.

## Why Speed Matters

Here's the thing about AI chat interfaces: most of them feel slow. Not because the AI is slow—it's because the interface adds latency.

Every time you:
- Wait for the UI to catch up with the streaming response
- Watch that annoying typing indicator before anything appears
- Deal with janky scrolling as text flows in
- Experience that pause between sending and first token

...you're experiencing bad frontend engineering.

Theo's whole brand is obsessing over developer experience and frontend performance. So building an AI chat that prioritizes speed makes sense. It's playing to his strengths.

## What T3.Chat Gets Right

### It's Actually Fast

The first-token latency is noticeable. When you hit send, text starts appearing almost immediately. No dramatic pause. No typing indicator theater.

This sounds trivial. It isn't. When you're having a conversation with an AI, every millisecond of latency breaks the flow. T3.Chat optimizes for conversational feel over flashy animations.

### The Interface Is Clean

No feature bloat. No fifty buttons you'll never click. Just a chat interface that does chat well.

This is surprisingly rare. Most AI chat apps look like they were designed by committee—every stakeholder got their feature shoved into the sidebar. T3.Chat feels like one person said "no" to a lot of meetings.

### It Works Like You'd Expect

Keyboard shortcuts work. Markdown renders properly. Code blocks have syntax highlighting. History is searchable.

These aren't exciting features. But the number of AI chat apps that get this basic stuff wrong is embarrassing.

## The Developer Angle

Here's what's interesting about T3.Chat from a dev perspective: it's built by someone who actually uses AI for coding daily.

Theo talks constantly about using Claude, ChatGPT, and various AI tools in his workflow. He has opinions about what works and what doesn't. That shows in the product decisions.

Compare this to enterprise AI chat products built by teams who view AI as a feature checkbox rather than a tool they use. The difference in taste is palpable.

## Where It Fits in the AI Chat Landscape

Let's be honest about the competition:

**ChatGPT** has the name recognition and model access, but the interface is increasingly bloated with features. Custom GPTs, DALL-E integration, browsing—it's trying to do everything.

**Claude.ai** has the best model (fight me), but Anthropic's interface is... fine. Not bad, not exceptional. Very "we're an AI research company, not a product company."

**Perplexity** is great for search but weird for conversation. It wants to cite sources when sometimes you just want to chat.

**T3.Chat** is none of these. It's picking a lane: be fast, be clean, get out of the way. That's a valid bet.

## The Business Question

The elephant in the room: why would you pay for another AI chat app when you probably already pay for Claude or ChatGPT?

Honest answer: maybe you shouldn't. If you're happy with your current setup, T3.Chat isn't going to revolutionize your life.

But there's a market for people who:
- Want a faster interface without switching models
- Prefer cleaner UX over feature lists  
- Trust a dev-focused team to make good product decisions
- Want to support indie tools over Big AI

That's not everyone. But it's someone.

## The Theo Factor

Part of T3.Chat's appeal is, frankly, Theo himself. When you've watched someone rant about good DX for years, you trust their taste.

This is the same reason people buy products from creators they follow. You're not just buying the product—you're betting on the person behind it.

Is that rational? Maybe not purely. But when has software purchasing ever been purely rational?

## What I'd Want To See

If T3.Chat wants to compete long-term, it needs something ChatGPT and Claude don't have. Speed is good. Clean design is good. But those can be copied.

Some ideas:
- **Deep integrations** with dev tools (GitHub, VS Code, terminal)
- **Local-first** option for private conversations
- **Model routing** that picks the right model for each query
- **Collaborative features** for team conversations

The best indie products win by being opinionated, not by being cheaper ChatGPT.

## Should You Try It?

Yeah, probably. It's free to try, and you'll know within 5 minutes if it clicks for you.

If the speed difference feels meaningful and the interface resonates, great. If you're happy with Claude or ChatGPT, that's fine too.

The real takeaway isn't "T3.Chat is the best." It's that actual developers building AI tools make different choices than big companies. Sometimes better choices.

We need more of that.

---

*T3.Chat is at [t3.chat](https://t3.chat). Theo's YouTube is worth watching regardless of whether you use the product—the guy has good takes on web dev.*
