---
title: "On a TV, the Focus State Is the Whole Product"
excerpt: "On the web, designers hide the focus ring like an embarrassing tattoo. On a TV it's the only way users know where they are. Let's design it like it matters."
category: thoughts
publishedAt: "2026-01-21"
tags:
  - tv
  - ui-design
  - css
  - accessibility
featured: false
---

Every web designer has at some point typed this:

```css
*:focus { outline: none; }
```

and then gone to lunch feeling great about themselves. Meanwhile every keyboard user on Earth felt a disturbance in the force.

On a TV you cannot do this. There's no mouse, so the focus state isn't a nice-to-have accessibility feature. **It's the cursor.** It's the only thing telling the user where they are. If it's subtle, the app is broken.

## What makes a good TV focus state

It has to survive brutal conditions: three meters of distance, a dark room, a blindingly bright HDR panel, and a viewer who's half-watching their phone. So it needs to be:

**Obvious at a glance.** You should find it in under a second without hunting. If you need to squint, it's too quiet.

**Different in more than one way.** Don't rely on color alone. Combine several changes: size, border, brightness, shadow. If one signal gets washed out by the TV's picture mode, the others still work.

**Stable.** The focused element shouldn't shove its neighbors around. Grow it with `transform: scale()`, which doesn't trigger layout, instead of changing its width.

**Fast.** Focus moves on every button press. If your animation takes 400 ms, the remote feels laggy and people press twice, overshooting. Keep it snappy, around 100–200 ms.

## A solid starting point

```css
.card {
  transform: scale(1);
  transition:
    transform 150ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);
  outline: 4px solid transparent;
  outline-offset: 6px;
}

.card:focus-visible {
  transform: scale(1.08);
  outline-color: #fff;
  box-shadow: 0 18px 40px rgb(0 0 0 / 0.55);
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
```

Scale, outline and shadow together. Raise `z-index` so the grown card sits above its neighbors instead of getting clipped. And notice the transition lists exact properties, never `all`, because animating everything on every keypress on a cheap TV processor is how you get a slideshow.

## The "where did it go" problem

The most common TV bug isn't an ugly focus state. It's **no** focus state, because focus landed somewhere invisible:

- on an element that's offscreen
- on something inside a closed menu
- on `<body>`, after the focused element got removed during a re-render

That last one is sneaky. Your list refreshes, React or whatever re-renders the row, the focused card is destroyed, and focus silently drops to the document. The user presses → and nothing happens. They press it again. Then they unplug the TV.

Fix it by **restoring focus deliberately** after updates: keep track of which item was focused by ID, and refocus the new element with that ID after the render.

## The lesson for the web

Here's the uncomfortable part. Everything above is also true on the web for anyone using a keyboard, a switch device or a screen magnifier. We just get away with ignoring it because most of our users have a mouse.

Building for TV is a forced lesson in respecting focus. Once you've had to make it work from the couch, `outline: none` starts to look less like a style choice and more like removing the steering wheel because it ruins the dashboard.

So style your focus states. Make them loud. Make them yours. Just don't make them invisible.
