---
title: "FOAR: I Wrote a UI Language Where Every Component Is a State Machine"
excerpt: "After years of booleans pretending to be state, I stopped writing libraries about the problem and wrote a language instead: states, exhaustive match, accessibility as compile errors and a tiny runtime with no virtual DOM."
category: deep-dives
publishedAt: "2026-11-20"
tags:
  - foar
  - rust
  - webassembly
  - state-machines
  - side-project
featured: false
---

Earlier this year I wrote about how **your UI is already a state machine**, and how modeling it as a pile of booleans creates bugs in all the combinations nobody planned for.

Discriminated unions in TypeScript help a lot. But it's still a convention. Nothing stops the next person from adding `isLoading` right next to your beautiful union type.

So I went further than a pattern. I built a **language**. It's called **FOAR**, and its whole premise fits on one line:

> **Interfaces are state machines. Write them that way.**

## What it looks like

```rust
view Article {
    store title: String = "Untitled";

    state Viewing {
        render {
            Text(title)
            Button("Rename") -> on_click(Rename)
        }
        effect Rename() { transition Editing; }
    }

    state Editing {
        render {
            Input(value: title, autofocus: true) -> on_input(Type) -> on_enter(Done)
        }
        effect Type(text: String) { title = text; }
        effect Done() { transition Viewing; }
    }
}
```

A view declares its **states**, what each state **renders**, and which **effects** it handles. A view is in exactly one state at a time. Effects belong to the states they live in. And `transition Editing;` swaps only that view's subtree.

There's no `isEditing` flag, because "editing" isn't a fact about the view. It's **what the view is right now**.

## The compiler says no (helpfully)

Most of FOAR's value is in what it refuses to compile.

**Exhaustive matching.** Enums are tagged unions with payloads, and every `match` must handle every case. Add a new variant and every match that doesn't handle it stops compiling, with an error that tells you exactly which case is missing and where.

**Static types.** Stores, derived values, pure functions, contexts, view props and even declared host calls are type-checked, with errors reported as `file:line:col`.

**Accessibility as compile errors.** An image without alt text, a form control without a label, an icon-only button with no name, an invalid ARIA role: these don't produce lint warnings you can ignore. They **fail the build**, with a message saying what to add.

**Typos don't silently do nothing.** Misspell an event name and you get a compile error with a suggestion, instead of a listener that never fires.

## No virtual DOM

FOAR's compiler knows exactly which values each piece of the UI depends on. So there's no need to re-render and diff a virtual tree. Bindings **write only the values that changed**, keyed lists reuse rows, and inputs keep focus. Static CSS is generated at build time.

The runtime ships at around **23 KB gzipped**.

## One Rust compiler, two homes

The compiler is written in **Rust** and builds both natively and to **WebAssembly**. The WebAssembly build is what powers the **browser playground**: you write FOAR, it compiles right there in the page, and the result runs live, with no server involved.

Around the compiler there's a whole toolchain: a router, streaming server-side rendering with hydration and partial islands, packages with a lockfile, a formatter, a language server, a Vite plugin and a VS Code extension. One install script puts a single binary on your PATH, with the compiler, runtime and dev server included.

## Why build a language?

Honestly? Because every UI bug I've chased for years had the same shape: **two things that should never be true at the same time, being true at the same time.** Loading and errored. Editing and saved. Open and closed.

You can fight that with discipline, code review and conventions. Or you can make those states impossible to write down. A library can make the right thing easy. A language can make the wrong thing **unrepresentable**.

## Try it

The fastest way is the playground in your browser, no install required. Or:

```bash
curl -fsSL https://josmanvis.github.io/FOAR/install.sh | sh
```

FOAR is MIT-licensed and young. There are rough edges, and that's part of the fun. If you've ever stared at four booleans wondering which combination caused the bug, it was built for you.

Draw the boxes. Draw the arrows. Then let the compiler hold you to it.
