---
title: "Publishing npm Packages: Hard Lessons from too-bored, ace, and Beyond"
date: "2025-01-25"
description: "Everything I learned publishing npm packages at work and in the open—versioning, documentation, monorepos, and the mistakes that taught me the most."
tags: ["npm", "javascript", "typescript", "open-source", "publishing"]
featured: true
readingTime: "16 min"
---

# Publishing npm Packages: Hard Lessons from too-bored, ace, and Beyond

Publishing an npm package feels simple: `npm publish`. Done.

But maintaining a package that people actually use? That's where the complexity lives. After publishing packages like `too-bored` (a virtual keyboard for kiosks), `ace` (a React scaffolding CLI), `gappa-comments` (threaded comments), and more recently `pubsafe` and `zeebra`, I've learned that the publish command is just the beginning.

This is everything I wish I knew before my first npm publish.

## The Anatomy of a Well-Published Package

Let's start with what a production-ready package looks like. Here's the structure I've converged on after years of iteration:

```
my-package/
├── src/                    # Source code (TypeScript)
│   ├── index.ts           # Main entry point
│   ├── core/              # Core functionality
│   ├── utils/             # Utilities
│   └── types.ts           # Type definitions
├── dist/                   # Build output (gitignored, npm-included)
│   ├── index.js           # CommonJS build
│   ├── index.mjs          # ESM build
│   ├── index.d.ts         # Type declarations
│   └── index.d.mts        # ESM type declarations
├── scripts/               # Build and publish scripts
│   ├── build.ts
│   └── prepublish.ts
├── tests/                 # Tests
│   ├── unit/
│   └── integration/
├── package.json           # The heart of it all
├── tsconfig.json          # TypeScript config
├── tsconfig.build.json    # Build-specific TS config
├── .npmignore             # What to exclude from npm
├── README.md              # Documentation
├── CHANGELOG.md           # Version history
└── LICENSE                # Legal stuff
```

## package.json: Getting It Right

The `package.json` is where most publishing problems originate. Here's a complete example from a real package:

```json
{
  "name": "zeebra",
  "version": "1.2.3",
  "description": "Performant z-index management with virtual z-stack recycling",
  "author": "Jose <jose@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/josmanvis/zeebra.git"
  },
  "homepage": "https://github.com/josmanvis/zeebra#readme",
  "bugs": {
    "url": "https://github.com/josmanvis/zeebra/issues"
  },
  "keywords": [
    "z-index",
    "css",
    "react",
    "layers",
    "modal",
    "popup"
  ],
  
  "type": "module",
  
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      },
      "require": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./react": {
      "import": {
        "types": "./dist/react.d.mts",
        "default": "./dist/react.mjs"
      },
      "require": {
        "types": "./dist/react.d.ts",
        "default": "./dist/react.js"
      }
    }
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "scripts": {
    "build": "tsup src/index.ts src/react.ts --format cjs,esm --dts",
    "test": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run lint && npm run typecheck && npm run test && npm run build"
  },
  
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "react": "^18.2.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  
  "engines": {
    "node": ">=18.0.0"
  },
  
  "publishConfig": {
    "access": "public"
  }
}
```

Let me break down the critical parts:

### The Exports Field

The `exports` field is how modern Node.js and bundlers resolve your package. Getting it wrong means your package won't work in certain environments:

```json
"exports": {
  ".": {
    "import": {
      "types": "./dist/index.d.mts",
      "default": "./dist/index.mjs"
    },
    "require": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

**Why this structure?**
- `types` must come before `default` (TypeScript reads top-to-bottom)
- Separate entries for `import` (ESM) and `require` (CJS)
- Explicit subpath exports for tree-shaking

**Common mistake I made**: Forgetting the `types` condition inside exports. TypeScript 4.7+ respects `exports` for type resolution, and without explicit types conditions, consumers get "no types found" errors.

### The Files Field

```json
"files": [
  "dist",
  "README.md",
  "LICENSE"
]
```

This is a whitelist—only these files/folders go to npm. I prefer this over `.npmignore` because it's explicit. You know exactly what's being published.

**Pro tip**: Run `npm pack` and extract the tarball to see exactly what gets published:

```bash
npm pack
tar -xzf zeebra-1.2.3.tgz
ls -la package/
```

### Peer Dependencies Done Right

```json
"peerDependencies": {
  "react": ">=16.8.0"
},
"peerDependenciesMeta": {
  "react": {
    "optional": true
  }
}
```

If your package has React bindings but also works without React (like a core library), make React an optional peer dependency. This prevents npm from yelling at users who don't need React.

## Building for Multiple Targets

The JavaScript ecosystem's module situation is a mess. You need to support:
- CommonJS (Node.js, older bundlers)
- ESM (modern Node.js, modern bundlers)
- TypeScript type declarations

I've tried many build tools. Here's my current recommendation:

### tsup: The Pragmatic Choice

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  minify: false, // Let consumers minify
  sourcemap: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";', // For React Server Components
    };
  },
});
```

Why tsup?
- Zero config for simple cases
- Handles dual CJS/ESM builds
- Generates .d.ts files
- Fast (uses esbuild)
- Mature and well-maintained

### The prepublishOnly Hook

Never publish without validation:

```json
"scripts": {
  "prepublishOnly": "npm run lint && npm run typecheck && npm run test && npm run build"
}
```

This runs automatically before `npm publish`. If any step fails, the publish is aborted.

I add an extra check with a custom script:

```typescript
// scripts/prepublish.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function preflight() {
  console.log('🔍 Running prepublish checks...\n');

  // 1. Check for uncommitted changes
  try {
    execSync('git diff --quiet HEAD');
  } catch {
    console.error('❌ Uncommitted changes detected. Commit before publishing.');
    process.exit(1);
  }

  // 2. Verify dist exists and is recent
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist folder not found. Run build first.');
    process.exit(1);
  }

  // 3. Check package.json version matches git tag
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const version = pkg.version;
  
  try {
    execSync(`git rev-parse v${version}`, { stdio: 'ignore' });
    console.log(`✅ Git tag v${version} exists`);
  } catch {
    console.warn(`⚠️  No git tag for v${version}. Consider: git tag v${version}`);
  }

  // 4. Verify exports resolve correctly
  const exports = pkg.exports?.['.'];
  if (exports) {
    const files = [
      exports.import?.default,
      exports.require?.default,
      exports.import?.types,
      exports.require?.types,
    ].filter(Boolean);

    for (const file of files) {
      if (!fs.existsSync(file)) {
        console.error(`❌ Export file missing: ${file}`);
        process.exit(1);
      }
    }
    console.log('✅ All export files exist');
  }

  console.log('\n✅ Prepublish checks passed!\n');
}

preflight();
```

## Versioning: The Hardest Part

Semantic versioning sounds simple: MAJOR.MINOR.PATCH. In practice, it's a judgment call every time.

### My Versioning Rules

**Patch (x.x.X)**: Bug fixes, dependency updates, documentation
- The behavior consumers expect doesn't change
- No new features, just fixes

**Minor (x.X.0)**: New features, non-breaking additions
- New exports, new options, new functionality
- Everything that worked before still works the same way

**Major (X.0.0)**: Breaking changes
- Removed exports
- Changed function signatures
- Changed default behavior
- Dropped Node.js version support

### The Gray Areas

Here's where it gets tricky:

**Adding a required parameter to a function?**
- Major. Existing code will break.

**Adding an optional parameter?**
- Minor. Existing code still works.

**Fixing a bug that people might depend on?**
- This is the hardest. Technically a patch, but if people rely on the buggy behavior, it's breaking for them. I lean toward minor for "bug fixes that change observable behavior."

**Improving performance significantly?**
- Patch if behavior is unchanged. But document it—consumers might have workarounds for the old slow behavior.

### Changelogs That Don't Suck

Every version gets a changelog entry. I use Keep a Changelog format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-01-25

### Added
- New `useZIndexGroup` hook for managing z-index across component groups
- Support for custom z-index ranges via `ZIndexProvider` props

### Changed
- Improved recycling algorithm, 40% reduction in z-index churn

### Fixed
- Fixed memory leak when components unmount rapidly

## [1.2.0] - 2025-01-10

### Added
- React 19 support
- `createZIndexStack` factory for non-React usage

### Deprecated
- `ZIndexManager.reset()` - use `ZIndexManager.clear()` instead
```

The changelog is for humans. Be specific about what changed and why.

## Documentation: README Patterns

Your README is your package's landing page. Here's the structure I've found works:

```markdown
# Package Name

One-sentence description of what it does.

[![npm version](https://badge.fury.io/js/package-name.svg)](https://badge.fury.io/js/package-name)
[![npm downloads](https://img.shields.io/npm/dm/package-name.svg)](https://www.npmjs.com/package/package-name)

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Quick Start

[Minimal working example - copy-pasteable]

## Features

- Feature 1
- Feature 2
- Feature 3

## API Reference

### `mainFunction(options)`

[Detailed API documentation]

## Examples

[More complex examples]

## FAQ

[Common questions]

## Contributing

[How to contribute]

## License

MIT
```

**Key points:**
- Quick start in the first scroll
- Copy-pasteable examples
- Link to more detailed docs if needed
- Keep it focused—README isn't the place for every edge case

## Publishing Workflows

### Manual Publishing

For small packages, manual is fine:

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. This runs prepublishOnly automatically
npm publish

# 3. Push the version commit and tag
git push && git push --tags
```

### Automated with GitHub Actions

For packages with more contributors, automate it:

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # For npm provenance
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      
      - run: npm publish --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `--provenance` flag adds cryptographic proof that this package came from this GitHub repo. It's a trust signal for consumers.

### Monorepo Publishing

For monorepos with multiple packages, I use Changesets:

```bash
# Install
npm install -D @changesets/cli
npx changeset init

# When you make a change
npx changeset
# This creates a changeset file describing what changed

# To release
npx changeset version  # Bumps versions, updates changelogs
npx changeset publish  # Publishes all changed packages
```

Changesets handles:
- Version coordination across packages
- Changelog generation
- Peer dependency updates
- Publishing order

## Mistakes I've Made

### 1. Publishing Without Building

Early on, I published a package without running the build step. The `dist/` folder was stale. Users got an old version of the code. 

**Fix**: `prepublishOnly` hook that always builds.

### 2. Breaking Changes in Minor Versions

I thought renaming an internal function wouldn't matter. But it was exported, and someone was using it. Their build broke on a minor update.

**Fix**: Everything exported is public API. Document it, or don't export it.

### 3. Not Testing the Published Package

The package worked in my dev environment. But I had a path alias that didn't ship. The published package was broken.

**Fix**: After publishing, install the package in a fresh project and verify it works:

```bash
mkdir /tmp/test-install && cd /tmp/test-install
npm init -y
npm install my-package@latest
node -e "console.log(require('my-package'))"
```

### 4. Forgetting Windows

My CLI tool used `/` for paths. Worked great on Mac and Linux. Broke completely on Windows.

**Fix**: Use `path.join()` and `path.sep`. Test on Windows (or at least in WSL).

### 5. Huge Package Size

I accidentally included test fixtures in the published package. It was 50MB instead of 500KB.

**Fix**: Always check package size before publishing:

```bash
npm pack --dry-run
# Shows what will be included and total size
```

## Unpublishing and Deprecation

Sometimes you need to remove or discourage use of a version.

### Deprecating a Version

```bash
npm deprecate my-package@1.2.3 "Security vulnerability, upgrade to 1.2.4"
```

This shows a warning when anyone installs that version. Use it for security issues or bad releases.

### Deprecating a Package

```bash
npm deprecate my-package "This package is unmaintained. Use better-package instead."
```

### Unpublishing

npm has strict rules about unpublishing:
- Within 72 hours of publish: You can unpublish
- After 72 hours: Generally can't unpublish (unless no dependents)

```bash
npm unpublish my-package@1.2.3
```

**My advice**: Rarely unpublish. Deprecate instead. Unpublishing breaks builds for anyone who depends on that exact version.

## Security Considerations

### npm Access Tokens

Never commit npm tokens. Use:
- `NPM_TOKEN` environment variable in CI
- npm's `--otp` flag for 2FA when publishing manually
- `npm token create --read-only` for CI jobs that only need to read

### The pubsafe Pattern

I built `pubsafe` specifically because I almost published a package with a `.env` file containing API keys. Now I run it before every publish:

```bash
npx pubsafe
# Scans for sensitive files and verifies they're in .gitignore/.npmignore
```

### Audit Your Dependencies

Before publishing, audit what you're depending on:

```bash
npm audit
```

Your package's vulnerabilities become your users' vulnerabilities.

## Final Thoughts

Publishing npm packages is a skill that compounds. Each package you publish teaches you something. The mistakes become lessons, and eventually the process becomes second nature.

Key takeaways:

1. **Structure your package.json carefully** — exports, files, engines matter
2. **Build for CJS and ESM** — the ecosystem is still split
3. **Automate validation** — prepublishOnly hooks save you from yourself
4. **Version thoughtfully** — breaking changes are a big deal
5. **Document like a user** — quick start first, details later
6. **Test the published package** — not just the source

The npm ecosystem has its problems, but it's also incredibly powerful. A well-maintained package can help thousands of developers. That's worth getting right.

---

*What publishing lessons have you learned the hard way? I'm always looking to improve my workflow.*
