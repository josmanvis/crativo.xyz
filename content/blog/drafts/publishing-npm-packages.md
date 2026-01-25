---
title: Publishing npm Packages - Lessons from too-bored and ace
excerpt: What I learned shipping open source packages used by real developers.
category: tools
publishedAt: 2025-01-27
tags:
  - NPM
  - Open Source
  - JavaScript
  - TypeScript
---

# Publishing npm Packages: Lessons from too-bored and ace

At the Innovation Lab, I built tools that solved real problems. Two of them—**too-bored** (a virtual keyboard) and **ace** (a React CLI)—made it onto npm. Here's what I learned about publishing packages that people actually use.

## Start with Your Own Problem

Both packages came from frustration:

- **too-bored**: I needed a virtual keyboard for kiosk apps. Everything I found was bloated or didn't play nice with React state.
- **ace**: I was tired of setting up the same React boilerplate. Copy-pasting configs got old fast.

The best packages solve problems you personally have. You'll be your own first user, which means you'll actually maintain it.

## The Anatomy of a Good Package

```
my-package/
├── src/              # TypeScript source
├── dist/             # Compiled output
├── README.md         # This is your landing page
├── LICENSE           # MIT unless you have reasons
├── package.json      # Metadata matters
└── tsconfig.json
```

### package.json Essentials

```json
{
  "name": "too-bored",
  "version": "1.2.0",
  "description": "Configurable virtual keyboard for React",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["react", "keyboard", "virtual", "kiosk"],
  "repository": {
    "type": "git",
    "url": "https://github.com/josmanvis/too-bored"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  }
}
```

Key things:
- **files**: Only ship what's needed
- **types**: TypeScript users will thank you
- **peerDependencies**: Don't bundle React, let them use theirs
- **keywords**: How people find you

## README is Everything

Your README is your package's landing page. It needs:

1. **What it does** — One sentence
2. **Install** — Copy-pasteable
3. **Quick example** — Working code in 10 lines
4. **API docs** — Props, options, methods
5. **License** — Don't make people hunt

I've seen great packages die because the README was a wall of text with no code examples.

## Versioning Strategy

Semantic versioning isn't optional:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

For pre-1.0 packages, I treat minor as breaking. Once you hit 1.0, the contract is real.

## Publishing Workflow

```bash
# Bump version
npm version patch  # or minor, or major

# Build
npm run build

# Publish
npm publish

# Push tags
git push --tags
```

I automated this with a script:

```bash
#!/bin/bash
npm run test
npm run build
npm version $1
npm publish
git push --tags
```

## Mistakes I Made

1. **Publishing without building** — Shipped src/ instead of dist/. Embarrassing.
2. **No .npmignore** — Published node_modules once. Package was 200MB.
3. **Breaking changes in patch** — Lost a user's trust.
4. **No TypeScript types** — Had to retrofit them later.

## The Payoff

There's something satisfying about seeing your package in someone else's package.json. Too-bored has been downloaded thousands of times. People I'll never meet are using code I wrote at the Innovation Lab.

That's the magic of open source.

## Quick Start

If you've never published:

```bash
npm login
npm publish
```

That's it. Start small. Ship something. Iterate.
