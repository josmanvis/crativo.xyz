---
title: "Container Queries: Viewport Width is Dead"
date: "2026-05-25"
description: "Media queries are obsolete for component design. It's time to build truly modular, self-aware UI components using Container Queries."
coverImage: "/blog/container-queries-viewport-dead.svg"
---

## The Great Lie of Responsive Design

For over a decade, we built responsive websites based on a fundamental lie: that the size of the *browser window* dictates the layout of our components.

We used media queries. `@media (min-width: 768px)` became our mantra. We told our cards, our sidebars, and our navigation menus to change their shape based on how wide the user's screen was.

But a component shouldn't care about the screen. It should care about the space it actually has.

Imagine a user profile card. On a mobile phone, it spans the full width of the screen. On a desktop, you might put it in a narrow sidebar, or you might put it in a wide main content area.

If you style that card using media queries, it will look fine on mobile. It will look fine in the main content area on desktop. But when you place it in the narrow desktop sidebar? It breaks. The screen is wide, so the media query triggers the "wide" layout, but the sidebar itself is narrow. The card becomes a squished, unusable mess.

## The Old Way: Context-Dependent Components

To fix this, we created horrible workarounds. We passed props to our components to tell them where they lived. We added modifier classes.

```html
<!-- The Old Way: Explicitly declaring context -->
<div class="sidebar">
  <ProfileCard class="profile-card--compact" />
</div>

<div class="main-content">
  <ProfileCard class="profile-card--expanded" />
</div>
```

This destroys component isolation. A component should be a black box. You should be able to drop it anywhere—in a sidebar, in a grid, in a modal—and it should just figure out how to display itself optimally.

Media queries made true modularity impossible.

## The New Way: Enter Container Queries

Container Queries solve this problem definitively. Instead of querying the viewport width, an element queries the width of its *parent container*.

This flips responsive design on its head. Components are finally self-aware.

Here is how you use them. First, you define a container using the `container-type` property:

```css
/* Step 1: Define the container */
.sidebar, .main-content, .grid-item {
  container-type: inline-size;
  container-name: card-wrapper; /* Optional naming */
}
```

Now, instead of using `@media`, you use `@container` inside your component's CSS:

```css
/* Step 2: Component queries its container */
.profile-card {
  display: flex;
  flex-direction: column; /* Default compact layout */
  padding: 1rem;
}

/* If the container is wider than 400px, switch to a horizontal layout */
@container (min-width: 400px) {
  .profile-card {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
}
```

That's it. Drop this `.profile-card` into a 300px sidebar, and it stacks vertically. Drop the exact same component into an 800px main content area, and it sits horizontally. 

Zero JavaScript. Zero modifier classes. Perfect modularity.

![Container Queries vs Media Queries](/blog/container-queries-viewport-dead-inline.svg)

## Container Query Units (cqi)

The magic doesn't stop at breakpoints. Container Queries also introduce new CSS units based on the container's size, similar to `vw` and `vh`.

The most useful of these is `cqi` (Container Query Inline). `1cqi` is 1% of the container's inline width.

This allows for incredibly powerful fluid typography and spacing that responds to the component's context, not the screen.

```css
.card-title {
  /* Font size scales based on how wide the container is */
  font-size: clamp(1.5rem, 5cqi, 3rem);
}
```

If the card is placed in a narrow column, the text shrinks. If it's placed in a hero banner, the text grows dynamically. It's fluid design at the component level.

## Rethinking Grid Layouts

Container queries fundamentally change how we use CSS Grid and Flexbox. 

Before, we relied heavily on auto-fit grids (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`) to handle responsiveness without media queries. While this is a great technique, it forces all children in the grid track to behave exactly the same way.

With container queries, the grid defines the structural space, and the component inside that space determines its own destiny. You can have a grid where the first item spans two columns and renders in its "expanded" state, while the siblings sit in single columns and render in their "compact" states—all using the exact same HTML and CSS component class.

## The Death of Media Queries?

Are media queries dead? Not entirely. 

Media queries are still useful for macro-layout. You still need them to define when your sidebar collapses into a hamburger menu, or when your main grid goes from one column to three. They are for page-level architecture.

But for micro-layout? For the styling of individual components, buttons, cards, and modules? Yes. For component design, media queries are absolutely dead. 

## Build Once, Place Anywhere

Container queries deliver on the promise that Web Components and JavaScript frameworks have been chasing for years: true visual encapsulation.

You build a component once. You give it rules on how to adapt to its available space. And then you never worry about it again. You can drag it, drop it, nest it, and move it anywhere in your application, confident that it will always look beautiful.

Stop looking at the window. Start looking at the container. Build modular, robust, self-aware UI.
