---
title: "Setch: Turning a DJ Set's Messy Tracklist Into Real Tracks"
excerpt: "Every great DJ mix has a tracklist buried in a description written by someone who hates consistency. Setch reads it, cleans it, and scores search results until the right song wins."
category: deep-dives
publishedAt: "2026-02-11"
tags:
  - dj
  - typescript
  - search
  - side-project
featured: false
---

You know the feeling. You're listening to a two-hour house set, a track comes on at 47:12, and it's the best thing you've ever heard. You scroll to the description and find the tracklist, written in a format best described as *vibes*:

```
00:00 intro
3:41 - Artist A — Track Name (Extended Mix)
7:55 Artist B - another track [label]
12. ID - ID
```

Different separators. Some timestamps, some numbers. Brackets of every shape. And at least one **ID - ID**, which is DJ for "you will never know."

I built **Setch** to deal with this. You paste a mix, it finds the tracklist, and it hunts down each track individually.

## Step 1: find the tracklist

Setch uses **Puppeteer** to load the mix page and read its description. Then it looks for the patterns tracklists almost always follow:

- **timestamps** (`3:41`, `1:02:15`)
- **track numbers** (`12.`, `12)`)
- an artist and title split by some kind of dash

It also checks the platform's own **music metadata section** when it's there, since that's sometimes cleaner than whatever the uploader typed. Then it **deduplicates** the results and marks where each track came from, because the same song often appears in both places.

The lesson from this step: never write one perfect regex. Write a few forgiving ones and merge their results.

## Step 2: clean the search terms

Raw tracklist lines are full of junk that hurts searching: label names in brackets, "(Extended Mix)", emoji, stray punctuation. Setch strips special characters before searching so the query is mostly just artist and title.

Small step, huge difference. Search engines are good, but not "ignore my emoji-laden bracket soup" good.

## Step 3: score the candidates

This is my favorite part. A search returns a bunch of candidates, and Setch scores each one:

- **100 points** for an exact match
- **10 points** for each matching term
- **a penalty for long videos**, because a 90-minute result is almost certainly *another mix*, not the track you want

In code, the idea looks like this:

```typescript
function scoreCandidate(query: string, title: string, durationSec: number) {
  const q = normalize(query);
  const t = normalize(title);
  let score = t === q ? 100 : 0;

  for (const term of q.split(' ')) {
    if (term && t.includes(term)) score += 10;
  }
  if (durationSec > 15 * 60) score -= 50; // probably a mix, not a track
  return score;
}
```

That length penalty is the kind of rule you only discover by watching the naive version confidently pick a three-hour Boiler Room set as the best match for a four-minute song.

Each search also runs in its **own isolated browser context**, so one search's cookies and state can't leak into the next and skew results.

## Step 4: let a human win

Automation gets you most of the way. For the rest, Setch lets you **edit a track manually** or **paste the exact URL** to override the match. The best tools don't pretend to be perfect. They make the last 10% fast to fix.

## Talking to the UI

All the slow work happens on the backend, so the UI talks to it over **WebSockets** with small, explicit message types: `search`, `search_not_found`, `search_complete`, `download`, `download_progress`, and so on. Every step of a long job streams back to the screen, so you watch tracks get found one by one instead of staring at a spinner for three minutes.

If you build anything that takes longer than a second, do this. Progress you can see feels twice as fast as progress you can't.

## The point

Setch started as "I want that one track from minute 47." It turned into a small lesson in fuzzy matching: normalize everything, score instead of picking, penalize the obvious wrong answers, and always leave a manual override.

And please: when you find that track, go buy it and support the artist. That's how the next great mix gets made.
