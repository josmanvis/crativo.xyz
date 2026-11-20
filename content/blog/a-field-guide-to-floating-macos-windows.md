---
title: "I Keep Building Floating Windows: A Field Guide to macOS Overlays"
excerpt: "A DJ controller HUD, a screen annotation layer, a toolbar glued to the iOS Simulator. Apparently my favorite UI is one that floats over everything else. Here's how to build them without annoying anyone."
category: tutorials
publishedAt: "2026-10-07"
tags:
  - macos
  - swift
  - appkit
  - ui-design
featured: false
---

I recently noticed a pattern in my side projects:

- **FLX2 Status Overlay**: an always-on-top, click-through HUD showing my DJ controller's pad mode.
- **floatnote**: a transparent overlay for drawing and annotating on top of the screen.
- **iOS Simulator Charms**: a toolbar that magnetically sticks to the side of the Simulator window.

All of them are **windows that float over other apps**. Apparently that's my thing now. So here's what I've learned building them. floatnote is an Electron app, but the others are native, so the examples below are AppKit, where these window behaviors are easiest to see.

## The core: a panel, not a window

Regular windows want attention: they activate your app, show up in the Dock, and steal keyboard focus. For an overlay, that's all wrong. You want an `NSPanel` that floats without taking over:

```swift
let panel = NSPanel(
    contentRect: NSRect(x: 0, y: 0, width: 420, height: 120),
    styleMask: [.borderless, .nonactivatingPanel],
    backing: .buffered,
    defer: false
)
panel.level = .floating          // above normal windows
panel.isOpaque = false
panel.backgroundColor = .clear   // let your content draw its own shape
panel.hasShadow = false
```

`.nonactivatingPanel` is the important part: clicking it won't yank focus away from the app you're actually using.

## Show up everywhere

By default, a window lives on one Space and disappears when you go fullscreen. For a HUD that should always be there:

```swift
panel.collectionBehavior = [
    .canJoinAllSpaces,     // every desktop
    .fullScreenAuxiliary,  // alongside fullscreen apps
    .stationary            // don't slide around in Mission Control
]
```

Without this, your overlay vanishes the moment someone switches desktops, which feels like a bug even though it's macOS working as designed.

## Click-through: look but don't touch

The FLX2 HUD sits at the bottom of the screen while I'm using djay. If it intercepted clicks, it would block the app underneath. So it **ignores the mouse entirely**:

```swift
panel.ignoresMouseEvents = true
```

Clicks pass straight through to whatever is behind it. The catch: now you can't click the overlay either. So click-through overlays need **another way to be controlled**, usually a menu bar item. Always give users a way back in.

## Attaching to another app's window

iOS Simulator Charms is the trickiest of the three, because it has to **follow another app's window**. macOS doesn't give you a "glue my window to that one" API. Instead, the app uses **Accessibility APIs** to read the Simulator window's position and size, then repositions itself along the right edge as the Simulator moves.

That needs the **Accessibility permission**, which brings a famous macOS quirk: if you rebuild or update the app, macOS can silently revoke that permission while the toggle still shows "on." Removing the app from the list and re-adding it fixes it. Document this for your users, because nobody guesses it on their own.

## Designing overlays people don't hate

The technical part is the easy part. The hard part is being a good guest on someone else's screen:

1. **Stay small.** An overlay should take the least space that does the job.
2. **Stay out of the way of work.** Default to a corner or an edge, and make it easy to move.
3. **Be readable over anything.** You don't know what's behind you. A solid or blurred backing with high-contrast text works over white documents and dark video alike.
4. **Never steal focus.** Nothing is more infuriating than typing into an app and having an overlay eat your keystrokes.
5. **Make it easy to hide.** A keyboard shortcut or menu bar toggle, always.

## Why I keep building these

Overlays are the purest form of "show me the hidden state." They take information that lives somewhere inconvenient, like a DJ controller's invisible pad mode or a Simulator buried in menus, and put it right where your eyes already are.

They're also small, self-contained and fun to build in an afternoon. Which might be the real reason I keep making them.
