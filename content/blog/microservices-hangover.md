---
title: "The Microservices Hangover: Why Monoliths Are Cool Again"
excerpt: "We spent a decade smashing our apps into 47 tiny services. Now we're gluing them back together and pretending that was the plan all along."
category: thoughts
publishedAt: 2026-02-26
tags:
  - architecture
  - microservices
  - monolith
  - backend
featured: false
seo:
  title: "The Microservices Hangover: Monoliths Are Cool Again"
  description: "After a decade of microservices hype, the industry is rediscovering monoliths. Here's why the pendulum swung back."
  keywords: ["microservices", "monolith", "architecture", "distributed systems", "modular monolith"]
---

# The Microservices Hangover: Why Monoliths Are Cool Again

It's 2015. Every conference talk opens with the Netflix diagram: a beautiful spiderweb of tiny services, all chatting over REST like a group project where nobody trusts each other. The message is clear. If your app is one deployable, you are a dinosaur, and the meteor is a Kubernetes cluster.

So we did what any reasonable industry would do. We took perfectly working apps and smashed them into pieces.

Ten years later, we're on the floor looking for the superglue. The hangover is real, and it has a pager.

## What We Were Promised

The microservices brochure was incredible:

- **Independent deployment**: ship one service without touching the others
- **Technology flexibility**: Go here, Rust there, a little Elixir for flavor
- **Team autonomy**: every team gets its own little kingdom
- **Scalability**: scale only the part that's on fire
- **Resilience**: one service dies, the rest keep partying

Netflix did it. Amazon did it. Google did it. And our 12-person startup with 400 daily users looked at that list and said: same energy.

## What We Got

**Distributed system problems, free of charge**

Every function call became a network call. Network calls have opinions. They have latency. They time out on Tuesdays for no reason. The fallacies of distributed computing went from a fun list on Wikipedia to our entire personality.

```javascript
// Before: function call
const user = await getUser(userId);

// After: network call with retry logic, circuit breakers, timeouts
const user = await fetchWithRetry(
  `https://user-service.internal/users/${userId}`,
  { retries: 3, timeout: 5000, circuitBreaker: userCircuit }
);
```

One line became a small ceremony. And every service boundary is now a brand new place for things to break.

**The deployment myth**

"Independent deployment" is true right up until your services share data, which is always. Change the user schema and congratulations, you now get to update four services, in a specific order, staying backwards compatible at every step, like defusing a bomb where the wires are owned by different teams.

We traded "deploy everything together" for "coordinate a release across three Slack channels and pray."

**The complexity tax**

Service discovery. Load balancers. Circuit breakers. Distributed tracing. Centralized logging. API gateways. A service mesh. Kubernetes, obviously, because how else would you run a to-do app.

We removed the monolith and replaced it with a monolith's worth of infrastructure. Instant classic.

**The debugging nightmare**

A request goes Service A → Service B → Service C → Service D and then fails. Where? Somewhere. The logs are spread across four systems, the trace ID got dropped in Service B, and the person who wrote Service C left in 2021. Good luck, detective.

## The Monolith Renaissance

Plot twist: the pendulum is swinging back. Smart teams are figuring out that monoliths were never evil. They were just an architecture with tradeoffs, which, it turns out, is what every architecture is.

**Modular monoliths**: one deployable unit, but organized into strict modules with real boundaries. You get the simplicity of a monolith and the tidy org chart of services, minus the 3 a.m. network partitions.

```python
# Modular structure
app/
├── users/          # User module
│   ├── api.py      # Public interface
│   ├── models.py   # Internal models
│   └── service.py  # Business logic
├── orders/         # Order module
│   ├── api.py
│   ├── models.py
│   └── service.py
└── shared/         # Shared utilities
```

Each module exposes a public API, and other modules only talk to that API, never the internals. So if one module ever genuinely needs to become its own service, the boundary is already drawn. You just cut along the dotted line.

**When microservices still make sense**

To be fair, they're not a scam. Netflix and Amazon had real problems: thousands of engineers, absurd scale, and a genuine need to deploy independently. If that's you, microservices are great. Go wild.

But most companies are not Netflix. Most have 10 to 50 engineers, moderate traffic, and a burning desire to never open a service mesh config file again.

## The New Pragmatism

The industry has discovered nuance, which is a fancy way of saying we got burned. The new rule is "start simple, extract when it hurts."

**Start as a monolith**: one deployable, split into modules. Easy to build, easy to debug, easy to deploy.

**Extract when painful**: when a module needs its own scaling, its own tech, or its own team, then and only then pull it out.

**Extract carefully**: use the strangler fig pattern. Shift traffic gradually. Do not, under any circumstances, announce The Big Rewrite.

## What's Different Now

This isn't a return to 2010 with jQuery and FTP. The tooling grew up:

- **Containerization**: monoliths ship in containers now. Same deployment experience, fewer moving parts.
- **Modular frameworks**: Rails engines, NestJS modules and Django apps all support real modularity out of the box.
- **Better observability**: even a monolith gets OpenTelemetry these days.
- **Serverless**: functions became the unit of scale, not services.

We're not abandoning distributed systems. We're just being picky about which problems actually deserve one.

## The Boring Truth

Architecture is tradeoffs all the way down. Monoliths trade flexibility for simplicity. Microservices trade simplicity for scalability and team autonomy.

Neither one is wrong. Both cost something. The mistake was treating microservices as the default instead of a decision you make on purpose, with actual needs, and ideally while sober.

Starting a new project? Start simple. Already deep in microservices hell? It's okay to consolidate. Nobody's judging. We were all there, staring at the Netflix diagram, wondering if our side project needed eleven services.

It did not.

---

*Still running microservices? If they're working, genuinely great. If not, the monolith is right there, arms open, saying it told you so.*
