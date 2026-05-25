---
title: "From React to SolidJS: A Practical Comparison"
excerpt: "Exploring the shift from React to SolidJS. A deep dive into signals vs hooks, rendering models, and what it feels like to make the switch."
category: tutorials
publishedAt: 2026-01-27
tags:
  - React
  - SolidJS
  - JavaScript
  - Frontend
coverImage: /blog/react-to-solidjs.svg
featured: false
seo:
  title: "React vs SolidJS: A Practical Developer Comparison"
  description: "A practical guide to transitioning from React to SolidJS. Comparing hooks vs signals, virtual DOM vs fine-grained reactivity, and performance."
  keywords: ["react", "solidjs", "signals", "hooks", "frontend framework", "virtual dom", "reactivity"]
---

# From React to SolidJS: A Practical Comparison

If you've been doing frontend development over the past decade, you likely think in React. The component lifecycle, the dependency arrays in `useEffect`, the virtual DOM reconciliation—it's become second nature. You understand the rules of hooks, you know when to use `useMemo`, and you instinctively recognize when a component is going to re-render.

But recently, there's been a massive shift in the frontend ecosystem. The industry is slowly moving away from the Virtual DOM and towards fine-grained reactivity. At the forefront of this movement is **SolidJS**.

At first glance, SolidJS looks almost exactly like React. It uses JSX. It has components. It has state primitives that look just like hooks. But under the hood, it operates on fundamentally different principles.

If you are a React developer looking at SolidJS, this article will explain exactly what changes when you make the switch, both conceptually and practically.

## The Big Difference: The Rendering Model

To understand SolidJS, you have to unlearn the React rendering lifecycle.

### How React Does It

In React, state changes trigger a re-render of the component and all its children.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  console.log("Component rendered!");

  return (
    <div className="card">
      <h2>Counter Component</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Clicks: {count}
      </button>
    </div>
  );
}
```

Every time you click that button, `"Component rendered!"` prints to the console. React calls the entire `Counter` function again, generates a new Virtual DOM tree, diffs it against the old one, and surgically updates the real DOM where necessary. 

This model is conceptually simple—the UI is a pure function of state—but it can become a performance bottleneck. To fix performance issues, React developers are forced to use `React.memo`, `useCallback`, and `useMemo` to prevent unnecessary re-renders.

### How SolidJS Does It

In Solid, components are just setup functions. They run **exactly once**.

```jsx
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  
  console.log("Component rendered!");

  return (
    <div class="card">
      <h2>Counter Component</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Clicks: {count()}
      </button>
    </div>
  );
}
```

When you click this button, the console log **does not run again**. The component function doesn't execute a second time. 

So how does the UI update?

In SolidJS, the JSX is compiled into direct DOM manipulations. The `count()` call inside the JSX creates a direct reactive subscription to that specific text node in the DOM. When the signal updates, Solid precisely updates *only that text node*. There is no Virtual DOM, no diffing, and no component re-evaluation.

![React vs SolidJS Rendering Models](/blog/react-solidjs-rendering.svg)

This makes SolidJS incredibly fast. It's essentially vanilla JavaScript DOM manipulation with a great developer experience.

## State: Hooks vs. Signals

React's hooks are tied to the render cycle. They must be called unconditionally at the top level of a component. You can't put a `useState` inside an `if` statement.

Solid's signals are independent reactive primitives. They don't care about components at all.

```jsx
import { createSignal } from "solid-js";

// You can create state completely outside a component!
const [globalCount, setGlobalCount] = createSignal(0);

function App() {
  const [localCount, setLocalCount] = createSignal(0);
  
  // Derived state is just a function
  const doubleCount = () => localCount() * 2;
  
  return (
    // ...
  )
}
```

Because signals track their own dependencies automatically (they register dependencies when you invoke them as functions, like `localCount()`), you don't need dependency arrays.

### The End of `useEffect` Headaches

In React, `useEffect` is notoriously difficult to get right. You constantly battle with stale closures and missing dependencies in your `[dependencies]` array.

```jsx
// React
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]); // Forget this, and you get stale data
```

In Solid, you use `createEffect`. It automatically tracks which signals you read inside it.

```jsx
// SolidJS
createEffect(() => {
  // Solid knows this effect depends on `count()` because it was called here.
  document.title = `Count: ${count()}`;
}); // No dependency array needed!
```

This automatic dependency tracking completely eliminates the entire category of "stale closure" bugs that plague React codebases.

## Control Flow: The End of `.map()`

Because Solid components don't re-render, you can't use regular JavaScript array mapping or logical AND `&&` operators like you do in React.

```jsx
// React
return (
  <div>
    {isLoggedIn && <h1>Welcome back!</h1>}
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  </div>
);
```

If you did this in Solid, the `isLoggedIn` evaluation and the `items.map` would run exactly once during the initial component setup, and the DOM would never update when the state changes.

Instead, Solid provides specific control flow components that are optimized to handle reactive lists and conditionals:

```jsx
// SolidJS
import { For, Show } from "solid-js";

return (
  <div>
    <Show when={isLoggedIn()}>
      <h1>Welcome back!</h1>
    </Show>

    <ul>
      <For each={items()}>
        {(item) => <li>{item.name}</li>}
      </For>
    </ul>
  </div>
);
```

These control flow components manage the DOM nodes directly. When an item is added to the `items()` array, the `<For>` component just appends a new `<li>` to the DOM. It doesn't need to diff the whole list.

## Destructuring Props: A Major Gotcha

The biggest hurdle for React developers moving to Solid is learning how to handle props. **Do not destructure your props.**

In React, this is standard:
```jsx
function UserProfile({ name, age }) {
  return <h1>{name} is {age} years old</h1>;
}
```

In Solid, props are implemented as reactive proxy objects. Under the hood, they use JavaScript Getters to track when a prop is accessed. If you destructure the props object, you read the value once and immediately lose the reactivity.

```jsx
// ❌ Bad in SolidJS (Will not update if name changes)
function UserProfile({ name }) {
  return <h1>{name}</h1>; 
}

// ✅ Good in SolidJS (Stays reactive)
function UserProfile(props) {
  return <h1>{props.name}</h1>; 
}
```

If you really need to split or merge props (for instance, when building a UI component library), Solid provides utility functions like `splitProps` and `mergeProps` that preserve reactivity.

## Conclusion

Switching to SolidJS requires unlearning some deeply ingrained React habits. You have to stop thinking in terms of "renders" and "lifecycles", and start thinking in terms of "reactive graphs" and "tracking scopes".

But once it clicks, it feels like a superpower. You never have to worry about `useMemo`, `useCallback`, or dependency arrays again. You get incredible performance out of the box, with a syntax that feels comfortably familiar.

React will continue to dominate the industry for a long time, especially with the push towards React Server Components. But if you love React's component model but hate its client-side performance bottlenecks and hook rules, SolidJS is a breath of fresh air.
