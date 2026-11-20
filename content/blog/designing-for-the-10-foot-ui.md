---
title: "The 10-Foot UI: Designing Apps for a Screen Across the Room"
excerpt: "Your user is on a couch, three meters away, holding a remote with six buttons and zero patience. Everything you know about web UI is now slightly wrong."
category: deep-dives
publishedAt: "2026-01-07"
tags:
  - tv
  - ui-design
  - accessibility
featured: false
---

Here's a fun exercise. Take your favorite web app, put it on a 65-inch TV, sit on the couch, and try to use it with a remote that has an arrow pad, an OK button, and a Back button.

You will last about nine seconds.

That's because TV apps live in a completely different universe called the **10-foot UI**. The name comes from the rough distance between the viewer and the screen, and that distance changes everything: how big things are, how you move around, and how much you can trust the user to read.

## Rule 1: there is no cursor

On the web, the mouse does a lot of invisible work for you. Hover states, precise clicks, "just click anywhere on the card." On a TV, all of that is gone. The user moves **focus** from element to element with a D-pad: up, down, left, right.

That means:

- **Every interactive thing must be reachable with arrow keys.** If you can't get to it by pressing directions, it doesn't exist.
- **The layout *is* the navigation.** Put two buttons slightly out of line and "right" might jump somewhere nobody expected.
- **There's always exactly one focused thing.** Losing focus on a TV is like losing the cursor on a desktop, except the user can't wiggle the mouse to find it.

## Rule 2: big, and then bigger

Text that's perfectly readable on a laptop turns into ant writing three meters away. TV interfaces use **much larger type**, fewer words per screen, and generous spacing so the focus ring has room to breathe.

A good gut check: if your screen has a paragraph on it, you've already lost. TV screens are posters, not documents.

## Rule 3: respect the edges

TVs have a long history of cropping the outer edge of the picture, so platforms recommend keeping important content inside a **safe area** with comfortable margins. Even on modern panels that don't crop, content jammed against the bezel looks broken from the couch.

Put your titles, buttons and logos inside the margins. Let only backgrounds and artwork bleed to the edge.

## Rule 4: Back must always work

The Back button is the user's emergency exit. It should **always** do something predictable: close the overlay, go up a level, or leave the screen. A Back button that does nothing is the TV equivalent of a website with no way to close a modal.

## Rule 5: typing is torture

Entering text with a D-pad on an on-screen keyboard is one of the worst experiences in all of consumer technology. So design around it:

- Search should show results **as you type**, so two or three letters is usually enough.
- Offer recent searches and suggestions so users can pick instead of type.
- For logins, let people sign in **on their phone** with a code or QR. Nobody should have to D-pad their password.

## Rule 6: focus is your entire visual design

On the web, a focus ring is an accessibility afterthought that designers try to hide. On TV, **the focus state is the most important visual in the app**. It has to be obvious from across the room, at a glance, in a dark room, on a bright screen.

Scale it up, add a border, lift it with a shadow, brighten it. Whatever you choose, it should be impossible to wonder "where am I?"

## The weird upside

Building for the couch forces a kind of discipline that makes every other UI better. Fewer choices per screen. Clear hierarchy. Big targets. Full keyboard support. Predictable navigation.

That's basically the accessibility checklist we're all supposed to follow on the web anyway, except on TV it isn't optional, because the alternative is someone yelling at their remote.

Next week: how to actually build D-pad navigation on the web without losing your mind.
