---
title: "Android TV Basics: Banners, D-Pads and the Absence of a Touchscreen"
excerpt: "Your Android app technically runs on a TV. It just won't show up in the launcher, can't be navigated with a remote, and assumes a finger. Here's the short list of what makes an Android app a TV app."
category: tutorials
publishedAt: "2026-07-29"
tags:
  - tv
  - android
  - ui-design
featured: false
---

Android TV is Android. Same OS, same APIs, same tooling. So in theory, your phone app "runs on a TV."

In practice, it'll be invisible in the launcher, it might refuse to install, and once it's open, nobody can use it, because it was designed for a finger and the user is holding a remote. Here's the short list of what turns an Android app into a TV app.

## 1. Tell the launcher you exist

TV home screens only show apps that declare they're built for TV. That's an intent filter with the **`LEANBACK_LAUNCHER`** category on your TV entry activity:

```xml
<activity android:name=".TvActivity" android:exported="true">
  <intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
  </intent-filter>
</activity>
```

Without it, your app can be installed and still be nowhere to be found on the home screen. Users won't go looking in settings for it.

## 2. Give it a banner, not just an icon

Phone launchers show square icons. TV launchers show wide **banners**, rectangular tiles of 320 × 180 pixels, set on the application or activity:

```xml
<application
  android:banner="@drawable/tv_banner"
  ... >
```

Put your app's name in the banner as text. On a TV launcher, the banner *is* your branding, and an icon stretched into a rectangle looks unfinished from the couch.

## 3. Don't require a touchscreen

Many TVs don't have one, obviously. If your manifest implies a touchscreen is required, the app may be filtered out of installation on TV devices. Declare it as optional:

```xml
<uses-feature
  android:name="android.hardware.touchscreen"
  android:required="false" />
<uses-feature
  android:name="android.software.leanback"
  android:required="false" />
```

Setting leanback to `required="false"` lets the same app support both phones and TVs. If it's a TV-only app, you can set it to `true`.

## 4. Everything must work with a D-pad

This is the big one. On TV, users move **focus** with up, down, left, right, select and Back. That means:

- Every interactive element must be **focusable** and reachable with the arrow keys.
- **Focus must be visible** from across the room: scale it, outline it, brighten it.
- **Back** must always do something sensible.
- No gestures. No swipes. No long-press-only actions.

Android's focus system handles a lot of the "what's to the right?" logic for you, but your layout has to make sense as a grid. Misaligned elements lead to focus jumping somewhere surprising.

## 5. Design for the 10-foot UI

The screen is huge, but the viewer is far away, so treat it like a poster:

- big text, few words
- generous spacing, with key content inside the screen's safe area margins
- horizontal **rows of cards**, the browsing pattern TV users already know from every streaming app
- dark backgrounds, which are easier on eyes in a dim living room

## 6. Text input is the enemy

Typing with a D-pad on an on-screen keyboard is miserable. Offer voice search where you can, show results while typing, and for login, let people sign in on their phone with a code or QR instead of typing a password with a remote.

## 7. Test on real hardware

The emulator is fine for a start, but nothing replaces a real TV device with a real remote, from the real couch. You'll immediately notice the things that don't show up on a monitor: focus states too subtle to see, text too small, and actions that take nine button presses.

## The mindset

A TV app isn't a phone app on a big screen. It's a different product with a different input, a different distance and a different posture: lean back, not lean in.

Get the manifest right so it shows up. Get the focus right so it's usable. And get the banner right, because on a TV home screen, that rectangle is the first impression.
