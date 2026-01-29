---
title: "I Built an iTunes 7 Clone Because Modern Music Apps Lost Their Soul"
excerpt: "Brushed metal, glowing LCDs, column browsers. A deep dive into how I recreated the peak of 2006 Apple design using Next.js, CSS gradients, and the Web Audio API."
category: deep-dives
publishedAt: 2026-01-26
tags:
  - React
  - CSS
  - Design
  - Nostalgia
  - Next.js
  - Frontend Engineering
coverImage: /blog/building-itunes-7-clone-nextjs.svg
featured: true
seo:
  title: "Building an iTunes 7 Clone in Next.js | A Technical Deep Dive"
  description: "A 3,000 word deep dive into recreating iTunes 7. Covers complex CSS gradients, recreating skeuomorphic design, Web Audio API state management, and virtualized list performance."
  keywords: ["iTunes 7 clone", "Next.js music player", "skeuomorphic design css", "web audio api react", "css gradients brushed metal"]
---

# I Built an iTunes 7 Clone Because Modern Music Apps Lost Their Soul

I was staring at Spotify the other day — this flat, dark void with tiny album art and text that's actively hostile to my aging eyes — and I thought: *What happened?*

Music apps used to be **beautiful**. Not "minimalist beautiful" or "clean beautiful." Actually, genuinely, delightfully beautiful. Textured. Detailed. Full of little touches that made you want to look at them.

iTunes 7, released in September 2006, was the peak. It introduced Cover Flow, gapless playback, and refined the "Brushed Metal" aesthetic that defined an era of computing. It felt like a physical machine. The buttons had weight. The LCD glowed. The scrollbars had depth.

So I embarked on a slightly obsessive quest: I built [GemTunes](https://gemtunes.vercel.app), a faithful recreation of that brushed metal era, running entirely in the browser with Next.js.

This isn't just a nostalgic screenshot; it's a fully functional music player. And building it in 2026 taught me more about modern CSS and React performance than any "SaaS Dashboard" tutorial ever could.

## The Aesthetic: Why Skeuomorphism Matters

Before we look at code, we have to talk about design philosophy.

Modern design (Flat, Material, Fluent) optimizes for **scalability**. Flat rectangles scale infinitely. They are easy to design, easy to code, and easy to refactor.

Skeuomorphism (making digital objects resemble real-world counterparts) optimizes for **affordance**.
*   In iTunes 7, a button looked like a physical plastic or metal object. You knew you could click it because it had highlights and shadows that suggested 3D volume.
*   The "LCD" display looked like a screen. You knew it was for information, not interaction.
*   The volume slider looked like a physical fader.

We threw this away for "cleanliness," but we lost the intuitive grasp of the interface. Recreating this required fighting against every default in modern web development.

## Challenge 1: The Brushed Metal Texture (Pure CSS)

In 2006, Apple used bitmap images for everything. The window chrome was a sliced PNG.

I wanted GemTunes to be resolution-independent. No images. Pure CSS.

### The Metal Gradient
The iconic "Brushed Metal" isn't a simple linear gradient. It's a complex multi-stop gradient designed to simulate light hitting a rough metallic surface.

```css
.metal-bg {
  background: linear-gradient(
    180deg, 
    #d4d4d4 0%,  /* Top highlight */
    #c0c0c0 3%,   /* Sudden drop to mid-tone */
    #b8b8b8 50%,  /* Slow fade */
    #acacac 97%,  /* Darker bottom */
    #a0a0a0 100%  /* Bottom edge shadow */
  );
  position: relative;
}
```

The magic is in the `3%` stop. It creates a harsh "lip" at the top of the window, simulating the beveled edge of an aluminum casing.

### Adding Noise
A smooth gradient looks like plastic. Metal has grain. To achieve this without a 500KB texture file, I used an SVG noise filter embedded via Data URI, overlaid with `mix-blend-mode`.

```css
.metal-texture::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,..."); /* SVG Noise */
  pointer-events: none;
  mix-blend-mode: multiply;
}
```

This gives the UI that gritty, tactile feel that defined Mac OS X Tiger.

## Challenge 2: The Glowing LCD Display

The centerpiece of iTunes is the status display. It mimics a backlit LCD screen.

**The requirements:**
1.  Dark, slightly blue-black background.
2.  Inner shadow to make it look recessed.
3.  Glassy reflection on the top half.
4.  Text that "glows" like phosphors.
5.  Scanlines.

### The CSS Implementation

```css
.lcd-container {
  /* The dark screen */
  background: linear-gradient(180deg, #1c1c1e 0%, #0f0f10 100%);
  
  /* The recessed casing effect */
  border: 1px solid #3a3a3a;
  border-bottom-color: #5a5a5a; /* Light hits bottom lip */
  border-top-color: #1a1a1a;    /* Shadow on top lip */
  box-shadow: 
    inset 0 3px 6px rgba(0,0,0,0.8), /* Inner deep shadow */
    0 1px 0 rgba(255,255,255,0.3);   /* Bottom highlight on the metal casing */
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

/* The Glass Reflection */
.lcd-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%; /* Only top half */
  background: linear-gradient(
    180deg, 
    rgba(255,255,255,0.1) 0%, 
    rgba(255,255,255,0.02) 100%
  );
  pointer-events: none;
}
```

### The Phosphor Text
Modern fonts are too sharp. An LCD display has "bleed." The pixels light up the surrounding area.

```css
.lcd-text {
  color: #3e3e3e; /* Off state */
}

.lcd-text.active {
  color: #22d962; /* Bright Green */
  text-shadow: 
    0 0 10px rgba(34, 217, 98, 0.5), /* Large diffuse glow */
    0 0 2px rgba(34, 217, 98, 0.8);  /* Tight intense glow */
}
```

## Challenge 3: The Column Browser (State Management)

The defining feature of iTunes navigation is the Column Browser: **Genre > Artist > Album**.
This is a dependent filtering system. Selecting "Rock" in Column A filters Column B to only show Rock artists.

### Data Structure & Performance
I loaded a dataset of 5,000 tracks. Naive filtering in React (`array.filter` on every render) caused noticeable lag on the main thread, especially when dragging the window.

I used **Memoization** heavily.

```typescript
// useLibrary.ts

// 1. Get unique Genres (Cheap, do once)
const genres = useMemo(() => 
  ['All', ...new Set(tracks.map(t => t.genre))].sort(), 
[tracks]);

// 2. Filter Tracks by Selected Genre
const tracksByGenre = useMemo(() => {
  if (selectedGenre === 'All') return tracks;
  return tracks.filter(t => t.genre === selectedGenre);
}, [tracks, selectedGenre]);

// 3. Get Artists from the FILTERED tracks (Dependent)
const artists = useMemo(() => 
  ['All', ...new Set(tracksByGenre.map(t => t.artist))].sort(), 
[tracksByGenre]);
```

This "waterfall" of memos ensures that changing the **Song** selection doesn't re-calculate the **Artist** list. Only changing a parent filter triggers a re-calculation of children.

### Virtualization
Rendering lists of 5,000 items in the DOM is a crash sentence. I used `react-window` to virtualize the main track list.

However, iTunes had "striped" rows (zebra striping). In a virtual list, absolute positioning can mess up the even/odd calculation if you aren't careful. I had to ensure the row index was passed correctly to apply the `.odd` class:

```css
.track-row.odd {
  background-color: #f1f5fa; /* That classic iTunes blue-grey tint */
}
```

## Challenge 4: Audio Engineering (Web Audio API)

HTML5 `<audio>` tag is fine for simple playback, but iTunes had a visualization. To get visualization data, you need the **Web Audio API**.

### The Audio Context Setup
You can't just plug an `<audio>` src in and get frequency data. You have to route it through an `AudioContext`.

```typescript
// audio-engine.ts
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = new Audio();
const source = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();

// Connect the graph
source.connect(analyser);
analyser.connect(audioCtx.destination); // Connect to speakers

// Configure Analyser
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
```

### The Visualizer Loop
To render the little bouncing bars in the LCD, I set up a `requestAnimationFrame` loop.

```typescript
const draw = () => {
  requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);
  
  // dataArray now contains volume levels (0-255) for each frequency band
  // 0 = Bass, 128 = Mids, 255 = Treble
  
  updateVisualizerState(dataArray);
};
```

**Optimization:** Updating React state 60 times a second triggers 60 re-renders. This kills performance.
Instead of React state for the visualizer, I drew directly to a `<canvas>` element overlaid on the LCD. React manages the *presence* of the canvas, but the canvas manages its own pixels. This decoupled the visualization frame rate from the React render cycle.

## Conclusion: What We Lost

Building GemTunes was a lesson in detail.
Every pixel in iTunes 7 was placed with intent. The drop shadows weren't just `box-shadow: 0 2px 4px black`. They were specific gradients to simulate directionality. The active states were carefully crafted inversions.

Modern web development tools (Tailwind, Shadcn) make building *interfaces* fast. But they make building *personality* optional.

When we strip away the textures, the glows, and the metaphors, we remove the friction, yes. But we also remove the joy.

I'm not saying every app should look like a brushed metal toaster. But maybe, just maybe, we should allow ourselves a little bit of soul again.

[Check out the live demo here](https://gemtunes.vercel.app) (and yes, the volume slider really works).