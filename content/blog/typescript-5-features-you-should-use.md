---
title: TypeScript 5.x Features You're Sleeping On
excerpt: The const type parameter alone changed how I write generics. Here's what else you're missing.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - TypeScript
  - JavaScript
  - Developer Experience
coverImage: /blog/typescript-5-features-you-should-use.svg
featured: false
---

# TypeScript 5.x Features You're Sleeping On

I've been writing TypeScript since 2016. Back then, it was "JavaScript with types." Now it's a sophisticated type system that can express things I didn't think were possible.

TypeScript 5.x has shipped some genuinely useful features that flew under the radar. Not the flashy headline stuff—the practical things that make daily coding better. Here's what you should actually be using.

## 1. `const` Type Parameters

This one changed how I write generic functions. Before TS 5.0, when you passed an array literal to a generic function, TypeScript would widen the type:

```typescript
function getRoutes<T extends readonly string[]>(routes: T) {
  return routes;
}

const routes = getRoutes(['home', 'about', 'contact']);
// Type: string[]  😢

// To get the literal types, you had to do this:
const routes2 = getRoutes(['home', 'about', 'contact'] as const);
// Type: readonly ["home", "about", "contact"]  ✅
```

Requiring `as const` at call sites is annoying. With `const` type parameters:

```typescript
function getRoutes<const T extends readonly string[]>(routes: T) {
  return routes;
}

const routes = getRoutes(['home', 'about', 'contact']);
// Type: readonly ["home", "about", "contact"]  ✅ No as const needed!
```

The `const` modifier on the type parameter tells TypeScript to infer literal types. This is huge for builder patterns, configuration objects, and any API where you want to preserve exact types.

Real-world example—a form builder:

```typescript
function createForm<const T extends Record<string, FieldConfig>>(fields: T) {
  return {
    fields,
    validate: (data: FormData<T>) => { /* ... */ }
  };
}

const loginForm = createForm({
  email: { type: 'email', required: true },
  password: { type: 'password', required: true },
});

// TypeScript knows exactly what fields exist
loginForm.validate({
  email: 'test@test.com',
  password: 'secret',
  // username: '...'  // ❌ Error: Object literal may only specify known properties
});
```

## 2. Decorators (Standard, Finally)

TypeScript 5.0 shipped support for the TC39 standard decorators. Yes, decorators have existed in TypeScript forever with `experimentalDecorators`, but those were based on an old proposal that never standardized.

The new decorators are different:

```typescript
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
) {
  const methodName = String(context.name);
  
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${methodName} with`, args);
    const result = target.call(this, ...args);
    console.log(`${methodName} returned`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number) {
    return a + b;
  }
}
```

Key differences from experimental decorators:
- No `reflect-metadata` needed
- Better typing (context parameter gives you type info)
- They're standard JavaScript (will work without transpilation eventually)

If you're starting new projects, use standard decorators. If you have existing code with experimental decorators, you can keep using them—they're not going away.

## 3. `satisfies` Operator

This shipped in 4.9 but I still see people not using it. The problem: you want TypeScript to check that an object matches a type, but you also want to preserve the literal types.

```typescript
type Theme = {
  colors: Record<string, string>;
  fonts: Record<string, string>;
};

// Using a type annotation: loses specificity
const theme1: Theme = {
  colors: { primary: '#007bff', secondary: '#6c757d' },
  fonts: { body: 'Inter', heading: 'Poppins' },
};

theme1.colors.primary  // Type: string (not "#007bff")

// Using satisfies: checks the type AND preserves literals
const theme2 = {
  colors: { primary: '#007bff', secondary: '#6c757d' },
  fonts: { body: 'Inter', heading: 'Poppins' },
} satisfies Theme;

theme2.colors.primary  // Type: "#007bff" ✅
theme2.colors.tertiary // ❌ Error: Property 'tertiary' does not exist
```

With `satisfies`, you get:
- Type checking (can't add invalid properties)
- Literal type preservation (exact strings, numbers, etc.)
- Autocomplete on the actual keys that exist

I use this constantly for configuration objects, design tokens, and route definitions.

## 4. `using` for Resource Management

TypeScript 5.2 added the `using` keyword for automatic resource cleanup. Think RAII from C++, or try-with-resources from Java.

```typescript
class FileHandle implements Disposable {
  constructor(private path: string) {
    console.log(`Opening ${path}`);
  }
  
  read() { return 'file contents'; }
  
  [Symbol.dispose]() {
    console.log(`Closing ${this.path}`);
  }
}

function processFile() {
  using file = new FileHandle('/tmp/data.txt');
  const contents = file.read();
  // ... do stuff with contents
  // file is automatically closed when function exits
  // Even if an error is thrown!
}
```

For async resources, there's `await using`:

```typescript
class DatabaseConnection implements AsyncDisposable {
  static async connect(url: string) {
    const conn = new DatabaseConnection();
    await conn.init(url);
    return conn;
  }
  
  async [Symbol.asyncDispose]() {
    await this.disconnect();
  }
}

async function query() {
  await using db = await DatabaseConnection.connect(process.env.DB_URL);
  const result = await db.query('SELECT * FROM users');
  // db.disconnect() called automatically
  return result;
}
```

No more try/finally everywhere. No more forgetting to clean up. This is especially great for:
- File handles
- Database connections
- Locks/mutexes
- Temporary files
- Event listeners

## 5. Better Type Narrowing

TypeScript 5.x significantly improved type narrowing in several cases.

**Narrowing on computed properties:**
```typescript
type Data = { kind: 'a', value: string } | { kind: 'b', value: number };

function process(key: 'kind', data: Data) {
  if (data[key] === 'a') {
    // TypeScript now narrows correctly
    data.value.toUpperCase();  // ✅ knows value is string
  }
}
```

**Narrowing through generic type constraints:**
```typescript
function process<T extends string | number>(value: T) {
  if (typeof value === 'string') {
    return value.toUpperCase();  // TypeScript knows T is string here
  }
  return value * 2;  // TypeScript knows T is number here
}
```

**Better narrowing with `in` operator:**
```typescript
type Cat = { meow(): void };
type Dog = { bark(): void };

function pet(animal: Cat | Dog) {
  if ('meow' in animal) {
    animal.meow();  // ✅ TypeScript knows it's Cat
  }
}
```

## 6. All `enum` Members as Types

Previously, only string enum members could be used as types. Now numeric enums work too:

```typescript
enum HttpStatus {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}

// This now works!
function isSuccess(status: HttpStatus.OK) {
  return true;
}

isSuccess(200);  // ✅
isSuccess(404);  // ❌ Error
```

## 7. `verbatimModuleSyntax`

This tsconfig option simplifies import/export behavior. When enabled, TypeScript preserves your imports exactly as written—if you write `import type`, it's erased; if you write `import`, it stays.

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true
  }
}
```

```typescript
// With verbatimModuleSyntax:

import type { User } from './types';  // Erased completely
import { formatUser } from './utils';  // Preserved

// If you import a type without "type", TypeScript errors:
import { User } from './types';  // ❌ Error: Use "import type"
```

This eliminates ambiguity and makes the output predictable. I enable this in all new projects.

## 8. Better Performance

TypeScript 5.0 moved from namespaces to modules internally, resulting in 10-20% faster compilation and lower memory usage. TS 5.3+ continued optimizing.

You don't have to do anything—just upgrade and enjoy faster `tsc`.

## My Config Recommendations

Here's my current tsconfig.json for new projects:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

Key settings:
- `noUncheckedIndexedAccess`: Array/object index access returns `T | undefined`. Catches tons of bugs.
- `verbatimModuleSyntax`: Clean import/export behavior.
- `moduleResolution: bundler`: If you're using a bundler (Vite, webpack, etc.), use this. It matches how bundlers actually resolve modules.

## The Features I Skip

Not everything new is worth using:

- **`@satisfies` in JSDoc**: If you're writing JSDoc instead of TypeScript, you have bigger problems.
- **Import attributes**: Still experimental, ecosystem support is spotty.
- **Type-only import/export in namespace**: Namespaces are legacy, just use modules.

## Upgrade Already

If you're on TypeScript 4.x, upgrade. The improvements in 5.x are substantial: better inference, faster compilation, features like `const` type parameters that genuinely improve code quality.

The upgrade is usually painless—run `tsc` and fix whatever breaks. Most projects take under an hour.

---

*The TypeScript release notes are actually well-written and worth reading. Each release has detailed explanations with examples.*
