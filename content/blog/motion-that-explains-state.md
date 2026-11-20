---
title: "Animation Should Explain Something: Motion That Shows State"
excerpt: "If you can't say in one sentence why something moves, it shouldn't. Good motion answers a question: where did that come from, what changed, where did it go. Everything else is just a screensaver."
category: thoughts
publishedAt: "2026-10-21"
tags:
  - animation
  - ui-design
  - css
featured: false
---

There's a rule I've been following for a while, and it has deleted more animation code than any performance audit:

> **Every animation must explain something. If you can't say what in one sentence, remove it.**

It sounds harsh, but it's freeing. Instead of asking "would this look cool animated?", you ask "what does the user need to understand here, and can motion help?"

## The questions good motion answers

**"Where did that come from?"** A menu that slides in from the edge tells you it lives off-screen at that edge, so you know where to find it again and which way to dismiss it.

**"What changed?"** A number that briefly highlights when it updates draws the eye to the change. Without it, the update is easy to miss.

**"Where did it go?"** An item that shrinks into the trash icon when deleted tells you where it went, and that you can probably get it back.

**"Is it working?"** A progress indicator, a button that presses down, a subtle pulse while something saves. Motion as feedback.

**"How are these connected?"** A thumbnail that expands into the full view shows that they're the same thing at two sizes.

Each of these has a one-sentence reason. That's the test.

## What fails the test

- elements that fade in one by one on scroll, just because they can
- a logo that spins on hover
- parallax backgrounds drifting behind text
- a page transition that takes 800 ms and says nothing about where you went

None of these answer a question. They're decoration that moves, and moving decoration competes with the content for attention. At best it's neutral. At worst, it's distracting and slow, and for some users, physically uncomfortable.

## Speed is part of the explanation

Even good motion fails if it's too slow. UI animation should be **quick**: most transitions feel right somewhere in the range of roughly 150–400 ms. Long enough to be seen and understood, short enough that nobody waits for it.

A useful framing: the animation is there to **carry the eye**, not to put on a show. The moment the user is waiting for your animation to finish, it's become an obstacle.

And easing matters. Things in the real world don't start and stop instantly, so **ease-out** (fast start, gentle stop) feels natural for things entering the screen, and makes the UI feel responsive because the motion starts immediately.

## Motion as status, with an example

Think about a meter on audio gear. It moves constantly, and nobody calls it decoration, because every movement *is* information: how loud the signal is right now. That's the gold standard. When motion carries data, it never feels gratuitous.

You can borrow that in UI: a counter that ticks up to its new value shows the change happened and roughly how big it was, and a progress line that grows with an upload *is* the status. Just keep the content readable without it, so with reduced motion everything is simply there.

## A quick checklist

Before adding an animation, ask:

1. **What does it explain?** One sentence.
2. **Is it fast?** Can a user act before it finishes?
3. **Does it only use cheap properties?** Animate `transform` and `opacity`, not layout.
4. **What happens with reduced motion?** Is the content still there and still clear?
5. **Would anyone miss it?** If not, delete it.

## The point

Motion is a language. Used well, it explains space, change and cause and effect better than any label. Used for decoration, it's just noise with good easing.

Make it say something, or let it stay still.
