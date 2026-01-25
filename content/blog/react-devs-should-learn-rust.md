---
title: Why Every React Dev Should Learn a Little Rust
excerpt: Not to write Rust professionally. To understand your tools—and become a better developer.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - Rust
  - React
  - JavaScript
  - Career
coverImage: /blog/react-devs-should-learn-rust.svg
featured: false
---

# Why Every React Dev Should Learn a Little Rust

I'm not going to tell you to rewrite your React app in Rust. That would be insane.

But I am going to argue that learning some Rust—even if you never write production Rust—will make you a better JavaScript developer. It made me one.

Here's why.

## Your Tools Are Written in Rust

Look at the JavaScript ecosystem in 2025:

- **SWC** (Babel replacement): Rust
- **Turbopack** (Webpack replacement): Rust
- **Biome** (ESLint/Prettier replacement): Rust
- **Rolldown** (Rollup replacement, coming): Rust
- **Lightning CSS**: Rust
- **Parcel 2**: Rust (partially)
- **Deno's internals**: Rust

When your bundler crashes with a cryptic error, when your linter behaves unexpectedly, when you're debugging a build issue—understanding Rust helps you understand what's happening.

I'm not saying you need to read SWC's source code. But knowing *why* these tools are written in Rust gives you context. Knowing what Rust can and can't do explains their design decisions.

## The Ownership Model Changes How You Think

Rust's killer feature is ownership: every value has exactly one owner, and the compiler enforces it.

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // s1's ownership moves to s2
    
    // println!("{}", s1);  // ERROR: s1 is no longer valid
    println!("{}", s2);      // Works fine
}
```

This seems restrictive until you realize what it prevents: data races, use-after-free, null pointer dereferences. Whole categories of bugs that are impossible.

How does this help with JavaScript?

JavaScript doesn't have ownership. But thinking about ownership—who "owns" this data? who can mutate it?—leads to better code.

```javascript
// Bad: who owns this object?
function processUser(user) {
  user.processedAt = new Date();  // Mutating the input 😬
  return user;
}

// Better: clear ownership
function processUser(user) {
  return {
    ...user,
    processedAt: new Date(),  // New object, original unchanged
  };
}
```

React's immutability patterns, Redux's pure reducers, the functional programming trend in JavaScript—these all rhyme with Rust's ownership model. Learning Rust makes the "why" behind these patterns visceral.

## Explicit Error Handling

JavaScript's approach to errors:

```javascript
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();  // Hope this doesn't fail
  return user.name.toUpperCase();       // Hope user has a name
}
```

Rust forces you to handle every possibility:

```rust
async fn get_user(id: &str) -> Result<String, Error> {
    let response = fetch(&format!("/api/users/{}", id)).await?;
    let user: User = response.json().await?;
    
    match user.name {
        Some(name) => Ok(name.to_uppercase()),
        None => Err(Error::MissingName),
    }
}
```

That `?` operator propagates errors explicitly. The `match` on `Option<String>` forces you to handle the `None` case. The compiler won't let you ignore possibilities.

After writing Rust, I came back to JavaScript and started writing:

```javascript
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  
  const user = await response.json();
  
  if (!user.name) {
    throw new Error('User has no name');
  }
  
  return user.name.toUpperCase();
}
```

More verbose? Yes. More robust? Absolutely.

## Type Systems Go Deeper

TypeScript's type system is great. Rust's goes further.

```rust
// Rust generics with constraints
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

Rust's type system proves more at compile time:
- Memory safety
- Thread safety
- Absence of null/undefined
- Exhaustive pattern matching

Learning Rust's type system makes TypeScript's feel intuitive. You understand generics deeply. You appreciate what TypeScript gives you and know its limits.

## Memory and Performance Intuition

JavaScript developers rarely think about memory. The garbage collector handles it.

Rust makes you think about it:

```rust
// Stack allocation (fast)
let x: i32 = 5;

// Heap allocation (slower)
let y: Box<i32> = Box::new(5);

// Borrowing vs. copying
let s1 = String::from("hello");
let s2 = &s1;  // Borrow (no copy)
let s3 = s1.clone();  // Copy (expensive for large data)
```

After Rust, I think differently about JavaScript performance:

```javascript
// Every spread creates a new object (heap allocation, GC pressure)
const newState = { ...state, ...updates };

// Array methods create new arrays
const doubled = numbers.map(n => n * 2);

// String concatenation creates new strings
const greeting = "Hello, " + name + "!";
```

None of this is wrong—JavaScript optimizes these patterns well. But understanding the underlying cost helps you make informed decisions when performance matters.

## Concurrency Without Fear

JavaScript has async/await. Rust has async/await AND threads AND channels AND atomic operations. And the compiler ensures you can't create data races.

```rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3, 4, 5];
    
    let handle = thread::spawn(move || {
        // data is MOVED here, no shared mutable state
        data.iter().sum::<i32>()
    });
    
    // Can't use data here anymore - compiler error
    let result = handle.join().unwrap();
    println!("Sum: {}", result);
}
```

Understanding concurrent programming patterns—even in a different language—makes you better at async JavaScript. You recognize race conditions. You understand why shared mutable state is dangerous.

## How to Start

You don't need to become a Rust expert. Here's a reasonable path:

### Week 1: The Basics
- Install Rust (`rustup`)
- Read chapters 1-4 of "The Rust Book" (free online)
- Write a hello world, play with variables, understand ownership

### Week 2: Deeper Concepts
- Read chapters 5-8 (structs, enums, pattern matching)
- Write a small CLI tool (file reader, todo list)
- Feel the compiler fight you, then help you

### Week 3: The Good Stuff
- Read chapter 10 (generics, traits)
- Try to write something that would be hard in JavaScript (parallel processing, memory-mapped files)
- Appreciate what Rust offers that JavaScript can't

### Beyond
- Build something fun: a CLI, a WASM module, contribute to a Rust project
- Or stop here—you've learned the important concepts

## What I Built

My Rust journey started with Tauri (desktop apps with Rust backend). Building floatnote and josetunes taught me:

- How native development differs from web
- Why Rust's guarantees matter for production software
- How to think about memory layout and performance

I'm not a Rust expert. I can read it, write basic programs, and understand errors. That's enough to make me a better JavaScript developer.

## The Meta Lesson

Learning a different language expands your thinking. Not because you'll use it daily, but because it challenges assumptions.

JavaScript is dynamic, garbage-collected, single-threaded. Rust is static, manually managed (sort of), multi-threaded. They make different tradeoffs.

Understanding both gives you perspective. When JavaScript's GC pauses cause jank, you know why. When Rust's compiler rejects your code, you know it's preventing real bugs.

This isn't unique to Rust. Learning any sufficiently different language helps:
- Haskell teaches functional purity
- Go teaches simplicity and concurrency
- C teaches what your computer actually does

Rust happens to be especially relevant for JavaScript developers in 2025 because our tools are written in it. But the meta skill—learning to think in different paradigms—is what really matters.

---

*"The Rust Programming Language" book is excellent and free. Start there. Rustlings exercises are good for hands-on practice.*
