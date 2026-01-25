---
title: "Monorepos: When They Help, When They Hurt"
excerpt: I've used monorepos and polyrepos. Here's how to know which is right for your team.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - Architecture
  - DevOps
  - JavaScript
  - Tooling
coverImage: /blog/monorepo-decision-guide.svg
featured: false
---

# Monorepos: When They Help, When They Hurt

Every few months, someone on my team asks: "Should we move to a monorepo?"

It's a loaded question. Google uses a monorepo. So does Facebook. So does Microsoft for certain projects. But many successful companies use polyrepos. The right answer depends on your situation.

I've worked in both setups. I've migrated from polyrepo to monorepo, and I've watched a monorepo become unmanageable. Here's what I've learned about when each approach makes sense.

## What's Actually a Monorepo?

A monorepo is a single repository containing multiple distinct projects. Not one giant app—multiple apps, libraries, and services that happen to live together.

```
my-monorepo/
├── apps/
│   ├── web/          # React frontend
│   ├── mobile/       # React Native app
│   └── api/          # Node.js backend
├── packages/
│   ├── ui/           # Shared component library
│   ├── config/       # Shared configs (ESLint, TSconfig)
│   └── utils/        # Shared utilities
├── package.json      # Root workspace config
└── turbo.json        # Turborepo config (or nx.json, etc.)
```

A polyrepo is the traditional setup: each project gets its own repository.

## When Monorepos Help

### 1. You Have Shared Code

If your web app, mobile app, and API share types, utilities, or components, a monorepo makes that easy:

```typescript
// packages/shared/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// apps/web/src/components/UserCard.tsx
import { User } from '@mycompany/shared';

// apps/api/src/routes/users.ts
import { User } from '@mycompany/shared';
```

Change the `User` type, and TypeScript immediately tells you everywhere that breaks. No version mismatches. No "which package version has the fix?"

In a polyrepo, sharing code means:
1. Extract to a separate package
2. Publish to npm (or a private registry)
3. Update versions in consuming repos
4. Hope everyone upgrades

That ceremony kills velocity when you're iterating fast.

### 2. Atomic Cross-Project Changes

Say you're renaming an API endpoint. It affects the backend and two frontends.

**Polyrepo:**
- PR to api repo (merge, deploy)
- PR to web repo (wait for api to deploy, then merge)
- PR to mobile repo (same)
- Coordinate timing so nothing breaks

**Monorepo:**
- One PR with changes to api/, web/, and mobile/
- One review, one merge, everything stays in sync

For teams doing lots of cross-cutting changes, this is transformative. The coordination overhead vanishes.

### 3. Consistent Tooling

In a monorepo, everyone uses the same:
- ESLint config
- TypeScript version
- Prettier settings
- Testing setup
- CI/CD pipeline

```
packages/
└── config/
    ├── eslint-config/    # Shared ESLint rules
    ├── tsconfig/         # Shared TypeScript settings
    └── jest-preset/      # Shared Jest config
```

No more "the web team is on TypeScript 4.9 but mobile is stuck on 4.7." Everyone upgrades together.

### 4. Easier Onboarding

New developer joins. In a polyrepo world:
- Clone 5 repos
- Set up 5 different dev environments
- Figure out which repos talk to which
- Keep them all running simultaneously

In a monorepo:
- Clone one repo
- Run `npm install`
- Run `npm run dev` (starts everything)

I've seen onboarding time drop from days to hours.

## When Monorepos Hurt

### 1. Your Projects Are Actually Independent

If your web app and your marketing site share nothing, why are they in the same repo? Different teams, different deploy schedules, different concerns.

A monorepo adds complexity. If you don't benefit from the integration, that complexity is pure cost.

### 2. You Don't Have the Tooling

Monorepos need tooling to work:
- **Workspace management:** npm/yarn/pnpm workspaces, Lerna
- **Task running:** Turborepo, Nx, or Bazel
- **Caching:** To avoid rebuilding everything on every change
- **Affected analysis:** To run only the tests that matter

Without these, a monorepo is just a big folder of pain. Every CI run builds everything. Every test run takes forever. Developers wait constantly.

The tooling has gotten much better, but it's still setup work. If you're a small team moving fast, that setup might not be worth it.

### 3. Your Team Is Too Large

At scale, monorepos have different problems:
- Git operations slow down (clone, checkout, status)
- CI becomes a bottleneck
- Code ownership gets murky
- Merge conflicts increase

Google and Facebook solve this with custom tooling (Piper, custom VCS). Most teams can't build that. If you have 500 developers, a monorepo might create more problems than it solves.

The sweet spot seems to be 10-100 developers. Enough to benefit from shared code, not so many that coordination breaks down.

### 4. Mixed Tech Stacks

If your frontend is JavaScript and your backend is Go, a monorepo adds friction. Different package managers, different build systems, different testing philosophies.

You can make it work, but the benefits diminish. The "atomic cross-project change" advantage is weaker when changes don't share a type system.

## My Recommendation Framework

Answer these questions:

**1. Do your projects share code?**
- Yes → Points toward monorepo
- No → Points toward polyrepo

**2. How often do you make cross-project changes?**
- Weekly or more → Strong case for monorepo
- Monthly or less → Polyrepo is probably fine

**3. What's your team size?**
- 1-10 developers → Either works, monorepo might be overkill
- 10-50 developers → Monorepo sweet spot
- 50+ developers → Careful evaluation needed

**4. Do you have capacity to set up tooling?**
- Yes → Monorepo is viable
- No → Stay polyrepo until you do

## Setting Up a Modern Monorepo

If you decide to go monorepo, here's my current recommended stack:

**Package Manager:** pnpm
- Faster than npm/yarn
- Strict by default (catches missing deps)
- Great workspace support

**Task Runner:** Turborepo
- Easy to set up (compared to Nx)
- Remote caching (huge time saver)
- Good enough for most teams

**Structure:**
```
├── apps/           # Deployable applications
├── packages/       # Shared libraries
├── tooling/        # Build configs, scripts
├── package.json    # Workspace root
├── pnpm-workspace.yaml
└── turbo.json
```

**Root package.json:**
```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {}
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'
```

## The Migration

Moving from polyrepo to monorepo is a project. Here's the rough process:

1. **Start fresh:** Create a new monorepo with your tooling set up
2. **Move one project:** Usually the core app, with its full git history
3. **Extract shared code:** Move common types/utils to packages/
4. **Move next project:** Update imports to use shared packages
5. **Repeat until done**

Don't try to preserve separate git histories in one repo. It's not worth the complexity. Archive the old repos and move forward.

## My Experience

At the Innovation Lab, we used a monorepo for our kiosk projects. It worked great—shared components, shared configs, coordinated deployments. The tooling (Lerna at the time) was rough, but the developer experience was worth it.

At ON24, different teams own different services. Polyrepo makes sense because the projects are genuinely independent. Shared code goes into proper npm packages with versioning.

Neither is wrong. They're tools for different situations.

The mistake is treating it as a religious choice. "Google uses a monorepo, so we should too." Google also has thousands of engineers building custom VCS tools. Your situation is different.

Evaluate honestly. Choose deliberately. And know that you can migrate later if you choose wrong.

---

*Turborepo and Nx both have excellent docs. If you're exploring monorepos, start there.*
