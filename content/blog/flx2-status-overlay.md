---
title: "Why We Built a Heads-Up Display for a DJ Controller"
excerpt: "The DDJ-FLX2 has eight pads that mean four different things depending on an invisible mode, and it never tells you which. We built a 723-line Swift overlay that listens to the MIDI and puts the answer on screen — including one number it has to guess."
category: deep-dives
publishedAt: "2026-09-08"
tags:
  - swift
  - macos
  - coremidi
  - dj-hardware
  - open-source
coverImage: /blog/flx2-status-overlay.svg
featured: true
seo:
  title: "FLX2 Status Overlay: Reading DJ Controller Pad Modes Over CoreMIDI"
  description: "How we built a click-through macOS overlay that shows the AlphaTheta DDJ-FLX2's active pad mode per deck by listening to raw MIDI and parsing djay Pro's own mapping file."
  keywords: ["DDJ-FLX2", "CoreMIDI", "swift overlay", "djay pro", "midi mapping", "macos nspanel"]
---

# Why We Built a Heads-Up Display for a DJ Controller

The AlphaTheta DDJ-FLX2 has eight performance pads per deck. Those eight pads mean four completely different things depending on which mode the deck is in — Hot Cue, Beat Loop, Sampler, Pad FX.

The pads are not labelled. They cannot be labelled, because their meaning changes every time someone presses a mode button.

So the workflow is: look at the controller, forget which mode you're in, look up at the laptop, hunt for the mode indicator in djay's UI, look back down — and by then the transition is gone.

We built a small always-on-top overlay that just says it. Black rounded box, orange monospace, bottom of the screen, click-through so it never steals a mouse event.

```
1  BEAT LOOP   -DRUMS- [INSTR][VOCAL]   2  HOT CUE   [DRUMS] -INSTR- [VOCAL]

LOOP 1    LOOP 4    LOOP 8    LOOP 16    CUE 1     CUE 2     CUE 3     CUE 4
-1 BT     -4 BT     +1 BT     +4 BT      CUE 5     CUE 6     CUE 7     CUE 8
```

Two decks, side by side, laid out the way they sit under your hands. Each column is the deck number, its current pad mode, its stem state, and a live legend of what all eight pads currently trigger. The pad that was just hit flashes white.

It's 723 lines of Swift in one file, with no Xcode project. Here's the reasoning, how it reads a device that never describes itself, and the one part of it that is a principled guess.

## The Problem With Looking at the Screen

The information already exists. djay Pro displays the pad mode perfectly well.

It displays it in a panel, on a laptop, behind whatever you're actually reading, in a font sized for a mouse user sitting still. None of that is true of the person using it. When you're beat matching, your eyes are on the controller and your ears are on the mix.

This is the whole argument for the overlay, and it's not a technical one. The data isn't missing, it's in the wrong place. An overlay is a boring fix: put it at the bottom of the screen where peripheral vision picks it up, at a size readable from a metre away, in a window that never takes focus.

The technically interesting part came right after — the controller never actually announces what mode it's in.

## The Controller Doesn't Announce Its Mode

There's no "current mode" message. Nothing to query. The FLX2 sends a note-on when a pad-mode button is pressed, and that is the only signal in existence.

```swift
/// Pad-mode button notes (channel 0 = deck 1, channel 1 = deck 2).
let kPadModeNotes: [UInt8: PadMode] = [0: .hotCue, 1: .beatLoop, 3: .sampler, 5: .padFX]
```

So the overlay opens a CoreMIDI input, connects to every source whose name matches `FLX2`, and listens. Press Beat Loop on deck 1 and channel 0 note 1 arrives. That's the mode.

Which leaves the cold-start problem: when the overlay launches, each deck is already in *some* mode and nobody said which. The pads themselves solve it. Every mode's eight pads occupy their own block of note numbers, so any pad press identifies the mode retroactively:

```swift
/// Which mode (and which pad) a given note belongs to.
static func forNote(_ n: UInt8) -> (PadMode, Int)? {
    switch n {
    case 0...7:    return (.hotCue, Int(n))
    case 16...23:  return (.padFX, Int(n - 16))
    case 48...55:  return (.sampler, Int(n - 48))
    case 96...103: return (.beatLoop, Int(n - 96))
    default:       return nil
    }
}
```

Until that first press, the overlay draws the mode dimmed — a small honesty signal meaning *this is a guess, not a confirmation*. One pad hit and it goes bright.

## Don't Hard-Code the Labels. Read the Mapping.

The first version had the pad labels hard-coded. `LOOP 1`, `LOOP 4`, `LOOP 8`. It was wrong within a week, because the mapping got edited and the overlay was now confidently lying.

A lying HUD is worse than no HUD. You stop trusting it, and an untrusted readout is just clutter.

So we stopped guessing and started reading djay Pro's own `.djayMidiMapping` file — the same plist djay uses to decide what a pad does. It looks for the mapping in the order you'd want: an explicit `$FLX2_MAPPING` override, then a named personal mapping, then any user mapping whose USB id matches the FLX2, newest first, then djay's bundled default.

Each control in that plist carries a `keyPath` like `turntable1.loopIn` or `turntable2.unmixerThreeTrackChannel1Muted`. The overlay shortens those into labels and re-reads the file whenever its modification date changes. Edit the mapping, and the overlay follows without a restart.

The bonus round: Pad FX pads get their real effect names. djay records which Instant FX sits in each of its eight slots in its own preferences plist, so instead of `FX 1` through `FX 8` you get `ECHO OUT LONG`, `REVERB OUT`, `GATE 1/4`. Same trick — read what the app already knows.

The principle is one worth stealing: **if the information already exists on disk, don't re-declare it.** Every hard-coded copy is a thing that will drift, and it will drift silently.

## The Part That Can't Be Solved

The overlay shows stem state — which of DRUMS / INSTR / VOCAL are audible on each deck, as filled orange chips, with muted stems dimmed and struck through.

That row is a guess. A careful, well-maintained guess, but a guess.

Nothing can ask djay what its Neural Mix state is. There's no API, no file, no message. And one app cannot see the LED feedback another app sends to the controller — djay owns that MIDI output connection, and macOS is not going to let a second process eavesdrop on it.

So the state is *inferred*:

- every stem pad in the mapping is a toggle, so a press flips the tracked state
- a deck starts from "all stems audible"
- pressing a Load Track button resets that deck back to all-audible

```swift
if let kp = Mapping.shared.keyPath(ch: Int(ch), note: Int(note)) {
    if let b = Mapping.stemBinding(kp) {
        Model.shared.toggleStem(deck: b.deck, index: b.index, muted: b.muted)
    } else if kp.hasSuffix(".loadTrack"), kp.hasPrefix("turntable"),
              let d = Int(String(Array(kp)[9])) {
        Model.shared.resetStems(deck: d - 1)
    }
}
```

This holds as long as stems are driven from the pads. The moment someone mutes a stem with the mouse in djay's own UI, the overlay is out of step and has no way to find out.

We nearly cut the feature for that reason. We kept it and added a **Resync stem state** item to the menu bar that puts both decks back to all-audible, because in practice the pads drive the stems almost all of the time, and a mostly-correct readout you can reset in one click beats no readout at all.

But it's documented as inferred — in the README, and in the menu item that exists to fix it. If you're going to ship a guess, label it a guess.

## Laying It Out Like the Decks

The first version stacked the decks vertically: deck 1's block, then deck 2's block. It worked, and it was subtly wrong, because that is not where the decks are. Deck 1 is on the left and deck 2 is on the right. Your hands know that. An overlay that disagrees with your hands adds a translation step, and a translation step at 128 BPM is a missed cue.

Turning it into two side-by-side columns sounds like a five-minute change. It wasn't, because the whole thing is drawn as a single `NSAttributedString` and the labels are a different width every time the mapping changes.

Space-padding the columns doesn't work: the title row is 13pt and the pad grid is 11pt, so the same number of monospace characters is a different number of points. Column two would line up on the grid rows and drift on the titles.

Tab stops fix it. Measure the widest row of the left column, put an `NSTextTab` just past it, and separate the columns with `\t`:

```swift
var stops: [NSTextTab] = []
var x: CGFloat = 0
for col in columns.dropLast() {
    x += width(col) + kColumnGap
    stops.append(NSTextTab(textAlignment: .left, location: x))
}
```

Tab stops are absolute positions, so they don't care what font the run is in. Both grids and both titles land on the same edge regardless of size.

The same trick in reverse put the stem chips where they belong. They started as their own row under each grid, costing a line per deck. Now each deck's chips hang off a *right*-aligned tab stop at its own column's right edge, so they stay flush with the pad grid below them whether that deck is showing `CUE 1` or `HYDRANT LIGHT`.

Four lines became three, and the overlay stopped being a wall.

## Shipping It Without an Xcode Project

There is no `.xcodeproj`. There's a 50-line `build.sh` that assembles the bundle by hand:

```bash
./build.sh                  # -> ~/Applications/FLX2-STATUS-OVERLAY.app
./build.sh /Applications    # or anywhere else
```

It writes an `Info.plist`, compiles `main.swift` twice — once for `arm64-apple-macos11.0`, once for `x86_64` — `lipo`s them into a universal binary, and ad-hoc signs the result. `LSUIElement` is `true`, so it's a menu-bar app with no Dock icon.

For a single-file app this beats a project file. There's nothing to migrate when Xcode changes its mind about build settings, and the entire build is legible in one screen.

GitHub Actions runs the same script on every push, then checks that the artifact is what it claims to be:

```bash
archs=$(lipo -archs "$APP/Contents/MacOS/FLX2-STATUS-OVERLAY")
for want in arm64 x86_64; do
  case " $archs " in *" $want "*) ;; *) echo "missing $want"; exit 1;; esac
done
```

That check exists because `build.sh` deliberately falls back to a native-only binary when a cross-compile fails. Locally that's a convenience — you still get a working app. In a release it would silently ship an Apple-Silicon-only build to an Intel user, and nobody would find out until it refused to launch. CI is where a convenient fallback turns into a bug, so CI is where it gets caught.

Push a `v*` tag and the same workflow publishes a GitHub Release with the zip attached, versioned from the tag.

The one thing we can't automate away: builds are ad-hoc signed, not notarised. Notarisation needs a paid Apple Developer ID, and this is a free tool for a controller we own. A downloaded copy gets stopped by Gatekeeper until you right-click → Open once. Building from source sidesteps it entirely, which for a single Swift file takes about ten seconds.

## What We'd Tell You To Steal

**The hard part wasn't MIDI.** Parsing running-status MIDI packets took an afternoon. Deciding what to do when the state is genuinely unknowable took much longer, and that's the part users actually feel.

**Read the app's own config instead of duplicating it.** Every label the overlay shows comes from a file djay already maintains. That's the difference between a tool that goes stale and one that follows you.

**Match the physical layout.** Software that contradicts the hardware in front of someone creates a translation step, and translation steps cost time you don't have.

**Label your guesses.** The stem row is inferred and says so, in the docs and in the menu item that resets it. That single line of documentation is what makes it a feature instead of a bug.

## Wrapping Up

It's a heads-up display for a piece of hardware that refuses to describe itself, built by listening to the only thing it does say out loud.

The whole thing is open source at [github.com/josmanvis/FLX2-STATUS-OVERLAY](https://github.com/josmanvis/FLX2-STATUS-OVERLAY) — one Swift file, one build script, one workflow. If you have an FLX2, the mapping reader should follow whatever mapping you're already running. If you have a different controller, the note tables are the only part specific to this one.

Sometimes the best tool is the one that just tells you what mode you're in.

---

*Grab a build from [Releases](https://github.com/josmanvis/FLX2-STATUS-OVERLAY/releases), or clone it and run `./build.sh`.*
