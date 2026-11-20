---
title: "Plug a DJ Controller Into Your Browser: The Web MIDI API in 15 Minutes"
excerpt: "Your browser can talk to hardware. Not via a plugin, not via an Electron app. Just a JavaScript API, a USB cable and a controller covered in glowing buttons."
category: tutorials
publishedAt: "2026-03-04"
tags:
  - midi
  - dj
  - javascript
  - web-apis
featured: false
---

There's a little-known corner of the web platform that feels like cheating: the **Web MIDI API**. Plug a MIDI device into USB, and a web page can read every button, knob and fader on it in real time.

I mix on a DJ controller, so naturally I want every pad on it to light up a `<div>`. Let's build exactly that.

## Step 1: ask for access

```javascript
const midi = await navigator.requestMIDIAccess();

for (const input of midi.inputs.values()) {
  console.log('Found:', input.name);
  input.onmidimessage = handleMessage;
}
```

That's genuinely the whole setup. The browser asks the user for permission, then hands you every connected MIDI input. You also get a `statechange` event on `midi` when devices are plugged in or out, so you can attach listeners on the fly.

Two gotchas:

- It only works on a **secure context** (HTTPS or `localhost`).
- **Browser support is not universal.** Chromium-based browsers support it, Firefox supports it too, but Safari does not. Always feature-detect with `'requestMIDIAccess' in navigator`.

## Step 2: decode three bytes

Most MIDI messages are just **three bytes**. The first one, the *status byte*, tells you what happened and on which channel:

```javascript
function handleMessage({ data }) {
  const [status, data1, data2] = data;
  const type = status & 0xf0;    // what kind of message
  const channel = status & 0x0f; // which of 16 channels

  switch (type) {
    case 0x90: // Note On
      if (data2 > 0) pressed(channel, data1, data2);
      else released(channel, data1); // velocity 0 = release
      break;
    case 0x80: // Note Off
      released(channel, data1);
      break;
    case 0xb0: // Control Change: knobs, faders, jog wheels
      moved(channel, data1, data2 / 127);
      break;
  }
}
```

The two you'll see constantly on a DJ controller:

- **Note On / Note Off** (`0x90` / `0x80`): buttons and pads. `data1` is which button, `data2` is velocity.
- **Control Change** (`0xB0`): knobs and faders. `data1` is which control, `data2` is the value from 0 to 127.

And one classic trap: plenty of devices send **Note On with velocity 0** instead of a proper Note Off. Treat it as a release, or your pads will stay "pressed" forever.

## Step 3: find out what's what

Every controller maps its buttons to different note and CC numbers, and the manual is usually a PDF from a dark corner of the manufacturer's site. The fastest way to learn your device is to log everything and push buttons:

```javascript
function handleMessage({ data }) {
  console.log([...data].map((b) => b.toString(16).padStart(2, '0')).join(' '));
}
```

Press a pad, write down the bytes. Twist a knob, write down the bytes. Ten minutes later you have your own mapping table, and a much deeper appreciation for whoever designed the factory one.

## Step 4: make it visual

```javascript
function pressed(channel, note, velocity) {
  const pad = document.querySelector(`[data-note="${note}"]`);
  pad?.classList.add('lit');
}
function released(channel, note) {
  document.querySelector(`[data-note="${note}"]`)?.classList.remove('lit');
}
```

Hit a pad, a square on screen glows. It's a small thing, and it is absurdly satisfying the first time a physical button changes a web page with no lag at all.

## Going the other way

MIDI is two-way. Grab an output from `midi.outputs` and you can **send** messages back, which on many controllers means lighting up the pad LEDs from your code:

```javascript
output.send([0x90, padNote, 127]); // light it
output.send([0x80, padNote, 0]);   // turn it off
```

Which value means which color is, again, in that PDF.

## Why bother?

Because it opens a door most web devs never walk through. MIDI controllers are cheap, sturdy and full of satisfying physical inputs: faders, knobs, pads, jog wheels. With a web page and this API you can build custom control surfaces, visualizers, practice tools and weird art projects, with nothing to install.

Hardware and the web, finally on speaking terms. Go push some buttons.
