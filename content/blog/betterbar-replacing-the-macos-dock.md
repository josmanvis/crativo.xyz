---
title: "BetterBar: I Replaced the macOS Dock With a Brutalist Terminal Bar"
excerpt: "The Dock is a shelf of bouncing icons that hasn't fundamentally changed in decades. I wanted something denser, quieter and actually customizable. So I built my own, down to the private API the real Dock uses."
category: deep-dives
publishedAt: "2026-10-28"
tags:
  - macos
  - typescript
  - react
  - side-project
featured: false
---

The macOS Dock is iconic, literally. It's also a fairly rigid shelf of bouncing icons that takes up a lot of screen for what it does, with limited ways to make it yours.

I wanted something different: denser, calmer, more informative, and fully customizable. So I built **BetterBar**, a dock alternative with a **brutalist terminal aesthetic**: monospace, minimal, frameless.

## What it does

BetterBar is a bar along the edge of your screen that shows:

- **pinned apps**, which you can drag to reorder, rename or hide, shown as icons, icons with labels, or just labels
- **running apps** that aren't pinned, with right-click actions to focus, hide, quit, show all windows or maximize
- **window previews** when you hover (with Screen Recording permission)
- **music controls** for Spotify and Music.app
- **world clocks**, up to six time zones, with tabular numerals
- **battery status**, color-coded as it drains
- **simulator launchers** for iOS, iPadOS, Android and Windows
- **macOS Spaces**, with the active one highlighted
- **third-party extensions**

## Make it yours

The whole point was customization the Dock doesn't offer:

- **Position:** top, bottom, left or right edge
- **Thickness:** a slider from 48 to 200 px
- **Free-floating mode:** detach it from the edge and put it anywhere
- **Length:** span the edge, shrink-wrap to content, or a custom size
- **Section order:** drag any section around: pinned, running, music, clock, and more
- **Per-section toggles** so you only show what you use
- **Transparency** with backdrop blur, and a **content scale** from 0.5× to 2×

Everything is configured in a native settings window, and changes sync live to the bar. There's even settings search with ⌘F, because once you have enough options, you need a way to find them.

## Extensions without a build step

This is the part I'm proudest of. You can add your own sections to the bar as **React components**:

```
~/.betterbar/extensions/<name>/main.tsx
```

Drop a `.tsx` file there and it shows up. **No build step.** Extensions get access to the bar's CSS custom properties so they match the rest of the bar automatically.

I use this for work tools, like a branch explorer that shows branch, merge request and ticket status in its own window. That's the real power of a dock you control: it can show *your* information, not just app icons.

## Respecting screen space, the real way

A bar that floats over your windows is annoying, because maximized windows end up hidden behind it. The system Dock avoids that by **reserving screen space** so windows resize around it.

BetterBar does the same thing, using the **same private CoreGraphics API the system Dock uses**. Maximize a window and it stops at the bar's edge, just like it would with the real Dock.

That's the difference between a "dock replacement" that feels like an overlay and one that feels native.

## Why monospace

The look is intentionally stark: monospace text, hard edges, one accent color. A dock is a tool you glance at hundreds of times a day, and dense, aligned, calm information beats bouncing icons and gradients for that job.

Numbers like clocks and battery percentages use tabular figures, so nothing jitters when they update. Small detail, big difference when something sits on your screen all day.

## Install

There's a Homebrew tap for it (`homebrew-betterbar`), so installing and updating is as easy as any other brew package.

## The lesson

Some of the most satisfying projects come from replacing a tool you use every day and never questioned. The Dock is "fine." But fine is not the same as fitting how you actually work.

When the default doesn't fit, build the version that does. Even if it means reading up on private APIs to get one detail exactly right.
