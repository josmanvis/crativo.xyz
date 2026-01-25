---
title: The View Transitions API Changes Everything for SPAs
excerpt: Native page transitions in the browser. No libraries. No hacks. Finally.
category: deep-dives
publishedAt: 2025-01-11
tags:
  - CSS
  - JavaScript
  - Animation
  - UX
coverImage: /blog/view-transitions-api-guide.svg
featured: false
---

# The View Transitions API Changes Everything for SPAs

For 15 years, I've been building SPAs and fighting the same battle: how do you make navigation feel smooth without shipping a mountain of JavaScript?

Native apps have always had this figured out. Tap a row in iOS, and it slides away as the detail view slides in. Everything feels connected. Intentional.

Web apps? You click a link and the entire page blinks. Or you ship 30KB of Framer Motion and carefully orchestrate every transition. Neither option is great.

But the View Transitions API changes the game. It's a browser-native way to animate between DOM states—including navigation. And it's finally ready for production.

## What It Actually Does

The View Transitions API lets you capture the current state of the page, make changes to the DOM, and then animate between the old and new states. The browser handles the complexity.

Here's the simplest example:

```javascript
document.startViewTransition(() => {
  // Update the DOM
  document.querySelector('h1').textContent = 'New Title';
});
```

That's it. The browser will:
1. Screenshot the current state
2. Run your callback (which updates the DOM)
3. Screenshot the new state
4. Animate between them with a crossfade

No libraries. No keyframes. No fighting with `getComputedStyle`. Just tell the browser what changed, and it figures out how to animate it.

## Beyond Crossfades: Named Elements

The default crossfade is nice, but the real power comes from naming elements. When you give an element a `view-transition-name`, the browser tracks it across state changes and animates its position, size, and other properties automatically.

```css
.profile-card {
  view-transition-name: profile-card;
}

.detail-image {
  view-transition-name: profile-card;  /* Same name = same element */
}
```

Now when you transition from a card grid to a detail view, the image doesn't just fade—it smoothly morphs from the card size to the detail size. The browser calculates the position delta and creates the animation.

Here's a practical example. Say you have a photo gallery:

```html
<!-- Gallery Page -->
<div class="gallery">
  <img 
    src="photo1.jpg" 
    class="thumbnail"
    style="view-transition-name: photo-1"
  />
  <img 
    src="photo2.jpg" 
    class="thumbnail"
    style="view-transition-name: photo-2"
  />
</div>
```

```html
<!-- Detail Page -->
<div class="detail">
  <img 
    src="photo1.jpg" 
    class="hero-image"
    style="view-transition-name: photo-1"
  />
  <h1>Photo Title</h1>
  <p>Description...</p>
</div>
```

When you navigate from gallery to detail, the thumbnail with `view-transition-name: photo-1` will animate directly into the hero image position. It feels like the same element is moving, even though you've completely replaced the DOM.

## Using It With React

In React (or any SPA framework), you integrate View Transitions with your router. Here's how I do it with React Router:

```tsx
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

function useViewTransitionNavigate() {
  const navigate = useNavigate();

  return (to: string) => {
    if (!document.startViewTransition) {
      // Fallback for unsupported browsers
      navigate(to);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        navigate(to);
      });
    });
  };
}

// Usage
function ProductCard({ product }) {
  const navigate = useViewTransitionNavigate();

  return (
    <div 
      onClick={() => navigate(`/products/${product.id}`)}
      style={{ viewTransitionName: `product-${product.id}` }}
    >
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
    </div>
  );
}
```

The `flushSync` is important—it ensures React updates the DOM synchronously within the view transition callback. Without it, React's batching might break the transition.

## Customizing Animations

The default crossfade is just the starting point. You can customize animations with CSS:

```css
/* Customize the default animation */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-in;
}

/* Customize a specific named element */
::view-transition-old(profile-card) {
  animation: scale-down 0.4s ease-out;
}

::view-transition-new(profile-card) {
  animation: scale-up 0.4s ease-in;
}

@keyframes scale-down {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.8); opacity: 0; }
}

@keyframes scale-up {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

You can also create slide transitions for navigation:

```css
/* Slide in from right */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

::view-transition-old(page) {
  animation: slide-to-left 0.3s ease-out;
}

::view-transition-new(page) {
  animation: slide-from-right 0.3s ease-in;
}
```

## The Navigation API Integration

For full-page navigations (actual URL changes, not just SPA routing), there's `navigation` API integration. This is still experimental but incredibly powerful:

```javascript
// Intercept navigation and add transitions
navigation.addEventListener('navigate', (event) => {
  if (!event.canIntercept) return;
  
  event.intercept({
    async handler() {
      const response = await fetch(event.destination.url);
      const html = await response.text();
      
      // Parse and update with a view transition
      document.startViewTransition(() => {
        document.body.innerHTML = html;
      });
    }
  });
});
```

This lets MPAs (multi-page apps) have SPA-like transitions without becoming SPAs. Mind-blowing, honestly.

## Real-World Patterns

Here are some patterns I've implemented with View Transitions:

### Shared Element Lists

```tsx
function TrackList({ tracks, onSelect }) {
  return (
    <ul>
      {tracks.map(track => (
        <li 
          key={track.id}
          onClick={() => onSelect(track)}
          style={{ viewTransitionName: `track-${track.id}` }}
        >
          <img src={track.artwork} />
          <span>{track.title}</span>
        </li>
      ))}
    </ul>
  );
}

function NowPlaying({ track }) {
  return (
    <div 
      className="now-playing"
      style={{ viewTransitionName: `track-${track.id}` }}
    >
      <img src={track.artwork} className="full-artwork" />
      <h1>{track.title}</h1>
      <PlayerControls />
    </div>
  );
}
```

### Modal Open/Close

```tsx
function Modal({ children, isOpen, onClose, transitionName }) {
  const handleClose = () => {
    document.startViewTransition(() => {
      flushSync(() => onClose());
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={handleClose}
    >
      <div 
        className="modal-content"
        style={{ viewTransitionName: transitionName }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
```

### Theme Toggle

```tsx
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    document.startViewTransition(() => {
      flushSync(() => {
        setTheme(t => t === 'light' ? 'dark' : 'light');
      });
    });
  };

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

With circular clip-path animations, this looks incredible:

```css
::view-transition-new(root) {
  animation: circle-in 0.5s ease-out;
}

@keyframes circle-in {
  from {
    clip-path: circle(0% at var(--click-x, 50%) var(--click-y, 50%));
  }
  to {
    clip-path: circle(150% at var(--click-x, 50%) var(--click-y, 50%));
  }
}
```

## Browser Support and Fallbacks

As of early 2025, View Transitions API has good support:

- Chrome/Edge: Full support (since Chrome 111)
- Safari: Partial support (TP, coming to stable)
- Firefox: In development

The API is designed to be progressively enhanced. Always check for support:

```javascript
function transition(callback) {
  if (!document.startViewTransition) {
    callback();
    return;
  }
  document.startViewTransition(callback);
}
```

Users without support just don't get the animation. The functionality works fine.

## Performance Considerations

View Transitions are generally performant because:
- Animations happen on the compositor thread
- The browser creates temporary pseudo-elements for the transition
- Your actual DOM isn't being animated (just screenshots of it)

But there are pitfalls:

**1. Large view-transition-name counts:** Each named element creates additional compositor work. Don't name hundreds of list items.

**2. Heavy DOM updates:** If your callback takes too long, users will notice the delay before the animation starts.

**3. Large images:** The browser screenshots the page, including images. Very large images can cause stutters.

## Why This Matters

I've been obsessing over animations for years. Built with Framer Motion, GSAP, React Spring, CSS-only approaches. They all work, but they all have costs: bundle size, complexity, performance.

The View Transitions API is different. It's:
- **Zero JavaScript for basic transitions** (just CSS)
- **Automatic element tracking** (no refs, no measurements)
- **Browser-optimized** (compositor-thread animations)
- **Progressive enhancement** (works without breaking anything)

This is what the platform should provide. Animation primitives that work out of the box.

I'm already using it in production on smaller projects. In a year, I expect it'll be my default for any navigation or state change animation. The old way—manually calculating positions, orchestrating keyframes, shipping animation libraries—will feel archaic.

The web is catching up to native. Finally.

---

*If you're excited about View Transitions, check out the Chrome team's explainers and Jake Archibald's demos. They're excellent.*
