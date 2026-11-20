---
title: "Your TV Is a Potato: Performance for Web Apps on Living-Room Hardware"
excerpt: "That 65-inch 4K TV has the processing power of a phone from years ago, and your React app just asked it to animate box-shadows on 200 cards. Here's how to keep TV apps smooth."
category: deep-dives
publishedAt: "2026-08-05"
tags:
  - tv
  - performance
  - css
  - javascript
featured: false
---

Here's a fact that surprises a lot of web developers: the TV in your living room, the one with the gorgeous 4K panel that cost more than your laptop, often has a **pretty modest processor** running its apps. The money went into the screen, not the chip.

So when you build a TV web app on a fast laptop, it feels great. Then you load it on the actual TV and every focus change stutters like it's buffering. Welcome to TV performance.

## The budget is tiny, so spend it on focus

On TV, the single most important interaction is **moving focus**. Every press of the D-pad must respond instantly. If focus lags, users press again, overshoot, and decide your app is broken.

So the performance budget has one priority: **arrow key → visible focus change, immediately.** Everything else can wait.

## Rule 1: animate only transform and opacity

These two properties can usually be handled by the compositor without recalculating layout or repainting the page. Almost everything else can trigger expensive work on every frame.

```css
/* good: compositor-friendly */
.card:focus { transform: scale(1.08); }

/* bad: layout or paint on every frame */
.card:focus { width: 320px; margin: -10px; }
```

That includes `box-shadow` animations, which look harmless and can be surprisingly expensive to repaint. A common trick: put the shadow on a pseudo-element and fade its **opacity** instead.

```css
.card { position: relative; }
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.5);
  opacity: 0;
  transition: opacity 150ms;
}
.card:focus::after { opacity: 1; }
```

## Rule 2: render less DOM

A home screen with 20 rows of 30 cards is 600 cards, each with images, text and nested wrappers. Weak TV hardware chokes on that.

- **Virtualize rows**: only render the rows near the viewport, and only the cards near the visible part of each row.
- **Flatten your markup.** Every extra wrapper `div` costs something. On TV, it adds up.
- **Avoid giant re-renders** when focus moves. Moving focus between two cards shouldn't re-render the whole grid.

## Rule 3: images are the real weight

TV apps are image-heavy: posters, thumbnails, hero art. And decoding big images is costly on modest chips.

- Serve images **at the size they're displayed**, not a full-res original scaled down by CSS.
- Use modern compressed formats if the target platform supports them.
- **Lazy-load** offscreen rows, but preload the next couple of cards in the direction the user is moving, so focus never lands on a blank tile.

## Rule 4: watch memory, not just speed

TV apps tend to stay open for hours. Leaks that would never matter in a quick website visit pile up into crashes after a long evening of browsing.

Clean up timers and listeners when screens unmount. Don't cache every image you've ever shown. Long-session testing matters as much as first-load testing.

## Rule 5: test on the slowest target

Your laptop lies. Chrome DevTools has CPU throttling that helps you spot problems early, but nothing replaces running the app on the **cheapest device you support**, holding the real remote, scrolling through real data.

If it's smooth there, it's smooth everywhere.

## The upside

All of this is just good web performance, turned up to eleven. Compositor-friendly animation, less DOM, right-sized images and no leaks make every web app faster.

TV just removes your ability to get away with skipping them. The potato always tells the truth.
