---
title: "iOS Simulator Charms: A Magnetic Toolbar for Testing Mobile Web"
excerpt: "Testing a mobile site in the iOS Simulator means juggling Safari menus, keyboard shortcuts and a window that keeps hiding behind your editor. So I glued a toolbar to its side."
category: devtools
publishedAt: "2026-09-02"
tags:
  - ios
  - macos
  - mobile
  - testing
  - side-project
featured: false
---

If you build for mobile web, you spend a lot of time in the **iOS Simulator**. And the iOS Simulator is a wonderful tool wrapped in an obstacle course:

- it hides behind your editor the moment you click away
- opening a URL means copy, switch, tap the address bar, paste
- reloading needs the right shortcut, in the right window
- getting to Safari's Web Inspector is a trip through macOS Safari's menus

None of these are hard. All of them are friction, dozens of times a day. So I built **iOS Simulator Charms**: a floating tool palette that **sticks to the side of the Simulator window** and puts all of those actions one click away.

## The magnetic part

The charms bar uses macOS **Accessibility APIs** to track the Simulator window's position. Move the Simulator and the bar follows, clinging to its right edge like a magnet. It feels like a native part of the Simulator, even though it's a completely separate app.

## What the charms do

**Quick focus and rotate.** Lost the Simulator behind your IDE again? Click the phone charm to bring it to the front. Another click rotates the device.

**Paste demo URL.** This is the one that saves the most time. Copy a URL on your Mac, click the clipboard charm, and it opens **inside the Simulator** using `xcrun simctl`. Deep links, localhost URLs, staging links: no more retyping URLs on a virtual keyboard.

**Fast reloads.** Refresh Safari or trigger a hard reload with one click. The app sends the exact keystrokes the Simulator expects, instantly.

**Safari integration.** Jump straight into Safari's **Web Inspector** or **Console** for the Simulator, without digging through menus.

**Tab manager.** A slide-out panel tracks your active Simulator tabs. You can rename them for your testing session ("checkout – logged out," "checkout – logged in"), reorder them, and click to inspect.

## The permissions gotcha

Because the app tracks another app's window and sends AppleScript commands to Safari, it needs macOS **Accessibility** and **Automation** permissions. The app detects when it's missing access and walks you to the exact settings panel.

There's one macOS quirk worth knowing, because it'll confuse you otherwise: **if you rebuild or update the app, macOS can silently revoke its Accessibility permission, even though the toggle still shows "on."** The fix is to remove the app from the list with the minus button, then add it back with the plus button. If something stops working after an update, try that first.

## Installing it

```bash
curl -fsSL https://raw.githubusercontent.com/josmanvis/ios-simulator-charms/main/install.sh | bash
```

There's also a `.dmg` and a `.pkg` on the releases page, or you can clone the repo and `make` it yourself.

## Why small tools matter

None of these charms is impressive on its own. "Open a URL" is not a groundbreaking feature. But mobile testing is a loop you repeat hundreds of times, and shaving ten seconds and three context switches off each loop adds up to hours, and more importantly, to staying in flow.

The best developer tools aren't big. They're the ones that remove a tiny annoyance you'd stopped noticing, until it was gone.
