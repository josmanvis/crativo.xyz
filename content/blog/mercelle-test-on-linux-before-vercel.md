---
title: "mercelle: Test on Linux Before You Ship to Vercel"
excerpt: "Your Mac is not Linux. Vercel is. Everything in between, like case-sensitive imports, native modules and the wrong CPU architecture, is where 'works on my machine' goes to die. So I put a real Linux VM in the loop."
category: devtools
publishedAt: "2026-09-30"
tags:
  - devtools
  - vercel
  - linux
  - nextjs
  - side-project
featured: false
---

Here's a classic bug that has ruined a lot of Friday deploys:

```typescript
import { Button } from './button';
```

The file is actually called `Button.tsx`. On macOS, which is case-insensitive by default, this works perfectly. You test it, it's fine, you ship it.

Vercel runs **Linux**, which is case-sensitive. Your app throws a 500 in production, and you discover it the way everyone discovers these things: from a user.

That's the whole reason I built **mercelle**: run your app in a **real Linux VM** before you ship it to Vercel.

## The gap between your Mac and production

Case sensitivity is just one member of a whole family of bugs that never reproduce on macOS:

| Bug | Why your Mac misses it |
|---|---|
| Linux-only native modules | `node_modules` were built for macOS; things like `sharp` or `bcrypt` fail in production |
| glibc vs musl issues | macOS uses a different C library than Linux |
| Case-sensitive imports | `./button` works on macOS, 500s on Linux |
| Wrong architecture | an Apple Silicon `arm64` binary vs an x64 runner |
| `VERCEL_ENV` branches | code paths that only run once deployed |

None of these are exotic. They're the most boring bugs in the world, and they only appear *after* you deploy.

## What mercelle does

```bash
npm install -g mercelle

cd your-next-app
mercelle dev
```

Then mercelle:

1. detects your framework and package manager
2. creates a Linux VM named after your project
3. installs Node, git and build tools inside it (once, then cached)
4. syncs your source into the VM
5. installs dependencies **inside the VM**, so native modules are Linux builds
6. injects the Vercel system environment variables your code branches on
7. starts your dev server and streams its output

Your app is just `http://localhost:3000`, like normal. The first run takes a few minutes to provision. After that it's cached.

## Why a VM and not a container?

A container on macOS gives you a Linux userland, but it shares a kernel and usually the filesystem with something that isn't the production environment. mercelle boots a **real virtual machine** with a real kernel, real filesystem, real permissions and a real init system, so `apt install` and native builds behave the way they will in production.

It uses **OrbStack** by default, and falls back to **Lima** on older Intel Macs that can't run OrbStack. `mercelle doctor` tells you exactly what's missing.

## Deploy-shaped, not watcher-shaped

There's also `mercelle up`, which is deliberately **not** a dev watcher. It boots the VM, syncs the source, installs dependencies, starts the app in the background, prints the URL and returns, just like a deploy would. That means a script or CI step can call it.

```bash
mercelle up       # bring it up like a deployment
mercelle logs     # watch everything it does
mercelle network  # see how your services are wired
mercelle down     # tear it down
```

## The rule I follow now

**Anything that will run on a real Vercel account gets proven on mercelle first.**

It isn't about distrusting Vercel. Vercel is doing exactly what it should: running your code on Linux. It's about distrusting *my Mac*, which has been quietly lying to me about case sensitivity and native modules for years.

The cheapest production bug is the one you find before production. A few minutes of VM boot time is a lot cheaper than a Friday evening rollback.
