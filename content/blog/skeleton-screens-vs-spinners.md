---
title: "Skeleton Screens vs. Spinners: Lying to Users Responsibly"
excerpt: "A spinner says 'please wait, something is happening, probably.' A skeleton says 'here's what's coming.' Same wait, completely different feeling. Here's when to use which."
category: deep-dives
publishedAt: "2026-06-10"
tags:
  - ui-design
  - performance
  - css
featured: false
---

Your API takes 800 milliseconds. You can't make it faster today. What you *can* change is how those 800 milliseconds **feel**, and that's where the spinner vs. skeleton debate comes in.

## The spinner

A spinner is the universal symbol for "something is happening." It's simple, it works everywhere, and it has one big problem: **it tells the user nothing**.

How long will this take? What's coming? Is it stuck? The spinner doesn't know. It just spins, forever, with the confidence of someone giving directions to a place they've never been.

Staring at a spinner makes you *watch time pass*. And watched time feels longer.

## The skeleton

A **skeleton screen** shows a gray outline of the layout that's about to appear: blocks where the image goes, bars where the text goes. When the data arrives, the real content fills in.

It works because:

- **It shows progress immediately.** The page "loaded." Only the details are pending.
- **It sets expectations.** The user already knows the shape of what's coming and can plan where to look.
- **It prevents layout shift.** If the skeleton matches the real layout, nothing jumps when content arrives.

## When to use which

**Use a skeleton when:**
- you're loading a page or a region **whose layout you know** (feeds, lists, cards, profiles)
- the wait is likely to be noticeable, but not huge

**Use a spinner (or a progress bar) when:**
- the result's shape is **unknown**
- it's a **small, local action**, like a button that's submitting
- it's a long task, where a real **progress bar with a percentage** is much better than either

**Use nothing when:**
- the wait is very short. Flashing a loader for 100 ms is worse than no loader, because it reads as a flicker. A common trick is to delay showing any loading state by a couple hundred milliseconds, so fast responses never show one.

## Building a skeleton that doesn't lie

The cardinal sin of skeletons is a **mismatch**: a skeleton with three lines that turns into content with seven, a square image placeholder for a wide image. Then everything jumps on load, and you've added layout shift instead of preventing it.

Build the skeleton from the same layout as the real component:

```css
.skeleton {
  background: linear-gradient(90deg, #e7e4da 0%, #f1efe8 50%, #e7e4da 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
  border-radius: 2px;
}

@keyframes shimmer {
  from { background-position: 100% 0; }
  to   { background-position: -100% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

```tsx
function PostRow({ post }: { post?: Post }) {
  return (
    <article className="post-row">
      {post ? <h3>{post.title}</h3> : <div className="skeleton" style={{ height: 24, width: '70%' }} />}
      {post ? <p>{post.excerpt}</p> : <div className="skeleton" style={{ height: 16, width: '90%' }} />}
    </article>
  );
}
```

Same component, same container, same sizes. Loaded or not, the row takes up the same space.

And yes, the shimmer stops for people who asked for reduced motion. A static gray block is still a perfectly good skeleton.

## Don't skeleton everything

Skeletons are a tool, not a religion. A page made entirely of pulsing gray boxes for three seconds feels just as slow as a spinner, just more stylish about it.

The real fix for slow loading is still to load less, cache more and show what you already have. If the user saw this list ten seconds ago, show that cached version instantly and refresh it in the background.

Skeletons make waiting feel better. Not waiting feels best of all.
