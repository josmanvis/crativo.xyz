---
title: React 19 Features That Actually Matter (And Which Are Hype)
excerpt: After months with React 19, here's what's real and what's marketing.
category: deep-dives
publishedAt: 2025-01-21
tags:
  - React
  - JavaScript
  - Frontend
coverImage: /blog/react-19-what-actually-matters.svg
featured: false
---

# React 19 Features That Actually Matter (And Which Are Hype)

React 19 dropped and my Twitter feed exploded. "GAME CHANGER!" "The future is here!" "This changes everything!"

I've been burned by hype before. Remember Concurrent Mode? Suspense for data fetching? We waited years for those. Some features land exactly as promised. Others... don't.

So I spent the last few months actually using React 19 in real projects. Here's my honest breakdown of what matters, what's overhyped, and what you should actually care about.

## The Features That Actually Matter

### Actions (Forms Without useState)

This is the big one. Actions let you handle form submissions without managing loading states manually.

Before React 19:
```tsx
function NewsletterForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      const formData = new FormData(e.target);
      await subscribe(formData.get('email'));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && <p className="error">{error}</p>}
      {success && <p>Thanks for subscribing!</p>}
    </form>
  );
}
```

After React 19:
```tsx
function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    async (prev, formData) => {
      try {
        await subscribe(formData.get('email'));
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    },
    { success: false, error: null }
  );

  return (
    <form action={formAction}>
      <input name="email" type="email" disabled={isPending} />
      <button disabled={isPending}>
        {isPending ? 'Subscribing...' : 'Subscribe'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p>Thanks for subscribing!</p>}
    </form>
  );
}
```

The `useActionState` hook handles the pending state automatically. The `action` prop replaces `onSubmit` and gets the FormData directly.

**Why it matters:** Less boilerplate for the most common interaction pattern in web apps. Every form I build uses this now.

### useOptimistic

This hook lets you show optimistic UI updates while waiting for async actions:

```tsx
function TodoList({ todos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function addTodo(formData) {
    const title = formData.get('title');
    addOptimisticTodo({ id: crypto.randomUUID(), title });
    await createTodo(title);
  }

  return (
    <>
      <form action={addTodo}>
        <input name="title" />
        <button>Add</button>
      </form>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </>
  );
}
```

The todo appears immediately (grayed out), then becomes solid when the server confirms. If it fails, React automatically reverts.

**Why it matters:** Optimistic updates are table stakes for good UX, but implementing them properly was always tricky. This makes it trivial.

### use() for Promises and Context

The new `use()` function can read promises and context during render:

```tsx
function Comments({ commentsPromise }) {
  // This suspends until the promise resolves
  const comments = use(commentsPromise);
  
  return (
    <ul>
      {comments.map(c => <li key={c.id}>{c.text}</li>)}
    </ul>
  );
}

// Parent component
function Post({ postId }) {
  // Start fetching immediately, before render
  const commentsPromise = fetchComments(postId);
  
  return (
    <article>
      <PostContent id={postId} />
      <Suspense fallback={<Spinner />}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </article>
  );
}
```

Unlike hooks, `use()` can be called conditionally:

```tsx
function Component({ shouldFetch }) {
  if (shouldFetch) {
    const data = use(fetchData());  // Totally fine
  }
  // ...
}
```

**Why it matters:** This is a fundamental primitive that makes data fetching patterns cleaner. Combined with Suspense, it's powerful.

### ref as a Prop

No more `forwardRef`! Components can now accept `ref` as a regular prop:

```tsx
// Before
const Input = forwardRef(function Input(props, ref) {
  return <input {...props} ref={ref} />;
});

// After
function Input({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
```

**Why it matters:** Fewer wrapper components, cleaner code. It's a small thing, but you'll appreciate it every time you don't write `forwardRef`.

### Document Metadata Support

React 19 hoists `<title>`, `<meta>`, and `<link>` tags to the document head automatically:

```tsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />
      
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

These tags get moved to `<head>` and deduplicated automatically. No more React Helmet or custom portals.

**Why it matters:** SEO and social sharing metadata becomes trivial. One fewer dependency.

## Features That Are Overhyped

### Server Components in React 19

Server Components aren't new in React 19—they've been available through Next.js since 2022. React 19 just makes them officially part of React.

The hype: "Zero bundle size components!"
The reality: You already have this if you use Next.js 13+.

If you're not using a framework that supports RSC, this release doesn't change that. You can't just drop Server Components into Vite.

### The React Compiler

The compiler (formerly "React Forget") auto-memoizes components. No more manual `useMemo`, `useCallback`, `React.memo`.

The hype: "Never worry about memoization again!"
The reality: It's not shipping with React 19 core. It's a separate opt-in tool. And it's still experimental in production.

I've tried it. It works. But most apps don't need aggressive memoization anyway—they need better data fetching patterns and architecture. The compiler solves the problem you probably don't have.

### Async Client Components

Some people think React 19 allows async Client Components. It doesn't. Only Server Components can be async. If you write:

```tsx
'use client';
async function ClientComponent() {  // ❌ Still doesn't work
  const data = await fetch(...);
  return <div>{data}</div>;
}
```

You'll get an error. Use `use()` with a promise instead.

## What You Should Actually Do

### If You're Starting a New Project

Use Next.js 14+ or a framework that supports React 19. You get Actions, Server Components, and the new hooks out of the box.

### If You Have an Existing React App

1. **Upgrade to React 19** — It's mostly backward compatible
2. **Start using `useActionState`** for forms — Biggest ergonomic win
3. **Add `useOptimistic`** where you have loading states — Easy UX improvement
4. **Remove `forwardRef`** — Just pass `ref` as a prop
5. **Don't rush to Server Components** — They require a supporting framework

### What You Can Skip

- Don't rewrite working code to use Actions
- Don't add the compiler just because it exists
- Don't feel bad about still using `useState` for forms

## My Honest Take

React 19 is a good release. Not revolutionary, but solid. The Actions APIs (`useActionState`, `useOptimistic`) are the real wins—they make common patterns easier.

The Server Components story is still a "use a framework" story. If you're not on Next.js or Remix, React 19 doesn't fundamentally change your architecture options.

The biggest shift is philosophical: React is embracing the server. The future is RSC + Actions + streaming. But that future has been rolling out gradually through Next.js for two years already.

If you're already on that path, React 19 is a refinement. If you're still building SPAs with Vite, it's new APIs for forms and some nice-to-haves. Either way, worth upgrading.

---

*The React team's upgrade guide is comprehensive. Read it before upgrading—there are some breaking changes around refs and deprecated APIs.*
