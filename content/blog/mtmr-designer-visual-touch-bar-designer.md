---
title: "MTMR Designer: Visual Touch Bar Designer for macOS"
description: "A visual drag-and-drop designer for macOS Touch Bar presets that eliminates manual JSON editing. Built with React 19 + Vite, featuring 39 element types, real-time preview, and direct MTMR integration."
date: "2026-03-11"
tags: ["react", "macos", "touch-bar", "design-tools", "open-source"]
category: "Projects"
ogImage: "/blog/mtmr-designer.svg"
---

# MTMR Designer

![MTMR Designer](/blog/mtmr-designer.svg)

<h1 align="center">MTMR Designer</h1>

<p align="center">
  <strong>A visual drag-and-drop designer for macOS Touch Bar presets</strong>
</p>

<p align="center">
  Build, preview, and export custom <a href="https://github.com/Toxblh/MTMR">MTMR</a> Touch Bar configurations — no JSON by hand.
</p>

<p align="center">
  <a href="https://josetwentyfour.github.io/mtmr-designer">Documentation</a> &middot;
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#features">Features</a> &middot;
  <a href="#architecture">Architecture</a>
</p>

![React 19](https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react)
![Vite 7](https://img.shields.io/badge/vite-7-646cff?style=flat-square&logo=vite)
![Node >= 18](https://img.shields.io/badge/node-%E2%89%A518-339933?style=flat-square&logo=nodedotjs)
![macOS](https://img.shields.io/badge/platform-macOS-000?style=flat-square&logo=apple)
![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## The Problem That Drove Me Insane

Every macOS developer who's tried to customize their Touch Bar has faced the same frustration: editing JSON by hand. You want to add a button? Edit the JSON. You want to rearrange elements? Edit the JSON. You want to see what it looks like? Edit the JSON, save, restart MTMR, and hope you didn't break anything.

This is not a good user experience. This is 2006-era configuration management.

**The Breaking Point**

I was trying to create a custom Touch Bar layout for my development workflow. I needed:
- A button to toggle dark mode
- A button to control music playback
- A button to show battery status
- A button to quickly exit the Touch Bar (for presentations)

I spent 45 minutes editing JSON, restarting MTMR, and watching nothing work. The syntax was unforgiving. The structure was confusing. And I couldn't see what I was building until I'd already built it.

That's when I decided: I'm never editing Touch Bar JSON by hand again.

## The Solution: Visual Design

MTMR Designer is a visual drag-and-drop interface for creating MTMR Touch Bar presets. Instead of writing JSON, you:

1. **Drag elements** from a palette onto a visual Touch Bar canvas
2. **Configure properties** in a sidebar (titles, colors, actions, etc.)
3. **See real-time preview** of exactly what your Touch Bar will look like
4. **Export to JSON** with one click, ready to use in MTMR

## Features

### Visual Editor
See your Touch Bar layout in real-time. Drag elements from the palette, reorder with drag-and-drop, right-click for context menus. What you see is what you get.

### 39 Element Types
Buttons, media keys, native plugins (weather, CPU, battery, music, network, etc.), sliders, groups, and custom script buttons across 6 categories:

| Category | Elements |
|---|---|
| **Buttons** | `escape` `exitTouchbar` `brightnessUp` `brightnessDown` `illuminationUp` `illuminationDown` `volumeUp` `volumeDown` `mute` |
| **Native Plugins** | `timeButton` `battery` `cpu` `currency` `weather` `yandexWeather` `inputsource` `music` `dock` `nightShift` `dnd` `darkMode` `pomodoro` `network` `upnext` |
| **Media Keys** | `previous` `play` `next` |
| **Custom** | `staticButton` `appleScriptTitledButton` `shellScriptTitledButton` |
| **Sliders** | `brightness` `volume` |
| **Special** | `group` `close` `swipe` |

### Rich Property Editor
Configure titles, images, colors, widths, alignment, actions, and type-specific settings for every element. Each element type has its own property panel with relevant options.

### Action System
Assign tap actions (single, double, triple, long press) with HID keycodes, AppleScript, shell scripts, or URL triggers. Create complex interactions without touching code.

### JSON Editor
Live syntax-highlighted JSON preview with inline editing, validation, import/export, and click-to-select sync. Perfect for power users who want to see the underlying structure.

### Preset System
5 built-in presets, 26 community presets, plus save and manage your own custom presets with overwrite support. Start with a template and customize it to your needs.

### MTMR Integration
Load and save directly to your MTMR config file at `~/Library/Application Support/MTMR/items.json`. One-click export that works with the actual MTMR app.

### Undo & Redo
Full history support with keyboard shortcuts. Your work auto-saves to localStorage so you never lose progress.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/josetwentyfour/mtmr-designer.git
cd mtmr-designer

# Install dependencies
pnpm install
cd server && npm install && cd ..

# Start the development server
pnpm run dev
```

Open **http://localhost:3001** in your browser.

## Architecture

```
mtmr-designer/
├── src/                          # React frontend
│   ├── components/
│   │   ├── TouchBar/             # Visual Touch Bar canvas
│   │   ├── Palette/              # Element type catalog (left sidebar)
│   │   ├── Properties/           # Property editors (right sidebar)
│   │   └── JsonOutput/           # JSON preview/editor panel
│   ├── context/AppContext.jsx    # Global state (useReducer + localStorage)
│   ├── data/
│   │   ├── elementDefinitions.js # 39 element types, categories, defaults
│   │   └── presets.js            # Built-in + community preset configs
│   └── utils/
│       ├── jsonGenerator.js      # JSON serialization / parsing
│       └── mtmrFileSystem.js     # Server API wrappers
├── server/server.js              # Express + Vite backend
├── electron/                     # Optional Electron wrapper
├── mtmr-src/                     # MTMR 2026 Swift app (Xcode)
└── public/presets/                # 26 community preset JSON files
```

### Frontend

**React 19 + Vite.** Three-panel layout: element palette (left), Touch Bar canvas + JSON editor (center), property editor (right, shown on selection). State managed with `useReducer` in a single context, auto-persisted to `localStorage`. Drag-and-drop powered by `@dnd-kit`.

### Backend

**Express** integrated with Vite via `vite-express`. Exposes API routes for filesystem operations:

| Endpoint | Method | Description |
|---|---|---|
| `/api/load-mtmr` | GET | Read MTMR config from disk |
| `/api/save-mtmr` | POST | Write MTMR config to disk |
| `/api/config-path` | GET | Get config file path |
| `/api/health` | GET | Server health check |

Uses `comment-json` to parse MTMR configs that contain JavaScript-style comments.

### Electron (Optional)

Embeds the React app and renders items to the actual macOS Touch Bar via Electron's `TouchBar` API. Not wired into the main scripts.

### MTMR 2026 (Optional)

Bundled fork of the MTMR Swift macOS app. Build with Xcode from `mtmr-src/MTMR.xcodeproj`. Bundle ID: `com.mtmr-designer.mtmr2026`.

## Getting Started Guide

### Prerequisites

- macOS with MTMR installed
- Node.js >= 18
- A desire to stop editing JSON by hand

### Installation

1. **Install MTMR** from [GitHub](https://github.com/Toxblh/MTMR) if you haven't already
2. **Clone the repository**: `git clone https://github.com/josetwentyfour/mtmr-designer.git`
3. **Install dependencies**: `pnpm install`
4. **Start the server**: `pnpm run dev`

### Basic Workflow

1. **Open the app** at http://localhost:3001
2. **Choose a preset** or start from scratch
3. **Drag elements** from the left palette onto the Touch Bar canvas
4. **Configure properties** in the right sidebar
5. **Preview in real-time** to see exactly what you're building
6. **Export to JSON** and copy to your MTMR config
7. **Restart MTMR** to see your changes

### Tips & Tricks

- **Hold Shift** while dragging to snap to grid
- **Right-click** elements for context menus
- **Double-click** titles to edit text inline
- **Use the search bar** to quickly find elements
- **Save presets** for reusable configurations

## Why I Built It

I've been customizing my macOS experience for years. From Alfred workflows to custom terminal setups, I love making my tools work exactly how I want them to.

But the Touch Bar was always the exception. It was either:
- Use the default macOS controls (boring)
- Edit JSON by hand (frustrating)
- Give up and use a physical keyboard (defeat)

I wanted something in between. I wanted the power of customization without the pain of configuration.

**The Vision**

MTMR Designer exists because I believe customization shouldn't require configuration expertise. You shouldn't need to understand JSON structure to create a custom Touch Bar. You shouldn't need to restart apps to see changes. You shouldn't need to be a developer to have a personalized computing experience.

The goal is simple: make Touch Bar customization as easy as using a visual design tool. Drag, drop, configure, export. That's it.

## Technical Deep Dive

### State Management

The app uses a single `useReducer` context for global state. This includes:
- Current Touch Bar configuration
- Selected element
- Undo/redo history
- User preferences

State is persisted to `localStorage` automatically, so your work is never lost.

### Drag & Drop

Built with `@dnd-kit`, the drag-and-drop system handles:
- Element reordering within the Touch Bar
- Element deletion via drag-to-trash
- Palette-to-canvas dragging
- Nested drag operations (dragging elements within groups)

### JSON Generation

The JSON generator is the heart of the app. It takes the visual state and converts it to MTMR-compatible JSON, handling:
- Proper nesting of groups
- Correct action formatting
- Default values for missing properties
- Validation to prevent invalid configurations

### File System Integration

The Express backend handles file operations with proper error handling:
- Reading existing MTMR configs
- Writing new configurations
- Path validation to prevent security issues
- Conflict resolution for concurrent edits

## Community & Contributions

MTMR Designer is open source because I believe great tools should be built in the open.

### How to Contribute

1. **Report bugs** via GitHub Issues
2. **Suggest features** in the Discussions
3. **Submit pull requests** for improvements
4. **Create presets** and share them with the community

### Community Presets

The app includes 26 community presets covering everything from development workflows to media control to system monitoring. Each preset is a real configuration that someone found useful.

## Future Plans

### Near-Term Goals

- **Mobile support** for designing on iPad/iPhone
- **Cloud sync** for presets across devices
- **Plugin system** for custom element types
- **Template sharing** with direct import/export

### Long-Term Vision

- **Cross-platform support** (Windows, Linux touchbars)
- **Integration with other tools** (Alfred, Raycast)
- **AI-powered suggestions** for optimal layouts
- **Community marketplace** for premium presets

## Conclusion

MTMR Designer is more than just a tool — it's a philosophy. It's the belief that customization should be accessible, that configuration shouldn't be a barrier, and that everyone deserves a computing experience tailored to their needs.

If you've ever been frustrated by editing JSON by hand, if you've ever wanted a custom Touch Bar but didn't know where to start, if you just want your tools to work the way you think they should — MTMR Designer is for you.

**Stop editing JSON. Start designing.**

---

## Quick Links

- [Documentation](https://josetwentyfour.github.io/mtmr-designer)
- [GitHub Repository](https://github.com/josetwentyfour/mtmr-designer)
- [Live Demo](https://mtmr-designer.netlify.app)
- [MTMR App](https://github.com/Toxblh/MTMR)

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Drag & Drop | @dnd-kit |
| State | useReducer + Context |
| Syntax Highlighting | react-syntax-highlighter |
| Server | Express + vite-express |
| JSON | comment-json |
| Desktop | Electron (optional) |
| Native App | Swift / Xcode (optional) |

## License

MIT