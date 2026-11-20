---
title: Building Virtual Keyboards in React
excerpt: Lessons learned from creating too-bored, a configurable virtual keyboard for kiosk applications.
category: tutorials
publishedAt: 2024-12-15
tags:
  - React
  - TypeScript
  - NPM
  - Kiosk
featured: true
---

# Building Virtual Keyboards in React

At Retail Business Services, I spent three years building kiosk software for Stop & Shop and other Ahold Delhaize brands. Touch screens in grocery stores, customer service stations, self-checkout interfaces—environments where there's no physical keyboard and users need to type.

Every project needed an on-screen keyboard. Every time, I'd evaluate existing solutions and find them lacking. They were either bloated jQuery plugins from 2012, React components with weird APIs, or simple implementations that fell apart with edge cases.

Eventually I built my own and published it as **too-bored** (get it? keyboard → too bored). Here's everything I learned.

## The Problem with Existing Solutions

Before writing code, I did my research. Here's what was out there:

**react-simple-keyboard** — The most popular option. But "simple" is doing a lot of work. The bundle size is 47KB minified, it requires CSS imports that don't play well with CSS-in-JS, and the API is callback-based in a way that fights React's declarative model.

**react-virtual-keyboard** — Abandoned, last commit 2019. TypeScript types are wrong. Pass.

**kioskboard** — Not React-specific, manipulates the DOM directly, which causes issues with React's virtual DOM reconciliation.

The fundamental problem is that most virtual keyboards were built for a different era of web development. They assume you're going to imperatively control when the keyboard shows/hides, manually manage input synchronization, and style things with global CSS.

I wanted something that felt native to React 18+:
- Controlled component pattern
- Hooks for custom behavior
- CSS-in-JS theming
- TypeScript-first
- Tiny bundle

## Architecture Decisions

### Controlled vs Uncontrolled

The first decision: should the keyboard manage its own state or be controlled by the parent?

I went with controlled. Here's why:

```typescript
// Uncontrolled - keyboard manages internal state
<Keyboard 
  onSubmit={(value) => handleSubmit(value)} 
/>

// Controlled - parent owns the state
const [value, setValue] = useState('');
<Keyboard 
  value={value} 
  onChange={setValue} 
/>
```

The controlled pattern is more verbose, but it's what React developers expect. It works with form libraries (React Hook Form, Formik), it's easy to add validation, and the data flow is explicit.

### Layout System

Keyboards need different layouts—QWERTY for text, numeric for PINs, email with @ key prominent. Instead of building separate components, I designed a layout system:

```typescript
interface KeyDefinition {
  key: string;           // What gets typed
  display?: string;      // What's shown on the key (optional, defaults to key)
  width?: number;        // Relative width (1 = standard key)
  action?: 'backspace' | 'enter' | 'space' | 'shift' | 'tab';
}

type KeyboardRow = KeyDefinition[];
type KeyboardLayout = KeyboardRow[];

const QWERTY_LAYOUT: KeyboardLayout = [
  [
    { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
    { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' },
  ],
  [
    { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
    { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' },
  ],
  [
    { key: 'shift', display: '⇧', width: 1.5, action: 'shift' },
    { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' },
    { key: 'b' }, { key: 'n' }, { key: 'm' },
    { key: 'backspace', display: '⌫', width: 1.5, action: 'backspace' },
  ],
  [
    { key: 'space', display: ' ', width: 6, action: 'space' },
    { key: 'enter', display: '↵', width: 2, action: 'enter' },
  ],
];

const NUMERIC_LAYOUT: KeyboardLayout = [
  [{ key: '1' }, { key: '2' }, { key: '3' }],
  [{ key: '4' }, { key: '5' }, { key: '6' }],
  [{ key: '7' }, { key: '8' }, { key: '9' }],
  [
    { key: 'backspace', display: '⌫', action: 'backspace' },
    { key: '0' },
    { key: 'enter', display: '✓', action: 'enter' },
  ],
];
```

This makes custom layouts trivial:

```typescript
const PIN_LAYOUT: KeyboardLayout = [
  [{ key: '1' }, { key: '2' }, { key: '3' }],
  [{ key: '4' }, { key: '5' }, { key: '6' }],
  [{ key: '7' }, { key: '8' }, { key: '9' }],
  [
    { key: 'clear', display: 'Clear', action: 'backspace', width: 1.5 },
    { key: '0' },
    { key: 'enter', display: 'Enter', action: 'enter', width: 1.5 },
  ],
];

<Keyboard layout={PIN_LAYOUT} />
```

### Event Handling

This is where things get interesting. A virtual keyboard needs to handle:

1. **Click/tap on keys** — The obvious one
2. **Press and hold** — For backspace, users expect continuous deletion
3. **Shift state** — Toggle for uppercase, special characters
4. **Physical keyboard input** — If someone has a Bluetooth keyboard connected

```typescript
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseKeyboardOptions {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  layout: KeyboardLayout;
}

export function useKeyboard({ value, onChange, onEnter, layout }: UseKeyboardOptions) {
  const [shiftActive, setShiftActive] = useState(false);
  const repeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const repeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = useCallback((keyDef: KeyDefinition) => {
    if (keyDef.action === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (keyDef.action === 'enter') {
      onEnter?.();
    } else if (keyDef.action === 'shift') {
      setShiftActive(prev => !prev);
    } else if (keyDef.action === 'space') {
      onChange(value + ' ');
    } else {
      const char = shiftActive ? keyDef.key.toUpperCase() : keyDef.key;
      onChange(value + char);
      
      // Auto-disable shift after typing a character
      if (shiftActive) {
        setShiftActive(false);
      }
    }
  }, [value, onChange, onEnter, shiftActive]);

  const startRepeat = useCallback((keyDef: KeyDefinition) => {
    // Only backspace repeats
    if (keyDef.action !== 'backspace') return;

    // Start repeating after 500ms, then every 100ms
    repeatTimeoutRef.current = setTimeout(() => {
      repeatIntervalRef.current = setInterval(() => {
        onChange(prev => prev.slice(0, -1));
      }, 100);
    }, 500);
  }, [onChange]);

  const stopRepeat = useCallback(() => {
    if (repeatTimeoutRef.current) {
      clearTimeout(repeatTimeoutRef.current);
      repeatTimeoutRef.current = null;
    }
    if (repeatIntervalRef.current) {
      clearInterval(repeatIntervalRef.current);
      repeatIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRepeat();
    };
  }, [stopRepeat]);

  return {
    shiftActive,
    handleKeyPress,
    startRepeat,
    stopRepeat,
  };
}
```

The key insight is the repeat behavior. On a physical keyboard, holding backspace deletes continuously. Users expect the same from virtual keyboards. The 500ms initial delay prevents accidental rapid deletion, then 100ms intervals feel natural.

### Touch Event Handling

Touch screens have different event characteristics than mice. On a kiosk, you need to handle:

```typescript
function Key({ keyDef, onPress, onRepeatStart, onRepeatEnd }: KeyProps) {
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent double-firing with click
    onPress(keyDef);
    onRepeatStart(keyDef);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    onRepeatEnd();
  };

  const handleMouseDown = () => {
    onPress(keyDef);
    onRepeatStart(keyDef);
  };

  const handleMouseUp = () => {
    onRepeatEnd();
  };

  const handleMouseLeave = () => {
    // Stop repeat if mouse leaves key while pressed
    onRepeatEnd();
  };

  return (
    <button
      className="keyboard-key"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ flex: keyDef.width || 1 }}
    >
      {keyDef.display || keyDef.key}
    </button>
  );
}
```

The `e.preventDefault()` on touch events is crucial. Without it, the browser might fire both touch and click events, causing double input.

### Theming with CSS-in-JS

Kiosks have wildly different visual requirements. Stop & Shop wanted their brand green, another client wanted dark mode only, a third wanted high-contrast for accessibility.

I used CSS custom properties (CSS variables) for theming:

```typescript
interface KeyboardTheme {
  backgroundColor: string;
  keyBackground: string;
  keyBackgroundActive: string;
  keyText: string;
  keyBorderRadius: string;
  keyGap: string;
  fontSize: string;
}

const defaultTheme: KeyboardTheme = {
  backgroundColor: '#f0f0f0',
  keyBackground: '#ffffff',
  keyBackgroundActive: '#e0e0e0',
  keyText: '#333333',
  keyBorderRadius: '8px',
  keyGap: '6px',
  fontSize: '18px',
};

const darkTheme: KeyboardTheme = {
  backgroundColor: '#1a1a1a',
  keyBackground: '#333333',
  keyBackgroundActive: '#444444',
  keyText: '#ffffff',
  keyBorderRadius: '8px',
  keyGap: '6px',
  fontSize: '18px',
};

function Keyboard({ theme = defaultTheme, ...props }: KeyboardProps) {
  const style = {
    '--kb-bg': theme.backgroundColor,
    '--kb-key-bg': theme.keyBackground,
    '--kb-key-bg-active': theme.keyBackgroundActive,
    '--kb-key-text': theme.keyText,
    '--kb-key-radius': theme.keyBorderRadius,
    '--kb-key-gap': theme.keyGap,
    '--kb-font-size': theme.fontSize,
  } as React.CSSProperties;

  return (
    <div className="keyboard" style={style}>
      {/* ... */}
    </div>
  );
}
```

The CSS:

```css
.keyboard {
  background: var(--kb-bg);
  padding: var(--kb-key-gap);
  display: flex;
  flex-direction: column;
  gap: var(--kb-key-gap);
}

.keyboard-row {
  display: flex;
  gap: var(--kb-key-gap);
}

.keyboard-key {
  background: var(--kb-key-bg);
  color: var(--kb-key-text);
  border: none;
  border-radius: var(--kb-key-radius);
  font-size: var(--kb-font-size);
  padding: 16px;
  cursor: pointer;
  transition: background 0.1s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.keyboard-key:active {
  background: var(--kb-key-bg-active);
}
```

CSS variables cascade naturally, so you can override specific properties without replacing the whole theme:

```tsx
<Keyboard 
  theme={{
    ...defaultTheme,
    keyBackground: '#ff6b6b',
  }}
/>
```

### Accessibility

Kiosk users include people with various disabilities. The keyboard needed to be accessible:

```typescript
function Key({ keyDef, ...props }: KeyProps) {
  const ariaLabel = getAriaLabel(keyDef);
  
  return (
    <button
      role="button"
      aria-label={ariaLabel}
      aria-pressed={keyDef.action === 'shift' ? shiftActive : undefined}
      tabIndex={0}
      {...props}
    >
      {keyDef.display || keyDef.key}
    </button>
  );
}

function getAriaLabel(keyDef: KeyDefinition): string {
  if (keyDef.action === 'backspace') return 'Backspace';
  if (keyDef.action === 'enter') return 'Enter';
  if (keyDef.action === 'shift') return 'Shift';
  if (keyDef.action === 'space') return 'Space';
  return keyDef.key.toUpperCase();
}
```

I also added keyboard navigation support—you can tab through keys and press Enter to activate them. Seems ironic for a virtual keyboard, but it matters for testing and for users with external switches.

### Performance Optimization

On kiosk hardware (often cheap tablets or all-in-one PCs), performance matters. A few optimizations:

**1. Memoized key components:**

```typescript
const Key = memo(function Key({ keyDef, onPress, ...props }: KeyProps) {
  // Only re-renders when keyDef or onPress changes
});
```

**2. Event handler stability:**

```typescript
// Bad - new function every render
<Key onPress={() => handleKeyPress(keyDef)} />

// Good - stable reference
const handlePress = useCallback(() => handleKeyPress(keyDef), [keyDef, handleKeyPress]);
<Key onPress={handlePress} />
```

**3. CSS animations instead of JS:**

```css
.keyboard-key {
  transition: transform 0.1s ease, background 0.1s ease;
}

.keyboard-key:active {
  transform: scale(0.95);
}
```

Hardware-accelerated CSS is much smoother than JavaScript-driven animations.

## The Final API

After all that, here's what using too-bored looks like:

```typescript
import { Keyboard, LAYOUTS, THEMES } from 'too-bored';

function KioskInput() {
  const [value, setValue] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  return (
    <div className="kiosk-form">
      <input 
        value={value}
        onFocus={() => setKeyboardVisible(true)}
        readOnly // Prevent native keyboard on tablets
      />
      
      {keyboardVisible && (
        <Keyboard
          value={value}
          onChange={setValue}
          onEnter={() => {
            setKeyboardVisible(false);
            handleSubmit(value);
          }}
          layout={LAYOUTS.qwerty}
          theme={THEMES.dark}
        />
      )}
    </div>
  );
}
```

Or with the hook for more control:

```typescript
import { useKeyboard, KeyboardGrid, LAYOUTS } from 'too-bored';

function CustomKeyboard() {
  const [value, setValue] = useState('');
  
  const keyboard = useKeyboard({
    value,
    onChange: setValue,
    onEnter: handleSubmit,
    layout: LAYOUTS.qwerty,
  });

  return (
    <div>
      <input value={value} readOnly />
      <KeyboardGrid {...keyboard} />
      <div>Shift: {keyboard.shiftActive ? 'ON' : 'OFF'}</div>
    </div>
  );
}
```

## Lessons Learned

**1. Controlled components are worth the verbosity.** They integrate better with the React ecosystem and make debugging easier.

**2. Edge cases are where the complexity lives.** The core keyboard logic is simple; handling repeat, shift states, touch events, and accessibility is where I spent 80% of the time.

**3. CSS variables beat runtime theming.** No JavaScript runs when colors change, and the cascade works naturally.

**4. Test on real hardware.** What works on your MacBook Pro might stutter on a cheap Android tablet. I had to optimize animations that I didn't think were a problem.

**5. Build what you need.** I used too-bored in production for two years before publishing it. By that point, I'd hit enough edge cases that the library was actually robust.

---

*too-bored is available on [npm](https://www.npmjs.com/package/too-bored). It's 8KB minified and gzipped, has zero dependencies, and works with React 16.8+.*
