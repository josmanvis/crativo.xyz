---
title: "htmx: Is the Return to Simplicity Actually Simpler?"
excerpt: I built the same app in htmx and React. Here's my honest take.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - htmx
  - JavaScript
  - Architecture
  - Hot Takes
coverImage: /blog/htmx-honest-review.svg
featured: false
---

# htmx: Is the Return to Simplicity Actually Simpler?

htmx has been living rent-free in my head for a year. The pitch is seductive: what if we stopped building SPAs? What if the server just returned HTML, and we used hypermedia like the web was designed for?

No npm install. No build step. No bundle sizes. No JavaScript frameworks. Just HTML attributes that make elements request more HTML.

I've been a React developer for nearly a decade. This sounded either brilliant or insane. So I built the same app twice—once with htmx, once with React—to find out which.

Here's my honest review.

## What htmx Actually Is

htmx extends HTML with attributes that let any element make HTTP requests and swap content without full page reloads. That's it. That's the whole library.

```html
<button hx-post="/clicked" hx-swap="outerHTML">
  Click Me
</button>
```

When you click this button, htmx:
1. Makes a POST request to `/clicked`
2. Takes the HTML from the response
3. Swaps out the button with that HTML

The server returns HTML, not JSON. No client-side rendering. No state management. No hydration.

Here's a complete todo app:

```html
<!-- List of todos (server-rendered) -->
<ul id="todo-list">
  <li>Buy groceries</li>
  <li>Walk the dog</li>
</ul>

<!-- Form to add todos -->
<form hx-post="/todos" hx-target="#todo-list" hx-swap="beforeend">
  <input name="todo" required />
  <button type="submit">Add</button>
</form>
```

```python
# Server (Python/Flask example)
@app.post("/todos")
def create_todo():
    todo = request.form["todo"]
    save_to_db(todo)
    # Return just the new <li>, not the whole page
    return f"<li>{todo}</li>"
```

That's a working interactive todo app with no JavaScript you wrote. The htmx library is 14KB gzipped.

## What I Built

I made a task management app with:
- Task lists with CRUD operations
- Drag-and-drop reordering
- Real-time updates (simulated)
- Search with live results
- Authentication

First in htmx with a Go backend. Then in React/Next.js.

## Where htmx Shines

### Simplicity of Data Flow

In React, you think about: state, props, effects, queries, mutations, cache invalidation, optimistic updates...

In htmx, you think about: what HTML should the server return?

```html
<!-- Delete a task -->
<button 
  hx-delete="/tasks/123" 
  hx-target="closest .task-card"
  hx-swap="outerHTML swap:1s"
  hx-confirm="Delete this task?"
>
  🗑️ Delete
</button>
```

The server returns either:
- Empty string (removes the card)
- Updated HTML (if you want to show "deleted" state briefly)

No `useMutation`, no `queryClient.invalidate()`, no state updates. The server is the source of truth, and the UI reflects it directly.

### Progressive Enhancement

htmx degrades gracefully. Add `hx-boost` to a regular form, and it works with JavaScript disabled—just as a normal form—but becomes AJAX-enhanced when JavaScript is available.

```html
<form method="POST" action="/search" hx-boost="true">
  <input name="q" />
  <button>Search</button>
</form>
```

With JS: submits via AJAX, swaps in results.
Without JS: submits normally, full page reload.

Your app works either way.

### Bundle Size

htmx: 14KB gzipped.
My React app: 156KB gzipped (and that's with good code splitting).

This matters for performance, especially on slower connections.

### Server Framework Flexibility

htmx doesn't care what your backend is. Go, Python, Ruby, PHP, Java—whatever returns HTML works. Your backend developers don't need to learn a JavaScript meta-framework.

## Where htmx Struggles

### Complex UI State

Here's where I hit walls. The task app needed:
- Drag-and-drop reordering
- Inline editing with keyboard shortcuts
- Optimistic updates for perceived speed

Drag-and-drop in htmx is... rough. There's Sortable.js integration, but coordinating the visual state with server state gets messy fast:

```html
<div 
  hx-post="/tasks/reorder" 
  hx-trigger="end"
  hx-swap="none"
  class="sortable"
>
  <!-- tasks -->
</div>

<script>
  new Sortable(document.querySelector('.sortable'), {
    onEnd: function(evt) {
      // Need to manually build the order data
      // and trigger the htmx request
      htmx.ajax('POST', '/tasks/reorder', {
        values: { order: getOrder() }
      });
    }
  });
</script>
```

You're back to writing JavaScript anyway. And now you're mixing paradigms.

### Forms With Complex Validation

htmx's form handling is excellent for simple forms. For complex ones with:
- Real-time validation
- Dependent fields (select A changes options in B)
- Multi-step wizards with client-side state

...you end up making lots of server requests or writing JavaScript that fights with htmx's model.

```html
<!-- Every keystroke = server request -->
<input 
  name="email" 
  hx-post="/validate/email" 
  hx-trigger="keyup changed delay:500ms"
  hx-target="#email-errors"
/>
```

This works but feels backwards. Client-side validation is faster and doesn't need network round-trips.

### Optimistic Updates

React:
```tsx
const mutation = useMutation(updateTask, {
  onMutate: (newTask) => {
    // Update UI immediately
    cache.setQueryData(['task', id], newTask);
  },
  onError: (err, _, context) => {
    // Rollback on failure
    cache.setQueryData(['task', id], context.previous);
  },
});
```

htmx:
```html
<!-- There's no built-in way to do this -->
<!-- You'd need custom JavaScript -->
```

htmx's model is request → response → update. The UI waits for the server. For local-feeling interactions, this creates perceptible latency.

### Developer Experience

The React ecosystem has incredible tooling:
- React DevTools
- TypeScript integration
- Component libraries
- Testing utilities

htmx has... console.log and the network tab. Debugging why an hx-swap isn't working means staring at HTML attributes and reading documentation.

## The Verdict: It Depends (But Usefully)

I hate "it depends" answers, so let me be specific.

**Use htmx when:**
- You have a server-rendered app that needs sprinkles of interactivity
- Your team is backend-heavy and doesn't want to learn React
- You're building content sites, blogs, admin dashboards
- Performance on low-end devices is critical
- You value simplicity over capability

**Use React when:**
- You're building app-like experiences (Figma, Notion, Gmail)
- You need complex client-side state
- You have lots of optimistic updates
- You need real-time collaboration features
- Your team already knows React

**The honest truth:** I enjoyed building with htmx. The constraint of "server returns HTML" forced cleaner architecture. I didn't need to think about cache invalidation or state synchronization—the server was always right.

But I missed TypeScript. I missed component composition. I missed being able to write complex interactions without fighting the framework.

htmx isn't simpler for everything. It's simpler for the things it was designed for. Try to use it outside that zone, and you're writing JavaScript anyway—just without the nice abstractions.

### My Personal Take

I'm keeping htmx in my toolkit. For my next side project—a simple CMS—I might reach for it over Next.js. But for the complex apps I build professionally? React is still the right tool.

The htmx community's critique of JavaScript framework complexity is valid. We've over-engineered many things that should be simple. But the solution isn't always "go back to server-rendered HTML." Sometimes the complexity exists because the problem is actually complex.

htmx is a good reminder to question our defaults. And sometimes, it's the right answer. Just not always.

---

*htmx was created by Carson Gross. If you want to go deeper, his essays on hypermedia are thoughtful even if you disagree with the conclusions.*
