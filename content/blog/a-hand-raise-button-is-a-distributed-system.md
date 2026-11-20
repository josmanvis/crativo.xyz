---
title: "A Hand-Raise Button Is a Distributed Systems Problem"
excerpt: "It's one button. Click it, your hand goes up, everyone sees it. What could go wrong? Reconnects, race conditions, stale state and a moderator who clicked 'lower all' at the exact wrong millisecond."
category: deep-dives
publishedAt: "2026-07-15"
tags:
  - webrtc
  - react
  - video
  - architecture
featured: false
---

At my day job I work on video conferencing features for a large webinar platform: attendee lists, **hand raise**, **pass the mic**, virtual backgrounds, custom user roles. And if there's one thing those features have taught me, it's that **the simplest-looking buttons hide the hardest problems.**

Take the hand-raise button. Product spec: "Attendee clicks the button. Their hand goes up. Presenters see it." One button, one sentence. Let's ship it by Friday.

## The naive version

Click → set `handRaised = true` locally → send a message → everyone else updates.

It works in the demo. Then reality shows up.

## Problem 1: whose state is it?

If the attendee's browser is the source of truth, what happens when:

- the moderator lowers the hand from their side?
- the attendee refreshes the page?
- the attendee joins from a second device?

Suddenly "is this hand raised?" has three different answers in three different places. The fix is the first rule of collaborative features: **shared state needs one source of truth**, usually the server or a shared session state, and every client renders from it.

The button doesn't *raise the hand*. It *requests* that the hand be raised. The server decides, and everyone, including the person who clicked, renders what the server says.

## Problem 2: the race

Attendee raises their hand. A split second later, the moderator clicks "lower all hands." The messages cross in flight.

Which wins? If you apply messages in whatever order they arrive, different clients can end up disagreeing. One shows the hand up, another shows it down.

You need **ordering**: the server applies events in one sequence and broadcasts the resulting state, often with a version number, so clients can ignore anything older than what they already have.

```typescript
interface HandState {
  raised: boolean;
  version: number; // assigned by the server
}

function onUpdate(next: HandState) {
  if (next.version <= current.version) return; // stale, ignore
  current = next;
  render(current);
}
```

Small idea, huge number of bugs prevented.

## Problem 3: reconnects

Video calls live on flaky networks. A client drops for eight seconds and reconnects. During those eight seconds, three hands went up and one went down.

If your clients only listen for *changes*, a reconnecting client misses them and shows stale state forever. So on every (re)connect, the client must fetch the **full current state**, not just resume the event stream.

Snapshot first, then events. Every real-time feature eventually learns this the hard way.

## Problem 4: the UI has to be honest

Optimistic UI is great for a like button. For hand raise, think it through. If the attendee sees their hand go up instantly but the request never reached the server, they're sitting there waiting to be called on by a presenter who has no idea.

A middle ground works well: show the hand going up immediately, but in a subtle **pending** style until the server confirms, then switch to the solid "raised" state. Fast feedback, honest status.

## Problem 5: order and fairness

A presenter wants to call on people **in the order they raised their hands**. So you need timestamps, from the server, not from each client's clock, because client clocks are wrong in creative ways.

And when the list is long, the presenter's UI needs to be glanceable: who's first, who's been waiting longest, one click to "pass the mic."

## The lesson

Every collaborative UI feature is a tiny distributed system wearing a button costume. The questions are always the same:

1. Where does the truth live?
2. What happens when messages race?
3. What happens on reconnect?
4. Is the UI honest about what's confirmed and what's pending?

Answer those four up front and the button really is simple. Skip them and you'll be debugging "my hand is up but nobody sees it" tickets for months.

It's never just a button.
