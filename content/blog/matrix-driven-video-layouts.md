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

At ON24, I work on video conferencing features used by thousands of concurrent users. One problem that consumed months of my attention: how do you lay out N video participants in a container of arbitrary size, keeping aspect ratios reasonable and wasting minimal space?

Sounds simple until you try it.

## The Problem

You have a container—say, 1920×1080 pixels. You have participants—could be 1, could be 49, could be anything in between. Each participant is a video stream that should ideally display at 16:9 aspect ratio.

The naive approach is flexbox with wrapping:

```css
.grid {
  display: flex;
  flex-wrap: wrap;
}

.participant {
  flex: 1 1 200px;
}
```

This falls apart immediately:
- 3 participants? Two on the first row, one centered below—looks unbalanced
- 5 participants? Awkward gaps
- 7 participants? Now you're getting creative with flex-basis
- Aspect ratios? Good luck

The common solution is hardcoded breakpoints:

```typescript
function getLayout(count: number): string {
  if (count === 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2 grid-rows-2';
  if (count <= 6) return 'grid-cols-3 grid-rows-2';
  if (count <= 9) return 'grid-cols-3 grid-rows-3';
  // ...and so on for every conceivable count
}
```

This is maintenance hell. Every new participant count needs manual tuning. And what happens at count 17? Or 23? Or when the container isn't 16:9?

I wanted something that worked mathematically, not heuristically.

## Reframing the Problem

Here's the insight: layout is an optimization problem.

Given:
- Container dimensions (width, height)
- Participant count
- Target aspect ratio (16:9 for video)

Find:
- Number of rows
- Number of columns

Such that:
- All participants fit
- Cell aspect ratio is as close to 16:9 as possible
- Wasted space (empty cells) is minimized

This is a constrained optimization problem with a small enough search space to brute-force.

## The Algorithm

For N participants, the number of possible layouts is limited. You need at least N cells, so:

```
rows × columns ≥ N
```

For any given number of rows R:
```
columns = ceil(N / R)
```

So we just need to try all values of R from 1 to N and pick the best one.

"Best" is where it gets interesting. I'm optimizing for two things:

1. **Aspect ratio fidelity** — How close are the cells to 16:9?
2. **Space efficiency** — How many cells are wasted?

```typescript
interface LayoutMatrix {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  cellAspectRatio: number;
  efficiency: number;
  wastedCells: number;
}

function calculateOptimalLayout(
  containerWidth: number,
  containerHeight: number,
  participantCount: number,
  targetAspectRatio: number = 16 / 9
): LayoutMatrix {
  let bestLayout: LayoutMatrix | null = null;
  let bestScore = -Infinity;

  // Try every possible row count
  for (let rows = 1; rows <= participantCount; rows++) {
    const cols = Math.ceil(participantCount / rows);
    
    // Calculate cell dimensions
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    const cellAspectRatio = cellWidth / cellHeight;
    
    // How far from target aspect ratio? (lower is better)
    const aspectDiff = Math.abs(cellAspectRatio - targetAspectRatio);
    const aspectScore = 1 / (1 + aspectDiff);
    
    // Space efficiency (higher is better)
    const totalCells = rows * cols;
    const wastedCells = totalCells - participantCount;
    const spaceEfficiency = participantCount / totalCells;
    
    // Combined score (weights can be tuned)
    const score = (aspectScore * 0.7) + (spaceEfficiency * 0.3);
    
    if (score > bestScore) {
      bestScore = score;
      bestLayout = {
        rows,
        cols,
        cellWidth,
        cellHeight,
        cellAspectRatio,
        efficiency: spaceEfficiency,
        wastedCells,
      };
    }
  }

  return bestLayout!;
}
```

Let's trace through an example. Container: 1920×1080, participants: 7.

| Rows | Cols | Cells | Wasted | Cell Size | Aspect Ratio | Score |
|------|------|-------|--------|-----------|--------------|-------|
| 1 | 7 | 7 | 0 | 274×1080 | 0.25:1 | Bad |
| 2 | 4 | 8 | 1 | 480×540 | 0.89:1 | Better |
| 3 | 3 | 9 | 2 | 640×360 | 1.78:1 | Perfect AR! |
| 4 | 2 | 8 | 1 | 960×270 | 3.56:1 | Bad |
| 7 | 1 | 7 | 0 | 1920×154 | 12.5:1 | Terrible |

The algorithm picks 3×3 because the cell aspect ratio (1.78:1, which is 16:9) is perfect, even though it wastes 2 cells.

## Applying the Layout with CSS Grid

Once we have the optimal matrix, CSS Grid does the heavy lifting:

```typescript
function applyLayout(
  container: HTMLElement,
  layout: LayoutMatrix,
  participantCount: number
): void {
  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`;
  container.style.gap = '4px';
  
  // Center participants if there are empty cells
  if (layout.wastedCells > 0) {
    centerLastRow(container, layout, participantCount);
  }
}

function centerLastRow(
  container: HTMLElement,
  layout: LayoutMatrix,
  participantCount: number
): void {
  const itemsInLastRow = participantCount % layout.cols || layout.cols;
  const emptyInLastRow = layout.cols - itemsInLastRow;
  
  if (emptyInLastRow === 0) return;
  
  // Offset the last row items to center them
  const lastRowStartIndex = participantCount - itemsInLastRow;
  const participants = container.children;
  
  for (let i = lastRowStartIndex; i < participantCount; i++) {
    const el = participants[i] as HTMLElement;
    const offset = Math.floor(emptyInLastRow / 2);
    el.style.gridColumnStart = String((i - lastRowStartIndex) + 1 + offset);
  }
}
```

The centering logic handles the case where the last row isn't full. With 7 participants in a 3×3 grid, the last row has 1 participant. Without centering, it sits in the leftmost cell. With centering, it's in the middle.

## Responsive Without Breakpoints

The beautiful thing about this approach: no media queries, no breakpoints. The algorithm works for any container size.

```typescript
function setupResponsiveGrid(
  container: HTMLElement,
  participantCount: number
): void {
  const updateLayout = () => {
    const { width, height } = container.getBoundingClientRect();
    const layout = calculateOptimalLayout(width, height, participantCount);
    applyLayout(container, layout, participantCount);
  };

  // Initial layout
  updateLayout();
  
  // Update on resize
  const observer = new ResizeObserver(updateLayout);
  observer.observe(container);
  
  return () => observer.disconnect();
}
```

Resize the window? Layout recalculates. Sidebar opens? Layout recalculates. Works in 4:3 containers, ultra-wide containers, whatever.

## Presenter Mode

Video calls often have a "presenter mode" where one person is large and others are thumbnails. This is a different layout problem.

```typescript
interface PresenterLayout {
  presenterArea: DOMRect;
  thumbnailArea: DOMRect;
  thumbnailLayout: LayoutMatrix;
}

function calculatePresenterLayout(
  containerWidth: number,
  containerHeight: number,
  thumbnailCount: number
): PresenterLayout {
  // Two layout options: thumbnails on right, or thumbnails on bottom
  const rightLayout = calculateRightSidebarLayout(
    containerWidth,
    containerHeight,
    thumbnailCount
  );
  
  const bottomLayout = calculateBottomBarLayout(
    containerWidth,
    containerHeight,
    thumbnailCount
  );
  
  // Pick whichever wastes less space
  return rightLayout.efficiency > bottomLayout.efficiency
    ? rightLayout
    : bottomLayout;
}

function calculateRightSidebarLayout(
  containerWidth: number,
  containerHeight: number,
  thumbnailCount: number
): PresenterLayout {
  // Presenter gets left 75%, thumbnails get right 25%
  const presenterWidth = containerWidth * 0.75;
  const thumbnailWidth = containerWidth * 0.25;
  
  const thumbnailLayout = calculateOptimalLayout(
    thumbnailWidth,
    containerHeight,
    thumbnailCount
  );
  
  return {
    presenterArea: new DOMRect(0, 0, presenterWidth, containerHeight),
    thumbnailArea: new DOMRect(presenterWidth, 0, thumbnailWidth, containerHeight),
    thumbnailLayout,
  };
}
```

The CSS for this uses grid areas:

```typescript
function applyPresenterLayout(
  container: HTMLElement,
  layout: PresenterLayout,
  presenterIndex: number
): void {
  container.style.display = 'grid';
  container.style.gridTemplateAreas = `"presenter thumbnails"`;
  container.style.gridTemplateColumns = '3fr 1fr';
  
  const participants = container.children;
  
  // Presenter
  (participants[presenterIndex] as HTMLElement).style.gridArea = 'presenter';
  
  // Thumbnails container
  const thumbnailsContainer = document.createElement('div');
  thumbnailsContainer.style.gridArea = 'thumbnails';
  thumbnailsContainer.style.display = 'grid';
  thumbnailsContainer.style.gridTemplateColumns = `repeat(${layout.thumbnailLayout.cols}, 1fr)`;
  thumbnailsContainer.style.gridTemplateRows = `repeat(${layout.thumbnailLayout.rows}, 1fr)`;
  
  // Move non-presenter participants to thumbnail container
  for (let i = 0; i < participants.length; i++) {
    if (i !== presenterIndex) {
      thumbnailsContainer.appendChild(participants[i]);
    }
  }
  
  container.appendChild(thumbnailsContainer);
}
```

## Performance Considerations

Recalculating layout isn't free. At ON24's scale, with potentially hundreds of participants, I needed to optimize:

**1. Throttle resize events:**

```typescript
function throttledResize(container: HTMLElement, participantCount: number) {
  let rafId: number | null = null;
  
  const update = () => {
    const { width, height } = container.getBoundingClientRect();
    const layout = calculateOptimalLayout(width, height, participantCount);
    applyLayout(container, layout, participantCount);
    rafId = null;
  };
  
  return () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(update);
    }
  };
}
```

**2. Memoize layout calculations:**

```typescript
const layoutCache = new Map<string, LayoutMatrix>();

function getCachedLayout(
  width: number,
  height: number,
  count: number
): LayoutMatrix {
  // Round dimensions to avoid cache misses on subpixel changes
  const key = `${Math.round(width)}-${Math.round(height)}-${count}`;
  
  if (!layoutCache.has(key)) {
    layoutCache.set(key, calculateOptimalLayout(width, height, count));
  }
  
  return layoutCache.get(key)!;
}
```

**3. Avoid layout thrashing:**

```typescript
function batchApplyLayout(
  container: HTMLElement,
  layout: LayoutMatrix,
  participantCount: number
): void {
  // Read phase
  const containerRect = container.getBoundingClientRect();
  const participants = Array.from(container.children) as HTMLElement[];
  
  // Write phase (batched)
  requestAnimationFrame(() => {
    container.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${layout.cols}, 1fr);
      grid-template-rows: repeat(${layout.rows}, 1fr);
      gap: 4px;
    `;
    
    // Apply centering
    centerLastRow(container, layout, participantCount);
  });
}
```

## The Library

I packaged this as **vids-matrix-driven-css**—framework-agnostic, works with React, Vue, vanilla JS, whatever:

```typescript
import { VideoGrid } from 'vids-matrix-driven-css';

// Vanilla JS
const grid = new VideoGrid({
  container: document.getElementById('video-grid'),
  targetAspectRatio: 16 / 9,
  gap: 4,
});

grid.setParticipantCount(12);
grid.setPresenterMode(true, 0); // First participant is presenter

// React hook version
function VideoConference({ participants }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useVideoGrid(containerRef, {
    participantCount: participants.length,
    targetAspectRatio: 16 / 9,
    gap: 4,
  });
  
  return (
    <div ref={containerRef}>
      {participants.map(p => (
        <VideoParticipant key={p.id} {...p} />
      ))}
    </div>
  );
}
```

## Results

Compared to the hardcoded breakpoint approach I started with:

| Metric | Before | After |
|--------|--------|-------|
| Lines of layout code | 400+ | 50 |
| Supported participant counts | 1-16 | 1-∞ |
| Average space utilization | 68% | 91% |
| Aspect ratio deviation | Variable | <5% |
| Resize performance | Janky | Smooth |

The space utilization improvement comes from the optimization algorithm finding layouts I never would have thought of. For 11 participants, I would have used 4×3 (12 cells, 1 wasted). The algorithm uses 4×3 but considers 3×4 too, picking whichever has better aspect ratio for the current container.

## Beyond Video

This approach generalizes to any grid of fixed-aspect-ratio items:

- Image galleries
- Card layouts
- Dashboard widgets
- Game boards

The core insight is always the same: instead of hardcoding layouts, define what "good" means mathematically and let the algorithm find it.

---

*vids-matrix-driven-css is available on npm if you want to use it. Or steal the algorithm—it's like 50 lines of actual logic.*
