---
title: "prefers-reduced-motion Is Not a Kill Switch"
excerpt: "Some people get literally sick from your parallax hero. Respecting reduced motion doesn't mean deleting all animation. It means removing the motion that moves, and keeping the feedback that informs."
category: tutorials
publishedAt: "2026-05-06"
tags:
  - css
  - accessibility
  - animation
featured: false
---

For some people, big sweeping motion on a screen isn't just annoying. It causes real dizziness, nausea and headaches, especially for people with vestibular disorders. Your beautiful parallax scroll is, for them, a seasickness simulator.

Operating systems let users ask for less motion, and the web exposes that wish as a media query:

```css
@media (prefers-reduced-motion: reduce) {
  /* the user asked for less motion */
}
```

The most common way to "support" it is this:

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

And it's... fine. It's better than nothing. But it's also a bit like dealing with a noise complaint by cutting the power to the whole building.

## Reduced, not removed

The setting says **reduce**, not **eliminate**. The problem is *motion*: things moving across the screen, zooming, spinning, sliding a long way. Plenty of animation doesn't move anything at all.

**Usually a problem:**
- parallax and scroll-jacking
- big slides and zooms between pages
- spinning or bouncing elements
- auto-playing background video
- anything that moves a large part of the screen

**Usually fine, and often helpful:**
- opacity fades
- color changes on hover and focus
- small, quick state changes, like a checkbox ticking

A cross-fade tells the user "this changed" without asking their inner ear to do anything. Deleting it doesn't make your UI more accessible. It just makes it more abrupt.

## A better pattern: swap, don't delete

Design each animation with a reduced version:

```css
.panel {
  transition:
    transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 400ms ease;
}
.panel[data-state='closed'] {
  transform: translateY(40px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .panel { transition: opacity 150ms ease; }       /* keep the fade */
  .panel[data-state='closed'] { transform: none; } /* drop the travel */
}
```

Full-motion users get a panel that slides and fades in. Reduced-motion users get a quick fade with no movement. Both understand what happened. Nobody gets queasy.

## In JavaScript, check before you animate

If your animations live in JS, check the preference first and **listen for changes**, because users can toggle it while your page is open:

```javascript
const query = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduce = query.matches;
query.addEventListener('change', (e) => (reduce = e.matches));

function reveal(el) {
  el.animate(
    reduce
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: 'translateY(24px)' },
          { opacity: 1, transform: 'none' },
        ],
    { duration: reduce ? 150 : 600, easing: 'ease-out', fill: 'both' }
  );
}
```

## The bug nobody tests: hidden-until-animated

Here's the reduced-motion failure that actually breaks sites: content that starts invisible and only appears **when an animation runs**. Turn animations off and that content stays at `opacity: 0` forever. The user sees a blank page and assumes your site is down.

The rule: **content must be visible without animation.** Animation should *enhance* an element's arrival, never be required for it to arrive. Turn on reduced motion in your OS settings, reload your site and scroll the whole thing. You might be surprised what's missing.

## Test it in ten seconds

Every browser's dev tools can emulate `prefers-reduced-motion`. In Chromium it's under **Rendering**. Flip it on and click around. If anything vanishes, jitters or still slides across the screen, you've found your to-do list.

Motion can make interfaces delightful. It just needs a volume knob, and the user should be the one holding it.
