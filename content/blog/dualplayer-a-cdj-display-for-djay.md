---
title: "DUALPLAYER: I Built a CDJ-3000 Screen for Software That Has No API"
excerpt: "djay Pro won't tell anyone what's playing on which deck. So I stitched it together from MIDI, a history log, a text file and a copy of its database, and put it on a fullscreen display that looks like club gear."
category: deep-dives
publishedAt: "2026-09-16"
tags:
  - dj
  - swift
  - macos
  - midi
  - side-project
featured: false
---

Club DJs mix on CDJs, and the CDJ-3000's screen is a thing of beauty: two players side by side, big BPM readouts, key, tempo, waveforms, everything you need at a glance in a dark booth.

I mix at home on an **AlphaTheta DDJ-FLX2** controller with **djay Pro**. Great setup. But djay's interface lives in a laptop window, and I wanted that club-style overview on a second screen.

So I built **DUALPLAYER**: a fullscreen, CDJ-3000-styled companion display. Two player panels, a crossfader strip, the current track, and djay's analyzed library.

There was just one problem. **djay Pro has no API for its per-deck state.** Nothing. You can't ask it what's playing.

## Building a display without asking

If you can't ask the app, you watch everything around it. DUALPLAYER combines five sources:

| Source | What it gives |
|---|---|
| The controller's MIDI stream | play state, tempo, volume, filter, EQ, crossfader, pad mode, stems, cue/sync, loop |
| djay's history log | **which track is on which deck**, with duration and load time |
| `NowPlaying.txt`, which djay writes live | the master track's title, artist, album and length |
| djay's media library database | the browsable track list with BPM and key |
| an audio input you choose | the live waveform |

Every number on screen comes from one of these. None of them were designed to be a public API. Together, they almost are.

## Controls by meaning, not by number

MIDI controllers send numbered messages: "CC 19 changed to 87." Hardcode those numbers and the moment you remap a control in djay, your display shows the wrong thing.

Instead, DUALPLAYER **reads djay's own mapping file** and routes each incoming message by what it's bound to: `turntable1.highEQ`, `mixer.crossfade`, `turntable2.unmixerThreeTrackChannel1Active`. Remap a control in djay, and the display follows it with no code change. The file is re-read whenever it changes.

## Which track is on which deck?

This was the hardest puzzle. `NowPlaying.txt` names a track, but never says **which deck** it's on. With two decks, that's useless.

The answer turned out to be djay's **history log**. Every history row includes a deck number next to the title, artist, duration and start time. Take the newest row per deck and each player gets its own track, which is then matched against the library for BPM and key.

But the deck numbers were encoded, so I didn't assume. I verified: only two deck tokens appeared across all 52 rows in my history (a clean 25/27 split), the decoded durations matched what `NowPlaying.txt` reported, the start times decoded to the right dates, and the newest deck-1 row was exactly the track `NowPlaying.txt` was naming.

When you're reverse-engineering someone else's data, "it looks right" isn't good enough. Cross-check it against something you already trust.

## Being honest about the limits

A display that confidently shows wrong data is worse than no display. So DUALPLAYER's README lists exactly what it can't do:

- **No playhead.** `NowPlaying.txt` reports a track's *duration*, not its *position*, and it doesn't change while the track plays. So there's no elapsed/remaining time and no way to place cue points on a timeline.
- **Play and stem state are inferred** from the controller: the play button toggles, loading a track resets, cue pauses. Drive things from the controller and it stays correct. Click around in djay with the mouse and it can drift.
- **Key mapping is inferred** from djay's stored key index and shown as both Camelot and note name.
- **The waveform is live audio**, not a whole-track overview.
- **The library is read from a private copy** of djay's database, because djay keeps the original open. Nothing djay owns is ever written to.

## Small hardware details that matter

The FLX2's faders and knobs are **14-bit**: they send a coarse value on one control number and a fine value on another, and DUALPLAYER combines both for smooth readouts. Tempo shows as a percentage, matching how the CDJ layout presents it. And like the real CDJ screen, the jog wheel and tempo fader aren't drawn, just their readouts.

## How it's built

It's a native macOS app, built as a **universal binary** (Apple Silicon and Intel) with a build script instead of an Xcode project:

```bash
./build.sh                # → ~/Applications/DUALPLAYER.app
./build.sh /Applications  # or anywhere else
```

## The real lesson

"There's no API" is rarely the end of the conversation. Apps leave traces everywhere: logs, files they write for other tools, databases, the hardware messages flowing through them. Combine enough of those traces, verify each one, document what you're guessing, and you can build something the original app never planned for.

And now my bedroom setup has a club screen. The crowd (still zero people) is very impressed.
