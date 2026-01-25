---
title: "Turbopack, SWC, Biome: The Rust Revolution in JS Tooling"
excerpt: JavaScript tools written in Rust are 10-100x faster. Here's what's happening and why.
category: deep-dives
publishedAt: 2025-01-20
tags:
  - Rust
  - JavaScript
  - Build Tools
  - Performance
coverImage: /blog/rust-based-js-tools.svg
featured: false
---

# Turbopack, SWC, Biome: The Rust Revolution in JS Tooling

Something weird is happening in JavaScript land. The tools we use to build JavaScript are increasingly not written in JavaScript.

Babel → SWC (Rust)
Webpack → Turbopack (Rust)
ESLint/Prettier → Biome (Rust)
npm → pnpm (Node, but native dependencies)
Terser → esbuild (Go)

The old tools work fine. But the new ones are 10-100x faster. And in 2025, that matters more than ever.

Let me break down what's actually happening and what you should use.

## Why Rust?

JavaScript is single-threaded and interpreted. No matter how clever your algorithm, there's a performance ceiling. Parsing a million lines of TypeScript in Node.js will never be as fast as parsing it in compiled, multi-threaded Rust.

Here's a real benchmark from the SWC team:

| Tool | Transform 10,000 files |
|------|----------------------|
| Babel | 14.2s |
| SWC | 0.4s |

That's 35x faster. Not 35% faster. 35 *times* faster.

Why Rust specifically (vs. Go, C++, etc.)?
- Memory safety without garbage collection
- Fearless concurrency (parallel parsing is safe)
- Great ecosystem for parsing (nom, logos)
- WASM compilation for browser use

Go is also popular (esbuild, Hugo). The common thread is "not JavaScript."

## SWC: The Babel Replacement

SWC (Speedy Web Compiler) is a Rust-based JavaScript/TypeScript compiler. It does what Babel does—transforms modern JS to older JS, handles JSX, TypeScript stripping—but faster.

**Installation:**
```bash
npm install -D @swc/core @swc/cli
```

**Basic usage:**
```bash
npx swc src -d dist
```

**Configuration (.swcrc):**
```json
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true
    },
    "target": "es2020",
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    }
  }
}
```

**Why switch from Babel?**

If you're using Next.js 12+, you're already using SWC. The framework switched quietly, and most people didn't notice (except that builds got faster).

For custom setups, the migration is straightforward because SWC supports most Babel plugins natively. The ones it doesn't support are usually obscure.

**What SWC doesn't do:**
- Type checking (use `tsc` for that)
- Some exotic Babel plugins (macro transforms, etc.)

## Turbopack: The Webpack Replacement (Eventually)

Turbopack is Vercel's Rust-based bundler, designed as a Webpack successor. It's integrated into Next.js 14+ as an opt-in dev server.

**Enable in Next.js:**
```bash
next dev --turbo
```

**The promise:**
- 700x faster than Webpack for large apps
- Instant hot module replacement
- Incremental compilation that scales

**The reality (2025):**
Turbopack is production-ready for development. It's incredibly fast. But production builds still use Webpack in Next.js. The full replacement is coming but isn't here yet.

For dev servers, it's a no-brainer. Enable `--turbo` and enjoy sub-second HMR. For production, you're still on Webpack (which is fine—it's battle-tested).

**Beyond Next.js:**
Turbopack isn't standalone yet. You can't just `npm install turbopack` and use it like Vite. It's deeply integrated with Next.js. If you want Rust-speed in a standalone bundler today, look at esbuild or Rolldown.

## Biome: Formatting and Linting, Unified

Biome (formerly Rome) is a Rust-based formatter and linter. It replaces both Prettier and ESLint with a single tool.

**Installation:**
```bash
npm install -D @biomejs/biome
npx biome init
```

**Configuration (biome.json):**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

**Usage:**
```bash
# Format files
npx biome format --write src

# Lint files
npx biome lint src

# Both at once
npx biome check --apply src
```

**Speed comparison:**
```
Prettier: 3.2s (formatting 1000 files)
Biome: 0.08s

ESLint: 8.7s (linting 1000 files)
Biome: 0.15s
```

That's not a typo. Biome is ~40-50x faster.

**Should you switch?**

Biome is ready for production. I use it in new projects. The formatting is Prettier-compatible (some edge cases differ). The linting covers most common ESLint rules.

Caveats:
- Fewer lint rules than ESLint ecosystem
- No plugin system yet (coming)
- CSS/HTML linting is newer

For JS/TS projects, it's excellent. The speed improvement transforms your developer experience—formatting and linting become instant.

## The Practical Migration Path

You don't have to switch everything at once. Here's a sensible order:

### Phase 1: Formatter (Low Risk)

Replace Prettier with Biome. Formatting is deterministic—either the output looks good or it doesn't. Easy to validate.

```bash
npm uninstall prettier
npm install -D @biomejs/biome
npx biome init
npx biome format --write .
```

Verify the output looks right. Update your pre-commit hooks. Done.

### Phase 2: Transpilation (Medium Risk)

If you're using Babel, try SWC. If you're on Next.js, you already have SWC.

For custom setups:
```bash
npm uninstall @babel/core @babel/preset-env @babel/preset-react
npm install -D @swc/core
```

Create `.swcrc`, update your build scripts. Most Babel configs translate directly.

### Phase 3: Linting (Higher Risk)

ESLint has a massive ecosystem. Plugin for React hooks, accessibility, import sorting, testing, etc. Biome doesn't cover all of them.

Options:
1. **Full switch:** If Biome's rules cover your needs, drop ESLint entirely
2. **Hybrid:** Use Biome for formatting, keep ESLint for specialized rules
3. **Wait:** The Biome team is adding rules constantly

I'm currently hybrid—Biome for formatting, ESLint for a few React-specific rules I need.

### Phase 4: Bundler (When Ready)

For Next.js: enable Turbopack for dev (`--turbo`).

For other projects: Vite is still the practical choice. It uses esbuild for dev and Rollup for production. Not pure Rust, but fast enough for most apps.

Rolldown (Rust port of Rollup) is in development. When it's ready, Vite will use it, and you'll get the speed boost automatically.

## What This Means for JavaScript Developers

You don't need to learn Rust to benefit from these tools. They're drop-in replacements with the same input (your code) and output (transformed code, lint errors, etc.).

But understanding *why* they're faster helps you make informed decisions:

1. **Parallelism is safe in Rust.** These tools parse and process files concurrently. Babel/ESLint in Node.js can't safely do that.

2. **No JIT warmup.** V8 needs time to optimize hot code paths. Rust is compiled—fast from the first microsecond.

3. **Memory efficiency.** Rust has fine-grained control over allocations. JavaScript generates garbage constantly.

The trend is clear: JavaScript will continue to be the language we write, but the tools that process it will increasingly be Rust (or Go, or other systems languages).

This is good. Build times going from 30 seconds to 3 seconds isn't a nice-to-have—it changes how you work. You iterate faster. You commit smaller changes. You catch errors sooner.

The JavaScript ecosystem is getting faster. Take advantage of it.

---

*The SWC and Biome documentation are both excellent. Start there if you're curious.*
