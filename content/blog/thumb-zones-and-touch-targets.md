---
title: "Your Users Have Thumbs, Not Cursors: Touch Targets and Thumb Zones"
excerpt: "Designers work on 27-inch monitors with pixel-perfect mice. Users hold a phone in one hand on a moving train. One of these people is wrong about where the buttons go."
category: deep-dives
publishedAt: "2026-04-01"
tags:
  - mobile
  - ui-design
  - accessibility
featured: false
---

Here's how most mobile UIs get designed: on a giant monitor, with a mouse that can hit any pixel with surgical precision, by someone sitting perfectly still.

Here's how they get used: one-handed, on a bus, with a thumb, while also holding a coffee and trying not to fall over.

These are not the same activity, and a lot of mobile UI pain comes from forgetting that.

## Touch targets: bigger than you think

A fingertip isn't a cursor. It's a blunt, squishy, warm object that covers what it's touching. So every platform sets a minimum size for anything tappable:

- **Apple's guidelines:** about **44 × 44 points**
- **Material Design:** about **48 × 48 dp**
- **WCAG 2.2 (target size, AA):** at least **24 × 24 CSS pixels**, or enough spacing around smaller targets

Note that the WCAG number is a *floor*, not a goal. If your tap targets are hitting the bare accessibility minimum, they're still annoying to use. Aim for the platform guidelines.

The trick is that the **visual** size and the **tappable** size don't have to match. A small icon can sit inside a much bigger invisible hit area:

```css
.icon-button {
  width: 24px;
  height: 24px;
  position: relative;
}
.icon-button::after {
  content: '';
  position: absolute;
  inset: -10px; /* 44×44 hit area around a 24×24 icon */
}
```

Small and tidy to look at, big and forgiving to tap.

## Thumb zones: where hands actually reach

Hold your phone in one hand and sweep your thumb across the screen without shifting your grip. You'll notice:

- **The bottom-middle is easy.** That's home turf.
- **The top corners are a stretch**, especially the corner on the opposite side of your thumb.
- **The very bottom edge** can be awkward too, right where the system's gesture area lives.

Now look at where most apps put their most important actions: top-left back buttons and top-right menus. Right where it's hardest to reach.

That's why so many modern apps moved navigation to the bottom: **tab bars, bottom sheets, floating action buttons** in reach of the thumb. Content goes up top where you can *see* it. Controls go down low where you can *reach* them.

## Put danger out of reach

Thumb zones cut both ways. The easiest spot to hit is also the easiest spot to hit *by accident*.

So frequent, safe actions go in the comfortable zone. Destructive ones like delete, log out, or "cancel subscription" should be a bit farther away, clearly labeled, and ideally behind a confirmation or an undo.

Speaking of which: **undo beats confirmation dialogs.** "Message deleted. Undo" respects your user more than "Are you sure?" They're sure. They're always sure. Until they aren't.

## Space between targets

Two perfectly sized buttons pressed right up against each other are still a problem, because thumbs are imprecise. Leave breathing room, especially between actions with very different consequences. "Save" and "Delete" should never be neighbors without a gap.

## Test it the real way

The fastest usability test in mobile design costs nothing:

1. Put the build on a real phone. Not a simulator in a browser. A real phone.
2. Use it **one-handed**, standing up.
3. Do the five most common tasks.

Every time your grip shifts or you reach for your second hand, write it down. That list is your redesign. I promise it'll find more problems than any review on a 27-inch monitor ever will.

Thumbs first. Pixels second.
