---
title: "The Stack That Actually Ships"
excerpt: "After 21 years and dozens of tech stacks, here's what I actually use to ship products in 2025."
category: hot-takes
publishedAt: 2024-11-25
tags:
  - Tech Stack
  - React
  - TypeScript
  - Architecture
coverImage: /blog/stack-that-ships.svg
featured: false
seo:
  title: "Best Tech Stack 2025 | What Actually Ships in Production"
  description: "A senior developer's production tech stack for 2025. Real-world choices for React, databases, hosting, and more."
  keywords: ["best tech stack 2025", "production tech stack", "React stack", "TypeScript stack", "modern web stack"]
---

# The Stack That Actually Ships

Everyone's got opinions about tech stacks. Most of those opinions come from Twitter threads and blog posts, not production experience.

After 21 years of building software—from jQuery spaghetti to enterprise video platforms—here's what I actually reach for when I need to ship.

## The Default Stack

When I start a new project with no special requirements:

```
Framework:     Next.js 15
Language:      TypeScript
Styling:       Tailwind CSS
Components:    shadcn/ui
Database:      PostgreSQL
ORM:           Prisma
Auth:          Auth.js (NextAuth)
Hosting:       Vercel
```

This isn't cutting-edge. It's boring. And boring ships.

## Why Each Piece

### Next.js 15

I've written about [why I still use Next.js](/blog/why-nextjs-2025), but the short version: it handles routing, SSR, API routes, and deployment without me thinking about it.

Alternatives I'd consider:
- **Remix** for form-heavy apps
- **Astro** for content sites
- **Plain React + Vite** if I need total control

### TypeScript

Not negotiable for anything beyond a weekend hack. The type system catches bugs before they happen and makes refactoring possible.

```typescript
// This saves hours of debugging
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

function processUser(user: User) {
  // TypeScript ensures user has all required fields
}
```

I don't use `any`. Ever. If I'm tempted, I'm doing something wrong.

### Tailwind CSS

I resisted Tailwind for years. "Utility classes are ugly." "It's just inline styles."

Then I shipped three projects with it. The velocity difference is real:

```jsx
// No more context switching between JSX and CSS files
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  Click me
</button>
```

The class names look messy until you internalize them. Then they become muscle memory.

### shadcn/ui

Not a component library—a collection of copy-paste components built on Radix. You own the code:

```bash
npx shadcn@latest add button
# Now you have src/components/ui/button.tsx
# Modify it however you want
```

Accessible by default. Customizable completely. No version lock-in.

### PostgreSQL + Prisma

PostgreSQL handles 99% of use cases. It's relational, it's fast, it's reliable, and it's free.

Prisma makes it type-safe:

```typescript
// Schema
model User {
  id    String @id @default(cuid())
  email String @unique
  posts Post[]
}

// Usage (fully typed)
const user = await prisma.user.findUnique({
  where: { email: 'test@example.com' },
  include: { posts: true }
});
```

Migrations work. The studio is helpful. It's not the fastest ORM, but it's fast enough.

### Auth.js

Authentication is hard. Don't roll your own:

```typescript
// One file to configure
export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({...}),
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub;
      return session;
    },
  },
});
```

OAuth providers, JWT sessions, database adapters—it handles the complexity.

### Vercel

Deploy with `git push`. Automatic previews. Edge functions. Analytics.

Yes, there's some lock-in. Yes, it gets expensive at scale. But for most projects, the developer experience is worth it.

Self-hosting Next.js is possible but annoying. I'd rather spend that time building features.

## When I Deviate

### Real-time Features

For WebSockets and real-time updates:

```
Pusher or Ably for simple cases
Socket.io for more control
Liveblocks for collaborative features
```

### Heavy Background Jobs

```
Trigger.dev or Inngest for job queues
Redis for simple queues
BullMQ if I'm already using Redis
```

### File Uploads

```
UploadThing for simple uploads
Cloudflare R2 or AWS S3 for heavy storage
```

### Search

```
Algolia for managed search
Meilisearch for self-hosted
PostgreSQL full-text search for simple cases
```

### Mobile

```
React Native with Expo
Or just a PWA if it's simple enough
```

## What I Don't Use Anymore

### Redux

React's built-in state + context + a few hooks handles 95% of cases:

```typescript
// Most state is local
const [count, setCount] = useState(0);

// Shared state? Context.
const { user } = useAuth();

// Server state? TanStack Query.
const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
```

Redux is overkill for most apps. If you need it, you'll know.

### CSS-in-JS

styled-components, Emotion—I'm off them. The runtime cost isn't worth it, and Tailwind is faster to write.

### GraphQL

For most CRUD apps, REST is simpler. GraphQL shines for complex data requirements, but adds tooling overhead.

```typescript
// This is fine
const posts = await fetch('/api/posts').then(r => r.json());

// You don't always need this
const { data } = useQuery(gql`
  query GetPosts {
    posts { id title author { name } }
  }
`);
```

### Microservices

Monoliths are fine. Actually, monoliths are great. Deploy one thing, debug one thing.

Split when you have a real scaling problem, not because it sounds architectural.

## The Process

Every project starts the same:

```bash
# 1. Scaffold
npx create-next-app@latest my-app --typescript --tailwind --app

# 2. Add components
npx shadcn@latest init
npx shadcn@latest add button card dialog form

# 3. Add database
npm install prisma @prisma/client
npx prisma init

# 4. Add auth
npm install next-auth @auth/prisma-adapter

# 5. Start building
npm run dev
```

First commit happens within an hour. First deploy within a day.

## Controversial Opinions

### Monorepos Are Usually Overkill

Unless you have multiple related packages that actually share code, a single repo is simpler.

### You Don't Need Kubernetes

Docker Compose for development. Single containers for production. Scale when you need to.

### Tests Should Exist, But Sparingly

Integration tests > Unit tests. Test behavior, not implementation. 80% coverage is a vanity metric.

### ORMs Are Worth It

The "just write SQL" crowd is wrong for most apps. Type-safe queries and migrations matter more than raw query performance.

## The Point

The best stack is the one that gets out of your way. I've tried dozens of combinations over 21 years. This one lets me focus on the product, not the infrastructure.

Your mileage may vary. Your constraints are different. But if you're starting something new and want to ship fast, this works.

---

*Currently shipping with this stack at ON24 and for side projects. It's not exciting. It works.*
