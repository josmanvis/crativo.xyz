---
title: "Tap Tempo: Measuring BPM by Hitting the Spacebar"
excerpt: "Tap along to a song, get its tempo. It's one of the oldest tools on every drum machine and DJ mixer, and it fits in about 30 lines of JavaScript, plus one statistics trick to stop your sloppy taps ruining it."
category: tutorials
publishedAt: "2026-05-27"
tags:
  - dj
  - music
  - javascript
featured: false
---

Every drum machine, guitar pedal and DJ mixer worth owning has a **tap tempo** button. You hit it in time with the music, and it tells you the BPM.

It's the simplest possible beat detector: the human. Let's build one in the browser, so you can tap along to any track and know whether it'll mix with the one you're playing.

## The core math

BPM is beats per minute, and a minute is 60,000 milliseconds. So if the average time between your taps is `interval` milliseconds:

```
BPM = 60000 / interval
```

Tap every 500 ms and you get 120 BPM. Tap every 469 ms or so and you're around 128, prime house territory.

## The naive version

```javascript
let taps = [];

function tap() {
  taps.push(performance.now());
  if (taps.length < 2) return null;
  const intervals = taps.slice(1).map((t, i) => t - taps[i]);
  const avg = intervals.reduce((a, b) => a + b) / intervals.length;
  return 60000 / avg;
}
```

Use `performance.now()`, not `Date.now()`: it's a high-resolution timer designed for measuring durations.

This works, but it has two problems. It remembers every tap forever, so if the song changes you're averaging two different tempos. And one late tap drags the whole average off.

## Fix 1: forget old taps

Two rules: only keep the last several taps, and if you stop tapping for a couple of seconds, start fresh.

```javascript
const MAX_TAPS = 8;
const RESET_AFTER_MS = 2000;

function tap() {
  const now = performance.now();
  const last = taps[taps.length - 1];
  if (last !== undefined && now - last > RESET_AFTER_MS) taps = [];

  taps.push(now);
  if (taps.length > MAX_TAPS) taps.shift();
  ...
}
```

Now tapping a new song works immediately, without a reset button.

## Fix 2: use the median, not the mean

Humans are sloppy. One tap 150 ms late wrecks an average, but it barely moves a **median**. Sort the intervals and take the middle one:

```javascript
function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
```

The median shrugs off a bad tap. That one change makes the readout dramatically more stable.

## Putting it together

```javascript
let taps = [];

export function tap() {
  const now = performance.now();
  const last = taps[taps.length - 1];
  if (last !== undefined && now - last > 2000) taps = [];

  taps.push(now);
  if (taps.length > 8) taps.shift();
  if (taps.length < 3) return null; // need a couple of intervals to be meaningful

  const intervals = taps.slice(1).map((t, i) => t - taps[i]);
  return Math.round((60000 / median(intervals)) * 10) / 10;
}

window.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.repeat) return;
  e.preventDefault();
  const bpm = tap();
  display.textContent = bpm ? `${bpm} BPM` : 'keep tapping…';
});
```

Notice `e.repeat`: holding the spacebar fires repeated keydown events, and you don't want auto-repeat counted as taps.

## Half-time and double-time

You'll quickly discover the classic tap-tempo confusion: tapping along to the hi-hats instead of the kick gives you double the BPM. Tapping every other kick gives you half.

Add two little buttons, **×2** and **÷2**, and you've covered it. Every hardware tap tempo has some version of this, because everyone taps along to the wrong thing sometimes.

## Make it feel good

- **Flash something on every tap.** Visual confirmation helps you lock in.
- **Show the number big**, with one decimal at most. Nobody needs 127.8364 BPM.
- **Show confidence.** "Keep tapping" until there are enough taps, then the number.

It's a tiny tool, but it's a good reminder that the simplest algorithm (count, measure, average) only becomes a good one when you design for how real humans behave: sloppily, inconsistently, and grooving way too hard.
