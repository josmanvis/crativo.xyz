---
title: "Building a Frame-by-Frame Scrubber to Study Skate Clips"
excerpt: "Every skater has paused a trick video at 0.25× trying to figure out what the back foot is doing. The browser's video element can step frame by frame if you know the right API."
category: tutorials
publishedAt: "2026-05-13"
tags:
  - skateboarding
  - javascript
  - video
  - web-apis
featured: false
---

If you skate, you've done this. You find a clip of someone landing the trick you've been failing at for weeks. You slow it down. You pause. You scrub back. You try to see what the back foot is doing in the half second that actually matters.

And the default video player fights you every step of the way, jumping in big chunks and never quite landing on the frame you want.

So let's build a better one: a scrubber that steps **one frame at a time**, with keyboard shortcuts, in plain JavaScript.

## The setup

```html
<video id="clip" src="kickflip.mp4" playsinline muted></video>
<output id="readout">frame 0</output>
```

`playsinline` stops iOS from going fullscreen, and `muted` keeps the browser happy about autoplay rules.

## Stepping one frame

The `<video>` element has no "next frame" button, but it has `currentTime`, which you can set. If you know the clip's frame rate, one frame is `1 / fps` seconds:

```javascript
const video = document.getElementById('clip');
const FPS = 60; // match your footage; phones often record at 30 or 60

function step(frames) {
  video.pause();
  const next = video.currentTime + frames / FPS;
  video.currentTime = Math.min(Math.max(next, 0), video.duration);
}
```

The browser doesn't tell you a video's frame rate through a simple property, so you either know it (you filmed it) or you pick a sensible default. For studying your own clips, you know it.

## Keyboard shortcuts

Hands on the keyboard, eyes on the board:

```javascript
window.addEventListener('keydown', (e) => {
  if (e.key === ',') step(-1);                 // back one frame
  if (e.key === '.') step(1);                  // forward one frame
  if (e.key === 'ArrowLeft') step(-FPS / 4);   // back a quarter second
  if (e.key === 'ArrowRight') step(FPS / 4);
  if (e.key === ' ') {
    e.preventDefault();
    video.paused ? video.play() : video.pause();
  }
});
```

Comma and period for single frames is a convention lots of video tools use, so your fingers may already know it.

## Knowing which frame you're on

Here's the subtle part. After you set `currentTime`, the frame on screen updates *asynchronously*. If you update your readout immediately, it can be one frame behind what you're looking at.

That's what `requestVideoFrameCallback` is for. It calls you back when a new frame is actually presented, with its exact media time:

```javascript
const readout = document.getElementById('readout');

function onFrame(_now, meta) {
  const frame = Math.round(meta.mediaTime * FPS);
  readout.textContent = `frame ${frame} · ${meta.mediaTime.toFixed(3)}s`;
  video.requestVideoFrameCallback(onFrame);
}

if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
  video.requestVideoFrameCallback(onFrame);
} else {
  video.addEventListener('seeked', () => {
    readout.textContent = `${video.currentTime.toFixed(3)}s`;
  });
}
```

It's supported in current Chromium, Safari and Firefox, and the `seeked` fallback keeps older browsers usable.

## Slow motion that's actually smooth

For watching rather than stepping, `playbackRate` gives you real slow-mo:

```javascript
video.playbackRate = 0.25;
```

Footage shot at a high frame rate looks great slowed down. Footage shot at 30 fps gets choppy fast, because there just aren't enough frames to stretch. If you film tricks to study them, filming at 60 fps or higher makes a big difference.

## Make it a good UI

A few touches turn this from a demo into a tool:

- **A big frame counter.** You'll want to say "the flick happens at frame 214."
- **Marks.** Press `M` to bookmark a frame, so you can jump between pop, flick and catch.
- **A/B loop.** Loop between two marks forever at 0.25×. That's where the learning happens.
- **Mirror.** A `transform: scaleX(-1)` toggle helps when the clip is of someone with the opposite stance.

## Then go skate

The scrubber won't land the trick for you. But seeing exactly where your weight is at the moment of the pop, compared with someone who lands it every time, can fix in five minutes what a month of guessing didn't.

Watch frame by frame. Then close the laptop, grab the board, and do the reps.
