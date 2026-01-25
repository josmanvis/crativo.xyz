---
title: "Building Performant React Animations with Framer Motion"
excerpt: "Master Framer Motion from basics to advanced techniques - useAnimate, layout animations, gesture handling, SVG morphing, and performance optimization."
category: tutorials
publishedAt: 2025-01-24
tags: ["react", "framer-motion", "animation", "performance", "typescript", "ui"]
coverImage: /blog/framer-motion-animations.svg
featured: true
readingTime: "25 min"
---

# Building Performant React Animations with Framer Motion

There's a moment in every React developer's journey when CSS transitions stop being enough. You need an element to animate based on layout changes. You want spring physics instead of linear easing. You need to orchestrate multiple animations, morph SVG paths, or handle complex gesture interactions.

That's when you reach for Framer Motion.

I've used Framer Motion in production apps for years—from subtle micro-interactions to complex page transitions. This is everything I've learned about building animations that feel great and perform well.

## Why Framer Motion?

Before diving in, let's understand what makes Framer Motion special:

1. **Declarative animations** — Describe the end state, not the steps
2. **Spring physics** — Animations that feel natural, not robotic
3. **Layout animations** — Animate between DOM positions automatically
4. **Gesture handling** — Drag, hover, tap, pan with physics
5. **Exit animations** — Actually animate elements leaving the DOM
6. **SVG support** — Path morphing, drawing, and complex sequences
7. **Performance** — GPU-accelerated transforms, automatic optimization

Here's the simplest Framer Motion animation:

```tsx
import { motion } from 'framer-motion';

function FadeIn() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      Hello, I fade in!
    </motion.div>
  );
}
```

That's it. No keyframes, no useEffect timing hacks, no ref manipulation. Just declare what you want.

## Getting Started

```bash
npm install framer-motion
```

Framer Motion provides `motion` components for every HTML and SVG element:

```tsx
import { motion } from 'framer-motion';

// These all work
<motion.div />
<motion.span />
<motion.button />
<motion.svg />
<motion.path />
<motion.circle />
```

The fundamental pattern is:
- `initial` — Starting state
- `animate` — Target state  
- `exit` — State when removed (requires `AnimatePresence`)
- `transition` — How to animate between states

## The Animation Lifecycle

Let's build intuition for how Framer Motion thinks about animations:

```tsx
function AnimationLifecycle() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <button onClick={() => setIsVisible(!isVisible)}>
        Toggle
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}     // Mount state
            animate={{ opacity: 1, y: 0 }}       // Active state
            exit={{ opacity: 0, y: -20 }}        // Unmount state
            transition={{ duration: 0.3 }}
          >
            I animate in and out!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

**The mental model:**

```
┌─────────────────────────────────────────────────────────┐
│                  Animation Timeline                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Mount          Active State          Unmount            │
│    │                 │                   │               │
│    ▼                 ▼                   ▼               │
│ ┌──────┐        ┌──────┐           ┌──────┐             │
│ │initial│───────▶│animate│──────────▶│ exit │            │
│ └──────┘        └──────┘           └──────┘             │
│                                                          │
│  opacity: 0      opacity: 1         opacity: 0           │
│  y: 20           y: 0               y: -20               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Without `AnimatePresence`, exit animations won't work—React removes the element before animation can happen.

## Spring Physics: The Secret Sauce

CSS animations use easing curves: `ease-in`, `ease-out`, `cubic-bezier()`. They feel... mechanical. Springs feel alive.

```tsx
// Default spring (feels bouncy and natural)
<motion.div
  animate={{ x: 100 }}
  transition={{ type: 'spring' }}
/>

// Customized spring
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: 'spring',
    stiffness: 300,    // How "tight" the spring is
    damping: 20,       // How quickly it settles
    mass: 1,           // Weight of the object
  }}
/>

// Quick and snappy
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: 'spring',
    stiffness: 500,
    damping: 30,
  }}
/>

// Slow and wobbly
<motion.div
  animate={{ x: 100 }}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 5,
  }}
/>
```

**Spring parameter visualization:**

```
High Stiffness + High Damping = Quick, no overshoot
────────────────────●

High Stiffness + Low Damping = Quick, lots of bounce
────────────────────●─●─●─●

Low Stiffness + High Damping = Slow, smooth
──────────────────────────────────●

Low Stiffness + Low Damping = Slow, wobbly
──────────────────────────────────●───●──●─●
```

For most UI animations, I use these presets:

```tsx
const springPresets = {
  // Buttons, toggles - quick response
  snappy: { type: 'spring', stiffness: 400, damping: 30 },
  
  // Modals, drawers - smooth entrance
  smooth: { type: 'spring', stiffness: 200, damping: 25 },
  
  // Playful elements - noticeable bounce
  bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  
  // Subtle feedback - barely perceptible
  gentle: { type: 'spring', stiffness: 150, damping: 20 },
};
```

## Variants: Organizing Complex Animations

When animations get complex, inline props become unwieldy. Variants let you define named states:

```tsx
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  tap: {
    scale: 0.98,
  },
};

function Card({ children }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
    >
      {children}
    </motion.div>
  );
}
```

### Variant Propagation

Here's where variants get powerful—they propagate to children:

```tsx
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,        // Delay between each child
      delayChildren: 0.2,          // Initial delay before starting
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Visual timeline:**

```
Time ──────────────────────────────────────────────▶

Parent:  ████████████████████████████████████████
                    delayChildren (0.2s)
                    │
Item 1:             ▓▓▓▓▓▓▓▓▓▓▓▓
Item 2:                  ▓▓▓▓▓▓▓▓▓▓▓▓  (stagger 0.1s)
Item 3:                       ▓▓▓▓▓▓▓▓▓▓▓▓
Item 4:                            ▓▓▓▓▓▓▓▓▓▓▓▓
```

The children don't need `initial` or `animate`—they inherit from the parent!

## Layout Animations: The Magic

This is Framer Motion's killer feature. Animate between any two layouts automatically:

```tsx
function LayoutExample() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 300 : 100,
        height: isExpanded ? 200 : 100,
        borderRadius: isExpanded ? 20 : 50,
        background: '#3b82f6',
      }}
    />
  );
}
```

Just add `layout` and Framer Motion handles everything—width, height, position, border-radius. It uses FLIP (First, Last, Invert, Play) under the hood.

### Shared Layout Animations

The real magic is `layoutId`—animate an element between completely different components:

```tsx
function TabsExample() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Home', 'About', 'Contact'];

  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => setActiveTab(index)}
          style={{ position: 'relative' }}
        >
          {tab}
          {activeTab === index && (
            <motion.div
              layoutId="activeTab"
              className="tab-indicator"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: '#3b82f6',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

The indicator smoothly slides between tabs because both instances share `layoutId="activeTab"`.

### List Reordering

Combine `layout` with `AnimatePresence` for smooth list operations:

```tsx
function ReorderableList() {
  const [items, setItems] = useState([
    { id: 1, text: 'Learn Framer Motion' },
    { id: 2, text: 'Build something cool' },
    { id: 3, text: 'Ship it' },
  ]);

  const moveItem = (from: number, to: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(from, 1);
    newItems.splice(to, 0, removed);
    setItems(newItems);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, x: -100 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 25 },
              opacity: { duration: 0.2 },
            }}
            style={{
              padding: '1rem',
              margin: '0.5rem 0',
              background: '#f1f5f9',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.text}</span>
            <button onClick={() => removeItem(item.id)}>×</button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

When items are removed or reordered, the remaining items smoothly animate to their new positions.

## Gesture Handling

Framer Motion makes gestures trivial:

```tsx
function GestureDemo() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      whileFocus={{ boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)' }}
    >
      Click me
    </motion.button>
  );
}
```

### Drag

```tsx
function DraggableBox() {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      style={{
        width: 100,
        height: 100,
        background: '#3b82f6',
        borderRadius: 10,
        cursor: 'grab',
      }}
    />
  );
}
```

### Drag with Snap Points

```tsx
function SnapDrawer() {
  const constraintsRef = useRef(null);
  
  return (
    <div ref={constraintsRef} style={{ height: '100vh', position: 'relative' }}>
      <motion.div
        drag="y"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragSnapToOrigin
        onDragEnd={(event, info) => {
          // Snap to closed if dragged down past threshold
          if (info.offset.y > 100) {
            // Close drawer
          }
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 300,
          background: 'white',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          width: 40, 
          height: 4, 
          background: '#ccc', 
          borderRadius: 2,
          margin: '10px auto',
        }} />
        {/* Drawer content */}
      </motion.div>
    </div>
  );
}
```

### Pan and Custom Gestures

```tsx
function PanGesture() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  return (
    <motion.div
      onPan={(event, info) => {
        setPosition({
          x: position.x + info.delta.x,
          y: position.y + info.delta.y,
        });
      }}
      onPanStart={() => console.log('Pan started')}
      onPanEnd={() => console.log('Pan ended')}
      animate={{ x: position.x, y: position.y }}
      style={{
        width: 100,
        height: 100,
        background: '#22c55e',
        borderRadius: 10,
      }}
    />
  );
}
```

## useAnimate: Imperative Control

Sometimes declarative isn't enough. You need precise control over timing or need to sequence animations imperatively. Enter `useAnimate`:

```tsx
import { useAnimate } from 'framer-motion';

function ImperativeAnimation() {
  const [scope, animate] = useAnimate();

  const runSequence = async () => {
    // Animate the main element
    await animate(scope.current, { scale: 1.2 }, { duration: 0.2 });
    await animate(scope.current, { scale: 1 }, { type: 'spring' });
    
    // Animate children
    await animate('li', { opacity: 1, x: 0 }, { delay: stagger(0.1) });
  };

  return (
    <div ref={scope}>
      <button onClick={runSequence}>Start Animation</button>
      <ul>
        <li style={{ opacity: 0, transform: 'translateX(-20px)' }}>Item 1</li>
        <li style={{ opacity: 0, transform: 'translateX(-20px)' }}>Item 2</li>
        <li style={{ opacity: 0, transform: 'translateX(-20px)' }}>Item 3</li>
      </ul>
    </div>
  );
}
```

### Complex Sequences

```tsx
function ComplexSequence() {
  const [scope, animate] = useAnimate();

  const playIntro = async () => {
    // Phase 1: Fade in background
    await animate('.background', { opacity: 1 }, { duration: 0.5 });
    
    // Phase 2: Scale up logo with bounce
    await animate('.logo', 
      { scale: [0, 1.2, 1], opacity: 1 },
      { duration: 0.6, ease: 'easeOut' }
    );
    
    // Phase 3: Stagger in menu items
    await animate('.menu-item',
      { opacity: 1, y: 0 },
      { delay: stagger(0.08), duration: 0.4 }
    );
    
    // Phase 4: Reveal tagline with typewriter effect
    animate('.tagline', { opacity: 1 }, { duration: 0.3 });
  };

  useEffect(() => {
    playIntro();
  }, []);

  return (
    <div ref={scope}>
      <div className="background" style={{ opacity: 0 }}>
        <img className="logo" style={{ opacity: 0, scale: 0 }} src="/logo.svg" />
        <nav>
          {['Home', 'About', 'Work', 'Contact'].map((item) => (
            <span 
              key={item} 
              className="menu-item"
              style={{ opacity: 0, transform: 'translateY(20px)' }}
            >
              {item}
            </span>
          ))}
        </nav>
        <p className="tagline" style={{ opacity: 0 }}>Building the future</p>
      </div>
    </div>
  );
}
```

### Animate Multiple Elements

```tsx
import { useAnimate, stagger } from 'framer-motion';

function StaggeredCards() {
  const [scope, animate] = useAnimate();

  const animateCards = () => {
    animate(
      '.card',
      { opacity: 1, y: 0, scale: 1 },
      { 
        delay: stagger(0.1, { startDelay: 0.2 }),
        type: 'spring',
        stiffness: 300,
      }
    );
  };

  return (
    <div ref={scope}>
      <button onClick={animateCards}>Animate</button>
      <div className="grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i}
            className="card"
            style={{ opacity: 0, transform: 'translateY(20px) scale(0.95)' }}
          >
            Card {i}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## SVG Animations

Framer Motion shines with SVG:

### Path Drawing

```tsx
function DrawingPath() {
  return (
    <motion.svg width="200" height="200" viewBox="0 0 200 200">
      <motion.path
        d="M20,100 Q100,20 180,100 T180,180"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### SVG Morphing

```tsx
function MorphingIcon() {
  const [isPlaying, setIsPlaying] = useState(false);

  const playPath = "M8 5v14l11-7z";  // Play icon
  const pausePath = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";  // Pause icon

  return (
    <motion.svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      onClick={() => setIsPlaying(!isPlaying)}
      style={{ cursor: 'pointer' }}
    >
      <motion.path
        fill="#3b82f6"
        animate={{ d: isPlaying ? pausePath : playPath }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
```

### Complex SVG Sequences

```tsx
function AnimatedCheckmark() {
  const [isComplete, setIsComplete] = useState(false);
  const [scope, animate] = useAnimate();

  const showSuccess = async () => {
    setIsComplete(true);
    
    // Draw the circle
    await animate(
      'circle',
      { pathLength: 1 },
      { duration: 0.5, ease: 'easeOut' }
    );
    
    // Draw the checkmark
    await animate(
      '.checkmark',
      { pathLength: 1 },
      { duration: 0.3, ease: 'easeOut' }
    );
    
    // Scale pulse
    await animate(
      'svg',
      { scale: [1, 1.1, 1] },
      { duration: 0.3 }
    );
  };

  return (
    <div ref={scope}>
      <button onClick={showSuccess}>Complete</button>
      <motion.svg 
        width="80" 
        height="80" 
        viewBox="0 0 80 80"
      >
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          style={{ pathLength: isComplete ? undefined : 0 }}
        />
        <motion.path
          className="checkmark"
          d="M24 40 L35 51 L56 30"
          fill="none"
          stroke="#22c55e"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          style={{ pathLength: isComplete ? undefined : 0 }}
        />
      </motion.svg>
    </div>
  );
}
```

### Animated Illustrations

```tsx
function AnimatedHero() {
  return (
    <svg viewBox="0 0 400 300">
      {/* Background shapes */}
      <motion.circle
        cx="200"
        cy="150"
        r="100"
        fill="#22d3ee"
        fillOpacity="0.2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      
      {/* Floating elements */}
      <motion.rect
        x="50"
        y="50"
        width="30"
        height="30"
        rx="5"
        fill="#fb923c"
        animate={{ 
          y: [50, 30, 50],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.circle
        cx="350"
        cy="80"
        r="15"
        fill="#22c55e"
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
      
      {/* Main element with path drawing */}
      <motion.path
        d="M150 200 L200 120 L250 200 Z"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
      />
    </svg>
  );
}
```

## Scroll Animations

### useScroll Hook

```tsx
import { motion, useScroll, useTransform } from 'framer-motion';

function ParallaxHero() {
  const { scrollY } = useScroll();
  
  // Transform scroll position to different values
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  return (
    <motion.div
      style={{
        y,
        opacity,
        scale,
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1>Scroll down</h1>
    </motion.div>
  );
}
```

### Scroll-Linked Progress

```tsx
function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: '#3b82f6',
        scaleX: scrollYProgress,
        transformOrigin: '0%',
      }}
    />
  );
}
```

### Element-Based Scroll

```tsx
function RevealOnScroll({ children }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'], // When element enters/exits viewport
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100]);

  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
}
```

### useInView for Triggering Animations

```tsx
import { useInView } from 'framer-motion';

function AnimateOnView({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true,           // Only animate once
    margin: '-100px',     // Trigger 100px before entering viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
```

## Performance Optimization

Animations can tank performance if you're not careful. Here's how to keep things smooth:

### 1. Animate Transform and Opacity Only

These properties are GPU-accelerated and don't trigger layout:

```tsx
// ✅ Good - GPU accelerated
<motion.div
  animate={{
    x: 100,        // transform: translateX
    y: 50,         // transform: translateY
    scale: 1.2,    // transform: scale
    rotate: 45,    // transform: rotate
    opacity: 0.5,  // opacity
  }}
/>

// ❌ Avoid - triggers layout
<motion.div
  animate={{
    width: 200,    // Triggers layout
    height: 100,   // Triggers layout
    top: 50,       // Triggers layout
    left: 100,     // Triggers layout
  }}
/>
```

### 2. Use layout Animations Wisely

Layout animations use FLIP but can still be expensive with many elements:

```tsx
// ✅ Good - layout on container only
<motion.ul layout>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>  // No layout on children
  ))}
</motion.ul>

// ⚠️ Expensive - layout on every item
<ul>
  {items.map(item => (
    <motion.li key={item.id} layout>  // Each item calculates FLIP
      {item.name}
    </motion.li>
  ))}
</ul>
```

### 3. Reduce Motion for Accessibility

Respect user preferences:

```tsx
import { useReducedMotion } from 'framer-motion';

function AccessibleAnimation({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: shouldReduceMotion ? 0 : 0.3 
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 4. Optimize Exit Animations

Use `mode="wait"` judiciously—it blocks entering elements:

```tsx
// Sequential (slower, but no overlap)
<AnimatePresence mode="wait">
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.name}
    </motion.div>
  ))}
</AnimatePresence>

// Simultaneous (faster, elements overlap during transition)
<AnimatePresence mode="sync">
  {items.map(item => (
    <motion.div key={item.id} exit={{ opacity: 0 }}>
      {item.name}
    </motion.div>
  ))}
</AnimatePresence>
```

### 5. Use willChange Sparingly

Framer Motion handles `will-change` automatically, but for custom animations:

```tsx
function OptimizedAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <motion.div
      style={{
        willChange: isAnimating ? 'transform' : 'auto',
      }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => setIsAnimating(false)}
      animate={{ x: 100 }}
    />
  );
}
```

### 6. Debounce Scroll Handlers

```tsx
function OptimizedScrollAnimation() {
  const { scrollY } = useScroll();
  
  // useTransform is already optimized, but for custom logic:
  const [scrollPosition, setScrollPosition] = useState(0);
  
  useMotionValueEvent(scrollY, 'change', (latest) => {
    // This fires on every scroll frame - keep it light!
    setScrollPosition(latest);
  });

  return <div>{/* ... */}</div>;
}
```

## Real-World Example: Animated Card Grid

Let's build a production-ready animated card grid:

```tsx
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useState, useRef } from 'react';

interface Card {
  id: number;
  title: string;
  category: string;
  image: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 },
  },
};

function CardGrid({ cards, filter }: { cards: Card[]; filter: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  
  const filteredCards = filter === 'all' 
    ? cards 
    : cards.filter(card => card.category === filter);

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
      }}
    >
      <AnimatePresence mode="popLayout">
        {filteredCards.map((card) => (
          <motion.article
            key={card.id}
            variants={cardVariants}
            layout
            layoutId={`card-${card.id}`}
            whileHover={{ 
              y: -8,
              transition: { type: 'spring', stiffness: 400 },
            }}
            style={{
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <motion.img
              src={card.image}
              alt={card.title}
              layoutId={`image-${card.id}`}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
            />
            <motion.div style={{ padding: '1rem' }}>
              <motion.span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  textTransform: 'uppercase',
                }}
              >
                {card.category}
              </motion.span>
              <motion.h3 
                layoutId={`title-${card.id}`}
                style={{ margin: '0.5rem 0', fontSize: '1.25rem' }}
              >
                {card.title}
              </motion.h3>
            </motion.div>
          </motion.article>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterBar({ 
  categories, 
  activeFilter, 
  onFilterChange 
}: {
  categories: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
      {['all', ...categories].map((category) => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
          {activeFilter === category && (
            <motion.div
              layoutId="activeFilter"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: '#3b82f6',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

export function AnimatedCardGrid() {
  const [filter, setFilter] = useState('all');
  
  const cards: Card[] = [
    { id: 1, title: 'React Fundamentals', category: 'react', image: '/card1.jpg' },
    { id: 2, title: 'CSS Grid Mastery', category: 'css', image: '/card2.jpg' },
    { id: 3, title: 'TypeScript Deep Dive', category: 'typescript', image: '/card3.jpg' },
    { id: 4, title: 'Next.js Patterns', category: 'react', image: '/card4.jpg' },
    { id: 5, title: 'Tailwind Tips', category: 'css', image: '/card5.jpg' },
    { id: 6, title: 'Advanced Types', category: 'typescript', image: '/card6.jpg' },
  ];

  const categories = [...new Set(cards.map(c => c.category))];

  return (
    <div style={{ padding: '2rem' }}>
      <FilterBar
        categories={categories}
        activeFilter={filter}
        onFilterChange={setFilter}
      />
      <CardGrid cards={cards} filter={filter} />
    </div>
  );
}
```

## Page Transitions with Next.js

```tsx
// app/template.tsx (App Router)
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

For more complex transitions:

```tsx
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    x: '100vw',
    transition: {
      ease: 'easeInOut',
    },
  },
};

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

## Debugging Animations

### 1. Slow Down Animations

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 5 }}  // Slow it down to see what's happening
/>
```

### 2. Use Motion DevTools

Install the browser extension for visual debugging.

### 3. Log Animation Events

```tsx
<motion.div
  animate={{ x: 100 }}
  onAnimationStart={() => console.log('Started')}
  onAnimationComplete={() => console.log('Completed')}
/>
```

### 4. Visualize Spring Curves

```tsx
// Use this to visualize your spring settings
function SpringVisualizer({ stiffness, damping }: { stiffness: number; damping: number }) {
  return (
    <motion.div
      animate={{ x: 200 }}
      transition={{ type: 'spring', stiffness, damping }}
      style={{
        width: 50,
        height: 50,
        background: '#3b82f6',
        borderRadius: 8,
      }}
    />
  );
}
```

## Common Pitfalls

### 1. Forgetting AnimatePresence

```tsx
// ❌ Exit animation won't work
{isVisible && (
  <motion.div exit={{ opacity: 0 }}>
    Content
  </motion.div>
)}

// ✅ Wrap with AnimatePresence
<AnimatePresence>
  {isVisible && (
    <motion.div exit={{ opacity: 0 }}>
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### 2. Missing Keys in AnimatePresence

```tsx
// ❌ No key = no exit animation
<AnimatePresence>
  <motion.div exit={{ opacity: 0 }}>
    {content}
  </motion.div>
</AnimatePresence>

// ✅ Add unique key
<AnimatePresence>
  <motion.div key={contentId} exit={{ opacity: 0 }}>
    {content}
  </motion.div>
</AnimatePresence>
```

### 3. Layout Animation Conflicts

```tsx
// ❌ layoutId conflict
{items.map(item => (
  <motion.div layoutId="card">  // Same ID for all!
    {item.name}
  </motion.div>
))}

// ✅ Unique layoutId
{items.map(item => (
  <motion.div layoutId={`card-${item.id}`}>
    {item.name}
  </motion.div>
))}
```

### 4. Animating Non-Animatable Properties

```tsx
// ❌ Can't animate display
<motion.div animate={{ display: 'none' }} />

// ✅ Use opacity and visibility
<motion.div 
  animate={{ opacity: 0 }}
  onAnimationComplete={() => setVisible(false)}
/>
```

## Wrapping Up

Framer Motion transforms how you think about animation in React. Instead of wrestling with CSS keyframes or imperative JavaScript, you describe what you want and let the library figure out the physics.

Key takeaways:

1. **Start simple** — `initial`, `animate`, `exit` cover most cases
2. **Use springs** — They feel more natural than easing curves
3. **Variants organize complexity** — Named states + propagation = clean code
4. **Layout animations are magic** — Just add `layout` and `layoutId`
5. **useAnimate for sequences** — When declarative isn't enough
6. **Performance matters** — Stick to transforms and opacity
7. **Respect reduced motion** — Use `useReducedMotion` hook

The best animations are the ones you don't notice. They guide attention, provide feedback, and make interfaces feel alive without getting in the way.

Now go make something that moves.

---

*Found this useful? I write about React, TypeScript, and building great developer tools. Check out my other posts or follow me on Twitter.*
