---
title: "Designing Search for a TV Remote (Where Typing Is a Punishment)"
excerpt: "Typing 'the office' with a D-pad takes about 30 button presses. Your search UI's job is to get people to their show in five. Here's how."
category: deep-dives
publishedAt: "2026-10-14"
tags:
  - tv
  - ui-design
  - search
featured: false
---

Picture a user who wants to watch something. On a phone, they type six letters and they're there. On a TV, they get an on-screen keyboard and a D-pad.

To type **"the office"** that way, they move the highlight from letter to letter, pressing arrows and select for every character. That's dozens of button presses for ten characters. Typing a password like that is somewhere between purgatory and a hostage situation.

So the goal of TV search isn't "let users type." It's **"get users to the result with as little typing as possible."**

## 1. Results after every letter

The single most important feature: **show results as the user types**, starting from the first letter. On TV, every character is expensive, so the search should do as much work as possible with as little input as possible.

If two letters is enough to get the show onto the screen, the user stops typing and picks it. Great TV search often finishes before the word does.

## 2. Put the keyboard where the results are

Layout matters a lot. A common pattern is the **keyboard on one side, results on the other**, so the user can type a letter or two and then move straight into the results without leaving the screen.

And keep the results **in the same place** as the user types. If the result list jumps around or reloads with a flash on every letter, users lose track of what they were about to select.

## 3. A keyboard built for a D-pad

A regular QWERTY layout is designed for ten fingers, not for moving a highlight one square at a time. Many TV keyboards use a **compact grid, often alphabetical**, which can mean fewer moves on average, especially for people who don't touch-type.

Small but important details:

- **Remember the cursor position** after a letter is entered, so the highlight doesn't jump back to "A."
- **Wrap around the edges**, so going right from the last column comes back to the first.
- **Space, delete and clear** must be easy to reach, because they're constantly needed.

## 4. Recent and popular searches

The fastest search is the one you don't type. Before any input, show:

- **recent searches**, because people often look for the same things again
- **trending or popular titles**, which cover a surprising share of what people want

Often the user finds what they want without pressing a single letter.

## 5. Voice, if the remote has a mic

Many TV remotes now have a microphone button, and voice search is a huge upgrade over typing: say "the office" and done.

But design it as a **shortcut, not the only path**. Voice fails on accents, background noise and unusual titles. When it mishears, the user should land in the normal search with the text pre-filled and ready to edit, not back at square one.

## 6. Forgive spelling

Users are typing with a remote. They will make mistakes, and they will give up rather than fix them. So search should be forgiving:

- **typo tolerance** ("the ofice" still works)
- **matching across fields**: titles, actors, genres
- **ignoring articles and punctuation** ("office" finds "The Office")

Every correction the user doesn't have to make is several button presses saved.

## 7. Get them to *watch*, not just to a result

The search result shouldn't be a dead end that leads to another page that leads to a play button. From a result, one press should get the user to the title's page, and from there, one more to **play** or **resume**.

The finish line isn't "found it." It's "watching it."

## The lesson for every platform

TV search is an extreme case of something true everywhere: input is expensive, and the best interfaces ask for as little of it as possible. Suggest, predict, forgive, and remember.

On a phone, that saves a few seconds. On a TV, it's the difference between a user watching your show and a user giving up and picking something they don't need to type.
