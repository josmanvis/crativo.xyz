---
title: "Every Word Costs Pixels: Writing UI Copy for Watches, TVs and Phones"
excerpt: "The best UI copy isn't clever. It's short, specific and impossible to misread. On small or distant screens, every unnecessary word is a tax your user pays in attention."
category: thoughts
publishedAt: "2026-08-12"
tags:
  - ui-design
  - ux-writing
  - watch
  - tv
featured: false
---

Developers write a lot of UI text without thinking of it as writing. Button labels. Error messages. Empty states. Notification text. It all gets typed into a component at 6 p.m. and shipped.

On a desktop website, wordy copy is just a bit annoying. On a watch, wordy copy doesn't fit. On a TV, from the couch, it doesn't get read. So building for those screens forced me to get much better at writing three-word sentences.

## Rule 1: say the thing, not the process

Bad: **"Your request is currently being processed by our servers."**
Good: **"Saving…"**

Users don't care about your servers. They care about what's happening to *their* stuff. Lead with the outcome.

## Rule 2: buttons are verbs

A button should say what it does: **"Save," "Send," "Delete photo."** Not "OK." Not "Submit." Not "Yes."

"Are you sure? [Yes] [No]" makes users reread the question to decode the buttons. "Delete 3 photos? [Delete] [Cancel]" can be answered without reading the question at all.

## Rule 3: front-load the important word

On a small screen, text gets truncated. On a TV, people skim. Either way, the first two words do most of the work.

Bad: **"You have a new message from Alex"**
Good: **"Alex: running 10 min late"**

The second one can be cut to "Alex: running 10…" and still be useful. The first one becomes "You have a new…", which says nothing.

## Rule 4: errors say what to do next

An error message has one job: help the person recover.

Bad: **"Error 500."**
Bad: **"Something went wrong."**
Good: **"Couldn't save. Check your connection and try again."**

What happened, in human words, plus the next step. If there's nothing the user can do, at least tell them it's not their fault.

## Rule 5: numbers beat adjectives

**"Battery low"** vs **"12% battery"**.
**"Arriving soon"** vs **"Arriving in 4 min"**.

Numbers are shorter, more precise and faster to read, especially on a watch. "Soon" means something different to everyone. "4 min" means exactly one thing.

## Rule 6: same words, everywhere

If it's "Library" on the phone, it's "Library" on the TV and the watch and in the help docs. Not "Collection" in one place and "My Stuff" in another. Inconsistent names make users think they're looking at different features.

Keep a short glossary for your product. It's the cheapest design system you'll ever build.

## Rule 7: empty states are an invitation

An empty screen that says "No items" is a dead end. A good empty state says what *would* be here and how to get started:

**"No saved tracks yet. Tap ♥ on any track to save it here."**

One sentence turns a dead end into onboarding.

## Per-screen cheat sheet

- **Watch:** a number and a word, ideally. Push anything longer to the phone.
- **TV:** short labels, readable from the couch. No paragraphs, ever.
- **Phone:** short sentences, with the key word first in case of truncation.
- **Web:** more room, but the same rules. Room isn't permission to ramble.

## The editing trick

Write your UI copy, then **cut it in half**. Then try to cut it in half again. Most of the time the shortest version is also the clearest, because every word you remove is one less thing to misread.

Like this post's conclusion: shorter is better.
