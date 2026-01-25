---
title: Building Projax - A Developer's Project Dashboard
excerpt: How I built a cross-platform project management tool with CLI, TUI, desktop app, and VS Code extension.
category: tools
publishedAt: 2025-01-10
tags:
  - TypeScript
  - CLI
  - VS Code
  - Monorepo
  - Developer Tools
featured: false
---

# Building Projax: A Developer's Project Dashboard

My `~/Developer` folder is a mess. Twenty-five projects, half-finished ideas, experiments I forgot about. I'd spend five minutes just remembering which port a project runs on, or whether I'd committed my last changes.

I built **projax** to fix that.

## The Problem

Between my work at ON24 and all the side projects I've accumulated since my Innovation Lab days, I have a lot of code on my machine. Each project has different:

- Package managers (npm, pnpm, bun, cargo)
- Scripts and commands
- Dev server ports
- Test setups
- Git branches and uncommitted changes

I was constantly `cd`-ing around, grepping through package.json files, and forgetting which projects I hadn't touched in months.

## One Core, Many Interfaces

I wanted to access this info from everywhere—terminal, editor, menubar. So I built projax as a monorepo:

```
projax/
├── packages/
│   ├── core/          # Project detection logic
│   ├── cli/           # Command-line interface
│   ├── prxi/          # Terminal UI
│   ├── api/           # REST API
│   ├── desktop/       # Electron app
│   └── vscode-extension/
```

### The CLI

```bash
projax list              # See all projects
projax info my-app       # Get details
projax run my-app dev    # Run scripts from anywhere
projax ports             # What's using which port?
```

### The TUI

I built a terminal UI with Ink (React for the terminal). Arrow keys to navigate, enter to open, all the info at a glance.

### The VS Code Extension

Same data, right in the sidebar. Works in Cursor and Windsurf too. Click to open projects, see git status, run scripts.

## What It Detects

The core package scans directories and figures out:

```typescript
interface Project {
  name: string;
  path: string;
  packageManager: 'npm' | 'pnpm' | 'bun' | 'cargo';
  scripts: Record<string, string>;
  ports: number[];
  hasTests: boolean;
  testFramework?: string;
  lastModified: Date;
  gitBranch?: string;
  gitStatus?: 'clean' | 'dirty';
}
```

The port detection alone has saved me hours. It parses package.json scripts, checks .env files, scans vite.config and next.config—figures out what runs where.

## Lessons from Building CLI Tools

This isn't my first CLI. I built **ace** back at the Innovation Lab for bootstrapping React projects. A few things I've learned:

1. **Monorepos are worth it** — Sharing types between CLI, API, and extension saves so much time
2. **Build for yourself** — Projax solves my exact problems because I use it every day
3. **Start with the CLI** — It's the fastest to iterate on, then add GUI later

## Try It

```bash
npm install -g projax
projax scan ~/Developer
projax list
```

Or grab the VS Code extension. It's become part of my daily workflow.
