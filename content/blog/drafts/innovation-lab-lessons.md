---
title: Lessons from Running an Innovation Lab
excerpt: What I learned leading rapid application development at Retail Business Services.
category: career
publishedAt: 2024-09-12
tags:
  - Career
  - Innovation
  - Leadership
  - React
coverImage: /blog/innovation-lab.svg
---

# Lessons from Running an Innovation Lab

From 2018 to 2021, I led front-end development for the Innovation Lab at Retail Business Services—the technology arm of Ahold Delhaize, which owns Stop & Shop, Giant, Food Lion, and other grocery chains across the US and Europe. Our team's job was to prototype, validate, and pilot new technologies before they hit stores.

Three years, dozens of projects, millions of customers eventually touched by things we built. Here's what I learned about building products in an innovation environment.

## What an Innovation Lab Actually Does

The Innovation Lab wasn't R&D in the academic sense. We weren't publishing papers or exploring blue-sky concepts. We were a rapid application development team embedded in a 70-billion-dollar retail company.

Our mandate: take ideas from anywhere—executives, store managers, vendor pitches, competitive analysis—and turn them into working software fast enough to validate or kill them before significant investment.

A typical project lifecycle:

1. **Week 1-2:** Understand the problem, sketch solutions, get stakeholder buy-in
2. **Week 3-6:** Build an MVP, usually with React + Node.js
3. **Week 7-8:** Pilot in 1-3 stores with real customers
4. **Week 9-12:** Analyze results, iterate or kill
5. **If successful:** Hand off to production teams for full rollout

We killed more projects than we shipped. That was the point—fail fast, learn cheap.

## Project: The Stop & Shop Kiosk

The project that defined my time at the Lab was a customer service kiosk for Stop & Shop stores.

### The Problem

Grocery stores have thin margins. Labor is the biggest controllable cost. Stop & Shop wanted to reduce customer service desk staffing without degrading experience. The hypothesis: a self-service kiosk could handle common requests like price checks, product locations, digital coupons, and loyalty program questions.

### The Build

We went with a touchscreen kiosk running a React application in kiosk mode (Chrome fullscreen, no URL bar, no escape). The backend was Node.js talking to various store systems—inventory, pricing, loyalty.

The interesting technical challenges:

**1. IBM Watson Integration**

We integrated IBM Watson for natural language queries. "Where's the peanut butter?" instead of navigating menus.

```typescript
interface WatsonIntent {
  intent: string;
  confidence: number;
}

interface WatsonEntity {
  entity: string;
  value: string;
  confidence: number;
}

async function processQuery(text: string): Promise<QueryResult> {
  const response = await watson.message({
    workspaceId: WORKSPACE_ID,
    input: { text },
  });

  const intent = response.intents[0];
  const entities = response.entities;

  switch (intent?.intent) {
    case 'find_product':
      const product = entities.find(e => e.entity === 'product');
      return await findProductLocation(product?.value);
    
    case 'check_price':
      const item = entities.find(e => e.entity === 'product');
      return await checkPrice(item?.value);
    
    case 'store_hours':
      return await getStoreHours();
    
    default:
      return { type: 'fallback', message: 'I didn\'t understand that.' };
  }
}
```

Watson was... okay. Confidence scores were inconsistent, and training the model required retail domain expertise we had to build up. The lesson: AI features are only as good as your training data.

**2. Offline Resilience**

Store networks are unreliable. We needed the kiosk to work when the network didn't:

```typescript
// Service worker for offline support
const CACHE_NAME = 'kiosk-v1';
const OFFLINE_URLS = [
  '/',
  '/offline.html',
  '/static/store-map.json',
  '/static/product-catalog.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
      .then(response => response || caches.match('/offline.html'))
  );
});
```

We cached a subset of product data locally—enough for price checks and aisle locations to work offline. Anything requiring live data (loyalty balance, digital coupons) gracefully degraded.

**3. Touch-First UI**

I wrote extensively about this in my virtual keyboard article, but the broader lesson: touch interfaces are not mouse interfaces with bigger buttons.

- Touch targets need to be at least 44x44 pixels
- Hover states don't exist—use press states instead
- Swipe gestures need generous hit areas
- Users will touch the screen with wet hands, through gloves, while distracted

We built a component library specifically for kiosk use:

```typescript
// Big, chunky buttons for touch
const KioskButton = styled.button`
  min-width: 120px;
  min-height: 64px;
  font-size: 20px;
  border-radius: 12px;
  
  /* Press state instead of hover */
  &:active {
    transform: scale(0.96);
    background: ${p => p.theme.colors.primaryDark};
  }
  
  /* Remove default touch delays */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
`;
```

### The Pilot

We deployed to three Stop & Shop locations in Connecticut. I spent days standing near the kiosks, watching how people used them (and didn't use them).

Observations:

- **Placement matters.** Kiosks near the entrance got ignored. Kiosks near customer service got used.
- **Discovery is hard.** People didn't know the kiosk existed unless we put someone there to point at it.
- **Speed trumps features.** The store map was used 10x more than Watson queries. People want quick answers, not conversations.
- **Edge cases are common.** "Where's the bathroom?" "Can I return this item?" "Is the pharmacy open?" Our chatbot wasn't trained for any of these.

### The Outcome

The kiosk pilot was deemed a success—customer satisfaction scores stayed stable while service desk staffing was reduced 20% during pilot hours. The project was handed to a production team for broader rollout.

But here's the thing about innovation labs: I don't know what happened after that. The handoff was clean, the documentation was thorough, but I moved to the next project. That's the nature of the work—you build, you validate, you move on.

## Lessons That Stuck

### 1. Speed Over Perfection (But Know the Difference)

In an innovation environment, shipping a flawed prototype that teaches you something is better than shipping nothing. We had a saying: "If you're not embarrassed by v1, you shipped too late."

But—and this is crucial—there's a difference between "rough around the edges" and "doesn't work." The kiosk was visually unpolished in the first pilot, but it reliably did what it claimed to do. Trust requires reliability.

### 2. Reusable Components Are Worth the Investment

After the third kiosk project, we started building a component library. After the fifth, we had a design system. The time investment paid off exponentially.

```typescript
// Our kiosk component library
import { 
  KioskButton, 
  KioskInput, 
  KioskCard, 
  KioskModal,
  KioskKeyboard,
  ProductCard,
  AisleMap,
} from '@rbs/kiosk-components';
```

New projects that would have taken 8 weeks took 4. Consistency improved. Bugs found in one project got fixed everywhere.

The lesson applies beyond innovation labs: if you're going to build something more than twice, abstract it.

### 3. User Testing Early (Like, Embarrassingly Early)

Our best projects put working software in front of users within the first two weeks. Not wireframes—working software. There's something about interacting with a real thing that produces feedback you can't get from mockups.

We had a small usability lab in our office with a one-way mirror. We'd recruit store employees, sometimes customers, and watch them use our prototypes. The insights were often humbling:

- "Why would I use this when I can just ask someone?"
- "I don't understand what this button does."
- "This is too slow."

Every one of those comments made our products better.

### 4. Documentation Walks Out the Door

People leave. Projects get handed off. If knowledge only exists in heads, it's gone when those heads move on.

I learned to document obsessively:

- **Architecture Decision Records (ADRs):** Why we made technical choices, not just what we chose
- **Runbooks:** Step-by-step instructions for common operations
- **Video walkthroughs:** Sometimes a 5-minute Loom is worth 20 pages of docs

When I left the Innovation Lab, I spent my last two weeks writing documentation. It felt anticlimactic—no new features, no exciting code. But it was probably the most valuable thing I did.

### 5. Build Bridges to Production

Innovation labs have a dirty secret: lots of successful pilots never make it to production. There's a valley of death between "this worked in three stores" and "let's roll it out to 400 stores."

The gap is usually organizational, not technical. Production teams have different priorities, different constraints, different codebases. If the innovation team builds something that can't be integrated, it won't be integrated.

We learned to involve production teams early:

- Use their tech stack when possible
- Write code that meets their standards
- Build migration paths, not replacements
- Make handoffs gradual, not sudden

The kiosk project succeeded partly because we built it on the same React/Node stack the production team used. The handoff was "here's a repo you can deploy" instead of "here's a spec, rebuild it."

## The Tech Stack That Worked

For what it's worth, here's what we standardized on:

**Frontend:**
- React.js (class components initially, hooks later)
- TypeScript (game-changer for team velocity)
- styled-components (CSS-in-JS worked great for our component library)
- React Query (before it was cool)

**Backend:**
- Node.js with Express
- TypeScript
- PostgreSQL for structured data
- MongoDB for flexible/document data

**Infrastructure:**
- Docker everywhere
- Azure Kubernetes Service for production
- Azure DevOps for CI/CD

**Testing:**
- Jest for unit tests
- Cypress for E2E
- Manual testing in actual stores

The boring choices were intentional. When you're moving fast, you don't want to debug novel technology. You want to focus on the product.

## What I'd Do Differently

Looking back:

**1. More automated testing.** We shipped fast, but regression bugs were a recurring tax. CI/CD was good; test coverage was not.

**2. Better metrics from day one.** We often realized after a pilot that we should have been measuring something we weren't. Instrumentation should be part of the initial build, not an afterthought.

**3. Smaller pilots.** Three stores felt like the minimum, but sometimes one store with deep observation would have taught us more than three stores with thin data.

**4. Stronger relationships with store operations.** The best insights came from people who actually worked in stores. We should have embedded with them more.

## The Meta-Lesson

The most important thing I learned at the Innovation Lab isn't about technology. It's about the relationship between building and learning.

In a traditional development environment, you build something because you know it's needed. Requirements exist, you fulfill them.

In an innovation environment, you build something to find out if it's needed. The artifact is a hypothesis, not a solution.

This mindset—build to learn, not build to ship—changed how I approach all software development. Even at ON24 now, building production features at scale, I think about every feature as an experiment. What will we learn when this ships? How will we know if it's working?

The Innovation Lab taught me that building software is just a means to an end. The end is understanding.

---

*I spent three years at the Innovation Lab (2018-2021) before joining ON24. The projects I describe are real but some details are simplified or anonymized. Retail is a small world.*
