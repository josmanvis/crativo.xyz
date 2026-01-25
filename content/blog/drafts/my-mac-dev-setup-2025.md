---
title: My Mac Dev Setup 2025
excerpt: The tools, apps, and configs I use daily as a senior software engineer.
category: tools
publishedAt: 2025-01-30
tags:
  - Productivity
  - macOS
  - Tools
  - Developer Setup
---

# My Mac Dev Setup 2025

Every year or so, I document my dev setup. It helps me think about what's working and gives others ideas. Here's what I'm using in 2025.

## Hardware

- **MacBook Air M2** — Portable, silent, handles everything I throw at it
- **External monitor** — Whatever's available, I'm not picky
- **AirPods Pro** — For focus time and calls

## Terminal

### Warp + Oh My Zsh

I switched to Warp last year. The AI features are hit-or-miss, but the UX is genuinely better than iTerm for my workflow.

Still using Oh My Zsh with a custom plugin I wrote—**ai-stats-widget**—that tracks my Claude/Qwen/Gemini usage in the prompt.

### Key CLI Tools

```bash
# Package managers
brew              # System packages
pnpm              # Fast, efficient node packages
bun               # When I want speed

# Utilities
fzf               # Fuzzy finder for everything
ripgrep           # Fast grep
bat               # Better cat
eza               # Better ls
zoxide            # Smart cd

# Development
gh                # GitHub CLI
turbo             # Monorepo builds
```

## Editor

**Cursor** is my daily driver now. It's VS Code with AI that actually helps. I still use regular VS Code for some things, but Cursor's tab completion has changed how I write code.

### Extensions I Can't Live Without

- **Tailwind CSS IntelliSense**
- **Prettier**
- **ESLint**
- **GitLens**
- **Error Lens**
- **projax** (my own extension for project management)

## Node.js Setup

I use **nvm** to manage Node versions. Currently on Node 22 for most projects.

```bash
nvm install 22
nvm alias default 22
```

For package management, pnpm everywhere. The disk space savings are real when you have 25+ projects.

## Git Config

```bash
[user]
    name = Jose Viscasillas
    email = jose@crativo.xyz

[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    lg = log --oneline --graph --decorate

[init]
    defaultBranch = main

[pull]
    rebase = true
```

## Browsers

- **Arc** — Primary browser, love the spaces feature
- **Chrome** — For DevTools and testing
- **Safari** — Battery life testing

## Design

- **Figma** — UI design, wireframes
- **Affinity Designer** — When I need vector work
- **Affinity Photo** — Image editing

## Productivity

- **Raycast** — Replaced Spotlight completely
- **Notion** — Notes and docs
- **Linear** — Project tracking (when I'm organized)
- **CleanShot X** — Screenshots and recordings
- **floatnote** — My own app for screen annotations

## AI Tools

- **Claude** — Primary AI, use it constantly
- **Cursor** — AI-powered coding
- **Clawdbot** — Claude in my terminal/Telegram

I track my AI CLI usage with my custom zsh plugin. Helps me understand how much I'm leaning on these tools.

## What Changed This Year

1. **Cursor over VS Code** — The AI features are worth it
2. **pnpm over npm** — Should have switched years ago
3. **Arc over Chrome** — Better organization, same engine
4. **Warp over iTerm** — Modern terminal finally

## The Unsexy Truth

The tools matter less than you think. I could do my job with vim and a terminal. But good tools reduce friction, and reduced friction means more time building.

Find what works for you and stop optimizing. The best setup is the one you stop thinking about.
