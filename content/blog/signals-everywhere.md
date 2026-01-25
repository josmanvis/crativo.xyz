---
title: "Signals: Why Every Framework Is Copying This Pattern"
excerpt: From Solid to Angular to Svelte, signals are taking over. Here's why.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - JavaScript
  - Reactivity
  - Architecture
  - Frontend
coverImage: /blog/signals-everywhere.svg
featured: false
---

# Signals: Why Every Framework Is Copying This Pattern

Something interesting has happened in frontend development. After years of divergence—React's one-way data flow, Vue's reactivity, Svelte's compiler magic—frameworks are converging on a single primitive: signals.

- Solid has signals (since the beginning)
- Preact added signals
- Angular added signals
- Vue's refs are basically signals
- Svelte 5's "runes" are signals with different syntax
- There's even a TC39 proposal to add signals to JavaScript itself

This isn't coincidence. Signals solve a fundamental problem better than the alternatives. Let me explain why.

## What Are Signals, Actually?

At their core, signals are reactive containers for values. You create a signal, read from it, write to it, and anything that depends on it automatically updates.

```javascript
// Pseudocode for a minimal signal implementation
function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();
  
  function read() {
    // Track who's reading us
    if (currentSubscriber) {
      subscribers.add(currentSubscriber);
    }
    return value;
  }
  
  function write(newValue) {
    value = newValue;
    // Notify everyone who cares
    subscribers.forEach(fn => fn());
  }
  
  return [read, write];
}
```

That's maybe 20 lines. But those 20 lines unlock fine-grained reactivity—updates that touch exactly the DOM nodes that need to change, nothing more.

## Signals in Practice

Here's how signals look in different frameworks:

**Solid.js:**
```tsx
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {count()}
    </button>
  );
}
```

**Preact Signals:**
```tsx
import { signal } from '@preact/signals';

const count = signal(0);

function Counter() {
  return (
    <button onClick={() => count.value++}>
      Count: {count}
    </button>
  );
}
```

**Angular Signals:**
```typescript
import { signal, computed } from '@angular/core';

@Component({
  template: `
    <button (click)="increment()">
      Count: {{ count() }}
    </button>
  `
})
class Counter {
  count = signal(0);
  
  increment() {
    this.count.update(c => c + 1);
  }
}
```

**Svelte 5 Runes:**
```svelte
<script>
  let count = $state(0);
</script>

<button onclick={() => count++}>
  Count: {count}
</button>
```

Different syntax, same idea: declare a reactive value, use it, and the framework handles updates.

## Why Not Just useState?

React's model is different. `useState` triggers a re-render of the entire component (and its children) whenever state changes:

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <ExpensiveChild />  {/* Re-renders even though it doesn't use count */}
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

Every click re-renders `ExpensiveChild`. React's solution? Memoization:

```tsx
const ExpensiveChild = React.memo(function ExpensiveChild() {
  // ...
});
```

Now it only re-renders if its props change. But you have to opt into this. You have to remember. You have to wrap things in `useCallback` so function props don't break memoization.

With signals, this problem doesn't exist:

```tsx
// Solid.js
function Parent() {
  const [count, setCount] = createSignal(0);
  
  return (
    <div>
      <ExpensiveChild />  {/* Never re-renders */}
      <p>Count: {count()}</p>  {/* Only this text node updates */}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}
```

When `count` changes, only the text node inside `<p>` updates. The component function doesn't re-run. `ExpensiveChild` is untouched. No memoization needed.

## The Performance Difference

I benchmarked a simple app: a list of 1000 items where clicking an item updates its "selected" state.

| Framework | Update Time |
|-----------|-------------|
| React (no memo) | 23ms |
| React (with memo) | 8ms |
| Solid (signals) | 0.4ms |
| Preact Signals | 0.6ms |

That's not a typo. Solid is 50x faster than memoized React for this case.

Why? React does this:
1. Set state
2. Re-render component function
3. Diff the returned VDOM against previous VDOM
4. Patch real DOM where differences exist

Solid does this:
1. Update signal
2. Run effects that depend on that signal
3. Patch the exact DOM node

No VDOM. No diffing. No component re-execution. Just surgical DOM updates.

## Derived State: Computed/Memo

Signals usually come with a way to derive values that automatically update:

```tsx
// Solid
const firstName = createSignal('John');
const lastName = createSignal('Doe');
const fullName = createMemo(() => `${firstName()} ${lastName()}`);

// Angular
const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName()} ${lastName()}`);
```

`fullName` automatically updates when either input changes. But it only recomputes when accessed and only if its dependencies changed.

In React, you'd use `useMemo`:

```tsx
const fullName = useMemo(
  () => `${firstName} ${lastName}`,
  [firstName, lastName]  // Manual dependency array
);
```

The dependency array is the problem. You can miss dependencies. ESLint can catch some mistakes but not all. Signals track dependencies automatically.

## Effects That Don't Suck

React's `useEffect` has a reputation. The cleanup function, the dependency array, the stale closure bugs, the infinite loops...

```tsx
// Easy to mess up
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);  // Stale closure! count is always 0
  }, 1000);
  return () => clearInterval(id);
}, []);  // Empty deps means count is captured once
```

Signal-based effects track dependencies automatically:

```tsx
// Solid
createEffect(() => {
  console.log(`Count is now ${count()}`);
  // Automatically re-runs when count changes
  // No dependency array
});

// Cleanup
createEffect((prev) => {
  const id = setInterval(() => setCount(c => c + 1), 1000);
  onCleanup(() => clearInterval(id));
});
```

You can't forget a dependency because you don't list dependencies. The framework knows what you read.

## The Trade-offs

Signals aren't perfect.

**1. Calling Functions vs. Reading Properties**

In Solid, signals are functions: `count()`. In Preact, they're `.value`. Either way, there's ceremony that React's `count` doesn't have.

This matters when destructuring:
```tsx
// React
const { count } = props;  // Fine, it's a value

// Solid
const { count } = props;  // Broken! You destructured a function reference
```

Solid requires you to pass functions around carefully. It's a learning curve.

**2. Mental Model Shift**

React developers think in "re-render the world, diff the differences." Signal developers think in "what exactly depends on what?"

The signal model is arguably more correct, but it's different. Teams need to learn new patterns.

**3. Ecosystem**

React's ecosystem is massive. Signal-based frameworks are smaller. Component libraries, tutorials, Stack Overflow answers—React still wins on sheer volume.

**4. Debugging**

React DevTools show you component state at a glance. Signal debugging tools are newer and less mature. Tracking why a signal updated can be harder than understanding why a component re-rendered.

## Should React Adopt Signals?

This is the spicy question. The React team has been clear: they think the compiler (auto-memoization) is the answer, not signals.

Their argument: React's model is simpler conceptually. You write code that describes UI as a function of state. The framework optimizes it. You don't have to think about what subscribes to what.

Counter-argument: The React compiler has been "coming soon" for years. Meanwhile, `useMemo`/`useCallback` fatigue is real, and framework benchmarks keep showing signal-based alternatives as faster.

My take: React won't adopt signals. It would be too breaking. But the ecosystem is speaking—Preact's signals, Million.js, Legend State—people are bolting fine-grained reactivity onto React because they want it.

## What I Actually Use

For new projects where I control the stack, I've been reaching for Solid more often. The performance is better, the reactivity model is cleaner, and the ecosystem has matured.

For work (ON24), we're React. The ecosystem and team expertise matter more than benchmark numbers.

For learning: if you've only used React, spend a weekend with Solid or Svelte 5. Understanding signals will make you a better React developer—you'll understand what React is abstracting (and what it costs).

The trend is clear: signals are the primitive the web is converging on. Even if React never adopts them directly, understanding them is understanding where frontend development is heading.

---

*Ryan Carniato (Solid's creator) has excellent talks explaining signals. Worth watching even if you never use Solid.*
