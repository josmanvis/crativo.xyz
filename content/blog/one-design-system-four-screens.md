---
title: "One Design System, Four Screens: From Your Wrist to Your Wall"
excerpt: "Watch, phone, web and TV. Same brand, wildly different screens and wildly different inputs. 'Just make it responsive' covers maybe a third of the problem."
category: deep-dives
publishedAt: "2026-03-25"
tags:
  - design-systems
  - ui-design
  - tv
  - watch
featured: false
---

I've built interfaces for watches, phones, websites and TVs. The question that comes up on every multi-platform project is the same: **can we share one design system across all of them?**

The honest answer is "yes, but not the way you think." Responsive design handles screen *size*. The real differences between these four screens are **distance** and **input**, and no breakpoint fixes those.

## The four screens, honestly

| | Watch | Phone | Web | TV |
|---|---|---|---|---|
| **Distance** | arm's length | hand | desk | across the room |
| **Session** | ~2 seconds | minutes | minutes to hours | lean-back hours |
| **Input** | crown + tiny taps | thumbs | pointer + keyboard | D-pad + Back |
| **Density** | one fact | a few things | lots | a few, very big |

Look at the input row. Hover only exists on one of the four. Precise pointing only exists on one. Text entry is pleasant on maybe one and a half. A "button" component that assumes hover and a precise click is quietly wrong on three of the four screens.

## What you *can* share

**Color tokens.** Your brand palette, semantic colors (success, warning, danger) and the meaning behind them should be identical everywhere. Red means "stop" on the wrist and on the wall.

**Type *ratios*, not type sizes.** Share the relationships, like "a title is 1.5× the body text," and let each platform pick its base size. A TV's body text is huge next to a phone's, but the hierarchy should feel the same.

**Spacing scale.** Same steps (4, 8, 16, 24…), multiplied per platform. TVs need far more room around things so the focus state can grow without colliding.

**Iconography and voice.** Same icon set, same tone of writing, same names for things. If it's called "Library" on the phone, it shouldn't be "Collection" on the TV.

**Motion personality.** How things ease in and out should feel like the same product, even if the durations differ.

## What you *can't* share

**Component behavior.** A "card" on the web is a clickable box with a hover state. On TV it's a focus target that scales up. On a watch it might not exist at all. Share the *name* and the *visual DNA*, but give each platform its own implementation.

**Information density.** Shoving the web dashboard onto a TV doesn't work, and neither does shrinking the phone app onto a watch. Each screen needs its own decision about **what matters most**.

**Navigation.** Tabs on mobile, a sidebar on web, rows of shelves on TV, a single vertical list on the watch. Same destinations, completely different ways of getting there.

## A token setup that works

```json
{
  "color": {
    "accent": "#ff4a1c",
    "danger": "#c2340b"
  },
  "type": { "ratio": 1.25 },
  "space": { "unit": 4 },
  "platform": {
    "watch": { "baseFont": 16, "spaceScale": 1 },
    "phone": { "baseFont": 17, "spaceScale": 1 },
    "web":   { "baseFont": 17, "spaceScale": 1.25 },
    "tv":    { "baseFont": 28, "spaceScale": 2.5 }
  }
}
```

Shared meaning at the top, per-platform multipliers at the bottom. Each platform's build generates its own concrete values: CSS custom properties, Swift constants, Kotlin resources. Change the accent once and every screen updates. Change TV spacing and nothing else moves.

## The trap: designing on the biggest screen first

Most teams design for the web on a big monitor, then "adapt" down. That produces watch apps that are tiny web pages and TV apps that are giant web pages.

Try the opposite exercise: **design the watch version first**. It forces you to decide what the single most important thing is. Then each bigger screen gets to *add* things in a deliberate order, instead of the smaller ones having to *lose* things in a panic.

## The point

A design system across four screens isn't one set of components. It's **one set of decisions**: shared meaning, shared feel, shared language, implemented four different ways.

Same band, four venues. The setlist changes. The sound shouldn't.
