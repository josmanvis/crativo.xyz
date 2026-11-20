---
title: "The Camelot Wheel in 10 Lines: Harmonic Mixing for Programmers"
excerpt: "DJs use a clock-shaped cheat sheet to know which tracks sound good together. Under the hood it's the circle of fifths and some modulo arithmetic, so obviously I turned it into code."
category: tutorials
publishedAt: "2026-04-29"
tags:
  - dj
  - music
  - javascript
featured: false
---

Some transitions in a DJ set just *work*. The two tracks blend and it sounds like one song turning into another. Others clash so hard the dance floor collectively winces.

A big reason is **musical key**. Two tracks in compatible keys blend. Two in clashing keys fight. And DJs have a beautifully simple tool for this: the **Camelot wheel**.

## The wheel

The Camelot wheel lays all 24 musical keys out like a clock:

- **Numbers 1–12** go around the clock.
- **"B"** is the major key, **"A"** is the minor key, at each number.

So **8B is C major** and **8A is A minor**. Then the rule of thumb for a smooth mix is: from any key, you can move to

- **the same key** (8A → 8A)
- **one step around the clock**, keeping the letter (8A → 7A or 9A)
- **the other letter at the same number** (8A → 8B), the relative major/minor

That's it. No music theory degree required, which is exactly why DJs love it.

## Why it works: it's the circle of fifths

The wheel isn't arbitrary. Going one step clockwise moves up a **perfect fifth**: C → G → D → A and so on. Keys a fifth apart share all but one note, which is why they blend so smoothly. And the A/B pairs at the same number are **relative keys** that share every single note.

So the Camelot wheel is the circle of fifths with friendlier labels. Musicians had this figured out centuries ago. DJs just gave it a clock face.

## The code

Represent each key as a **pitch class**, 0–11, where C = 0, C♯ = 1 and so on up to B = 11. Moving up a fifth is +7 semitones, so a key's position around the circle of fifths is `(pitch × 7) % 12`. Line that up so C major lands on 8 and you're done:

```javascript
const majorNumber = (pc) => ((pc * 7) % 12 + 7) % 12 + 1;

function camelot(pitchClass, isMinor) {
  // A minor key shares its notes with the major key 3 semitones up (A minor → C major).
  return isMinor
    ? `${majorNumber((pitchClass + 3) % 12)}A`
    : `${majorNumber(pitchClass)}B`;
}

camelot(0, false); // C major → "8B"
camelot(9, true);  // A minor → "8A"
camelot(7, false); // G major → "9B"
```

I checked this against the full standard chart: all 24 keys come out right.

## Finding compatible tracks

Once a key is a number and a letter, compatibility is just neighbors on a clock:

```javascript
function compatible(code) {
  const n = parseInt(code, 10);
  const letter = code.slice(-1);
  const wrap = (x) => ((x - 1 + 12) % 12) + 1; // 0 → 12, 13 → 1
  const other = letter === 'A' ? 'B' : 'A';
  return [code, `${wrap(n - 1)}${letter}`, `${wrap(n + 1)}${letter}`, `${n}${other}`];
}

compatible('8A'); // ['8A', '7A', '9A', '8B']
compatible('12B'); // ['12B', '11B', '1B', '12A'], wrapping around the clock
```

The `wrap` helper is the most important line. Without it, 12 + 1 becomes 13 and you end up recommending a key that doesn't exist, which is the music equivalent of a 404.

## Making it useful

Now hook it up to a track library that has key data and you get a "what can I play next?" filter:

```javascript
const next = library.filter((t) => compatible(current.key).includes(t.key));
```

Sort those by BPM closeness and you've got the core of a pretty smart track suggester.

## The honest caveat

Key compatibility isn't a law. Energy, groove, vocals and plain vibes matter just as much, and some of the best transitions break the rules on purpose. Also, key-detection software is good but not perfect, so trust your ears over the label.

But as a starting point? It's remarkable that something that sounds so musical comes down to `× 7 % 12`. Music is math. The good kind.
