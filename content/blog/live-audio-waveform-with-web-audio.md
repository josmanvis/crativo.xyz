---
title: "Draw a Live Audio Waveform in the Browser With the Web Audio API"
excerpt: "Pipe a microphone or audio interface into an AnalyserNode, ask it for numbers 60 times a second, draw them on a canvas. Instant oscilloscope, zero dependencies."
category: tutorials
publishedAt: "2026-07-08"
tags:
  - web-audio
  - javascript
  - dj
  - canvas
featured: false
---

There's something hypnotic about a live waveform: the kick drum punching the line up, the hi-hats fizzing along the top. DJ gear is covered in them for good reason. You can *see* the music.

The browser can do this natively with the **Web Audio API**. No libraries, no plugins. An audio input, one analyser node, a canvas, and about 40 lines of code.

## Step 1: get audio in

For live input from a microphone, an audio interface, or a loopback device carrying your DJ software's output, use `getUserMedia`:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: false, // these are for phone calls, not music
    noiseSuppression: false,
    autoGainControl: false,
  },
});

const ctx = new AudioContext();
const source = ctx.createMediaStreamSource(stream);
```

**Turn off those three processing options.** They're tuned for voice calls, and they'll happily "clean up" your music by squashing the dynamics and removing the hi-hats. Great for Zoom, terrible for house music.

Also note that browsers require a user gesture before audio starts, so kick this off from a button click.

## Step 2: add an analyser

```javascript
const analyser = ctx.createAnalyser();
analyser.fftSize = 2048;
source.connect(analyser);

const samples = new Float32Array(analyser.fftSize);
```

The `AnalyserNode` doesn't change the sound at all. It just lets you peek at it. `fftSize` controls how many samples you grab per frame: bigger means a longer, more detailed slice of audio.

Notice we **don't** connect the analyser to `ctx.destination`. We only want to look at the sound, not play it back out of the speakers, which would cause feedback with a mic.

## Step 3: draw it

```javascript
const canvas = document.querySelector('canvas');
const g = canvas.getContext('2d');

function draw() {
  analyser.getFloatTimeDomainData(samples); // values from -1 to 1

  const { width, height } = canvas;
  g.clearRect(0, 0, width, height);
  g.beginPath();

  for (let i = 0; i < samples.length; i++) {
    const x = (i / samples.length) * width;
    const y = (0.5 - samples[i] / 2) * height;
    i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
  }

  g.strokeStyle = '#ff4a1c';
  g.lineWidth = 2;
  g.stroke();
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```

`getFloatTimeDomainData` fills the array with the raw waveform: each value is the speaker position at that instant, from −1 to 1. Map it to the canvas height, connect the dots, and that's an oscilloscope.

## Make it look like DJ gear

A raw oscilloscope line is cool but jittery. DJ software tends to show **amplitude**, the loudness envelope, as filled bars that are easier to read at a glance. Compute the peak for small chunks of samples:

```javascript
const bars = 64;
const chunk = Math.floor(samples.length / bars);

for (let b = 0; b < bars; b++) {
  let peak = 0;
  for (let i = b * chunk; i < (b + 1) * chunk; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  const h = peak * height;
  g.fillRect(b * (width / bars), (height - h) / 2, width / bars - 1, h);
}
```

Symmetrical bars, centered vertically. Suddenly it looks like a mixer.

## Crisp on retina screens

Canvas drawings look blurry on high-density displays unless you size the backing store for the device pixel ratio:

```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
g.scale(dpr, dpr);
```

Do this once (and on resize), then draw in **CSS pixels**: inside `draw()`, use `canvas.clientWidth` and `canvas.clientHeight` instead of `canvas.width` and `canvas.height`, or the `scale()` call will double everything.

## Live audio vs. a track overview

One important distinction: this shows **the audio happening right now**. The scrolling waveforms in DJ software that show the whole track, with the drop visible ahead of time, come from **pre-analyzing the entire file**, not from live input.

You can do that in the browser too, by decoding a file with `decodeAudioData` and computing peaks across the whole buffer, but it's a different technique. A live analyser can only ever show the present. It can't see the drop coming. That part's still your job as the DJ.

Now plug something in and watch the kick drum punch. It never gets old.
