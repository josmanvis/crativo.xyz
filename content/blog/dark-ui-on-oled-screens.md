---
title: "Dark Mode on OLED: Why Pure Black Isn't Always the Answer"
excerpt: "OLED screens turn black pixels completely off, which sounds like a free win for dark UI. Then you notice the smearing, the glowing white text and the logo burned into someone's TV."
category: deep-dives
publishedAt: "2026-05-20"
tags:
  - ui-design
  - dark-mode
  - tv
  - watch
featured: false
---

OLED screens are everywhere now: phones, watches, and a lot of TVs. They work differently from the LCD screens most design advice was written for, and dark UIs are where that difference shows up most.

On an LCD, a backlight shines through everything, so "black" is really "dark gray-ish." On an OLED, **each pixel makes its own light**, and a black pixel is simply **off**. That gives you deep, inky black, and it means your color choices behave in some surprising ways.

## The case for true black (#000)

- **Gorgeous contrast.** Content floats in the void. It looks fantastic, especially in a dark room.
- **Battery savings.** Off pixels use less power, which matters a lot on a watch.
- **No glowing bezel.** In a dark room, a true-black background blends into the hardware, so the UI looks like it has no edges.

That's why watch faces are almost always pure black. On a device with a tiny battery that's on your wrist all day, it's the right call.

## The case against it

**Black smear.** On some OLED panels, pixels coming up from fully off can respond a little slower than pixels that are already on. When you scroll content across a pure-black background, you may see dark, smeary trails behind moving edges. Using a very dark gray instead of absolute black keeps those pixels slightly on, which can reduce the effect.

**Halation.** Bright white text on pure black can seem to glow and bleed at the edges, especially for people with astigmatism. Long reading on #FFF over #000 gets tiring.

**Lost depth.** With pure black there's no darker color left for shadows, so elevation (cards above backgrounds, menus above cards) has to come from lighter surfaces instead.

## A practical palette

What I reach for:

```css
:root {
  --bg: #0e0e0d;        /* near-black, not absolute */
  --surface: #171715;   /* raised surfaces get *lighter* */
  --surface-2: #1f1f1c;
  --text: #eceae3;      /* off-white, not #fff */
  --text-muted: #a3a198;
}
```

Raised surfaces get **lighter** as they come forward, since shadows barely show on dark backgrounds. Text is off-white to soften the glow. And the background is just shy of black: nearly all the beauty, fewer side effects.

Choose pure black on purpose for watch faces, ambient "always-on" screens and fullscreen media where battery or immersion really matter.

## TVs and burn-in

OLED TVs add one more risk: **burn-in**, where a static element shown in the same place for a very long time can leave a faint permanent ghost. TV makers build in protections, but app designers can help:

- **Don't leave bright static elements on screen forever.** Logos, clocks and status bars that never move are the classic culprits.
- **Fade or dim persistent UI** during playback and after inactivity.
- **Use a real screensaver or dimming state** when nothing is happening.

A channel logo glued to the corner of someone's expensive TV for years is not the legacy you want.

## Watches: dimmer is better

On watches, the **always-on** mode is its own design. When the wrist is down, the display typically dims, and good apps switch to a simplified, mostly-black version with fewer bright pixels. Show the time and the one thing that matters, then save the color for when the wrist comes up.

## The takeaway

Dark mode isn't "invert the colors." On OLED it's its own medium, with real physics behind it.

- Near-black for most UIs, true black when battery or immersion wins.
- Off-white text.
- Lighter surfaces for depth.
- Keep bright static elements moving or dimming.

Your users won't notice any of this consciously. They'll just stop noticing the screen, which for a dark UI is the highest compliment there is.
