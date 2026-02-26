---
title: "SQLite is Eating the World (And Postgres Is Sweating)"
excerpt: "Everyone's putting SQLite everywhere now—browsers, edge functions, even servers. The little database that could is taking over, and the reasons why might surprise you."
category: deep-dives
publishedAt: 2026-02-26
tags:
  - sqlite
  - databases
  - postgres
  - turso
  - edge-computing
coverImage: /blog/sqlite-eating-the-world.svg
featured: true
seo:
  title: "SQLite is Eating the World: Why Everyone's Using It Everywhere"
  description: "From browsers to edge functions to servers, SQLite is everywhere now. Here's why the little database that could is taking over."
  keywords: ["sqlite", "postgres", "turso", "libsql", "edge database", "serverless database"]
---

# SQLite is Eating the World (And Postgres Is Sweating)

Five years ago, if you asked me what database to use for a production app, I'd say Postgres. Everyone would say Postgres. Postgres is the answer to every database question. Need relations? Postgres. Need JSON? Postgres. Need full-text search? Postgres with `tsvector`. Need time-series? TimescaleDB... which is Postgres.

Postgres is the golden hammer. Everything looks like a nail.

But something funny happened. SQLite started showing up in places it shouldn't be. Production apps. Edge functions. Browsers. People were running SQLite in production and it was... working?

Now we have Turso, libsql, SQLite in Cloudflare Workers, SQLite in browsers with OPFS, SQLite everywhere. The little database that could is eating the world.

## The Appeal of "Just a File"

SQLite isn't a server. It's a library that reads and writes a file. That's it. No connection strings, no connection pools, no containers, no separate process to monitor.

```bash
# Postgres installation
docker run --name postgres -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
# Then configure connection pooling
# Then set up backups
# Then monitor it
# Then wake up at 3am when it goes down

# SQLite installation
npm install better-sqlite3
# Done.
```

For a solo developer or small team, this is a revelation. Every production Postgres instance is a tiny ongoing operational burden. Someone needs to care about it. Someone needs to pay the hosting bill. Someone needs to handle upgrades.

SQLite? It's a file. You can copy it. You can version it. You can delete it and start over.

## But What About Concurrency?

This is always the first objection. "SQLite doesn't handle concurrent writes."

This was true. Then WAL mode happened.

```sql
PRAGMA journal_mode = WAL;
```

Write-Ahead Logging changes everything. Instead of blocking readers during writes, SQLite writes to a separate log file. Readers continue reading the main database. The log gets checkpointed back periodically.

With WAL mode, SQLite can handle thousands of reads and dozens of concurrent writes. That's enough for most applications. How many apps actually need hundreds of concurrent writes per second?

## The Edge Database Revolution

The real game-changer is edge computing. When your code runs on 300 servers worldwide, a centralized Postgres instance in Virginia becomes a bottleneck.

Every request has to cross an ocean (metaphorically or literally). Latency compounds. Users in Singapore wait for data from us-east-1.

SQLite flips this model. The database lives with the code. Every edge node has its own SQLite instance. Reads are instant because they're local. Writes are replicated asynchronously.

Turso took this idea and built a business around it. Embedded SQLite replicas that sync to a primary. You get local-read performance with global consistency. It's genuinely brilliant.

## SQLite in the Browser

This one still blows my mind. SQLite runs in the browser now.

Not a simulation. Actual SQLite compiled to WebAssembly, running in your browser, persisting to the Origin Private File System (OPFS). You get a real SQL database with ACID transactions, right in the user's browser.

```typescript
import { sqliteWasm } from '@sqlite.org/sqlite-wasm';

const db = await sqliteWasm.open('my-app.db');
await db.exec('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, text TEXT)');
await db.exec('INSERT INTO todos (text) VALUES (?)', ['Build offline-first app']);

// This data persists across sessions
// Works offline
// Zero server costs
```

This enables a completely new architecture: offline-first apps with a real database. Not localStorage, not IndexedDB with its nightmare API—an actual SQL database.

## When Postgres Still Wins

Let me be clear: SQLite isn't replacing Postgres everywhere.

**Heavy write workloads**: If you're doing hundreds of writes per second, Postgres is the right choice. Its MVCC implementation is battle-tested for this.

**Complex queries**: Postgres has decades of query optimization work. SQLite's optimizer is good, but Postgres is better for complex joins and subqueries.

**Multiple applications sharing data**: SQLite is embedded—one process only. If you need multiple services hitting the same database, you need a server.

**Extensions**: Postgres extensions are incredible. PostGIS, pgvector, TimescaleDB—this ecosystem doesn't exist for SQLite.

## The Pragmatic View

Here's my current mental model:

- **Prototype/MVP**: SQLite. Zero setup, move fast.
- **Single-server app**: SQLite with WAL mode. Keep it simple.
- **Edge/serverless**: Turso or libsql. Local reads, global replication.
- **Browser/offline-first**: SQLite WASM with OPFS.
- **High-scale multi-tenant**: Postgres. You'll know when you need it.

The database industry spent decades convincing us we needed big, complex, expensive infrastructure. SQLite's renaissance is proving that for most apps, we didn't. We just needed a file that could handle SQL.

## The Turso/Libsql Moment

Turso forked SQLite into libsql because SQLite's licensing and governance was too restrictive for modern use cases. They added:

- **HTTP-based replication**: Sync databases over HTTP, perfect for edge
- **Vector search**: Embeddings and similarity search built-in
- **Better async support**: For non-blocking operations in serverless

The result is SQLite, but evolved. It's still "just a file" but now that file can replicate globally.

## The Numbers Don't Lie

Turso reports billions of database reads per day across their edge network. Cloudflare added SQLite to D1 and watched adoption explode. Every major edge platform now offers some form of SQLite-as-a-service.

Developers are voting with their keyboards. They're choosing simplicity over complexity. Local over remote. Files over servers.

Postgres isn't going anywhere—it's still the right choice for many workloads. But SQLite is eating the edges, and those edges are getting bigger every day.

## What This Means for You

Next time you reach for `npm install pg`, pause. Ask yourself:

- Do I actually need a separate database server?
- Could a local file handle this workload?
- Would edge replication solve my latency problems?

The answer might still be Postgres. But it might not be. And that's new. That's the shift.

SQLite spent decades as "that thing for mobile apps and testing." Now it's a legitimate production database for the edge-first world. The little database that could, did.

---

*Running Postgres? Still fine. Running SQLite? Also fine. Running both? Probably ideal.*