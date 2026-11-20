---
title: "House Music Is Just Integer Math: Building a Phrase Counter in JavaScript"
excerpt: "Four beats a bar, eight bars a phrase, and every good mix lands on the one. Turns out the structure behind a dance floor fits in a dozen lines of code."
category: tutorials
publishedAt: "2026-02-04"
tags:
  - dj
  - music
  - javascript
featured: false
---

I'm a bedroom DJ. That means I have the controller, the headphones, the strong opinions about hi-hats, and a crowd of exactly zero people.

And the first thing nobody tells you about mixing house music is that it's **math**. Friendly, predictable, integer math. Which, for a programmer, is the best possible news.

## The structure

House music is built on a grid so regular it's basically a spreadsheet:

- **4 beats per bar.** The famous four-on-the-floor kick: boom, boom, boom, boom.
- **Bars group into phrases**, usually **8 or 16 bars**, and bigger sections are often 32.
- **Things change on phrase boundaries.** A new hi-hat comes in, the bassline drops out, the vocal starts. Producers almost never change something on bar 5.

Tempos for house usually sit somewhere around the **120–128 BPM** range. At 124 BPM, one beat is about 0.48 seconds, a bar is about 1.9 seconds, and a 16-bar phrase is about 31 seconds.

Why does this matter? Because the golden rule of mixing is: **start your next track at the beginning of a phrase, lined up with the beginning of a phrase in the current one.** Do that and the transition sounds intentional. Miss by a bar and it sounds like two radios arguing.

## The math

If you know the BPM and when beat one happened, everything else is division:

```typescript
interface Position {
  bar: number;          // 1-based bar within the phrase
  beat: number;         // 1–4
  phrase: number;       // 1-based phrase count
  beatsToNextPhrase: number;
  secondsToNextPhrase: number;
}

export function position(
  elapsedSeconds: number,
  bpm: number,
  barsPerPhrase = 16
): Position {
  const secondsPerBeat = 60 / bpm;
  const totalBeats = Math.floor(elapsedSeconds / secondsPerBeat);
  const beatsPerPhrase = 4 * barsPerPhrase;

  const beatInPhrase = totalBeats % beatsPerPhrase;
  const beatsToNextPhrase = beatsPerPhrase - beatInPhrase;

  return {
    phrase: Math.floor(totalBeats / beatsPerPhrase) + 1,
    bar: Math.floor(beatInPhrase / 4) + 1,
    beat: (beatInPhrase % 4) + 1,
    beatsToNextPhrase,
    secondsToNextPhrase:
      beatsToNextPhrase * secondsPerBeat - (elapsedSeconds % secondsPerBeat),
  };
}
```

Feed it the elapsed time and you get "phrase 3, bar 12, beat 2, 18.4 seconds until the next phrase." That last number is the one you actually care about at 1 a.m.

## Putting it on screen

A phrase counter is a perfect little UI problem: it has to be readable at a glance, in a dark room, while your hands are busy. So:

- **Big bar numbers, small everything else.** You care which bar you're on far more than which beat.
- **A countdown to the next phrase**, because "in 8 bars" is how DJs actually think.
- **Highlight the last 4 bars** of each phrase. That's your "get ready" window.

```typescript
function render(p: Position) {
  const warn = p.beatsToNextPhrase <= 16; // last 4 bars
  el.textContent = `${String(p.bar).padStart(2, '0')}.${p.beat}`;
  el.dataset.warn = String(warn);
}
```

Then in CSS, make `[data-warn="true"]` glow. Your future self, mid-transition, will be grateful.

## The catch: real music isn't perfectly regular

This works beautifully for electronic tracks with a steady tempo, which is most house music. It gets shakier with live drummers, tempo changes, or tracks that start with an intro that's an odd number of bars. Real DJ software solves this with **beat grids** that you can nudge and re-anchor.

So treat this as the clean version of the idea: once you've anchored beat one, the rest of the night is just integers.

## Why I love this

Most of programming is wrestling with ambiguity. House music is the opposite: a genre whose whole groove comes from being predictable. Four beats, sixteen bars, drop on the one.

It's the most satisfying `%` operator in my life. Now if you'll excuse me, the bedroom dance floor is expecting a deep house set.
