---
title: "I Built an iTunes 7 Clone Because Modern Music Apps Lost Their Soul"
excerpt: Brushed metal, glowing LCD, column browser. Here's how I recreated peak Apple design in Next.js.
category: deep-dives
publishedAt: 2026-01-26
tags:
  - React
  - CSS
  - Design
  - Nostalgia
coverImage: /blog/building-itunes-7-clone-nextjs.svg
featured: true
---

# I Built an iTunes 7 Clone Because Modern Music Apps Lost Their Soul

I was staring at Spotify the other day — this flat, dark void with tiny album art and text that's actively hostile to my aging eyes — and I thought: *What happened?*

Music apps used to be **beautiful**. Not "minimalist beautiful" or "clean beautiful." Actually, genuinely, delightfully beautiful. Textured. Detailed. Full of little touches that made you want to look at them.

iTunes 7 was the peak. Fight me.

So I built [GemTunes](https://gemtunes.vercel.app) — a faithful recreation of that brushed metal era, running entirely in the browser with Next.js.

## Why iTunes 7?

Released in 2006, iTunes 7 represented the pinnacle of Apple's "brushed metal" design language. Before iOS flattened everything into colored rectangles, Apple's apps had *texture*:

- **Brushed metal backgrounds** with subtle gradients
- **Glowing LCD displays** that felt like real hardware
- **Aqua-style buttons** with depth and shine
- **Column browsers** that actually showed your music library's structure

It wasn't just nostalgia goggles. This design worked. You could *see* the hierarchy. You could *feel* the controls. The green LCD wasn't just showing text — it was glowing, like real LED segments.

Modern apps optimize for "content density" and "reduced visual noise." What we lost was personality.

## The Technical Challenge

Recreating 2006-era desktop UI in 2026-era web tech is... interesting.

### The Brushed Metal Effect

The original brushed metal was a bitmap texture. I recreated it with pure CSS gradients:

```css
.app {
  background: linear-gradient(180deg, 
    #d4d4d4 0%, 
    #c0c0c0 3%, 
    #b8b8b8 50%, 
    #acacac 97%, 
    #a0a0a0 100%
  );
}

.controls {
  background: linear-gradient(180deg, 
    #d8d8d8 0%, 
    #c4c4c4 3%, 
    #b8b8b8 50%, 
    #acacac 97%, 
    #9c9c9c 100%
  );
  border-bottom: 1px solid #6a6a6a;
}
```

The trick is the uneven gradient stops. Real brushed metal isn't a smooth fade — it has bands of lighter and darker areas. Those 3% and 97% stops create that effect.

### The LCD Display

This was the fun part. The original iTunes LCD had:
- A dark, slightly blue-black background
- Green phosphor-style text
- A subtle glow effect
- Actual scanlines

```css
.lcd {
  background: linear-gradient(180deg, #1c1c1e 0%, #0f0f10 100%);
  border: 1px solid #000;
  border-radius: 3px;
  box-shadow: 
    inset 0 1px 3px rgba(0,0,0,0.8),
    inset 0 -1px 1px rgba(255,255,255,0.05),
    0 1px 0 rgba(255,255,255,0.2);
}

.lcd-title {
  color: #22d962;
  text-shadow: 
    0 0 8px rgba(34, 217, 98, 0.7),
    0 0 2px rgba(34, 217, 98, 0.9);
}

/* The scanline effect */
.lcd::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 1px,
    rgba(0,0,0,0.15) 1px,
    rgba(0,0,0,0.15) 2px
  );
  pointer-events: none;
}
```

The `text-shadow` does the heavy lifting for the glow. Two shadows — one large and diffuse (8px blur), one tight and bright (2px blur) — creates that CRT phosphor look.

### Aqua Buttons

Those 2006 Mac buttons had *depth*. They weren't flat rectangles with rounded corners. They had:
- A highlight at the top (light source from above)
- A subtle shadow at the bottom
- A distinct pressed state that actually looked pressed

```css
.pb-btn {
  background: linear-gradient(180deg, 
    #f4f4f4 0%, 
    #e8e8e8 20%,
    #d8d8d8 45%, 
    #c4c4c4 55%, 
    #d0d0d0 80%,
    #e0e0e0 100%
  );
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.9),
    inset 0 -1px 0 rgba(0,0,0,0.05),
    0 1px 1px rgba(0,0,0,0.15);
}

.pb-btn:active { 
  background: linear-gradient(180deg, 
    #c8c8c8 0%, 
    #b8b8b8 50%,
    #c0c0c0 100%
  );
  box-shadow: 
    inset 0 1px 2px rgba(0,0,0,0.2),
    inset 0 -1px 0 rgba(255,255,255,0.3);
}
```

The active state inverts the gradient and moves the shadows inward. It's a small thing, but it makes clicking feel *real*.

## The Column Browser

This is what I miss most about old iTunes. The three-column browser let you drill down through your library: Genre → Artist → Album. Each column filtered the next.

The implementation is deceptively simple:

```tsx
const genres = ['All', ...new Set(tracks.map(t => t.genre))];
const filteredByGenre = tracks.filter(t => 
  !selectedGenre || selectedGenre === 'All' || t.genre === selectedGenre
);
const artists = ['All', ...new Set(filteredByGenre.map(t => t.artist))];
// ...and so on
```

Each column derives from the filtered results of the previous one. Select "Rock" in Genre, and Artist only shows rock artists. Select "Led Zeppelin" and Album only shows their albums.

It's hierarchical navigation that makes *sense*. Modern music apps hide this structure behind search and "smart" recommendations. Sometimes you just want to browse.

## Audio Handling

The Web Audio API is powerful but overkill for basic playback. I went with a plain `<audio>` element:

```tsx
const audio = useRef<HTMLAudioElement>(null);

const play = useCallback((track: Track) => {
  if (audio.current) {
    if (current?.id !== track.id) {
      audio.current.src = track.url;
      setCurrent(track);
    }
    audio.current.play();
    setPlaying(true);
  }
}, [current]);
```

Event listeners handle time updates and track completion:

```tsx
useEffect(() => {
  const a = audio.current;
  if (!a) return;
  
  const onTime = () => setTime(a.currentTime);
  const onEnd = () => {
    const i = filtered.findIndex(t => t.id === current?.id);
    if (i < filtered.length - 1) play(filtered[i + 1]);
    else setPlaying(false);
  };
  
  a.addEventListener('timeupdate', onTime);
  a.addEventListener('ended', onEnd);
  return () => {
    a.removeEventListener('timeupdate', onTime);
    a.removeEventListener('ended', onEnd);
  };
}, [current, filtered]);
```

The `ended` event auto-advances to the next track in the filtered list. Just like iTunes did.

## The Playing Animation

You know that little equalizer animation next to the currently playing track? Three bars bouncing at different rates?

```css
.playing-icon {
  display: inline-flex;
  align-items: flex-end;
  gap: 1px;
  height: 10px;
}

.playing-icon span {
  width: 2px;
  background: currentColor;
  animation: eq 0.4s ease infinite alternate;
}

.playing-icon span:nth-child(1) { height: 40%; }
.playing-icon span:nth-child(2) { height: 70%; animation-delay: 0.1s; }
.playing-icon span:nth-child(3) { height: 50%; animation-delay: 0.2s; }

@keyframes eq {
  to { transform: scaleY(0.5); }
}
```

Three `<span>` elements, staggered animation delays, and `scaleY` for the bounce. Simple, but it adds life.

## What I Learned

**CSS can do more than we give it credit for.** Gradients, shadows, and pseudo-elements can recreate complex textures without images. The entire brushed metal effect is pure CSS.

**Old design wasn't worse, just different.** Skeuomorphism had real UX benefits: affordances were obvious, state was visible, depth guided attention. Flat design traded these for simplicity.

**Nostalgia is a valid design choice.** Not everything needs to look like it was designed yesterday. Sometimes the old way *was* better for what you're building.

## Try It

GemTunes is live at [gemtunes.vercel.app](https://gemtunes.vercel.app). Drop some MP3s in and experience music browsing like it's 2006.

The code is straightforward Next.js with zero external dependencies beyond Lucide icons. All styling is vanilla CSS. No component libraries, no CSS-in-JS, no animation frameworks.

Sometimes the best way to appreciate modern tools is to remember what came before.
