---
title: Building Typesafe APIs with tRPC (A Practical Guide)
excerpt: End-to-end type safety without code generation. Here's how I use tRPC in production.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - TypeScript
  - tRPC
  - API
  - Full-Stack
coverImage: /blog/building-typesafe-apis-trpc.svg
featured: false
---

# Building Typesafe APIs with tRPC (A Practical Guide)

I've built a lot of APIs. REST APIs with Express, GraphQL with Apollo, even some JSON-RPC stuff back in the day. They all share a common pain point: the gap between your backend types and your frontend types.

You write a beautiful TypeScript interface on the server. Then you copy it to the client. You change a field. You forget to update one side. You deploy. The bug appears in production three days later.

tRPC makes this impossible. Literally impossible. Your frontend types are *derived* from your backend types. Change one, the other updates automatically. TypeScript yells at you if they're out of sync.

It's magic. Here's how to use it.

## What tRPC Actually Is

tRPC (TypeScript Remote Procedure Call) is a way to call server functions from the client with full type safety. No code generation, no manual syncing, no GraphQL schemas.

You define a function on the server:

```typescript
// server/routers/user.ts
export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({ 
        where: { id: input.id } 
      });
      return user;
    }),
});
```

You call it from the client:

```typescript
// client/components/Profile.tsx
const { data: user } = trpc.user.getById.useQuery({ id: '123' });
//          ^ user is fully typed: { id: string, name: string, ... }
```

That's it. The input is validated with Zod. The output is inferred from your query. The TypeScript types flow from server to client automatically.

## Setting It Up

Let me walk through a real setup. I'll use Next.js, but tRPC works with any React setup (and even non-React projects).

### 1. Install Dependencies

```bash
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod
```

tRPC uses React Query under the hood for caching, deduplication, and all the other goodies.

### 2. Create the tRPC Instance

```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson, // Handles dates, Maps, Sets, etc.
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
```

### 3. Define Your Routers

```typescript
// server/routers/post.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = router({
  // Get all posts
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const posts = await db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      
      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        const next = posts.pop();
        nextCursor = next!.id;
      }
      
      return { posts, nextCursor };
    }),

  // Get single post
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await db.post.findUnique({ where: { id: input.id } });
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' });
      return post;
    }),

  // Create post (protected)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      published: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.post.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });
    }),
});
```

### 4. Combine Routers

```typescript
// server/routers/_app.ts
import { router } from '../trpc';
import { postRouter } from './post';
import { userRouter } from './user';
import { commentRouter } from './comment';

export const appRouter = router({
  post: postRouter,
  user: userRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
```

That `AppRouter` type is the magic. It carries all your procedure types to the client.

### 5. Create the API Endpoint

```typescript
// pages/api/trpc/[trpc].ts (Next.js Pages Router)
// or app/api/trpc/[trpc]/route.ts (App Router)
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import { createContext } from '../../../server/context';

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
```

### 6. Set Up the Client

```typescript
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// pages/_app.tsx or app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../utils/trpc';
import superjson from 'superjson';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

function App({ children }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Using It

Now the fun part. Here's how you actually use tRPC in components:

### Queries

```tsx
function PostList() {
  const { data, isLoading, error } = trpc.post.list.useQuery({
    limit: 20,
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <ul>
      {data.posts.map(post => (
        <li key={post.id}>
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </li>
      ))}
    </ul>
  );
}
```

### Infinite Queries

```tsx
function InfinitePostList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = 
    trpc.post.list.useInfiniteQuery(
      { limit: 10 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  return (
    <>
      <ul>
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </ul>
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          Load More
        </button>
      )}
    </>
  );
}
```

### Mutations

```tsx
function CreatePostForm() {
  const utils = trpc.useUtils();
  
  const createPost = trpc.post.create.useMutation({
    onSuccess() {
      // Invalidate and refetch posts after creation
      utils.post.list.invalidate();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement);
    
    createPost.mutate({
      title: form.get('title') as string,
      content: form.get('content') as string,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit" disabled={createPost.isPending}>
        {createPost.isPending ? 'Creating...' : 'Create Post'}
      </button>
      {createPost.error && <p>{createPost.error.message}</p>}
    </form>
  );
}
```

### Optimistic Updates

```tsx
const likeMutation = trpc.post.like.useMutation({
  onMutate: async ({ postId }) => {
    // Cancel outgoing fetches
    await utils.post.byId.cancel({ id: postId });
    
    // Snapshot current value
    const previous = utils.post.byId.getData({ id: postId });
    
    // Optimistically update
    utils.post.byId.setData({ id: postId }, (old) => ({
      ...old!,
      likeCount: old!.likeCount + 1,
    }));
    
    return { previous };
  },
  onError: (err, { postId }, context) => {
    // Roll back on error
    utils.post.byId.setData({ id: postId }, context!.previous);
  },
});
```

## Authentication and Authorization

tRPC uses "context" to pass request-scoped data (like the current user) to procedures.

```typescript
// server/context.ts
import { inferAsyncReturnType } from '@trpc/server';
import { getSession } from 'next-auth/react';

export async function createContext({ req, res }) {
  const session = await getSession({ req });
  
  return {
    session,
    user: session?.user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
```

Then create protected procedures:

```typescript
// server/trpc.ts
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user, // user is now non-null
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
```

Now `protectedProcedure` handlers have `ctx.user` guaranteed:

```typescript
deletePost: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const post = await db.post.findUnique({ where: { id: input.id } });
    
    if (post?.authorId !== ctx.user.id) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }
    
    return db.post.delete({ where: { id: input.id } });
  }),
```

## Why tRPC Over GraphQL

I like GraphQL. I've used it in production. But tRPC solves the type safety problem more elegantly for TypeScript-only stacks.

| Aspect | GraphQL | tRPC |
|--------|---------|------|
| Type generation | Requires codegen | Automatic |
| Schema | Separate SDL files | TypeScript is the schema |
| Learning curve | Steeper | Lower (just functions) |
| Flexibility | Any client language | TypeScript only |
| Overfetching | Solved (client specifies) | N/A (RPC model) |

If you need to support non-TypeScript clients (mobile apps in Swift/Kotlin, etc.), GraphQL makes more sense. If your entire stack is TypeScript, tRPC is simpler.

## My Real-World Experience

I've used tRPC in three production projects now. Honestly? It's been great.

**The wins:**
- Zero type mismatches between client and server
- Refactoring is safe—rename a field and TypeScript shows you every usage
- Less boilerplate than REST or GraphQL
- React Query integration is seamless

**The friction:**
- Debugging network requests is less intuitive (everything is POST to `/api/trpc`)
- No standard for API documentation (like Swagger/OpenAPI)
- Tight coupling between client and server code

**My verdict:** For full-stack TypeScript apps where you control both ends, tRPC is my default choice. The type safety is worth the trade-offs.

---

*tRPC was created by Alex / KATT. The v10 release in 2022 was a big step up. If you tried it before and bounced off, give it another look.*
