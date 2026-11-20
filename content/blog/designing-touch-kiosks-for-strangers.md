---
title: "Designing Kiosks for Strangers: Lessons From Grocery Store Touchscreens"
excerpt: "A kiosk user has never seen your app before, will never read instructions, and is standing in a noisy store holding a basket. Every assumption you make about 'users' breaks here."
category: deep-dives
publishedAt: "2026-06-24"
tags:
  - kiosk
  - ui-design
  - accessibility
  - voice
featured: false
---

Back in the Innovation Lab at Retail Business Services (the tech arm behind grocery chains like Stop & Shop), I worked on in-store kiosk software: product lookup, a voice shopping list, and store navigation.

Kiosks taught me more about UI design than any other platform, because a kiosk user is the hardest kind of user there is: **a complete stranger, with zero patience, who will use your app exactly once.**

## Lesson 1: there is no onboarding

App users install your app and tolerate a tutorial. Website users at least chose to visit. Kiosk users just walked past a screen and decided to poke it.

So the first screen has to explain itself instantly. One clear question ("What are you looking for?"), big obvious buttons, and nothing that requires prior knowledge. If anything needs explaining, the design is already wrong.

## Lesson 2: assume nothing about the person

Kiosk users span every age, every level of tech comfort, every height, sometimes wheelchair users, people with low vision, people who don't speak the store's main language well, and people holding a kid in one arm.

That means:

- **Huge touch targets.** Bigger than you think. Then a bit bigger.
- **High contrast and big type**, readable from a step back.
- **Controls within reach** for someone seated, not just someone standing.
- **No time pressure** in the middle of a task, but a **reset** after real inactivity so the next person gets a clean start.

## Lesson 3: typing on glass is a last resort

Touchscreen keyboards are bad. Kiosk touchscreen keyboards, on a vertical screen, with strangers' fingers, are worse.

That's why I built **too-bored**, a React virtual keyboard with big keys, visual feedback on every tap (a quick flash, since there's no physical click), auto-capitalization and swipe-to-delete. It became an npm package other teams used.

But the bigger lesson was to **avoid typing whenever possible**: categories to browse, popular items to tap, suggestions after one or two letters.

## Lesson 4: voice is amazing, and stores are loud

Voice seemed like the obvious answer to the typing problem. "Where are the tomatoes?" is faster than any keyboard.

Then you put a microphone in a grocery store: refrigerator hum, announcements, kids, and someone on speakerphone in the next aisle. We tested several speech services (IBM Watson, Google Dialogflow and Microsoft LUIS) and ended up combining them, using one for transcription and another for working out what the person actually meant.

Because people don't speak in search queries. They say things like "those red things for pasta, not the sauce, the actual ones you cook." The system has to get from *that* to "tomatoes," and the UI has to make it painless to correct when it gets it wrong.

## Lesson 5: the data is the hardest part

Showing where a product is means knowing the layout of **that specific store**. Every location is different, and stores remodel. Some products live in two places (the regular aisle *and* a seasonal display). Some are out of stock.

We built a store map editor so managers could drag aisles around, and mapped products to aisle locations. The UI part was the easy bit. Keeping the map true to the real world was the actual project.

That's true of most "simple" kiosk features: the screen is the tip of the iceberg, and the iceberg is data quality.

## Lesson 6: design for the walk away

Every kiosk session ends with someone walking off, usually mid-task. So:

- **Auto-reset after inactivity**, so the next person isn't greeted by someone else's half-finished search.
- **Don't keep personal data around** longer than the session needs.
- **Give results they can carry.** An aisle number to remember beats a beautiful map they'll forget the moment they turn around.

## What kiosks taught me about everything else

Design for the kiosk and you've designed for everyone: big targets, plain language, no assumed knowledge, forgiving input, graceful exits. The web would be a much nicer place if every product team pretended their users were strangers standing in a noisy grocery store.

Because honestly, on a bad day, that's all of us.
