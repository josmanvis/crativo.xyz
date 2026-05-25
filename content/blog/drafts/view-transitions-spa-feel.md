---
title: "View Transitions API: SPA Feel Without the Framework"
date: "2026-05-25"
description: "Stop building massive single-page applications just for page transitions. The View Transitions API brings native, buttery-smooth routing to multi-page apps."
tags: ["CSS", "Web APIs", "Performance"]
image: "/blog/view-transitions-spa-feel.svg"
---

For years, developers have reached for heavy JavaScript frameworks (React, Vue, Svelte) to build Single Page Applications (SPAs). Why? Often, it wasn't for complex state management. It was simply to avoid the jarring "white flash" of a full page reload. We wanted smooth, animated transitions between pages.

We traded simplicity, SEO, and fast time-to-interactive for a neat fading animation.

The View Transitions API fixes this. It brings native, buttery-smooth page transitions to standard Multi-Page Applications (MPAs). No heavy router, no client-side rendering. Just pure CSS and a tiny bit of JavaScript.

## The Problem: The Hard Way

In the old days of SPAs, if you wanted a list of items to smoothly transition into a detail page, you had to:
1. Hijack the browser's native routing.
2. Intercept the link click.
3. Fetch the new data asynchronously.
4. Mount the new component while the old one was still in the DOM.
5. Use a library like Framer Motion or React Transition Group to orchestrate the handoff.
6. Clean up the old DOM nodes.

It was an architectural nightmare for a purely aesthetic feature.

## The Solution: Native View Transitions

The View Transitions API lets the browser do the heavy lifting. When navigating, the browser takes a snapshot of the current DOM, takes a snapshot of the new DOM, and automatically animates between them.

Here's how simple it is to use the API for a cross-document navigation (MPA):

```html
<!-- In your HTML head -->
<meta name="view-transition" content="same-origin">
```

That's literally it for a basic fade transition. The browser will fade the old page out and fade the new page in. 

![View Transition Snapshot Process](/blog/view-transitions-spa-feel-inline.svg)

## Customizing the Magic

Fading is cool, but what if we want to animate a specific element—say, a hero image—from the list view to the detail view? We want it to smoothly grow and move into its new position.

We use the `view-transition-name` CSS property.

On the list page:

```css
.card-image-123 {
  view-transition-name: hero-image;
}
```

On the detail page:

```css
.detail-hero-image {
  view-transition-name: hero-image;
}
```

When the navigation happens, the browser sees the same `view-transition-name` on both pages. It figures out the size and position difference and automatically morphs the element between the two states.

*Important:* The `view-transition-name` must be unique on the page at any given time.

## Controlling the Animation

By default, the browser handles the sizing and positioning animation, while the contents cross-fade. You can target the pseudo-elements created by the API to customize the duration, easing, or entirely change the animation.

```css
::view-transition-old(hero-image),
::view-transition-new(hero-image) {
  /* Prevent the default cross-fade */
  animation: none;
  /* Make the morphing animation slower and smoother */
  mix-blend-mode: normal;
}

::view-transition-group(hero-image) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
}
```

## Progressive Enhancement

The beauty of the View Transitions API is that it's the ultimate progressive enhancement. If a browser doesn't support it, the user just gets a standard, fast page load. Nothing breaks.

You no longer need to ship 200kb of JavaScript to get an app-like feel. You can build a standard MPA with HTML and CSS, add a meta tag, sprinkle in some `view-transition-name` properties, and get a world-class experience.

Stop over-engineering. Embrace the platform.
