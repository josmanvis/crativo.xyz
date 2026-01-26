---
title: "CSS Anchor Positioning: Tooltips and Popovers Done Right"
excerpt: Position elements relative to other elements with pure CSS. No JavaScript positioning libraries. No getBoundingClientRect(). The future of UI is here.
category: deep-dives
publishedAt: 2025-01-26
tags:
  - CSS
  - UI
  - Tooltips
  - Web Development
coverImage: /blog/css-anchor-positioning.svg
featured: false
---

# CSS Anchor Positioning: Tooltips and Popovers Done Right

I've spent more time than I'd like to admit wrestling with tooltip positioning. Calculating offsets. Handling viewport edges. Making sure the tooltip doesn't clip off-screen. Shipping JavaScript libraries just to put a box near another box.

It's absurd when you think about it. "Position this element relative to that element" should be simple. And now, finally, it is.

CSS Anchor Positioning lets you position any element relative to any other element—using pure CSS. No JavaScript. No `getBoundingClientRect()`. No Popper.js. No Floating UI.

Just CSS.

## The Basic Idea

You define an anchor (the reference element) and a positioned element that uses that anchor. The positioned element can reference the anchor's edges:

```css
/* Define the anchor */
.button {
  anchor-name: --my-anchor;
}

/* Position relative to anchor */
.tooltip {
  position: absolute;
  position-anchor: --my-anchor;
  
  /* Position below the anchor */
  top: anchor(bottom);
  left: anchor(center);
}
```

That's it. The tooltip positions itself below the button and centers horizontally. As the button moves, the tooltip follows. Resize the window? Still works. Button in a scrolling container? Still works.

## Understanding anchor()

The `anchor()` function returns a length value based on the anchor's position. You can reference any edge:

```css
.tooltip {
  /* Vertical positioning */
  top: anchor(top);      /* Align with anchor's top */
  top: anchor(bottom);   /* Below the anchor */
  top: anchor(center);   /* Vertically centered */
  
  /* Horizontal positioning */
  left: anchor(left);    /* Align with anchor's left */
  left: anchor(right);   /* To the right of anchor */
  left: anchor(center);  /* Horizontally centered */
}
```

You can also use percentages for fine control:

```css
.tooltip {
  top: anchor(50%);   /* Same as center */
  left: anchor(25%);  /* 25% from the left edge */
}
```

## Adding Gaps

The tooltip usually needs some space between it and the anchor. Just use `calc()`:

```css
.tooltip {
  position: absolute;
  position-anchor: --my-anchor;
  
  /* 8px below the anchor */
  top: calc(anchor(bottom) + 8px);
  left: anchor(center);
  translate: -50% 0;  /* Center it */
}
```

Or use margin:

```css
.tooltip {
  top: anchor(bottom);
  margin-top: 8px;
}
```

## The Complete Tooltip Example

Here's a production-ready tooltip:

```html
<button class="trigger">Hover me</button>
<div class="tooltip">I'm a tooltip!</div>
```

```css
.trigger {
  anchor-name: --trigger;
}

.tooltip {
  /* Positioning */
  position: absolute;
  position-anchor: --trigger;
  
  /* Place below and center */
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: 8px;
  
  /* Styling */
  background: #1e293b;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
  
  /* Hidden by default */
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
}

.trigger:hover + .tooltip,
.trigger:focus + .tooltip {
  opacity: 1;
  pointer-events: auto;
}
```

No JavaScript. The tooltip positions itself, follows the button, and appears on hover.

## Handling Viewport Edges: position-try

The magic really happens when you need fallback positions. What if the tooltip would go off-screen below the button? It should flip above.

Enter `position-try`:

```css
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  
  /* Default: below */
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0;
  margin-top: 8px;
  
  /* Fallback positions */
  position-try-fallbacks: 
    --above,
    --left,
    --right;
}

@position-try --above {
  top: auto;
  bottom: anchor(top);
  margin-top: 0;
  margin-bottom: 8px;
}

@position-try --left {
  top: anchor(center);
  left: auto;
  right: anchor(left);
  translate: 0 -50%;
  margin-top: 0;
  margin-right: 8px;
}

@position-try --right {
  top: anchor(center);
  left: anchor(right);
  translate: 0 -50%;
  margin-top: 0;
  margin-left: 8px;
}
```

The browser tries each position in order until it finds one that doesn't overflow the viewport. Below → Above → Left → Right.

### Built-in Flip Keywords

For common cases, there are shortcuts:

```css
.tooltip {
  position-try-fallbacks: flip-block;  /* Try opposite on block axis */
}

.tooltip {
  position-try-fallbacks: flip-inline; /* Try opposite on inline axis */
}

.tooltip {
  position-try-fallbacks: flip-block flip-inline; /* Try both */
}
```

`flip-block` on a tooltip below the anchor will try above. `flip-inline` on a tooltip to the right will try left.

## Popover Integration

Anchor positioning works beautifully with the Popover API:

```html
<button popovertarget="menu" style="anchor-name: --menu-trigger">
  Open Menu
</button>

<div popover id="menu">
  <ul>
    <li>Option 1</li>
    <li>Option 2</li>
    <li>Option 3</li>
  </ul>
</div>
```

```css
[popover] {
  position: absolute;
  position-anchor: --menu-trigger;
  
  top: anchor(bottom);
  left: anchor(left);
  margin: 0;
  margin-top: 4px;
  
  position-try-fallbacks: flip-block;
}
```

The popover positions itself relative to its trigger button. Click the button, the popover appears in the right place. No JavaScript positioning code.

## Multiple Anchors

An element can reference multiple anchors:

```css
.connector-line {
  position: absolute;
  
  /* Left end connects to element A */
  left: anchor(--element-a right);
  
  /* Right end connects to element B */
  right: anchor(--element-b left);
  
  /* Vertically centered between both */
  top: calc((anchor(--element-a center) + anchor(--element-b center)) / 2);
}
```

This is powerful for things like:
- Connecting nodes in a diagram
- Drawing lines between related elements
- Complex UI layouts with interdependent positioning

## anchor-center: The Centering Shortcut

Centering positioned elements is so common that there's a dedicated value:

```css
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  
  top: anchor(bottom);
  justify-self: anchor-center;  /* Centers horizontally relative to anchor */
  margin-top: 8px;
}
```

`justify-self: anchor-center` centers the element on the anchor's inline axis. No `translate: -50%` needed.

## Conditional Visibility

You can hide anchored elements when they don't fit anywhere:

```css
.tooltip {
  position-visibility: anchors-visible;  /* Hide if anchor is off-screen */
}

.tooltip {
  position-visibility: no-overflow;  /* Hide if tooltip would overflow */
}
```

Options:
- `always` - Always visible (default)
- `anchors-visible` - Only visible when anchor is visible in scroll container
- `no-overflow` - Hide if it would overflow the containing block

## Real-World Example: Context Menu

```html
<div class="document" oncontextmenu="showMenu(event)">
  Right-click anywhere
</div>

<nav popover id="context-menu">
  <button>Cut</button>
  <button>Copy</button>
  <button>Paste</button>
  <hr>
  <button>Delete</button>
</nav>
```

```css
#context-menu {
  position: absolute;
  position-anchor: --click-position;
  
  top: anchor(bottom);
  left: anchor(right);
  margin: 0;
  
  position-try-fallbacks: 
    flip-block,
    flip-inline, 
    flip-block flip-inline;
  
  /* Styling */
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 4px 0;
  min-width: 160px;
}
```

```javascript
function showMenu(e) {
  e.preventDefault();
  
  // Create an anchor at click position
  const anchor = document.createElement('div');
  anchor.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    anchor-name: --click-position;
  `;
  document.body.appendChild(anchor);
  
  // Show the popover
  document.getElementById('context-menu').showPopover();
  
  // Clean up anchor when popover closes
  document.getElementById('context-menu').addEventListener('toggle', (e) => {
    if (e.newState === 'closed') anchor.remove();
  }, { once: true });
}
```

The context menu positions at the click location and flips if needed to stay on screen. The CSS handles all the positioning logic.

## Dropdown Menus

```css
.dropdown-trigger {
  anchor-name: --dropdown;
}

.dropdown-menu {
  position: absolute;
  position-anchor: --dropdown;
  
  /* Full width of trigger */
  left: anchor(left);
  right: anchor(right);
  
  /* Below trigger */
  top: anchor(bottom);
  margin-top: 4px;
  
  /* Flip above if needed */
  position-try-fallbacks: flip-block;
}
```

The dropdown stretches to match the trigger width using both `left` and `right` anchored positions.

## Dialog Pointers/Arrows

Creating a tooltip arrow that points to the anchor:

```css
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: 12px;
}

.tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  translate: -50% 0;
  
  /* Triangle arrow */
  border: 8px solid transparent;
  border-bottom-color: #1e293b;
}
```

For arrows that adjust with flipping, you'll need the `@position-try` blocks to also update the arrow styles.

## Browser Support

As of January 2025:
- Chrome 125+ ✅
- Edge 125+ ✅
- Safari 18+ ✅ (partial)
- Firefox: In development

For unsupported browsers, positioned elements fall back to their position property defaults. You can feature detect:

```css
@supports (anchor-name: --test) {
  .tooltip {
    /* Anchor positioning styles */
  }
}
```

Or in JavaScript:

```javascript
if (CSS.supports('anchor-name', '--test')) {
  // Use anchor positioning
} else {
  // Fall back to JavaScript positioning
}
```

## What This Replaces

With anchor positioning, I no longer need:

- **Popper.js / Floating UI** - 90% of use cases are now CSS-only
- **getBoundingClientRect() calls** - No manual position calculation
- **ResizeObserver for repositioning** - Browser handles it
- **Scroll listeners for position updates** - Automatic
- **Complex z-index management** - Works with popover's top layer

The JavaScript that remains is just for show/hide logic—not positioning.

## My Preferred Patterns

### Basic Tooltip
```css
.tooltip {
  position: absolute;
  position-anchor: --trigger;
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: 8px;
  position-try-fallbacks: flip-block;
}
```

### Dropdown Menu
```css
.menu {
  position: absolute;
  position-anchor: --trigger;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 4px;
  position-try-fallbacks: flip-block flip-inline;
}
```

### Side Panel
```css
.panel {
  position: absolute;
  position-anchor: --trigger;
  left: anchor(right);
  top: anchor(top);
  margin-left: 8px;
  position-try-fallbacks: flip-inline;
}
```

## The CSS Future is Declarative

Anchor positioning is part of a larger trend: CSS is becoming a complete UI layout language. We had flexbox for 1D layouts, grid for 2D layouts, and now anchor positioning for relational layouts.

The pattern is clear:
1. Describe what you want
2. Let the browser figure out how

No more imperative "calculate this, update that, handle this edge case." Just declare the relationship and move on.

Start using anchor positioning today. Your tooltip JavaScript is ready for retirement.

---

*The CSS Anchor Positioning spec is still being refined, but the core features are stable across implementations. For the latest, check [MDN's anchor positioning guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning).*
