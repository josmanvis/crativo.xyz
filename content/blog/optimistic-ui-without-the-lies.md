---
title: "Optimistic UI: Pretend It Worked (and Have a Plan for When It Didn't)"
excerpt: "When you like a post, the heart turns red instantly, before the server has even heard about it. That's optimistic UI. It feels like magic until the request fails and nobody planned for it."
category: tutorials
publishedAt: "2026-06-17"
tags:
  - react
  - ui-design
  - state-management
featured: false
---

Tap a like button in any modern app and the heart fills in **instantly**. Not after the network round trip. Not after the database writes. Immediately.

The app is lying to you. Kindly, for your own good. That's **optimistic UI**: update the interface as if the action already succeeded, then quietly sync with the server in the background.

It's one of the most effective tricks in UI engineering, and also one of the easiest to get subtly wrong.

## Why it works

Most actions **succeed** almost all the time. Liking a post, checking a to-do, renaming a file, reordering a list: the failure rate is tiny. So making the user wait for confirmation on every single action punishes the 99% for the sake of the 1%.

Show the result now, and the app feels instant even on a mediocre connection.

## The three parts people forget

An optimistic update isn't one step. It's three:

1. **Apply** the change locally, right away.
2. **Send** the request.
3. **Reconcile**: on success, accept the server's version. On failure, **roll back** and tell the user.

Step 3 is where most implementations quietly give up.

## A small, honest implementation

```tsx
function useToggleLike(post: Post) {
  const [liked, setLiked] = useState(post.liked);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const previous = liked;
    setLiked(!previous); // 1. apply now
    setError(null);
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: previous ? 'DELETE' : 'POST',
      }); // 2. send
      if (!res.ok) throw new Error();
    } catch {
      setLiked(previous); // 3. roll back
      setError("Couldn't save that. Try again?");
    }
  }

  return { liked, toggle, error };
}
```

The key line is `const previous = liked`. You **remember what it was** before you changed it, so you can put it back. No snapshot, no rollback, no optimistic UI. Just a UI that sometimes lies permanently.

React also ships a `useOptimistic` hook for exactly this pattern, and data libraries like TanStack Query have built-in support for optimistic updates with rollback. Use them when you can. But it helps to understand the three steps underneath.

## When NOT to be optimistic

**Money.** Don't show "Payment complete ✓" before the payment is complete. Ever.

**Irreversible or high-stakes actions.** Deleting an account, sending an email to a thousand people, submitting an order. Show a real pending state and wait for the server.

**Actions that often fail.** If validation frequently rejects the input, the rollback becomes a constant flicker of "yes… actually, no." Validate on the client first, or just wait.

The rule of thumb: **be optimistic when success is almost certain and failure is cheap to undo.**

## Failing gracefully

When the rollback happens, the user should notice, but not panic:

- **Undo the visual change** so the UI matches reality again.
- **Say what happened** close to where it happened. A tiny message by the button beats a full-screen error.
- **Offer a retry.** Most failures are flaky networks, and the second try usually works.

What you must never do is fail *silently*. A heart that stays red while the server never recorded the like is worse than a slow heart. It's a broken promise, and users only need to catch one to stop trusting every other instant update in your app.

## The vibe

Optimistic UI is basically good customer service: "Yep, done!" with a confident smile, and a backup plan in the back pocket. The smile makes the app feel fast. The backup plan is what keeps it honest.
