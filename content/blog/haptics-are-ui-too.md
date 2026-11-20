---
title: "Haptics Are UI Too: Designing Feedback You Can Feel"
excerpt: "A good haptic is the UI equivalent of a firm handshake. A bad one is your phone buzzing like an angry wasp every time you scroll. Here's the difference."
category: deep-dives
publishedAt: "2026-04-22"
tags:
  - mobile
  - watch
  - ui-design
  - ios
featured: false
---

We spend weeks on colors, spacing and animation curves, and then treat vibration like an on/off switch. But on phones and watches, **haptics are a whole extra channel of UI**, and they work even when nobody's looking at the screen.

Done well, haptics make an app feel physical and confident. Done badly, they make your phone feel like it's having a panic attack.

## What haptics are actually for

Good haptic feedback does one of three jobs:

1. **Confirm an action.** You toggled the switch, the payment went through, the item snapped into place.
2. **Mark a boundary.** You've hit the end of a list, a value snapped to a detent, a slider reached its limit.
3. **Signal an outcome.** Success feels different from a warning, which feels different from an error.

If a haptic isn't doing one of those three, it's decoration. And decoration you can feel gets old fast.

## Match the feeling to the meaning

On iOS, UIKit gives you three generators, and the names tell you exactly when to use them:

```swift
// Something physical happened: a snap, a collision, a drop
UIImpactFeedbackGenerator(style: .light).impactOccurred()

// The selection changed: scrolling through a picker
UISelectionFeedbackGenerator().selectionChanged()

// An outcome: success, warning or error
UINotificationFeedbackGenerator().notificationOccurred(.success)
```

That mapping is the whole design system in miniature: **impact** for physical events, **selection** for stepping through values, **notification** for results. Use a heavy impact for a successful save and it feels like something crashed. Use a success pattern for scrolling and every flick celebrates nothing.

## On the web: proceed with caution

The web has `navigator.vibrate()`:

```javascript
if ('vibrate' in navigator) navigator.vibrate(12); // a short tick, in ms
```

It's handy for Android, but support is uneven, and notably it isn't available in Safari on iOS. So treat web haptics as a bonus that some users get, never as the only way you communicate something.

## The rules I follow

**Pair, don't replace.** Haptics should reinforce something visible, never be the only signal. Some people disable them, some devices lack them, and some users can't perceive them.

**Less is more.** The best haptics are the ones you barely notice consciously. A tiny tick when a value snaps into place feels great. A strong buzz every time you tap a button feels like the app is shouting.

**Never on scroll by default.** Continuous haptics during normal scrolling are exhausting. Reserve them for **detents** and **boundaries**, the moments that actually mean something.

**Respect the settings.** System haptic settings exist for a reason. If the user turned them off, your clever pattern isn't an exception.

**Timing is everything.** A haptic that fires 200 ms after the visual change feels broken, like a badly dubbed movie. Fire it at the exact moment the UI changes.

## Watches live and die by this

On a smartwatch, haptics carry even more weight because the screen is tiny and often not being watched. A tap on the wrist can say "turn left" or "your timer's done" without the user lifting their arm at all.

That's the purest form of haptic UI: information delivered straight to your nervous system, no screen required. It's also a good reason to be careful. Something that taps your body deserves a high bar for being useful.

## Try it yourself

Pick the three most important moments in your app: the main success, the main error and the main "snap." Give each a distinct, subtle haptic, and leave everything else silent.

Your users probably won't be able to tell you what changed. They'll just say the app feels better. That's exactly the point.
