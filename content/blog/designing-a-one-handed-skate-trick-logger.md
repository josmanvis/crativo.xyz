---
title: "Design Exercise: A Skate Trick Logger You Can Use With One Hand"
excerpt: "You're at the park, board under one foot, phone in the other hand, and you just landed it. You have about five seconds before you forget the details. Let's design an app for that moment."
category: thoughts
publishedAt: "2026-07-22"
tags:
  - skateboarding
  - ui-design
  - mobile
featured: false
---

Here's a fun design exercise I keep coming back to: a **trick logger for skaters**. You're at the park, you finally land a trick, and you want to record it, how many tries it took, and maybe a clip.

Sounds like a basic CRUD app. It isn't. The context is brutal, and context is where good design comes from.

## The context

Let's be honest about the user:

- **One hand.** The other one is holding the board, or a water bottle, or it's bleeding a little.
- **Bright sun.** Skateparks rarely have shade.
- **Sweaty, maybe gloved, definitely impatient.**
- **Seconds of attention.** You want to get back to skating.
- **Possibly no signal.** Lots of parks are in places where your phone shows one bar of hope.

If the app needs two hands, a precise tap or good lighting, it'll be used once and deleted.

## Principle 1: the main action is one tap, in thumb reach

The core action is "I landed it." That button goes **at the bottom of the screen**, big, in the thumb's natural zone. Not top-right. Not in a menu.

Tap it and the trick is logged with a timestamp. Everything else is optional.

## Principle 2: pick, don't type

Typing "backside 180 nosegrind" on a phone, one-handed, in the sun, is torture. So:

- **Recent tricks** at the top, so the one you're working on is one tap away.
- **Building blocks** instead of free text: stance → direction → rotation → trick. Each step is a short list of big buttons.
- **Favorites** for the handful of tricks you're actually practicing this month.

Ninety percent of logs should never touch a keyboard.

## Principle 3: count tries without looking

The interesting stat isn't just "landed." It's **how many tries it took**, and how that drops over time. That's the progress curve.

But you can't stop to tap a counter after every slam. So make the try counter something you can hit **without looking**: a huge area of the screen, or even a hardware button. Every tap is one try, with a quick haptic tick to confirm. The "landed" button closes out the session.

## Principle 4: built for the sun

- **High-contrast, bold UI.** Dark text on light, or the other way around, but strong. Soft grays disappear in direct sunlight.
- **Big type.** You're looking at it at arm's length while squinting.
- **No meaning carried by color alone.** Color is the first thing to wash out.

## Principle 5: offline first

The app should **never** wait for the network to log a trick. Save locally, instantly, and sync later when there's signal. A spinner at the skatepark is a lost log.

## Principle 6: clips without the hassle

Video is half the fun of skating. The ideal flow:

1. Your friend films the attempt.
2. You tap "landed."
3. The app suggests attaching **the most recent clip in your camera roll**, trimmed around the moment you logged it.

One tap to attach. No scrubbing through a 4-minute video in the sun.

## The screen, sketched

```
┌─────────────────────────────┐
│  KICKFLIP · 38 tries today  │  ← current trick, glanceable
│                             │
│   last landed: 2 days ago   │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │      + TRY  (tap)     │  │  ← giant, no-look target
│  │                       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │     ✓ LANDED IT       │  │  ← the main action, thumb zone
│  └───────────────────────┘  │
└─────────────────────────────┘
```

Two buttons, both huge, both at the bottom. Everything else is a glance.

## Why this exercise is useful

This app doesn't exist (yet). But designing for an extreme context sharpens the habits that make every app better: one primary action, thumb-first layout, picking over typing, offline by default, and legibility in bad conditions.

Most of our users aren't at a skatepark. But they're on a bus, holding a coffee, in bright light, with one bar of signal, more often than our design tools would like to admit.
