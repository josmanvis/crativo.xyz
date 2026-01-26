---
title: "CSS Scroll-Driven Animations: Delete Your JavaScript"
excerpt: Parallax, reveal effects, progress bars - all in pure CSS now. No IntersectionObserver. No scroll listeners. No jank.
category: deep-dives
publishedAt: 2025-01-26
tags:
  - CSS
  - Animation
  - Performance
  - Web Development
coverImage: /blog/css-scroll-driven-animations.svg
featured: true
---

# CSS Scroll-Driven Animations: Delete Your JavaScript

Here's something that used to require JavaScript, a scroll event listener, requestAnimationFrame, and careful performance tuning:

```css
.reveal {
  animation: fade-in linear;
  animation-timeline: view();
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
}
```

That's it. Elements fade in as they scroll into view. No JavaScript. No IntersectionObserver. No libraries.

Scroll-driven animations landed in Chrome 115 and are now supported across all modern browsers. They're one of the most significant CSS additions in years, and they're about to make a lot of JavaScript obsolete.

## The Problem With JavaScript Scroll Animations

We've been hacking scroll-linked animations for years. The typical approach:

```javascript
// The old way - don't do this anymore
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.transform = `scaleX(${scrolled})`;
});
```

This has problems:

1. **Scroll events fire on the main thread** - If your handler is slow, scrolling stutters
2. **Browser scrolling happens on a separate thread** - Your animation is always slightly behind
3. **You're calculating positions manually** - Error-prone and verbose
4. **requestAnimationFrame overhead** - You need it for performance, but it adds complexity

The result? Jank. That slight stutter when scrolling a heavily-animated page. We've all felt it.

CSS scroll-driven animations run on the compositor thread. They're synchronized with scroll. They can't jank. The browser handles everything.

## Two Types of Scroll Timelines

There are two ways to link animations to scroll:

### 1. Scroll Progress Timeline

Tracks scroll position of a container. 0% = top, 100% = bottom.

Perfect for: progress bars, parallax backgrounds, page-wide effects.

```css
.progress-bar {
  animation: grow-bar linear;
  animation-timeline: scroll();
}

@keyframes grow-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

### 2. View Progress Timeline

Tracks an element's position as it moves through the viewport. 0% = element entering, 100% = element leaving.

Perfect for: reveal animations, fade-ins, element-specific effects.

```css
.card {
  animation: slide-in linear;
  animation-timeline: view();
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}
```

## Building a Reading Progress Indicator

Let's build something real. A progress bar that shows how far you've scrolled through an article.

```html
<body>
  <div class="progress-bar"></div>
  <article>
    <!-- Your content -->
  </article>
</body>
```

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #3b82f6;
  transform-origin: left;
  
  /* The magic */
  animation: scale-progress linear;
  animation-timeline: scroll();
}

@keyframes scale-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

That's the entire implementation. It scales from 0 to 100% as you scroll. Try to match that simplicity with JavaScript.

### Targeting a Specific Scroller

By default, `scroll()` targets the nearest scrollable ancestor. To target something specific:

```css
.progress-bar {
  animation-timeline: scroll(root);  /* Document viewport */
}

/* Or with axis */
.horizontal-indicator {
  animation-timeline: scroll(root inline);  /* Horizontal scroll */
}
```

The `scroll()` function accepts:
- **scroller**: `nearest` (default), `root`, or `self`
- **axis**: `block` (default), `inline`, `x`, or `y`

## Reveal Animations That Actually Work

Here's the reveal pattern I use everywhere now:

```css
.reveal {
  animation: reveal-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes reveal-up {
  from {
    opacity: 0;
    transform: translateY(60px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

The `animation-range` is the secret sauce. It controls when the animation plays relative to the element's visibility:

- `entry 0%` - Animation starts when element begins entering viewport
- `cover 40%` - Animation ends when element is 40% visible

### Understanding Animation Ranges

View timelines have distinct ranges:

- **cover**: Full range, from element starting to enter until it's fully left
- **entry**: Just the entering phase
- **exit**: Just the exiting phase
- **contain**: When element is fully contained within viewport
- **entry-crossing**: As element crosses the viewport edge entering
- **exit-crossing**: As element crosses the viewport edge exiting

```css
/* Only animate during entry */
.animate-on-enter {
  animation-range: entry;
}

/* Animate the whole journey */
.animate-full {
  animation-range: cover;
}

/* Animate only when fully visible */
.animate-when-visible {
  animation-range: contain;
}
```

## Parallax Without the Pain

Parallax has always been a performance nightmare. Not anymore:

```css
.parallax-bg {
  animation: parallax linear;
  animation-timeline: scroll();
}

@keyframes parallax {
  from { transform: translateY(-30%); }
  to { transform: translateY(30%); }
}
```

The background moves slower than the scroll, creating depth. Runs on the compositor. No jank possible.

For more complex parallax with multiple layers:

```css
.layer-1 {
  animation: parallax-slow linear;
  animation-timeline: scroll();
}

.layer-2 {
  animation: parallax-medium linear;
  animation-timeline: scroll();
}

.layer-3 {
  animation: parallax-fast linear;
  animation-timeline: scroll();
}

@keyframes parallax-slow {
  from { transform: translateY(-10%); }
  to { transform: translateY(10%); }
}

@keyframes parallax-medium {
  from { transform: translateY(-20%); }
  to { transform: translateY(20%); }
}

@keyframes parallax-fast {
  from { transform: translateY(-30%); }
  to { transform: translateY(30%); }
}
```

## Named Scroll Timelines

For complex layouts, you can create named timelines:

```css
.scroll-container {
  scroll-timeline-name: --main-scroll;
  scroll-timeline-axis: block;
  overflow-y: scroll;
}

.animated-child {
  animation: slide-in linear;
  animation-timeline: --main-scroll;
}
```

This is useful when:
- The scroller isn't the nearest ancestor
- Multiple elements need to sync to the same scroll
- You have nested scrollers

## Real-World Example: Horizontal Scroll Gallery

Here's a horizontal scroll gallery with a step indicator:

```html
<div class="gallery">
  <div class="gallery__track">
    <div class="gallery__item">1</div>
    <div class="gallery__item">2</div>
    <div class="gallery__item">3</div>
  </div>
  <div class="gallery__indicator"></div>
</div>
```

```css
.gallery {
  position: relative;
}

.gallery__track {
  display: flex;
  overflow-x: scroll;
  scroll-snap-type: x mandatory;
  scroll-timeline: --gallery-scroll inline;
}

.gallery__item {
  flex: 0 0 100%;
  scroll-snap-align: center;
}

.gallery__indicator {
  position: absolute;
  bottom: 10px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: rgba(255,255,255,0.3);
}

.gallery__indicator::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 33.33%;  /* 1/3 for 3 items */
  height: 100%;
  background: white;
  
  animation: slide-indicator linear;
  animation-timeline: --gallery-scroll;
}

@keyframes slide-indicator {
  from { transform: translateX(0); }
  to { transform: translateX(200%); }  /* Move 2 positions */
}
```

As you scroll horizontally through the gallery, the indicator slides to show your position.

## JavaScript API for Dynamic Control

Sometimes you need JavaScript control. The Web Animations API works with scroll timelines:

```javascript
const timeline = new ScrollTimeline({
  source: document.documentElement,
  axis: 'block'
});

element.animate(
  [
    { opacity: 0, transform: 'translateY(50px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  {
    timeline,
    fill: 'both'
  }
);
```

For view-based animations:

```javascript
const timeline = new ViewTimeline({
  subject: element,
  axis: 'block'
});

element.animate(keyframes, {
  timeline,
  rangeStart: 'entry 0%',
  rangeEnd: 'cover 50%'
});
```

## Performance: Why It Matters

Scroll-driven CSS animations are not just convenient—they're fundamentally faster.

Traditional JavaScript scroll handlers:
1. Fire scroll event (main thread)
2. Calculate positions (main thread)
3. Update styles (main thread)
4. Trigger layout (main thread)
5. Paint (compositor thread)
6. Composite (compositor thread)

CSS scroll animations:
1. Composite (compositor thread)

Steps 1-4 are eliminated. The animation never touches the main thread. It's physically impossible for JavaScript execution to cause jank.

This is why:
- `transform` and `opacity` are ideal - compositor-only
- Complex animations on `width`, `height`, etc. still work but aren't as performant
- You should still follow animation best practices

## Browser Support and Fallbacks

As of January 2025:
- Chrome 115+ ✅
- Edge 115+ ✅
- Firefox 110+ ✅ (with flag, full support coming)
- Safari 18+ ✅

For browsers without support, the animation simply doesn't play. The element appears in its final state. This is usually fine for progressive enhancement.

For critical animations, you can detect support:

```css
@supports (animation-timeline: scroll()) {
  .reveal {
    animation: reveal-up linear;
    animation-timeline: view();
  }
}
```

Or in JavaScript:

```javascript
if (CSS.supports('animation-timeline', 'scroll()')) {
  // Use scroll-driven animations
} else {
  // Fall back to IntersectionObserver
}
```

## What I've Deleted

Since scroll-driven animations shipped, I've removed:

- IntersectionObserver for reveal animations
- Scroll event listeners for progress indicators
- Libraries like AOS (Animate On Scroll)
- Custom parallax implementations
- Most of my GSAP ScrollTrigger usage

The code reduction is significant. A scroll-heavy landing page went from 15KB of JavaScript to zero.

## The Patterns I Use Most

### 1. Fade In On Scroll

```css
.fade-in {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 25% cover 50%;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 2. Slide Up On Scroll

```css
.slide-up {
  animation: slide-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(100px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 3. Scale In On Scroll

```css
.scale-in {
  animation: scale-in linear both;
  animation-timeline: view();
  animation-range: entry;
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
```

### 4. Progress Bar

```css
.progress {
  transform-origin: left;
  animation: progress linear;
  animation-timeline: scroll(root);
}

@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

## Start Using This Today

Scroll-driven animations are stable, performant, and widely supported. There's no reason to wait.

Start by:
1. Adding a simple progress bar to your blog
2. Converting your fade-in-on-scroll effects
3. Removing those scroll event listeners you've been shipping

The browser is finally doing what we've been hacking around for a decade. Let it.

---

*For a deep dive with interactive examples, check out [scroll-driven-animations.style](https://scroll-driven-animations.style) by Bramus Van Damme. It's the best resource for this API.*
