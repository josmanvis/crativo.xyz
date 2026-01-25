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
coverImage: /blog/tauri-solidjs.svg
---

# Building Desktop Apps with Tauri and SolidJS

I've been building web apps for over a decade. React at ON24, React at the Innovation Lab before that. The browser is my comfort zone. But lately I've been obsessed with something different—native desktop apps that feel like they belong on your machine.

The journey started with a simple frustration: I was doing a screen recording, needed to circle something, and couldn't find a single tool that didn't suck. That frustration became floatnote. Then I got tired of sketchy browser extensions for downloading music, and josetunes was born.

Both apps taught me something important: the web stack can build incredible desktop experiences—if you pick the right foundation.

## The Electron Problem

My first instinct was Electron. It's what everyone uses. VS Code, Slack, Discord, Figma's desktop app—they're all Electron. There's clearly something there.

So I built a prototype. It worked. And then I looked at the bundle size: 156MB. For a floating window that draws lines. I checked memory usage while it was running: 280MB. For a transparent overlay.

The thing about Electron is that you're shipping an entire copy of Chromium with your app. That's fine for something like VS Code where the power justifies the weight. But for a utility app? It felt absurd.

I started researching alternatives and found Tauri.

## Why Tauri Changes Everything

Tauri takes a radically different approach. Instead of bundling Chromium, it uses your system's native WebView—WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux. The backend isn't Node.js; it's Rust.

Here's what that means in practice:

| Metric | Electron (floatnote prototype) | Tauri (floatnote final) |
|--------|-------------------------------|------------------------|
| Bundle size | 156MB | 7.2MB |
| Memory usage | 280MB idle | 24MB idle |
| Startup time | 2.3 seconds | 0.4 seconds |
| CPU at idle | 2-3% | 0.1% |

That's not a marginal improvement. That's a different category of application.

But the numbers only tell part of the story. What really sold me was the developer experience. Tauri feels like building a web app with superpowers—you get access to the file system, native menus, system tray, global shortcuts, all through a clean Rust API that you call from JavaScript.

## Building Floatnote: A Deep Dive

Let me walk you through how floatnote actually works, because it required solving some genuinely interesting problems.

### The Core Challenge

I wanted a transparent window that floats above everything, lets you draw with your mouse, and disappears when you're done. Sounds simple, but there are layers of complexity:

1. The window needs to be transparent but still receive mouse events
2. It needs to stay above full-screen apps (like when you're presenting)
3. Drawing needs to feel instant—no lag, no jank
4. It needs a way to clear the canvas without closing the app

### Window Configuration

Tauri's window configuration handles most of the tricky bits:

```rust
// src-tauri/src/main.rs
use tauri::{
    Manager, 
    WindowBuilder, 
    WindowUrl,
    PhysicalSize,
};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = WindowBuilder::new(
                app,
                "main",
                WindowUrl::default()
            )
            .title("floatnote")
            .transparent(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .inner_size(1920.0, 1080.0)
            .build()?;

            // macOS-specific: set window level to floating
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::NSWindowCollectionBehavior;
                let ns_window = main_window.ns_window().unwrap() as cocoa::base::id;
                unsafe {
                    ns_window.setCollectionBehavior_(
                        NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
                        | NSWindowCollectionBehavior::NSWindowCollectionBehaviorFullScreenAuxiliary
                    );
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_click_through,
            get_screen_size,
            clear_canvas,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

That `NSWindowCollectionBehavior` stuff is important—it's what lets floatnote appear over full-screen apps. Without it, the window would disappear whenever you entered presentation mode, which defeats the entire purpose.

### Click-Through Mode

Here's something subtle: when you're not actively drawing, the overlay should be invisible to mouse events. You should be able to click through it to interact with apps underneath. But when you want to draw, it needs to capture the mouse.

```rust
#[tauri::command]
fn set_click_through(window: tauri::Window, enabled: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::base::id;
        use cocoa::appkit::NSWindow;
        
        let ns_window = window.ns_window().unwrap() as id;
        unsafe {
            if enabled {
                ns_window.setIgnoresMouseEvents_(true);
            } else {
                ns_window.setIgnoresMouseEvents_(false);
            }
        }
    }
    
    Ok(())
}
```

The frontend toggles this based on whether a modifier key is held:

```typescript
// src/App.tsx
import { createSignal, onMount, onCleanup } from 'solid-js';
import { invoke } from '@tauri-apps/api/tauri';

function App() {
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [paths, setPaths] = createSignal<Path[]>([]);
  
  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Shift' && !isDrawing()) {
      setIsDrawing(true);
      await invoke('set_click_through', { enabled: false });
    }
  };
  
  const handleKeyUp = async (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      setIsDrawing(false);
      await invoke('set_click_through', { enabled: true });
    }
  };
  
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start in click-through mode
    invoke('set_click_through', { enabled: true });
  });
  
  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });
  
  return (
    <svg 
      class="drawing-surface"
      classList={{ active: isDrawing() }}
    >
      <For each={paths()}>
        {(path) => (
          <path
            d={path.d}
            stroke={path.color}
            stroke-width={path.width}
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        )}
      </For>
    </svg>
  );
}
```

### Smooth Drawing with SVG

For the drawing itself, I went with SVG paths instead of canvas. Why? Two reasons:

1. **Vector-based** — Lines stay crisp at any zoom level
2. **Easy serialization** — Each stroke is just a path string, trivial to save/load

The key to smooth drawing is capturing enough points and using the right path commands:

```typescript
interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
}

function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  }
  
  // Use quadratic bezier curves for smooth lines
  let d = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  
  // Last point
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  
  return d;
}

function handlePointerMove(e: PointerEvent) {
  if (!isDrawing()) return;
  
  const point: Point = {
    x: e.clientX,
    y: e.clientY,
    pressure: e.pressure,
  };
  
  setCurrentStroke(prev => ({
    ...prev,
    points: [...prev.points, point],
  }));
}
```

The quadratic bezier curves (`Q` command) smooth out the jaggedness you'd get from just connecting points with straight lines.

### Global Shortcuts

Users need to invoke floatnote from anywhere—even when another app has focus. Tauri handles this with global shortcuts:

```rust
use tauri::GlobalShortcutManager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            app.global_shortcut_manager()
                .register("CommandOrControl+Shift+D", move || {
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                })
                .expect("failed to register global shortcut");
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Cmd+Shift+D toggles the overlay. It's muscle memory now.

### Distribution

This is where Tauri really shines. Building for distribution:

```bash
npm run tauri build
```

That gives you:
- `.dmg` for macOS with proper code signing
- `.msi` for Windows
- `.deb` and `.AppImage` for Linux

I also published to Homebrew:

```bash
brew tap josecruz/tools
brew install floatnote
```

And npm for the truly lazy:

```bash
npx floatnote
```

The npm version downloads the binary for your platform and runs it. No compilation, no Rust toolchain needed.

## JoseTunes: When Rust Does the Heavy Lifting

If floatnote is about the frontend, josetunes is about the backend. It's a YouTube/SoundCloud downloader with a clean UI, but the interesting bits are in Rust.

### Why Not Just Use yt-dlp?

I tried. Shelling out to yt-dlp from Node.js is clunky—error handling is painful, progress tracking requires parsing stdout, and bundling a Python runtime adds weight.

Instead, I used Rust crates that do the same job:

```rust
// src-tauri/src/download.rs
use rustube::{Video, VideoFetcher};
use symphonia::core::probe::Hint;
use std::path::PathBuf;

#[derive(serde::Serialize, Clone)]
pub struct DownloadProgress {
    pub id: String,
    pub percent: f64,
    pub speed: String,
    pub eta: String,
}

#[tauri::command]
pub async fn download_video(
    url: String,
    output_dir: String,
    format: String,
    window: tauri::Window,
) -> Result<String, String> {
    let id = uuid::Uuid::new_v4().to_string();
    
    // Fetch video info
    let video = Video::from_url(&url.parse().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    
    let title = video.title().to_string();
    let sanitized_title = sanitize_filename(&title);
    
    // Get best audio stream
    let stream = video
        .streams()
        .iter()
        .filter(|s| s.includes_audio_track && !s.includes_video_track)
        .max_by_key(|s| s.bitrate)
        .ok_or("No audio stream found")?;
    
    // Download with progress reporting
    let output_path = PathBuf::from(&output_dir).join(format!("{}.{}", sanitized_title, format));
    
    stream
        .download_to_with_callback(&output_path, |progress| {
            let percent = (progress.current as f64 / progress.total as f64) * 100.0;
            
            window.emit("download-progress", DownloadProgress {
                id: id.clone(),
                percent,
                speed: format_speed(progress.speed),
                eta: format_eta(progress.eta),
            }).ok();
        })
        .await
        .map_err(|e| e.to_string())?;
    
    // Convert to desired format if needed
    if format == "mp3" {
        convert_to_mp3(&output_path).await?;
    }
    
    // Extract and embed metadata
    embed_metadata(&output_path, &video).await?;
    
    Ok(output_path.to_string_lossy().to_string())
}
```

### Concurrent Downloads

One thing I wanted was the ability to queue multiple downloads and have them run in parallel:

```rust
use tokio::sync::Semaphore;
use std::sync::Arc;

pub struct DownloadManager {
    semaphore: Arc<Semaphore>,
    max_concurrent: usize,
}

impl DownloadManager {
    pub fn new(max_concurrent: usize) -> Self {
        Self {
            semaphore: Arc::new(Semaphore::new(max_concurrent)),
            max_concurrent,
        }
    }
    
    pub async fn queue_download(&self, url: String, config: DownloadConfig) {
        let permit = self.semaphore.clone().acquire_owned().await.unwrap();
        
        tokio::spawn(async move {
            let result = download_video(url, config).await;
            drop(permit); // Release semaphore when done
            result
        });
    }
}
```

The semaphore limits concurrent downloads to prevent bandwidth saturation. Users can configure this in settings.

### The SolidJS Frontend

The frontend is pure SolidJS—no React, no virtual DOM. For a desktop app where performance matters, this was an easy choice.

```typescript
// src/components/DownloadQueue.tsx
import { For, createSignal, onMount } from 'solid-js';
import { listen } from '@tauri-apps/api/event';

interface Download {
  id: string;
  title: string;
  status: 'queued' | 'downloading' | 'converting' | 'done' | 'error';
  progress: number;
  speed?: string;
  error?: string;
}

export function DownloadQueue() {
  const [downloads, setDownloads] = createSignal<Download[]>([]);
  
  onMount(() => {
    // Listen for progress events from Rust
    listen<DownloadProgress>('download-progress', (event) => {
      setDownloads(prev => prev.map(d => 
        d.id === event.payload.id 
          ? { ...d, progress: event.payload.percent, speed: event.payload.speed }
          : d
      ));
    });
    
    listen<{ id: string }>('download-complete', (event) => {
      setDownloads(prev => prev.map(d =>
        d.id === event.payload.id
          ? { ...d, status: 'done', progress: 100 }
          : d
      ));
    });
  });
  
  return (
    <div class="download-queue">
      <For each={downloads()}>
        {(download) => (
          <div class="download-item" classList={{ done: download.status === 'done' }}>
            <div class="download-info">
              <span class="title">{download.title}</span>
              <span class="speed">{download.speed}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                style={{ width: `${download.progress}%` }}
              />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
```

The `listen` function is Tauri's event system—Rust emits events, JavaScript listens. It's clean, type-safe (with proper TypeScript definitions), and fast.

## SolidJS: Why Not React?

I've been writing React since 2018. It's my bread and butter at ON24. But for personal projects, I've found myself reaching for SolidJS more and more.

The reason comes down to mental model. In React, you're always thinking about renders—when will this component re-render? Did I memoize correctly? Is my useEffect running too often? 

SolidJS doesn't have that. There's no virtual DOM, no reconciliation, no re-renders. When a signal changes, only the specific DOM nodes that depend on it update. Nothing else runs.

```typescript
// React: the entire component re-renders when count changes
function Counter() {
  const [count, setCount] = useState(0);
  console.log('render'); // Logs every time count changes
  
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// SolidJS: only the text node updates
function Counter() {
  const [count, setCount] = createSignal(0);
  console.log('render'); // Logs once, on mount
  
  return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;
}
```

For desktop apps where you're often updating many small things independently (like download progress bars), this model is a perfect fit.

## What I've Learned

After a year of building desktop apps with Tauri:

**1. Rust is worth learning.** The borrow checker is annoying at first, but it catches real bugs. I've had zero runtime crashes in production—Rust forces you to handle every error case at compile time.

**2. Ship early, iterate fast.** I published floatnote when it could draw lines and clear the canvas. That was it. User feedback shaped everything else—the global shortcut, the color picker, the width selector.

**3. The web stack is powerful.** HTML, CSS, and JavaScript (or TypeScript) are genuinely great for building UIs. Tauri lets you use those skills for desktop apps without the Electron baggage.

**4. Build tools you need.** Both floatnote and josetunes solve problems I actually have. That's the best motivation—you're your own first user.

**5. Native integration matters.** The difference between a "web app in a window" and a real desktop app is the native touches—menu bar, global shortcuts, system tray, proper window management. Tauri makes all of these accessible.

## What's Next

I'm working on a third Tauri app—a local-first notes app with end-to-end encryption. The Rust ecosystem has great cryptography libraries, and the idea of a notes app that never touches a server is appealing.

If you're a web developer curious about desktop, I can't recommend Tauri highly enough. The combination of web frontend flexibility and Rust backend power is something special.

---

*floatnote is available via `brew install josecruz/tools/floatnote` or `npx floatnote`. josetunes is on my GitHub if you want to poke around the code.*
