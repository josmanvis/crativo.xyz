---
title: "Why Your DJ Controller's Faders Send Two Messages: 14-Bit MIDI Explained"
excerpt: "MIDI values go from 0 to 127. That's 128 steps, which is way too chunky for a smooth filter sweep. The fix from decades ago is still clever: send the number in two halves."
category: tutorials
publishedAt: "2026-09-23"
tags:
  - midi
  - dj
  - javascript
featured: false
---

If you've ever logged the MIDI coming off a DJ controller, you might have noticed something odd. Move a single fader and you don't get one stream of messages. You get **two**, on two different control numbers, moving together.

It looks like a bug. It's actually one of the neater tricks in the MIDI spec, and once you know it, a lot of controller behavior makes sense.

## The problem: 128 steps isn't enough

A normal MIDI Control Change message carries a value from **0 to 127**. That's **7 bits**, because the top bit of each data byte is reserved by the protocol.

For a lot of things, 128 steps is fine. For a filter sweep, a tempo fader or a volume fade, it's not. You can *hear* the steps: a slow filter sweep turns into a staircase, and a pitch fader with only 128 positions across its range can't be set precisely.

## The fix: send it in two halves

MIDI's answer is to split a bigger number across **two** control messages:

- the **MSB** (most significant bits, the coarse value) on one control number
- the **LSB** (least significant bits, the fine value) on a second control number

For the first 32 control numbers, the convention is that **CC *n* carries the MSB** and **CC *n* + 32 carries the LSB**. So a fader on CC 7 sends its fine value on CC 39.

Two 7-bit halves make **14 bits**, which means values from **0 to 16,383** instead of 0 to 127. That's 128 times more resolution, and the staircase becomes a ramp.

## Combining them in code

```javascript
const msb = new Map(); // last coarse value per control

function onControlChange(cc, value) {
  if (cc < 32) {
    msb.set(cc, value);
    return emit(cc, value << 7);            // coarse update right away
  }
  if (cc >= 32 && cc < 64) {
    const coarseCC = cc - 32;
    const coarse = msb.get(coarseCC) ?? 0;
    return emit(coarseCC, (coarse << 7) | value); // full 14-bit value
  }
}

function emit(cc, value14) {
  const normalized = value14 / 16383;       // 0.0 → 1.0
  update(cc, normalized);
}
```

`coarse << 7` shifts the MSB up into the high 7 bits, and `| value` drops the LSB into the low 7 bits. One number, 14 bits of precision.

## The gotchas

**Order matters.** Devices typically send the MSB first, then the LSB. If you only update on the LSB, you'll lag behind. If you only use the MSB, you've thrown away the extra resolution. The approach above updates on both.

**Not every control is 14-bit.** Buttons and many knobs are plain 7-bit. If you blindly treat CC 32–63 as fine values on a controller that uses them for regular controls, you'll get garbage. Check what your device actually sends.

**Pitch bend is already 14-bit.** It's its own message type that carries both halves in a single message, no pairing needed.

**Normalize early.** Convert everything to 0–1 as soon as possible, so your UI code never cares whether a control was 7-bit or 14-bit.

## Where I ran into it

My DJ display project, DUALPLAYER, reads the controller's MIDI to show EQ, filter, tempo and fader positions. The controller's faders and knobs are 14-bit, coarse on one CC and fine on CC + 32, and combining both is what makes the readouts move smoothly instead of in visible jumps.

It's a small detail, and it's exactly the kind of small detail that separates a display that feels like real gear from one that feels like a prototype.

## The takeaway

A protocol from the early 1980s, designed when every byte counted, found a way to add precision without breaking compatibility: old devices just read the coarse value and ignore the rest.

That's elegant engineering. Now go log your controller and see which of your faders have been quietly sending double.
