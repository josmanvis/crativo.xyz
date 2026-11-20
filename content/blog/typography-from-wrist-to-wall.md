---
title: "Typography From Wrist to Wall: Sizing Text for Watch, Phone, Desktop and TV"
excerpt: "16px is a great body size until your 'screen' is three meters away or two centimeters wide. The real unit of type isn't pixels. It's how big the text looks to an eyeball."
category: deep-dives
publishedAt: "2026-07-01"
tags:
  - typography
  - css
  - tv
  - watch
featured: false
---

Here's a question that sounds simple: **how big should body text be?**

On the web, the default answer is 16px and everyone moves on. But I build interfaces for screens that range from a watch on your wrist to a TV across the living room, and on those, "16px" is either enormous or invisible.

The trick is to stop thinking in pixels and start thinking about **how big the text appears to the person reading it**.

## Size is about distance, not pixels

Text that's 1 cm tall looks huge from 30 cm away and tiny from three meters. What your eye actually cares about is the **angle** the text takes up in your field of view, which depends on both its physical size and how far away you are.

That's why a TV needs physically gigantic text and a watch can get away with small text: you hold a watch close and sit far from a TV.

Rough reading distances:

| Screen | Typical distance |
|---|---|
| Watch | ~30 cm (raised wrist) |
| Phone | ~30–40 cm |
| Laptop / desktop | ~50–70 cm |
| TV | ~2–3 m |

The TV is five to ten times farther away than the phone. Its text needs to be dramatically larger to look the same.

## Per-platform starting points

These are the defaults I start from, which you should test on real hardware:

- **Watch:** short labels, very large primary numbers, very few words. Every character has to earn its place.
- **Phone:** around 16–17px body, which most platform defaults are built around.
- **Desktop web:** 16–18px body, with comfortable line length (roughly 60–75 characters).
- **TV:** much bigger body text and headings, short lines, generous spacing. Design as if you're making a poster, not a page.

## The web side: fluid type with `clamp()`

For the range of web screens, fluid type that scales with the viewport works well, with sensible floors and ceilings:

```css
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);  /* body */
  --step-2: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);  /* h2 */
  --step-4: clamp(2.25rem, 1.5rem + 4vw, 5rem);      /* display */
}

body { font-size: var(--step-0); }
h2   { font-size: var(--step-2); }
```

Text grows smoothly from phone to desktop, but never goes below a readable minimum or balloons past a sane maximum.

One important thing: use **`rem`** for the floor, not `px`. Users who bump up their browser's default font size should get bigger text. Pixel-locked minimums quietly ignore their choice.

## TV is a different scale, not a bigger breakpoint

Don't treat TV as "desktop, but wider." Its viewport might be a familiar resolution, but the viewer is three meters away. If you run a TV web app through desktop breakpoints, you get desktop-sized text on a living-room wall: technically responsive, practically unreadable.

Give TV its own type scale with a much larger base, and pick it by **platform**, not by width.

## Things that matter more than size

**Weight.** Thin fonts disappear at a distance and on small screens. Regular and medium weights survive. Ultra-light hero text is a desktop-only luxury.

**Contrast.** Small or distant text needs *more* contrast, not less. A low-contrast gray that's fine on a calibrated monitor will vanish on a TV in a bright room.

**Line length.** Long lines are tiring everywhere, and on a TV, from the couch, they're nearly impossible. Shorter lines, fewer words.

**Numbers.** On every platform, give live-updating numbers `font-variant-numeric: tabular-nums` so they don't jitter.

## The simple test

For every platform, put the actual device at the actual distance and read your UI. Phone in hand. Watch on wrist. TV across the room, sitting on the couch.

If you have to lean in, it's too small. Your design tool can't tell you that. Only the couch can.
