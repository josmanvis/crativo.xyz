---
title: Building Desktop Apps with Tauri and SolidJS
excerpt: Why I switched from Electron to Tauri for native macOS apps, and what I learned building floatnote and josetunes.
category: deep-dives
publishedAt: 2025-01-15
tags:
  - Tauri
  - Rust
  - SolidJS
  - Desktop
  - macOS
featured: true
---

# Building Desktop Apps with Tauri and SolidJS

After years of building web apps at ON24 and before that at the Innovation Lab, I wanted to scratch a different itch—native desktop apps. I'd dabbled with Electron before, but the bundle sizes and memory usage always bothered me. Then I discovered Tauri.

## Why I Made the Switch

At ON24, I work on video conferencing features that need to be performant. That mindset carried over to my side projects. When I saw Tauri apps shipping at 8MB instead of Electron's 150MB, I was sold.

| Metric | Electron | Tauri |
|--------|----------|-------|
| Bundle size | ~150MB | ~8MB |
| Memory usage | ~300MB | ~30MB |
| Startup time | 2-3s | <1s |

Tauri uses your system's native webview instead of bundling Chromium. The Rust backend is fast and memory-efficient—exactly what I wanted.

## Floatnote: Solving My Own Problem

I do a lot of screen recordings and presentations. I kept wanting to draw on screen—circle something, jot a quick note—without switching apps. Nothing I found worked the way I wanted, so I built **floatnote**.

It's a transparent, always-on-top drawing overlay for macOS. You can scribble, highlight, annotate—then clear it and keep going.

```rust
#[tauri::command]
fn set_window_level(window: Window, level: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        window.set_always_on_top(true)?;
    }
    Ok(())
}
```

I published it on npm (`npx floatnote`) and Homebrew. It felt good to ship something people could actually install and use.

## JoseTunes: Scratching the Music Itch

I'm into electronic music—DJing, collecting tracks. I got tired of janky browser extensions and command-line tools for downloading audio from YouTube and SoundCloud. So I built **josetunes**.

It downloads in FLAC or MP3, handles metadata properly, and has a clean UI. The SolidJS frontend stays snappy while Rust handles the heavy lifting—audio processing, file I/O, concurrent downloads.

## Why SolidJS Over React

I've been writing React since my Innovation Lab days. It's what I use at ON24. But for these personal projects, I wanted to try something different.

SolidJS clicked for me because:

1. **No Virtual DOM** — Updates go straight to the DOM
2. **Tiny bundle** — ~7KB vs React's ~40KB
3. **Familiar syntax** — JSX, components, hooks-like primitives

```tsx
const [tracks, setTracks] = createSignal<Track[]>([]);

const downloadTrack = async (url: string) => {
  setDownloading(true);
  const result = await invoke('download_audio', { url });
  setTracks(prev => [...prev, result]);
  setDownloading(false);
};
```

It's not replacing React for my day job, but for side projects where I control the stack? It's a joy.

## What I Learned

1. **Rust isn't as scary as it looks** — The borrow checker yells at you, but it catches real bugs
2. **Ship early** — I published floatnote before it was "done" and got useful feedback
3. **Solve your own problems** — The best side projects come from genuine needs

If you're building desktop apps in 2025, give Tauri a look. The developer experience has gotten really good.
