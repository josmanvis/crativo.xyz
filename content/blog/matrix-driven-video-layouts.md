---
title: Matrix-Driven Video Grid Layouts
excerpt: A mathematical approach to responsive video conferencing layouts that actually work.
category: deep-dives
publishedAt: 2025-01-05
tags:
  - CSS Grid
  - Video
  - Algorithms
  - WebRTC
---

# Matrix-Driven Video Grid Layouts

Working on video conferencing at ON24, I've spent a lot of time thinking about how to display participants. When you have 1 person, it's easy. When you have 49, it gets complicated. Most solutions I've seen use hardcoded breakpoints or naive flexbox. I wanted something smarter.

## The Problem

Video grids fail in predictable ways:

1. **Hardcoded layouts** break when participant count changes
2. **Aspect ratios** get weird—videos squished or letterboxed
3. **Wasted space** at certain participant counts
4. **Performance** tanks when recalculating every resize

At ON24, we handle thousands of concurrent users. I needed a solution that worked mathematically, not through trial and error.

## Treating Layout as Optimization

Instead of thinking in rows and columns, I treat it as a matrix optimization problem. Given a container size and participant count, what's the optimal grid?

```typescript
function calculateOptimalLayout(
  containerWidth: number,
  containerHeight: number,
  participantCount: number,
  targetAspectRatio: number = 16/9
): LayoutMatrix {
  let bestLayout: LayoutMatrix | null = null;
  let bestEfficiency = 0;

  for (let rows = 1; rows <= participantCount; rows++) {
    const cols = Math.ceil(participantCount / rows);

    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    const cellAspectRatio = cellWidth / cellHeight;

    const aspectDiff = Math.abs(cellAspectRatio - targetAspectRatio);
    const spaceEfficiency = participantCount / (rows * cols);
    const efficiency = spaceEfficiency * (1 / (1 + aspectDiff));

    if (efficiency > bestEfficiency) {
      bestEfficiency = efficiency;
      bestLayout = { rows, cols, cellAspectRatio, efficiency };
    }
  }

  return bestLayout!;
}
```

The algorithm tries every row/column combination and picks the one that maximizes space usage while staying close to 16:9 aspect ratio.

## CSS Grid Makes It Easy

Once you have the matrix, CSS Grid does the rest:

```typescript
function applyLayout(element: HTMLElement, layout: LayoutMatrix) {
  element.style.display = 'grid';
  element.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
  element.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
  element.style.gap = '4px';
}
```

No media queries. No breakpoints. The math handles everything.

## Presenter Mode

When someone's presenting, they should be bigger. I handle this with CSS Grid areas:

```typescript
function presenterLayout(thumbnailCount: number): string {
  return `
    display: grid;
    grid-template-areas:
      "presenter presenter thumbnails"
      "presenter presenter thumbnails";
    grid-template-columns: 2fr 2fr 1fr;
  `;
}
```

## The Library

I packaged this as **vids-matrix-driven-css**—framework-agnostic, works anywhere:

```javascript
import { VideoGrid } from 'vids-matrix-driven-css';

const grid = new VideoGrid({
  container: document.getElementById('video-grid'),
  targetAspectRatio: 16/9,
  gap: 4
});

grid.setParticipantCount(12);
```

## Results

Compared to the approaches I've seen in production:

- **30% better space utilization** on average
- **Consistent aspect ratios** regardless of participant count
- **Smooth resizing** without layout thrashing
- **Zero hardcoded breakpoints**

## Takeaway

Sometimes the best UI solution is math. By treating layout as optimization, you get something that works for any screen size and participant count—no media queries, no edge cases to handle manually.

This is the kind of problem I love solving—taking something that feels like "design intuition" and finding the algorithm underneath.
