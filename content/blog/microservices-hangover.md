---
title: "The Microservices Hangover: Why Monoliths Are Cool Again"
excerpt: "We spent a decade breaking things apart. Now we're gluing them back together. The industry pendulum swings back, and I'm not mad about it."
category: thoughts
publishedAt: 2026-02-26
tags:
  - architecture
  - microservices
  - monolith
  - backend
coverImage: /blog/microservices-hangover.svg
featured: false
seo:
  title: "The Microservices Hangover: Monoliths Are Cool Again"
  description: "After a decade of microservices hype, the industry is rediscovering monoliths. Here's why the pendulum swung back."
  keywords: ["microservices", "monolith", "architecture", "distributed systems", "modular monolith"]
---

# The Microservices Hangover: Why Monoliths Are Cool Again

Remember 2015? Every blog post was about microservices. Every conference talk showed that Netflix diagram—the one with dozens of tiny services all communicating via REST. If you weren't breaking your monolith into microservices, you were Doing It Wrong™.

So we did it. We broke everything apart. And now, ten years later, we're gluing it back together.

The hangover is real.

## What We Were Promised

Microservices were supposed to give us:

- **Independent deployment**: Ship one service without touching others
- **Technology flexibility**: Use the best language for each service
- **Team autonomy**: Different teams own different services
- **Scalability**: Scale only the services that need it
- **Resilience**: One service fails, others keep running

Netflix did it. Amazon did it. Google did it. Surely we could too.

## What We Got

**Distributed system problems**

Network calls that used to be function calls. Latency that appeared from nowhere. Services that were "available" but slow. The fallacies of distributed computing became our daily reality.

```javascript
// Before: function call
const user = await getUser(userId);

// After: network call with retry logic, circuit breakers, timeouts
const user = await fetchWithRetry(
  `https://user-service.internal/users/${userId}`,
  { retries: 3, timeout: 5000, circuitBreaker: userCircuit }
);
```

Every service boundary became a potential failure point.

**The deployment myth**

Independent deployment sounds great until you realize your services are coupled by data. Change the user schema? That's four services to update, in order, with backwards compatibility at each step.

We traded "deploy everything together" for "carefully choreograph deployments across teams and pray."

**The complexity tax**

Service discovery. Load balancing. Circuit breakers. Distributed tracing. Centralized logging. API gateways. Service meshes. Kubernetes.

We replaced a monolith with a monolith's worth of infrastructure.

**The debugging nightmare**

When a request fails, it goes through Service A → Service B → Service C → Service D. The error could be anywhere. The logs are scattered across four different systems. Good luck.

## The Monolith Renaissance

The pendulum is swinging back. Smart teams are rediscovering that monoliths aren't evil—they're just an architecture choice with tradeoffs.

**Modular monoliths**: Keep the code in one deployable unit, but organize it into strict modules with clear boundaries. You get the simplicity of a monolith with the organizational benefits of services.

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

Each module has a public API. Other modules call that API, not internal functions. When you need to extract a service later, the boundary already exists.

**When microservices still make sense**

They're not wrong for everyone. Netflix and Amazon had specific problems: thousands of engineers, massive scale, genuine need for independent deployment. If you have those problems, microservices still make sense.

But most companies aren't Netflix. Most have 10-50 engineers, moderate scale, and could benefit from simpler architecture.

## The New Pragmatism

The industry is learning nuance. We're moving from "microservices always" to "start simple, extract when needed."

**Start as a monolith**: One deployable, organized into modules. Simple to develop, simple to debug, simple to deploy.

**Extract when painful**: When a module needs independent scaling, different technology, or separate team ownership, extract it.

**Extract carefully**: Use the strangler fig pattern. Route traffic gradually. Don't rewrite everything at once.

## What's Different Now

The tools have improved. We're not going back to 2010 architecture:

- **Containerization**: Monoliths run in containers now. Same deployment experience.
- **Modular frameworks**: Rails engines, NestJS modules, Django apps—frameworks support modularity.
- **Better observability**: Even monoliths get OpenTelemetry these days.
- **Serverless**: Functions as a unit of scale, not services.

We're not abandoning distributed systems. We're being selective about which problems deserve distributed solutions.

## The Boring Truth

Architecture is about tradeoffs. Monoliths trade flexibility for simplicity. Microservices trade simplicity for scalability and team autonomy.

Neither is wrong. Both have costs. The mistake was treating microservices as the default choice instead of a deliberate decision based on actual needs.

If you're starting a new project, start simple. If you're in microservices hell, it's okay to consolidate. The cool kids aren't judging anymore—we've all been there.

---

*Still running microservices? If they're working, great. If not, monoliths are waiting with open arms.*