---
title: "Browser Extensions: The Platform Nobody Talks About"
excerpt: "Building for the browser as a platform. Extensions are the new apps, and they're weirdly fun to build. Here's what makes them special."
category: tutorials
publishedAt: 2026-02-26
tags:
  - browser-extensions
  - chrome
  - firefox
  - web
coverImage: /blog/browser-extensions.svg
featured: false
seo:
  title: "Browser Extensions: The Underrated Platform for Developers"
  description: "Browser extensions are a hidden gem for developers. Zero app store fees, direct user access, and a unique set of capabilities."
  keywords: ["browser extensions", "chrome extension", "firefox extension", "webextension", "extension development"]
---

# Browser Extensions: The Platform Nobody Talks About

Everyone's building mobile apps. Or SaaS products. Or AI wrappers. Meanwhile, browser extensions sit there, quietly useful, quietly profitable, and surprisingly fun to build.

I've built three extensions now. Each one taught me something new about this underrated platform.

## Why Extensions?

**Zero app store friction**

No 30% fee. No review process that takes weeks. No certification requirements. Publish to Chrome Web Store, wait a day or two, you're live.

**Instant distribution**

Users don't need to download an app. They click "Add to Chrome" and it's there. The friction is near zero.

**Unique capabilities**

Extensions can:
- Intercept and modify network requests
- Inject code into any webpage
- Access browser tabs and windows
- Run background processes
- Store data locally

These aren't capabilities web apps have. This is power user territory.

**The user is already there**

They're in the browser. They're on the page where your extension is needed. No context switching. No app switching.

## What You Can Build

**Productivity tools**

Modify any website. Add keyboard shortcuts. Automate repetitive tasks. Block distractions.

I built one that adds "copy as markdown" to every code block on every website. Simple. Useful. 10k users.

**Developer tools**

Inspect network requests. Format JSON. Debug APIs. The Chrome DevTools are extensible.

**Content enhancement**

Add features to existing websites. Better YouTube controls. Enhanced GitHub diffs. Dark mode for sites that don't have it.

**Privacy and security**

Block trackers. Manage passwords. Detect phishing. Extensions have visibility into every request.

**Workflow automation**

Auto-fill forms. Extract data from pages. Connect web apps that don't talk to each other.

## The Architecture

Modern browser extensions use Manifest V3 (Chrome) or the WebExtensions standard (Firefox, Safari, Edge). They share a common structure:

```
my-extension/
├── manifest.json       # Configuration
├── background.js       # Service worker (background)
├── content.js          # Runs on web pages
├── popup.html          # UI when clicked
├── popup.js            # Popup logic
├── options.html        # Settings page
├── options.js          # Settings logic
└── icons/              # Extension icons
```

**manifest.json**: The heart of your extension. Declares permissions, scripts, and capabilities.

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  "permissions": ["activeTab", "storage"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["https://*.github.com/*"],
    "js": ["content.js"]
  }],
  "action": {
    "default_popup": "popup.html"
  }
}
```

**content.js**: Runs in the context of web pages. Can read and modify the DOM. This is where most of the magic happens.

**background.js**: The service worker. Handles events, manages state, coordinates between components.

**popup.html**: What users see when they click your extension icon. A mini web app.

## The Permissions Model

This is where extensions get interesting—and controversial.

**activeTab**: Access to the current tab when the user invokes your extension
**tabs**: Access to all tabs, their URLs, and the ability to manipulate them
**storage**: Store data locally
**scripting**: Inject scripts into pages programmatically
**webRequest**: Intercept and modify network requests (Manifest V2, deprecated in V3)
**declarativeNetRequest**: Block/redirect requests declaratively (Manifest V3)

More permissions = more scrutiny during review. Request only what you need.

## Manifest V3: The Controversy

Chrome pushed Manifest V3, which restricted some extension capabilities. The biggest change: no more dynamic code execution and restricted network interception.

Ad blockers were upset. Privacy advocates were upset. Some functionality became harder or impossible.

Firefox kept some V2 capabilities. Safari implemented V3 differently.

The lesson: build for the platform as it exists, but know that platforms change. Have a backup plan.

## What I've Built

**Tab Wrangler**: Auto-closes tabs after inactivity. Keeps the last 10 open. Saves my RAM.

**Meeting Muter**: Detects when I'm in a Google Meet tab, provides global keyboard shortcuts for mute/unmute. Simple, daily utility.

**Code Copy**: Adds "copy as markdown" to every code block. Small, specific, useful.

None of these would work as well as web apps. They need to be in the browser, integrated with my workflow.

## The Economics

**Can you make money?**

Yes, but it's not the same as SaaS.

- **Chrome Web Store**: One-time payments, small amounts
- **Firefox Add-ons**: No native monetization
- **Your own licensing**: Subscription via your own server

Most successful extensions are:
- Free, with a paid "Pro" version
- Lead generators for a paid product
- Built for personal use, shared for free

**The real opportunity**

Extensions are rarely the product. They're usually a feature that complements something else.

A password manager extension connects to the password manager app. A meeting tool extension connects to the meeting service. The extension is a touchpoint, not the destination.

## Getting Started

**1. Start with a content script**

The simplest extension is just a content script that modifies a page. No popup, no background, just DOM manipulation.

```javascript
// content.js - runs on every page
console.log('Hello from my extension!');

// Find all links and add a border
document.querySelectorAll('a').forEach(link => {
  link.style.border = '1px solid red';
});
```

**2. Add a popup**

When you need user interaction, add a popup. It's just HTML/CSS/JS.

**3. Add storage**

When you need to persist settings, use `chrome.storage`.

```javascript
// Save
await chrome.storage.sync.set({ theme: 'dark' });

// Load
const { theme } = await chrome.storage.sync.get('theme');
```

**4. Add permissions as needed**

Start minimal. Add permissions only when you have a specific need.

## The Hidden Platform

Extensions occupy a unique space:
- Not quite web apps (more capabilities)
- Not quite desktop apps (lighter, easier)
- Not quite mobile apps (no app store drama)

They're a platform that sits between all of these, invisible to most users, essential to power users.

If you're looking for your next project, consider an extension. The barrier to entry is low. The feedback loop is fast. The potential for usefulness is high.

---

*Building something useful? An extension might be the simplest way.*