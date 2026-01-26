# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Development server (Next.js with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint the codebase
npm run lint
```

## Project Overview

crativo.xyz is a personal portfolio and blog site for Jose Viscasillas, built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and TypeScript. The site showcases software engineering projects and hosts a technical blog.

## Architecture

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (mix of client and server)
- `src/lib/` - Utility functions and context providers
- `src/data/` - Static data (projects configuration)
- `src/types/` - TypeScript type definitions
- `src/remotion/` - Remotion video compositions for intro animation
- `content/blog/` - Markdown blog posts with gray-matter frontmatter

### Page Structure

- `/` - Homepage with project grid, category filtering, and animated intro splash
- `/blog` - Blog listing with category filtering
- `/blog/[slug]` - Individual blog post pages
- `/projects/[id]` - Individual project detail pages
- `/about`, `/contact`, `/videos`, `/apps` - Static pages
- `/api/contact` - Contact form submission (Twilio SMS + Resend email)
- `/api/newsletter` - Newsletter subscription endpoint

### Splash Animation System

The homepage uses a splash screen system with two variants:
- **Desktop**: Remotion-powered video animation (`RemotionIntro.tsx` → `IntroAnimation.tsx`)
- **Mobile**: iOS call-style splash (`MobileCallSplash.tsx`)

`SplashContext` in `src/lib/SplashContext.tsx` tracks whether the splash has been shown this session using sessionStorage.

### Blog System

Blog posts are Markdown files in `content/blog/` with frontmatter:
```yaml
---
title: "Post Title"
excerpt: "Short description"
category: "tutorials" | "thoughts" | "devtools"
publishedAt: "2025-01-25"
tags: ["react", "typescript"]
coverImage: "/blog/post-cover.svg"
featured: true
---
```

The `src/lib/blog.ts` file handles parsing with `gray-matter`. Reading time is auto-calculated.

### Project Data

Projects are defined in `src/data/projects.ts` as a typed array. Each project has:
- Basic info (id, title, description, category, year)
- Tech stack array
- Long-form description (markdown-style)
- Code snippets
- Optional features list and preview images

Categories: `"Apps" | "Libraries" | "Tools" | "Kiosks"`

### Styling

- Tailwind CSS 4 with PostCSS
- Dark theme (bg-[#0a0a0a], text-[#ededed])
- Inter font via next/font
- CSS Modules available but not heavily used

### Third-Party Integrations

- **Remotion**: Video intro animation with @remotion/player
- **Twilio**: SMS notifications for contact form
- **Resend**: Email notifications for contact form
- **Microsoft Clarity**: Analytics (script in layout.tsx)
- **Framer Motion**: Animations

### Environment Variables

Required for full functionality (see `.env.example`):
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
NOTIFY_PHONE_NUMBER
RESEND_API_KEY
```

## Path Alias

Use `@/*` for imports from `src/`:
```typescript
import { Project } from "@/types/project";
import { getAllPosts } from "@/lib/blog";
```

## Remotion Integration

The project uses Remotion for programmatic video generation. The intro animation is embedded using `@remotion/player` (not rendered server-side). Key files:
- `src/remotion/IntroAnimation.tsx` - Animation composition
- `src/remotion/Root.tsx` - Remotion root
- `src/components/RemotionIntro.tsx` - Player wrapper component

The `.agents/skills/remotion-best-practices/` directory contains Remotion documentation and patterns - invoke `/remotion-best-practices` when working on video features.
