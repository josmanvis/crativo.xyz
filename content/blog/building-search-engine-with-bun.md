---
title: "Building a Search Engine with Bun: The angine Deep Dive"
publishedAt: 2024-06-15
description: "How I built a fast, lightweight search engine using Bun's native SQLite, full-text search, and modern indexing techniques. A deep dive into search architecture for side projects."
tags: ["bun", "search", "sqlite", "full-text-search", "architecture"]
coverImage: /blog/bun-search.svg
featured: true
readingTime: "22 min"
---

# Building a Search Engine with Bun: The angine Deep Dive

Every developer tool I build eventually needs search. Project dashboards need to find projects by name and description. Documentation sites need full-text search. CLI tools need fuzzy matching.

For years, I'd reach for Elasticsearch or Algolia. They work great, but they're overkill for many use cases. Elasticsearch requires a JVM and significant memory. Algolia charges per search operation. For a side project or local tool, I wanted something simpler.

So I built angine: a search engine that runs entirely on SQLite and Bun. No external services, no complex infrastructure, just fast full-text search that works anywhere Bun runs.

This is the deep dive into how it works.

## The Problem Space

What makes search "hard"?

1. **Tokenization**: Breaking text into searchable units
2. **Normalization**: Handling case, accents, stemming (run/running/ran)
3. **Ranking**: Deciding which results are most relevant
4. **Performance**: Returning results in milliseconds, not seconds
5. **Updates**: Keeping the index in sync with source data

Elasticsearch solves all of these with a sophisticated distributed architecture. But that architecture has overhead. For a local project dashboard or a documentation site with 10,000 pages, we can do something much simpler.

## Why SQLite + Bun?

SQLite has FTS5—a full-text search extension that's been battle-tested for over a decade. It handles tokenization, normalization, and ranking out of the box.

Bun has native SQLite bindings—no need for node-sqlite3 or better-sqlite3. It's fast, synchronous by default, and just works.

Combined, you get a search engine in a single file:

```typescript
import { Database } from 'bun:sqlite';

const db = new Database(':memory:');

// Create FTS5 table
db.run(`
  CREATE VIRTUAL TABLE documents USING fts5(
    title,
    content,
    tokenize='porter unicode61'
  )
`);

// Index some documents
db.run(`INSERT INTO documents VALUES (?, ?)`, ['Hello World', 'This is my first document']);
db.run(`INSERT INTO documents VALUES (?, ?)`, ['Search Tutorial', 'Learn how to search efficiently']);

// Search
const results = db.query(`
  SELECT title, snippet(documents, 1, '<b>', '</b>', '...', 10) as excerpt
  FROM documents
  WHERE documents MATCH ?
  ORDER BY rank
`).all('search');

console.log(results);
// [{ title: 'Search Tutorial', excerpt: 'Learn how to <b>search</b> efficiently' }]
```

That's a working search engine in 20 lines.

## angine Architecture

Of course, real-world search needs more structure. Here's how angine organizes things:

```
angine/
├── src/
│   ├── index.ts           # Main exports
│   ├── engine.ts          # Search engine class
│   ├── indexer.ts         # Document indexing
│   ├── query.ts           # Query parsing and execution
│   ├── tokenizer.ts       # Custom tokenization
│   ├── ranker.ts          # Result ranking
│   └── schema.ts          # Schema definition
├── tests/
└── package.json
```

### The Schema

First, define what you're searching:

```typescript
// src/schema.ts
export interface FieldConfig {
  type: 'text' | 'keyword' | 'number' | 'date';
  searchable?: boolean;  // Include in full-text search
  filterable?: boolean;  // Allow exact-match filtering
  weight?: number;       // Boost this field in ranking (1-10)
  stored?: boolean;      // Include in results
}

export interface Schema {
  fields: Record<string, FieldConfig>;
  primaryKey?: string;
}

// Example schema for a project search
const projectSchema: Schema = {
  fields: {
    id: { type: 'keyword', filterable: true },
    name: { type: 'text', searchable: true, weight: 10 },
    description: { type: 'text', searchable: true, weight: 5 },
    category: { type: 'keyword', filterable: true },
    techStack: { type: 'text', searchable: true, weight: 3 },
    year: { type: 'number', filterable: true },
    createdAt: { type: 'date', filterable: true, stored: true },
  },
  primaryKey: 'id',
};
```

### The Engine Class

The main interface:

```typescript
// src/engine.ts
import { Database } from 'bun:sqlite';
import type { Schema, FieldConfig } from './schema.js';
import { Indexer } from './indexer.js';
import { QueryExecutor } from './query.js';

export interface EngineConfig {
  schema: Schema;
  dbPath?: string;  // ':memory:' for in-memory
  tokenizer?: 'porter' | 'unicode61' | 'trigram';
}

export class SearchEngine<T extends Record<string, unknown>> {
  private db: Database;
  private schema: Schema;
  private indexer: Indexer;
  private queryExecutor: QueryExecutor;

  constructor(config: EngineConfig) {
    this.db = new Database(config.dbPath || ':memory:');
    this.schema = config.schema;
    this.initializeDatabase(config.tokenizer || 'porter');
    this.indexer = new Indexer(this.db, this.schema);
    this.queryExecutor = new QueryExecutor(this.db, this.schema);
  }

  private initializeDatabase(tokenizer: string) {
    const searchableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.searchable)
      .map(([name]) => name);

    const filterableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.filterable)
      .map(([name, cfg]) => ({ name, type: cfg.type }));

    // Create FTS5 table for full-text search
    this.db.run(`
      CREATE VIRTUAL TABLE IF NOT EXISTS fts_index USING fts5(
        ${searchableFields.join(', ')},
        doc_id UNINDEXED,
        tokenize='${tokenizer} unicode61'
      )
    `);

    // Create regular table for filtering and storage
    this.db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        indexed_at INTEGER NOT NULL
      )
    `);

    // Create filter indexes
    for (const field of filterableFields) {
      const sqlType = this.getSqlType(field.type);
      this.db.run(`
        CREATE TABLE IF NOT EXISTS filter_${field.name} (
          doc_id TEXT PRIMARY KEY,
          value ${sqlType}
        )
      `);
      this.db.run(`
        CREATE INDEX IF NOT EXISTS idx_filter_${field.name} 
        ON filter_${field.name}(value)
      `);
    }
  }

  private getSqlType(type: FieldConfig['type']): string {
    switch (type) {
      case 'number': return 'REAL';
      case 'date': return 'INTEGER';
      default: return 'TEXT';
    }
  }

  index(documents: T[]): void {
    this.indexer.indexBatch(documents);
  }

  indexOne(document: T): void {
    this.indexer.indexOne(document);
  }

  search(query: string, options?: SearchOptions): SearchResult<T>[] {
    return this.queryExecutor.search(query, options);
  }

  remove(id: string): void {
    this.indexer.remove(id);
  }

  clear(): void {
    this.db.run('DELETE FROM fts_index');
    this.db.run('DELETE FROM documents');
    // Clear filter tables...
  }

  close(): void {
    this.db.close();
  }
}
```

### The Indexer

Handles getting documents into the search index:

```typescript
// src/indexer.ts
import { Database } from 'bun:sqlite';
import type { Schema } from './schema.js';

export class Indexer {
  private db: Database;
  private schema: Schema;
  private insertFts: ReturnType<Database['prepare']>;
  private insertDoc: ReturnType<Database['prepare']>;

  constructor(db: Database, schema: Schema) {
    this.db = db;
    this.schema = schema;
    this.prepareStatements();
  }

  private prepareStatements() {
    const searchableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.searchable)
      .map(([name]) => name);

    const placeholders = [...searchableFields, 'doc_id'].map(() => '?').join(', ');
    
    this.insertFts = this.db.prepare(`
      INSERT INTO fts_index (${searchableFields.join(', ')}, doc_id)
      VALUES (${placeholders})
    `);

    this.insertDoc = this.db.prepare(`
      INSERT OR REPLACE INTO documents (id, data, indexed_at)
      VALUES (?, ?, ?)
    `);
  }

  indexBatch(documents: Record<string, unknown>[]): void {
    const transaction = this.db.transaction((docs: Record<string, unknown>[]) => {
      for (const doc of docs) {
        this.indexDocument(doc);
      }
    });
    transaction(documents);
  }

  indexOne(document: Record<string, unknown>): void {
    this.indexDocument(document);
  }

  private indexDocument(doc: Record<string, unknown>): void {
    const pk = this.schema.primaryKey || 'id';
    const id = String(doc[pk]);

    // Extract searchable field values
    const searchableValues = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.searchable)
      .map(([name]) => this.normalizeValue(doc[name]));

    // Insert into FTS index
    this.insertFts.run(...searchableValues, id);

    // Store full document
    this.insertDoc.run(id, JSON.stringify(doc), Date.now());

    // Update filter tables
    this.updateFilters(id, doc);
  }

  private normalizeValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(' ');
    return String(value);
  }

  private updateFilters(id: string, doc: Record<string, unknown>): void {
    const filterableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.filterable);

    for (const [name, config] of filterableFields) {
      const value = doc[name];
      if (value === undefined) continue;

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO filter_${name} (doc_id, value)
        VALUES (?, ?)
      `);

      if (config.type === 'date' && value instanceof Date) {
        stmt.run(id, value.getTime());
      } else {
        stmt.run(id, value);
      }
    }
  }

  remove(id: string): void {
    // Remove from FTS
    this.db.run('DELETE FROM fts_index WHERE doc_id = ?', [id]);
    // Remove from documents
    this.db.run('DELETE FROM documents WHERE id = ?', [id]);
    // Remove from filter tables
    const filterableFields = Object.keys(this.schema.fields)
      .filter(name => this.schema.fields[name].filterable);
    for (const name of filterableFields) {
      this.db.run(`DELETE FROM filter_${name} WHERE doc_id = ?`, [id]);
    }
  }
}
```

### The Query Executor

Where the magic happens—parsing queries and ranking results:

```typescript
// src/query.ts
import { Database } from 'bun:sqlite';
import type { Schema } from './schema.js';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
  boosts?: Record<string, number>;
  highlight?: boolean;
}

export interface SearchResult<T> {
  document: T;
  score: number;
  highlights?: Record<string, string>;
}

export class QueryExecutor {
  private db: Database;
  private schema: Schema;

  constructor(db: Database, schema: Schema) {
    this.db = db;
    this.schema = schema;
  }

  search<T>(query: string, options: SearchOptions = {}): SearchResult<T>[] {
    const { limit = 20, offset = 0, filters = {}, highlight = true } = options;

    // Parse and enhance query
    const ftsQuery = this.buildFtsQuery(query);
    
    // Build filter conditions
    const { filterSql, filterParams } = this.buildFilters(filters);

    // Build the query
    const sql = `
      SELECT 
        d.data,
        fts.rank as base_rank
        ${highlight ? ', ' + this.buildHighlights() : ''}
      FROM fts_index fts
      JOIN documents d ON d.id = fts.doc_id
      ${filterSql}
      WHERE fts_index MATCH ?
      ORDER BY fts.rank
      LIMIT ? OFFSET ?
    `;

    const rows = this.db.query(sql).all(ftsQuery, ...filterParams, limit, offset);

    return rows.map(row => this.processRow<T>(row, highlight));
  }

  private buildFtsQuery(query: string): string {
    // Handle special characters
    const escaped = query.replace(/['"]/g, '');
    
    // Split into terms
    const terms = escaped.split(/\s+/).filter(Boolean);
    
    // Build weighted query
    const searchableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.searchable);

    // For each term, boost by field weight
    const weightedTerms = terms.map(term => {
      const fieldQueries = searchableFields.map(([name, cfg]) => {
        const weight = cfg.weight || 1;
        // FTS5 column filter syntax
        return `${name}:${term}*^${weight}`;
      });
      return `(${fieldQueries.join(' OR ')})`;
    });

    return weightedTerms.join(' AND ');
  }

  private buildFilters(filters: Record<string, unknown>): {
    filterSql: string;
    filterParams: unknown[];
  } {
    const conditions: string[] = [];
    const params: unknown[] = [];

    for (const [field, value] of Object.entries(filters)) {
      const config = this.schema.fields[field];
      if (!config?.filterable) continue;

      if (Array.isArray(value)) {
        // IN clause for arrays
        const placeholders = value.map(() => '?').join(', ');
        conditions.push(`
          fts.doc_id IN (
            SELECT doc_id FROM filter_${field} WHERE value IN (${placeholders})
          )
        `);
        params.push(...value);
      } else if (typeof value === 'object' && value !== null) {
        // Range queries: { gte: 2020, lte: 2024 }
        const range = value as { gte?: unknown; lte?: unknown; gt?: unknown; lt?: unknown };
        const rangeConditions: string[] = [];
        
        if (range.gte !== undefined) {
          rangeConditions.push('value >= ?');
          params.push(range.gte);
        }
        if (range.lte !== undefined) {
          rangeConditions.push('value <= ?');
          params.push(range.lte);
        }
        if (range.gt !== undefined) {
          rangeConditions.push('value > ?');
          params.push(range.gt);
        }
        if (range.lt !== undefined) {
          rangeConditions.push('value < ?');
          params.push(range.lt);
        }

        if (rangeConditions.length > 0) {
          conditions.push(`
            fts.doc_id IN (
              SELECT doc_id FROM filter_${field} 
              WHERE ${rangeConditions.join(' AND ')}
            )
          `);
        }
      } else {
        // Exact match
        conditions.push(`
          fts.doc_id IN (
            SELECT doc_id FROM filter_${field} WHERE value = ?
          )
        `);
        params.push(value);
      }
    }

    const filterSql = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}`
      : '';

    return { filterSql, filterParams: params };
  }

  private buildHighlights(): string {
    const searchableFields = Object.entries(this.schema.fields)
      .filter(([_, cfg]) => cfg.searchable)
      .map(([name], i) => 
        `snippet(fts_index, ${i}, '<mark>', '</mark>', '...', 20) as highlight_${name}`
      );
    return searchableFields.join(', ');
  }

  private processRow<T>(row: any, highlight: boolean): SearchResult<T> {
    const document = JSON.parse(row.data) as T;
    const score = -row.base_rank; // FTS5 rank is negative

    const result: SearchResult<T> = { document, score };

    if (highlight) {
      const highlights: Record<string, string> = {};
      const searchableFields = Object.entries(this.schema.fields)
        .filter(([_, cfg]) => cfg.searchable)
        .map(([name]) => name);

      for (const field of searchableFields) {
        const highlightValue = row[`highlight_${field}`];
        if (highlightValue) {
          highlights[field] = highlightValue;
        }
      }
      result.highlights = highlights;
    }

    return result;
  }
}
```

## Using angine

Here's what it looks like in practice:

```typescript
import { SearchEngine } from 'angine';

// Define your schema
const schema = {
  fields: {
    id: { type: 'keyword' as const, filterable: true },
    title: { type: 'text' as const, searchable: true, weight: 10 },
    body: { type: 'text' as const, searchable: true, weight: 5 },
    author: { type: 'keyword' as const, filterable: true },
    publishedAt: { type: 'date' as const, filterable: true },
    tags: { type: 'text' as const, searchable: true, weight: 3, filterable: true },
  },
  primaryKey: 'id',
};

// Create engine
const engine = new SearchEngine({ 
  schema,
  dbPath: './search.db', // Or ':memory:' for in-memory
});

// Index documents
engine.index([
  {
    id: '1',
    title: 'Getting Started with Bun',
    body: 'Bun is a fast all-in-one JavaScript runtime...',
    author: 'jose',
    publishedAt: new Date('2025-01-01'),
    tags: ['bun', 'javascript', 'tutorial'],
  },
  {
    id: '2', 
    title: 'SQLite Full-Text Search',
    body: 'SQLite FTS5 provides powerful full-text search capabilities...',
    author: 'jose',
    publishedAt: new Date('2025-01-15'),
    tags: ['sqlite', 'search', 'database'],
  },
]);

// Search
const results = engine.search('bun javascript');
console.log(results);
// [
//   {
//     document: { id: '1', title: 'Getting Started with Bun', ... },
//     score: 0.89,
//     highlights: {
//       title: 'Getting Started with <mark>Bun</mark>',
//       body: '<mark>Bun</mark> is a fast all-in-one <mark>JavaScript</mark> runtime...',
//     }
//   }
// ]

// Search with filters
const filtered = engine.search('search', {
  filters: {
    author: 'jose',
    publishedAt: { gte: new Date('2025-01-10') },
  },
  limit: 10,
});

// Faceted search (multiple values)
const faceted = engine.search('tutorial', {
  filters: {
    tags: ['javascript', 'typescript'], // OR within array
  },
});
```

## Performance Optimizations

### Batch Indexing

The transaction wrapper makes batch indexing fast:

```typescript
// Single transaction for batch
const transaction = db.transaction((docs) => {
  for (const doc of docs) {
    indexDocument(doc);
  }
});

// Benchmark: 10,000 documents
// Without transaction: ~15 seconds
// With transaction: ~0.5 seconds
```

### Prepared Statements

Preparing statements once and reusing them avoids parse overhead:

```typescript
// Slow: parse every time
for (const doc of docs) {
  db.run('INSERT INTO fts_index VALUES (?, ?)', [doc.title, doc.body]);
}

// Fast: prepare once, run many
const stmt = db.prepare('INSERT INTO fts_index VALUES (?, ?)');
for (const doc of docs) {
  stmt.run(doc.title, doc.body);
}
```

### Index Optimization

For read-heavy workloads, optimize after bulk indexing:

```typescript
// After bulk insert
db.run('INSERT INTO fts_index(fts_index) VALUES ("optimize")');
```

This merges FTS segments for faster queries.

### In-Memory with Persistence

For maximum speed with durability:

```typescript
import { Database } from 'bun:sqlite';
import { readFileSync, writeFileSync } from 'fs';

class PersistentMemoryEngine {
  private db: Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    
    // Load from disk into memory
    try {
      const data = readFileSync(dbPath);
      this.db = new Database(':memory:');
      this.db.run('ATTACH DATABASE ? AS disk', [dbPath]);
      this.db.run('SELECT * FROM disk.sqlite_master'); // Validate
      // Clone disk to memory...
    } catch {
      this.db = new Database(':memory:');
    }
  }

  persist() {
    // Write memory to disk
    this.db.run('VACUUM INTO ?', [this.dbPath]);
  }
}
```

## Comparison with Alternatives

### vs Elasticsearch

| Feature | angine | Elasticsearch |
|---------|--------|---------------|
| Setup | `new SearchEngine()` | Cluster, JVM, config |
| Memory | ~10MB | ~2GB minimum |
| Latency | <1ms local | ~10ms network |
| Features | Basic FTS | Aggregations, ML, etc |
| Best for | Local/embedded | Distributed/enterprise |

### vs Algolia

| Feature | angine | Algolia |
|---------|--------|---------|
| Cost | Free | Per-operation |
| Latency | <1ms local | ~50ms global |
| Offline | Works offline | Requires network |
| Features | Basic FTS | Typo tolerance, geo, AI |
| Best for | Side projects | Production SaaS |

### vs MeiliSearch

| Feature | angine | MeiliSearch |
|---------|--------|-------------|
| Setup | npm install | Docker/binary |
| Memory | ~10MB | ~100MB+ |
| API | Embedded | HTTP |
| Features | Basic FTS | Typo tolerance, facets |
| Best for | Embedded | Self-hosted SaaS |

## When to Use angine

**Good fit:**
- Local CLI tools
- Developer dashboards
- Documentation sites (static)
- Electron apps
- Any embedded search need

**Not a good fit:**
- Multi-server deployments
- Real-time updates from multiple writers
- Complex aggregations
- Geographic search

## Future Improvements

Things I'm exploring:

### Fuzzy Matching

FTS5 doesn't have built-in fuzzy matching. Options:
1. Use trigram tokenizer
2. Pre-generate spelling variations
3. Implement Levenshtein in application layer

```typescript
// Trigram approach
db.run(`
  CREATE VIRTUAL TABLE fts_trigram USING fts5(
    content,
    tokenize='trigram'
  )
`);

// Now "helo" matches "hello"
```

### Semantic Search

Combining keyword search with vector embeddings:

```typescript
// Hypothetical API
const results = engine.search('fast runtime', {
  mode: 'hybrid',
  semanticWeight: 0.3,
});
```

This would require storing embeddings and doing cosine similarity.

### Real-Time Sync

For applications with changing data:

```typescript
// Watch for changes
const engine = new SearchEngine({
  schema,
  source: {
    type: 'postgres',
    connection: 'postgres://...',
    table: 'articles',
    syncInterval: 5000, // ms
  },
});
```

## Wrapping Up

Search doesn't have to be complicated. For many use cases, SQLite's FTS5 combined with Bun's native bindings gives you everything you need in a single dependency.

angine started as a way to add search to my project dashboard. It's grown into something I reach for whenever I need local search. No external services, no network calls, no subscription fees.

The key insights:
1. **FTS5 is powerful** — tokenization, ranking, highlighting built-in
2. **Bun makes it easy** — native SQLite, no build step
3. **Schema-driven design** — define once, index and query consistently
4. **Batch with transactions** — 30x performance improvement
5. **Know when to upgrade** — angine isn't a replacement for Elasticsearch

For side projects and local tools, give embedded search a try. You might be surprised how far it gets you.

---

*What search challenges are you facing? I'd love to hear about use cases where this approach might (or might not) work.*
