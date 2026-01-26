---
title: "CSS Scroll-State Queries: Delete Your IntersectionObserver"
excerpt: Chrome 133 just dropped scroll-state queries. Sticky detection, scroll snapping feedback, overflow indicators—all pure CSS now.
category: deep-dives
publishedAt: 2026-01-26
tags:
  - CSS
  - Performance
  - Web Development
  - Chrome
coverImage: /blog/css-scroll-state-queries.svg
featured: false
---

# CSS Scroll-State Queries: Delete Your IntersectionObserver

You know what I'm tired of? Writing JavaScript to answer simple questions about scrolling.

"Is this sticky header currently stuck?" IntersectionObserver.
"Which carousel slide is snapped right now?" Scroll event listener + math.
"Can this container even scroll?" ResizeObserver + overflow detection.

It's 2026 and we've been writing the same boilerplate for years. I have at least three utility hooks in my codebase that exist solely to track scroll state. They work fine. They also shouldn't exist.

Chrome 133 shipped scroll-state queries last week, and they're about to obsolete a lot of JavaScript. Let me show you what I mean.

## What Are Scroll-State Queries?

They're container queries, but for scroll state. Three types:

1. **Stuck** - Is a sticky element currently stuck to an edge?
2. **Snapped** - Is a scroll-snap element currently snapped?
3. **Scrollable** - Does this container have overflow?

```css
@container scroll-state(stuck: top) { /* stuck to top edge */ }
@container scroll-state(snapped: x) { /* horizontally snapped */ }
@container scroll-state(scrollable: top) { /* can scroll up */ }
```

If you've used container queries, you already know the syntax. Same mental model, new superpowers.

## The Sticky Header Problem (Solved)

Every app I've built has a sticky header that needs a shadow when it's actually stuck. Here's how we've been doing it:

```tsx
// The old way - useIsStuck.ts
function useIsStuck(ref: RefObject<HTMLElement>) {
  const [isStuck, setIsStuck] = useState(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return isStuck;
}
```

Then you conditionally apply classes based on that state. It works, but it's a lot of ceremony for answering "is this thing stuck?"

Here's the CSS-only version:

```css
.sticky-header {
  container-type: scroll-state;
  position: sticky;
  top: 0;
}

.sticky-header > nav {
  transition: box-shadow 0.2s ease;
  
  @container scroll-state(stuck: top) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
```

That's it. No JavaScript. No hooks. No state management. The browser tracks it for you.

The one gotcha: you can't query the container itself—you have to query a child element. That's why the `nav` is nested inside `.sticky-header`. Small price to pay.

## Scroll Snap Feedback Without JavaScript

I built a testimonial carousel last month. Center-snapped, mandatory snapping, the whole deal. The design called for dimming non-active slides. Here's the JavaScript I wrote:

```tsx
// Track which slide is snapped (the old way)
const [activeIndex, setActiveIndex] = useState(0);

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  
  const handleScroll = () => {
    const slides = container.querySelectorAll('.slide');
    const containerCenter = container.scrollLeft + container.offsetWidth / 2;
    
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(containerCenter - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });
    
    setActiveIndex(closestIndex);
  };
  
  container.addEventListener('scroll', handleScroll);
  return () => container.removeEventListener('scroll', handleScroll);
}, []);
```

Calculating centerpoints, comparing distances, tracking indices. For what? To change opacity.

Here's the CSS:

```css
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
}

.slide {
  container-type: scroll-state;
  scroll-snap-align: center;
}

.slide > .content {
  transition: opacity 0.3s ease;
  opacity: 0.3;
  
  @container scroll-state(snapped: x) {
    opacity: 1;
  }
}
```

No state. No event listeners. No math. The browser knows which element is snapped—now it tells CSS directly.

## Detecting Scrollable Overflow

This one's subtle but powerful. Ever built a scrollable container that should only show scroll indicators when there's actually content to scroll to?

```css
.scroll-container {
  container-type: scroll-state;
  overflow-y: auto;
  max-height: 400px;
}

/* Show fade at bottom when you can scroll down */
.scroll-container::after {
  content: '';
  position: sticky;
  bottom: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--bg-color));
  opacity: 0;
  pointer-events: none;
  
  @container scroll-state(scrollable: bottom) {
    opacity: 1;
  }
}
```

The fade indicator only appears when there's content below the fold. Scroll to the bottom, it disappears. No JavaScript measuring scroll position or comparing scrollHeight to clientHeight.

## Progressive Enhancement

This is Chrome 133+ only right now. Firefox and Safari are working on it, but we're not there yet. Here's how to ship this today:

```css
.sticky-header {
  container-type: scroll-state;
  position: sticky;
  top: 0;
}

.sticky-header > nav {
  /* Fallback: always show shadow */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  @supports (container-type: scroll-state) {
    /* Enhanced: only show when stuck */
    box-shadow: none;
    transition: box-shadow 0.2s ease;
    
    @container scroll-state(stuck: top) {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}
```

Browsers that don't support it get a permanent shadow. Browsers that do get the enhanced behavior. Ship it.

## When to Use This vs. Scroll-Driven Animations

I wrote about [scroll-driven animations](/blog/css-scroll-driven-animations-no-js) recently, and you might wonder: when do I use which?

**Scroll-driven animations** tie animation progress to scroll position. Great for:
- Progress bars that fill as you scroll
- Parallax effects
- Elements that animate in as they enter the viewport

**Scroll-state queries** are binary triggers based on state. Great for:
- Styling changes when sticky elements stick
- Highlighting the active carousel slide
- Showing/hiding scroll affordances

Think of it this way: scroll-driven animations are continuous (0% → 100%), scroll-state queries are discrete (stuck or not stuck).

Sometimes they overlap. You could use `scroll-state(snapped: x)` to trigger an entrance animation, or use `animation-timeline: view()` to fade in carousel slides. Pick whichever feels more natural for your use case.

## The Full Syntax

Here's everything you can query:

```css
/* Stuck queries - for sticky elements */
@container scroll-state(stuck: top) {}
@container scroll-state(stuck: bottom) {}
@container scroll-state(stuck: left) {}
@container scroll-state(stuck: right) {}
@container scroll-state(stuck: block-start) {}
@container scroll-state(stuck: block-end) {}
@container scroll-state(stuck: inline-start) {}
@container scroll-state(stuck: inline-end) {}

/* Snapped queries - for scroll-snap elements */
@container scroll-state(snapped: x) {}
@container scroll-state(snapped: y) {}
@container scroll-state(snapped: inline) {}
@container scroll-state(snapped: block) {}

/* Scrollable queries - for overflow containers */
@container scroll-state(scrollable: top) {}
@container scroll-state(scrollable: bottom) {}
@container scroll-state(scrollable: left) {}
@container scroll-state(scrollable: right) {}
```

Logical properties work too, so `block-start`/`block-end` handle writing modes automatically.

## What I'm Deleting From My Codebase

Here's the JavaScript I'm removing:

1. **useIsSticky** - Gone. `scroll-state(stuck: top)` handles it.
2. **useActiveSnapIndex** - Gone. `scroll-state(snapped: x)` handles it.
3. **useCanScroll** - Gone. `scroll-state(scrollable: *)` handles it.
4. Half my IntersectionObserver usage - Not all of it, but a lot was just sticky detection with extra steps.

I'm keeping IntersectionObserver for actual intersection stuff (lazy loading, infinite scroll triggers, analytics). But for pure scroll-state detection? CSS handles it now.

## The Bigger Picture

What I love about scroll-state queries is they follow the same pattern as container queries. Learn one, you know the other. CSS is building a coherent system for responding to context:

- **Media queries** → viewport state
- **Container queries** → parent size state  
- **Style queries** → custom property state
- **Scroll-state queries** → scroll state

Each one moves logic from JavaScript into CSS, where the browser can optimize it. Scroll-state queries run on the compositor thread—they're faster than any JavaScript equivalent.

Browser support will catch up. It always does. And when it does, we'll look back at all that IntersectionObserver code the same way we look at jQuery today: necessary for its time, obsolete now.

For now, progressive enhancement works. The fallback is fine. The enhanced experience is better. Ship it.
