---
title: "Spatial Navigation: Making a Web App Work With a TV Remote"
excerpt: "Tab order is a line. A TV screen is a grid. Here's how to make arrow keys move focus to the thing that's actually to the right, in about 60 lines of TypeScript."
category: tutorials
publishedAt: "2026-01-14"
tags:
  - tv
  - javascript
  - accessibility
  - focus-management
featured: false
---

Last week was the theory of the 10-foot UI. This week, let's write code, because "make it work with a remote" sounds easy right up until you try it.

The browser gives you **Tab** and **Shift+Tab**, which walk through focusable elements in DOM order. That's a straight line. But a TV screen is a **grid** of rows and cards, and when the user presses → they expect focus to go to whatever is visually *to the right*, not whatever happens to come next in the HTML.

That's called **spatial navigation**, and you can build a decent version yourself.

## The idea

When an arrow key is pressed:

1. Get the rectangle of the currently focused element.
2. Look at every other focusable element.
3. Keep only the ones that are actually in the pressed direction.
4. Pick the closest one, favoring things that line up on the same row or column.
5. Focus it.

That's it. The magic is all in step 4.

## The code

```typescript
type Dir = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

const FOCUSABLE = '[data-focusable]';

function center(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function score(from: DOMRect, to: DOMRect, dir: Dir): number | null {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  // Primary axis distance must point the right way.
  const primary =
    dir === 'ArrowRight' ? dx : dir === 'ArrowLeft' ? -dx : dir === 'ArrowDown' ? dy : -dy;
  if (primary <= 0) return null;

  // Sideways drift is punished hard, so we prefer staying on the same row/column.
  const drift = dir === 'ArrowLeft' || dir === 'ArrowRight' ? Math.abs(dy) : Math.abs(dx);
  return primary + drift * 3;
}

export function moveFocus(dir: Dir) {
  const current = document.activeElement as HTMLElement | null;
  if (!current?.matches(FOCUSABLE)) {
    document.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return;
  }
  const from = current.getBoundingClientRect();
  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (el === current) continue;
    const s = score(from, el.getBoundingClientRect(), dir);
    if (s !== null && s < bestScore) {
      bestScore = s;
      best = el;
    }
  }
  best?.focus();
  best?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

window.addEventListener('keydown', (e) => {
  if (e.key.startsWith('Arrow')) {
    e.preventDefault(); // stop the page from scrolling instead
    moveFocus(e.key as Dir);
  }
});
```

Mark your cards with `data-focusable` and `tabindex="0"` and you have working remote navigation.

## Why the "drift × 3" matters

Without that multiplier, pressing → on the last card of a row might jump *down and to the right* to a card on the next row, because it's technically closer. Users find this deeply upsetting. Punishing sideways drift keeps focus on the row you're on, which is what everyone expects.

Tune that number. On layouts with lots of uneven card sizes, you might want it even higher.

## The things that'll bite you

**Remember where you were.** If the user scrolls down to row 4 and comes back up, focus should land on the card they last had in row 1, not the first card. Store the last-focused element per row and restore it.

**Edges need a decision.** What happens when you press ← on the first card? Nothing? Wrap around? Open a side menu? All are valid. Pick one and be consistent.

**Scroll the focused thing into view.** A focused card hiding offscreen is a lost user. The `scrollIntoView` call above handles the basic case.

**Don't trap focus in hidden things.** Off-canvas menus and closed modals must not contain focusable elements, or the algorithm will happily jump into something invisible. The `inert` attribute is your friend.

## The platform way

There have been proposals to make spatial navigation a native browser feature, and TV platforms often provide their own focus engines. If yours does, use it. But understanding the scoring above makes debugging those engines dramatically less mysterious, because they're all doing some version of "find the nearest thing in that direction."

Next week: the focus state itself, which on TV is the most important pixel on the screen.
