---
title: "Your UI Is Already a State Machine. Stop Pretending It's a Pile of Booleans"
excerpt: "isLoading, isError, isEditing, hasSubmitted. Four booleans means 16 possible states, and you planned for maybe five. Here's how to make the impossible ones actually impossible."
category: tutorials
publishedAt: "2026-04-15"
tags:
  - typescript
  - react
  - state-management
  - architecture
featured: false
---

Look at this component state. Be honest, you've written it:

```typescript
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [hasSubmitted, setHasSubmitted] = useState(false);
```

Four booleans. Each can be true or false, so that's **2⁴ = 16 possible combinations**. How many of those did you design for? Maybe five.

The other eleven are bugs waiting for a user to find them. Loading *and* error at the same time. Editing *and* submitted. A spinner that never stops because one `setIsLoading(false)` lived in a branch that never ran.

## The fix: one variable, many named states

Your UI is never "loading-ish and also maybe errored." It's in **exactly one** state at a time. So model it that way, with a discriminated union:

```typescript
type FormState =
  | { status: 'viewing' }
  | { status: 'editing'; draft: string }
  | { status: 'saving'; draft: string }
  | { status: 'failed'; draft: string; error: string }
  | { status: 'saved' };
```

Now "loading and errored" isn't a bug you have to prevent. **It can't be written down.** TypeScript won't let you construct it. And notice that `draft` only exists in the states where it makes sense, so you can't accidentally read a stale draft from the `viewing` state.

## Transitions are the real API

A state machine is states **plus the rules for moving between them**. Put those rules in one place:

```typescript
type Event =
  | { type: 'EDIT' }
  | { type: 'TYPE'; text: string }
  | { type: 'SAVE' }
  | { type: 'SAVED' }
  | { type: 'FAILED'; error: string }
  | { type: 'CANCEL' };

function reducer(state: FormState, event: Event): FormState {
  switch (state.status) {
    case 'viewing':
      return event.type === 'EDIT' ? { status: 'editing', draft: '' } : state;

    case 'editing':
      if (event.type === 'TYPE') return { ...state, draft: event.text };
      if (event.type === 'SAVE') return { status: 'saving', draft: state.draft };
      if (event.type === 'CANCEL') return { status: 'viewing' };
      return state;

    case 'saving':
      if (event.type === 'SAVED') return { status: 'saved' };
      if (event.type === 'FAILED') return { status: 'failed', draft: state.draft, error: event.error };
      return state; // typing while saving does nothing, by design

    case 'failed':
      if (event.type === 'SAVE') return { status: 'saving', draft: state.draft };
      if (event.type === 'CANCEL') return { status: 'viewing' };
      return state;

    case 'saved':
      return event.type === 'EDIT' ? { status: 'editing', draft: '' } : state;
  }
}
```

Plug it into `useReducer` and you're done. The best part is the `saving` case: it **ignores** typing and double-clicks on Save. No more duplicate submissions, because the state machine simply doesn't have a transition for them.

## Render by state, not by flags

```tsx
switch (state.status) {
  case 'viewing': return <Button onClick={() => send({ type: 'EDIT' })}>Edit</Button>;
  case 'editing': return <Editor draft={state.draft} />;
  case 'saving':  return <Editor draft={state.draft} disabled />;
  case 'failed':  return <Editor draft={state.draft} error={state.error} />;
  case 'saved':   return <p>Saved ✓</p>;
}
```

Read that and you can see every screen the user can possibly encounter. No `{isLoading && !isError && hasSubmitted && …}` riddles. Add a new status to the union and TypeScript will point at every `switch` that doesn't handle it yet.

## When to bother

You don't need this for a single toggle. A dropdown that's open or closed is a boolean, and that's fine.

Reach for a state machine when:

- you have **three or more booleans** that affect the same piece of UI
- there are **async steps** (loading, saving, retrying)
- you've already shipped a bug where two "impossible" flags were true at once

That last one is the real signal. If you've hit that bug once, you'll hit it again, and the union type is far cheaper than the debugging session.

## The mindset shift

Booleans describe *facts about* your UI. A state machine describes *what your UI is*. It sounds like a tiny change, but it moves bugs from runtime to compile time, and the compiler never forgets an edge case the way a tired engineer does.

Draw the boxes. Draw the arrows. Then make the code look like the drawing.
