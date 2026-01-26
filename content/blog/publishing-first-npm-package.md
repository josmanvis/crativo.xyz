---
title: "Publishing Your First npm Package: A Practical Guide"
excerpt: "I've published several npm packages including too-bored, gappa-comments, and ace CLI. Here's everything I wish I knew before my first publish."
category: tutorials
publishedAt: 2024-11-08
tags:
  - npm
  - Open Source
  - JavaScript
  - TypeScript
coverImage: /blog/publishing-first-npm-package.svg
featured: false
seo:
  title: "How to Publish npm Package | Complete Guide for Beginners"
  description: "Step-by-step guide to publishing your first npm package. Learn from real experience publishing packages like too-bored and gappa-comments."
  keywords: ["publish npm package", "npm tutorial", "create npm package", "JavaScript library", "open source npm"]
---

# Publishing Your First npm Package: A Practical Guide

Publishing your first npm package feels like a rite of passage for JavaScript developers. I remember staring at the `npm publish` command for 10 minutes before pressing enter, terrified I'd break something.

Spoiler: you probably won't break anything. And if you do, `npm unpublish` exists (for the first 72 hours, at least).

I've published packages like `too-bored` (boredom-triggered actions), `gappa-comments` (comment extraction), and `ace` (a CLI tool). Here's everything I learned.

## Before You Write Any Code

### Check If It Already Exists

```bash
npm search your-package-idea
```

Or just search npmjs.com. There are over 2 million packages. Odds are, something similar exists. That's okay—yours might be better, simpler, or solve a specific use case.

### Pick a Good Name

Your package name should be:
- **Descriptive:** `react-toast-notifications` beats `rtn`
- **Available:** Check with `npm view package-name`
- **Memorable:** `axios` is easier to remember than `super-http-request-handler`

Scoped packages (`@username/package`) are always available if the unscoped name is taken.

## Project Setup

### Minimum Viable package.json

```json
{
  "name": "my-awesome-package",
  "version": "0.1.0",
  "description": "Does something awesome",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["awesome", "utility"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/you/my-awesome-package"
  }
}
```

Key fields:
- `main`: Entry point for CommonJS (`require()`)
- `types`: TypeScript definitions
- `files`: What gets published (keep it minimal!)
- `prepublishOnly`: Runs before `npm publish`

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Supporting Both CommonJS and ESM

Modern packages should support both:

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Use `tsup` to build both formats easily:

```bash
npm install -D tsup
```

```json
// tsup.config.ts
export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true
}
```

## Writing Quality Code

### Export Types

If you're using TypeScript (you should), export your types:

```typescript
// src/types.ts
export interface Options {
  timeout?: number;
  retries?: number;
}

// src/index.ts
export type { Options } from './types';
export { myFunction } from './myFunction';
```

### Handle Errors Gracefully

Don't throw unhandled errors:

```typescript
// Bad
function riskyOperation() {
  throw new Error("Something went wrong");
}

// Good
function riskyOperation(): Result<Data, Error> {
  try {
    // operation
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e };
  }
}
```

### Minimize Dependencies

Every dependency is a liability:
- Security vulnerabilities
- Bundle size
- Version conflicts

Ask: do I really need `lodash` for one function?

```typescript
// Instead of lodash.get
const get = (obj, path, defaultValue) => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    result = result?.[key];
  }
  return result ?? defaultValue;
};
```

## Testing Before Publishing

### Test Locally

```bash
# In your package directory
npm link

# In a test project
npm link my-awesome-package
```

Or use `npm pack` to create a tarball and install it:

```bash
npm pack
# Creates my-awesome-package-0.1.0.tgz

# In test project
npm install ../path/to/my-awesome-package-0.1.0.tgz
```

### Check What Gets Published

```bash
npm pack --dry-run
```

This shows exactly what files will be in the published package. Make sure you're not including:
- `node_modules/`
- Test files
- Source files (unless intentional)
- Config files (`.env`, etc.)

Use `.npmignore` or the `files` field to control this.

## Publishing

### First Time Setup

```bash
# Create npm account (if needed)
npm adduser

# Login
npm login

# Verify
npm whoami
```

### Your First Publish

```bash
# For scoped packages, make them public
npm publish --access public

# For unscoped packages
npm publish
```

That's it. Your package is live at `https://www.npmjs.com/package/your-package`.

### Version Management

Follow semver:
- **Patch (0.1.0 → 0.1.1):** Bug fixes
- **Minor (0.1.0 → 0.2.0):** New features, backward compatible
- **Major (0.1.0 → 1.0.0):** Breaking changes

Use npm's built-in commands:

```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

These update `package.json` and create a git tag.

## After Publishing

### Write a Good README

Your README is your package's landing page. Include:

1. **What it does** (one sentence)
2. **Installation** (`npm install ...`)
3. **Quick example** (copy-pasteable)
4. **API documentation** (all exports explained)
5. **License**

### Set Up GitHub Actions

Automate testing and publishing:

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Monitor Your Package

- Check download stats on npmjs.com
- Watch for GitHub issues
- Set up Dependabot for security updates

## Common Mistakes I Made

1. **Publishing with `node_modules`** — Always check with `npm pack --dry-run`
2. **Forgetting TypeScript types** — Add `declaration: true` to tsconfig
3. **Breaking changes in minor versions** — Users will be upset. I was upset.
4. **No tests** — Makes refactoring terrifying
5. **No changelog** — Users don't know what changed between versions

## The Psychological Part

Publishing open source is exposing yourself to judgment. People will:
- Find bugs you missed
- Question your design decisions
- Sometimes be rude about it

That's okay. Every package maintainer has been there. The alternative—keeping everything private—helps no one.

Your package doesn't need to be perfect. It needs to be useful to one person. Maybe that person is just you. That's enough.

## Start Small

My first published package was embarrassingly simple. Looking back, that was the right approach:

1. Solve one problem
2. Solve it well
3. Publish
4. Learn from feedback
5. Repeat

You don't need to build the next React. Build the utility function you keep copying between projects. Build the CLI tool that scratches your itch. Build something small, and ship it.

---

*My packages: [too-bored](https://npmjs.com/package/too-bored), [gappa-comments](https://npmjs.com/package/gappa-comments). Small, useful, mine.*
