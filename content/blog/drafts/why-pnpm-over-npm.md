---
title: "Why I Use pnpm Over npm"
excerpt: "A deep dive into workspace support, speed, disk space efficiency, and why I finally made the switch from npm to pnpm for all my projects."
category: tools
publishedAt: 2026-01-27
tags:
  - Tooling
  - pnpm
  - npm
  - Node.js
coverImage: /blog/why-pnpm-over-npm.svg
featured: false
seo:
  title: "Why I Use pnpm Over npm | Package Manager Comparison"
  description: "Comparing pnpm vs npm: workspace support, speed, disk efficiency, and the reasons I switched."
  keywords: ["pnpm", "npm", "package manager", "javascript", "node.js", "monorepo", "workspaces"]
---

# Why I Use pnpm Over npm

If you've looked at my recent open-source repositories or side projects, you might have noticed a trend: `package-lock.json` is out, and `pnpm-lock.yaml` is in.

For years, I was perfectly happy with `npm`. It was the default. It came with Node.js. It got the job done. Sure, it was sometimes slow, and yes, my `node_modules` folders were taking up half my hard drive, but that was just the cost of doing business in JavaScript, right?

Wrong.

Switching to `pnpm` has been one of the highest-leverage tooling changes I've made recently. The JavaScript ecosystem has advanced significantly, and tooling needs to keep pace with the scale of modern monorepos, CI/CD pipelines, and sheer developer velocity. Here is exactly why I made the switch and why you probably should too.

## 1. The `node_modules` Black Hole

We all know the joke about `node_modules` being the heaviest object in the universe. 

If you have 10 React projects on your machine, you have 10 copies of `react`, `react-dom`, `webpack`, `babel`, and their thousands of transitive dependencies taking up space on your SSD. When I audited my machine last year, I found over 50 gigabytes of duplicated `node_modules` data across random side projects, abandoned repositories, and active workspaces.

### How pnpm Solves This

`pnpm` uses a global content-addressable store. When you run `pnpm install`, it downloads the packages to this global store on your machine (usually located at `~/.local/share/pnpm/store`). Then, inside your project's `node_modules` folder, it creates **hard links** to that global store.

If you have 100 projects using React 18.2.0, you only have *one* copy of React 18.2.0 on your disk. It doesn't matter how many times you run `pnpm install` in different directories; the package manager is smart enough to check the global store first.

The space savings are astronomical. I saved over 30GB of disk space the day I migrated my local `Developer` folder to `pnpm`. But the benefits aren't just limited to disk space—reading hard links is drastically faster than copying millions of tiny text files around your hard drive.

## 2. Speed, Sweet Speed

Because `pnpm` links from a global store rather than copying files, installing dependencies is blazingly fast.

If you create a new project and install packages you've already used in other projects, the installation time is near-zero. It just creates links. This completely changes the way you prototype. I used to dread spinning up a new project because `npx create-react-app` or `npm install` would take two minutes. Now, `pnpm install` takes literally seconds.

![npm vs pnpm node_modules structure](/blog/pnpm-node-modules-structure.svg)

In CI/CD environments, this is a massive win. While `npm` and `yarn` have improved their caching over the years, `pnpm`'s architecture is fundamentally built for speed. Less time waiting for `npm install` means faster feedback loops and lower CI bills. You can cache the global store across your GitHub Actions runs, making subsequent builds finish in record time.

## 3. Strictness is a Feature (The End of Phantom Dependencies)

Here is a dirty secret about `npm` (and `yarn` v1): their flattened `node_modules` structure allows you to require packages you never actually installed.

When you install `express`, it might depend on `debug`. With `npm`, `debug` gets hoisted to the root of your `node_modules`. This means you can `require('debug')` in your code without ever adding it to your `package.json`.

This is called a "phantom dependency", and it is a ticking time bomb. The moment `express` removes or updates its dependency on `debug`, your app breaks in production, and you have no idea why. It worked on your machine, right?

`pnpm` fixes this. Its `node_modules` structure uses symlinks to ensure that **you can only access packages explicitly declared in your `package.json`**. It forces you to be honest. It catches missing dependencies locally before they break in production.

If you try to import a package that is deeply nested in your dependency tree but not in your `package.json`, Node will throw a `MODULE_NOT_FOUND` error immediately. This strictness has saved me from shipping broken code more times than I can count.

## 4. Unrivaled Workspace Support

In the era of monorepos, workspace support is critical. Whether you're using Turborepo, Nx, or just standard NPM Workspaces, managing dependencies across multiple packages in a single repository is notoriously difficult.

`npm` workspaces have gotten better, but `pnpm`'s workspace implementation is arguably the best in the ecosystem. Managing inter-dependencies in a monorepo is seamless.

Commands like:
```bash
# Run the build script in all packages
pnpm --filter ./packages/* run build

# Run the dev script only in the frontend package and its dependencies
pnpm --filter @my-org/frontend... run dev
```

Are intuitive and fast. `pnpm` also understands your internal dependency graph and builds packages in the correct order. If package A depends on package B, `pnpm` knows to build B before A when running recursive scripts.

Furthermore, `pnpm` has incredible commands like `pnpm deploy`, which allows you to extract a single package from a monorepo into an isolated directory with all its dependencies perfectly linked. This is a game-changer for building Docker images from a monorepo.

## The Migration Cost

Switching is surprisingly easy. 

1. Install pnpm: `npm install -g pnpm` (or enable it via corepack: `corepack enable pnpm`)
2. Delete `node_modules` and `package-lock.json`
3. Run `pnpm import` to convert your lockfile (optional but recommended to keep the same dependency versions)
4. Run `pnpm install`

The only friction you might encounter is phantom dependencies. Because `pnpm` is strict, it will break your build if you were relying on packages you didn't explicitly install. But honestly, fixing those is a feature, not a bug. You'll just need to run `pnpm add <package>` for any module that throws a "Not Found" error during your build process.

## Conclusion

I am not one to jump on every new shiny tool. But `pnpm` isn't just a shiny toy; it's a fundamental architectural improvement over `npm` and `yarn`. 

It saves disk space, it installs faster, it prevents phantom dependency bugs, and it makes monorepo management a breeze. In 2026, there is very little reason to stick with `npm` for serious projects.

If you haven't tried it yet, give it a shot on your next side project. You won't look back.
