---
title: From React to SolidJS - A Practical Comparison
excerpt: After years of React, I tried SolidJS for my side projects. Here's what surprised me.
category: tutorials
publishedAt: 2025-01-29
tags:
  - React
  - SolidJS
  - JavaScript
  - Frontend
---

# From React to SolidJS: A Practical Comparison

I've been writing React since 2016. It's what I use at ON24, what I used at the Innovation Lab, what I know inside and out. But for my recent Tauri projects—floatnote, josetunes, setch—I tried SolidJS instead.

Here's my honest comparison after shipping real apps with both.

## The Familiar Parts

SolidJS feels like React. JSX, components, props—it's all there:

```tsx
// React
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// SolidJS
function Counter() {
  const [count, setCount] = createSignal(0);
  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
}
```

Spot the differences:
- `useState` → `createSignal`
- `count` → `count()` (it's a function)

That's the biggest syntax change. If you know React, you can read SolidJS.

## The Different Parts

### No Virtual DOM

React re-renders components and diffs a virtual DOM. SolidJS compiles your JSX to direct DOM operations. Components run once—only the reactive parts update.

This matters for performance. In josetunes, I have a list of tracks updating in real-time during downloads. With React, I'd worry about unnecessary re-renders. With Solid, only the changing text nodes update.

### Signals vs State

React's `useState` returns a value. Solid's `createSignal` returns a getter function:

```tsx
// React - value
const [name, setName] = useState('Jose');
console.log(name); // 'Jose'

// Solid - getter
const [name, setName] = createSignal('Jose');
console.log(name()); // 'Jose'
```

This threw me at first. But it's what enables fine-grained reactivity—Solid tracks where you call `name()` and only updates those spots.

### Effects

```tsx
// React
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

// Solid
createEffect(() => {
  document.title = `Count: ${count()}`;
});
```

No dependency array. Solid automatically tracks what you read inside the effect.

## What I Like Better

### 1. No Dependency Arrays

I don't miss `useEffect` dependency arrays. Solid just knows what to track.

### 2. Smaller Bundle

SolidJS is ~7KB. React + ReactDOM is ~40KB. For Tauri apps where I control everything, smaller is better.

### 3. True Reactivity

```tsx
// This component never re-runs after mount
function App() {
  const [count, setCount] = createSignal(0);
  
  console.log('render'); // Only logs once!
  
  return <div>{count()}</div>;
}
```

In React, that log would fire on every state change. In Solid, the component body runs once; only the `{count()}` expression updates.

## What I Miss

### 1. Ecosystem

React has a library for everything. Solid's ecosystem is growing but smaller. I've had to build things myself or port React libraries.

### 2. Tooling

React DevTools is mature. Solid's devtools exist but aren't as polished.

### 3. Team Knowledge

At ON24, everyone knows React. For work projects, React is the obvious choice. Solid is for my personal stuff where I can experiment.

## When to Use Which

**Use React when:**
- Working with a team
- Need the ecosystem
- Building for a company

**Use SolidJS when:**
- Personal projects
- Performance matters
- Bundle size matters (Tauri, edge)
- You want to learn something new

## My Verdict

SolidJS isn't replacing React in my work life. But for side projects—especially Tauri apps where performance and bundle size matter—it's become my default.

The learning curve is gentle if you know React. Give it a weekend project and see how it feels.
