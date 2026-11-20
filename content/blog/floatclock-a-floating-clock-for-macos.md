---
title: "FloatClock: Sometimes You Just Want a Big Clock on Your Screen"
excerpt: "The menu bar clock is tiny and buried in the corner. FloatClock is a floating, resizable, absurdly customizable clock that sits on top of everything, and it taught me more about text layout than I expected."
category: devtools
publishedAt: "2026-11-13"
tags:
  - macos
  - swift
  - swiftui
  - side-project
featured: false
---

The macOS menu bar has a clock. It's small, it's in the corner, and when you're deep in work, or presenting, or recording, it might as well not exist.

I wanted a clock I could actually *see*: floating over everything, any size, placed wherever I want. So I built **FloatClock**, a small floating digital clock for macOS written in Swift with AppKit and SwiftUI, with no external dependencies.

## The basics

- **Drag** the digits or background to move it anywhere.
- **Drag an edge or corner** to resize it, down to as small as 120 × 44 points.
- **Hover** for pin and customize buttons.
- **Double-click, right-click or ⌘,** to customize.

It sits on top of other windows, can show on every desktop, and can switch to **click-through** mode so it never blocks what's underneath. Since a click-through window can't be clicked, a **menu bar icon** always gets you back to the settings. (Every floating window I build eventually learns this lesson.)

## The surprisingly hard part: fitting the digits

Here's a problem you don't think about until you build a resizable clock: **the text has to fill the window, whatever shape the window is.**

Make the window wide and short, and the digits need to shrink to fit the height. Make it tall and narrow, and a single line of `12:45` becomes tiny. So FloatClock **measures the digits against the actual window**, and when the window is tall enough, it automatically **stacks hours over minutes** to use the space.

That sounds simple, but it touches everything: the font, its weight, whether seconds are shown, AM/PM, padding, alignment. Every combination has to fit. That's why the project has tests for **layout bounds across window shapes, fonts, alignments and arrangements**. A clock that clips its own digits is a broken clock.

## Customization, because why not

Everything applies live and persists across launches:

- **Presets:** Minimal (transparent), Classic, Paper and Neon
- **Typefaces:** system, rounded, monospaced or serif, in five weights
- **Layout:** automatic, horizontal or stacked, with left, center or right alignment
- **Colors:** text, seconds, background, opacity, border, shadow, corner radius
- **Time:** 12 or 24 hour, optional AM/PM, seconds, date, and time-zone label
- **Time zones:** follow the system or pick any IANA zone

The Neon preset is objectively the correct choice, especially if your setup involves a DJ controller and dim lighting.

## Building it

It's a Swift package, so there's no Xcode project to wrangle:

```bash
./scripts/build-app.sh
open dist/FloatClock.app
```

And for development, `swift run FloatClock` gets you running immediately.

## Testing a clock is weirdly interesting

Time is one of the most bug-prone things in software, and a clock is nothing *but* time. So the tests cover the things that break clocks in real life: **time boundaries**, **time zones**, **settings persistence and migration**, and layout across every shape.

There's also a **smoke test** mode that exercises the actual UI: pointer hit testing, resizing, pinning, customization and recovering from click-through. It can even render **visual previews** to a folder, so you can eyeball every layout without clicking through settings by hand.

## Why build a clock in 2026?

Because small tools are where you get to sweat details. FloatClock does one thing, and that means every detail is visible: the way digits fit a window, whether numbers jitter when the seconds change, how the window behaves on every desktop.

And it means I always know exactly how late I am for the next meeting. In giant neon numbers.
