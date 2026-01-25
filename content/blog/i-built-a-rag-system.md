---
title: "I Built a RAG System. Here's Why You Probably Shouldn't."
excerpt: Vector databases, embeddings, chunking strategies—I went down the RAG rabbit hole so you don't have to. Here's when it's worth it (rarely).
category: deep-dives
publishedAt: 2025-01-11
tags:
  - AI
  - Architecture
  - LLMs
  - RAG
coverImage: /blog/i-built-a-rag-system.svg
featured: false
---

# I Built a RAG System. Here's Why You Probably Shouldn't.

Last month, I spent two weeks building a RAG (Retrieval-Augmented Generation) system. Vector database, embedding pipeline, chunking strategies, the whole nine yards.

The result? A system that answers questions about my documentation slightly better than just pasting the docs into ChatGPT.

Was it worth it? Probably not. Here's the honest breakdown.

## What RAG Actually Is (30 Second Version)

RAG = "give the AI relevant context before asking it questions."

Instead of asking the AI about something it wasn't trained on:
1. Convert your documents into numbers (embeddings)
2. Store those numbers in a database (vector DB)
3. When someone asks a question, find relevant chunks
4. Feed those chunks + question to the AI

Simple concept. Complex implementation.

## The Hype vs Reality

### The Hype

"RAG lets you build a ChatGPT for your company's data!"
"Query your entire knowledge base with natural language!"
"AI-powered search that actually understands context!"

### The Reality

- 70% of your time goes into chunking and preprocessing
- Retrieval quality determines everything (and it's hard)
- The "AI-powered" part is actually the easy bit
- Most use cases don't need RAG at all

## When You Don't Need RAG

Before building anything, ask yourself:

### Can you just... paste it?

Claude has 200k token context. GPT-4 Turbo has 128k. That's roughly:
- 150,000 words
- A 300-page book
- Most documentation sites

If your knowledge base fits in context, just paste it. No embedding, no retrieval, no maintenance.

```typescript
const answer = await askAI(`
Here's our complete documentation:
${fullDocs}

Question: ${userQuestion}
`);
```

"But that's expensive!" Not really. 100k tokens at GPT-4 Turbo rates is about $1. For occasional queries, that's fine.

### Is search good enough?

Traditional search (Elasticsearch, Algolia, even basic SQLite FTS) handles many "find information" use cases:

```sql
SELECT content, title 
FROM documents 
WHERE content MATCH 'how to configure authentication'
ORDER BY rank
LIMIT 5;
```

Then pass results to AI for summarization. Simpler than RAG, often just as effective.

### Is the data actually complex?

RAG shines when:
- You have a LOT of documents (millions)
- Semantic search matters (finding conceptually related, not just keyword matches)
- Context windows would be too expensive at scale

For most internal tools? Probably overkill.

## When RAG Actually Makes Sense

Okay, here's where RAG earns its complexity:

### 1. You're Building a Product Feature

If "AI-powered search" is a selling point, you can't paste 100k tokens per request. RAG makes it economical at scale.

### 2. Information Changes Frequently

With paste-it-all, you're regenerating massive prompts. With RAG, you just update the relevant chunks.

### 3. You Need Semantic Understanding

"Find me policies related to vacation time" should find "PTO policy" and "time off guidelines" even without keyword matches. That's embedding similarity doing work traditional search can't.

### 4. Multi-Document Synthesis

"Compare our security approach across all product lines" requires pulling from multiple sources intelligently. RAG can retrieve related chunks from different documents.

## My RAG Build: The Honest Breakdown

Here's what I actually built and what I learned:

### The Stack

```
Documents → Chunks → Embeddings → Pinecone
                                    ↓
User Query → Embedding → Similarity Search → Context
                                    ↓
                          Context + Query → GPT-4 → Answer
```

### The Code (Simplified)

```typescript
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Chunking: This is where I spent most of my time
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['\n## ', '\n### ', '\n\n', '\n', ' ']
});

const chunks = await splitter.splitDocuments(documents);

// Embeddings
const embeddings = new OpenAIEmbeddings();
const vectorStore = await PineconeStore.fromDocuments(
  chunks,
  embeddings,
  { pineconeIndex: index }
);

// Retrieval
async function answer(question: string) {
  const relevantDocs = await vectorStore.similaritySearch(question, 4);
  
  const context = relevantDocs
    .map(doc => doc.pageContent)
    .join('\n\n---\n\n');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{
      role: 'user',
      content: `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer based on the context provided.`
    }]
  });
  
  return response.choices[0].message.content;
}
```

### The Problems I Hit

**Problem 1: Chunking is an art, not a science**

How do you split documents? By paragraphs? By sentences? By tokens? Every choice has tradeoffs:
- Too small: Lose context
- Too big: Retrieve irrelevant info
- Wrong boundaries: Cut off important relationships

I tried five different strategies before settling on "markdown headers with overlap."

**Problem 2: Retrieval quality varies wildly**

Some queries work perfectly:
```
Q: "What's the API rate limit?"
→ Retrieves the exact paragraph about rate limits ✓
```

Some fail mysteriously:
```
Q: "How do I handle authentication?"
→ Retrieves general intro paragraphs, misses auth docs ✗
```

Why? Embedding similarity isn't the same as relevance. The words "handle authentication" might embed closer to general onboarding text than to specific auth implementation guides.

**Problem 3: The metadata matters more than expected**

Raw retrieval wasn't enough. I needed to track:
- Source document (for attribution)
- Section hierarchy (h1 > h2 > h3)
- Recency (newer docs prioritized)
- Document type (tutorial vs reference vs FAQ)

This metadata filtering does as much work as semantic search.

**Problem 4: Evaluation is hard**

How do you know if your RAG system is good? You need:
- Test questions with known answers
- Metrics for retrieval quality
- Metrics for generation quality
- Human evaluation for edge cases

I spent a week just building eval tools.

## The Cost Reality

Here's what my setup costs:

| Component | Cost | Notes |
|-----------|------|-------|
| Pinecone (Starter) | $70/month | 1M vectors |
| OpenAI Embeddings | ~$10/month | Batch processing |
| OpenAI GPT-4 | ~$50/month | Per-query responses |
| **Total** | **~$130/month** | For moderate usage |

Compare to: Pasting full docs into Claude API would cost similar amounts for the same query volume, with zero infrastructure.

## Simpler Alternatives That Work

Before going full RAG, try these:

### Alternative 1: Hybrid Search

Combine keyword search with embedding search:

```typescript
async function hybridSearch(query: string) {
  const [keywordResults, semanticResults] = await Promise.all([
    elasticSearch(query),      // Traditional search
    vectorSearch(query)        // Embedding similarity
  ]);
  
  // Merge and dedupe
  return mergeResults(keywordResults, semanticResults);
}
```

Often better than pure semantic search.

### Alternative 2: Smart Context Packing

Instead of RAG, just be clever about what you include:

```typescript
async function smartContext(query: string, allDocs: Doc[]) {
  // Use cheap embedding search to filter
  const relevant = await quickFilter(query, allDocs);
  
  // Pack as much as fits into context
  let context = '';
  for (const doc of relevant) {
    if ((context + doc.content).length < 100000) {
      context += doc.content + '\n\n';
    }
  }
  
  return askWithContext(context, query);
}
```

### Alternative 3: Structured Q&A

If you have predictable questions, just build a FAQ:

```typescript
const faqs = [
  { 
    question: "How do I reset my password?",
    keywords: ["password", "reset", "forgot", "login"],
    answer: "Go to Settings > Security > Reset Password..."
  },
  // ...
];

function findAnswer(query: string) {
  // Simple keyword matching or light semantic search
  const match = faqs.find(faq => 
    faq.keywords.some(k => query.toLowerCase().includes(k))
  );
  return match?.answer || askAI(query);
}
```

## If You're Going To Build RAG Anyway

Here's what I learned the hard way:

### Start with evaluation

Before building anything, create:
- 50+ test questions
- Expected answers or source documents
- Automated tests to run after changes

You'll thank yourself when tweaking embeddings for the 47th time.

### Chunking > everything else

Spend 50% of your time on chunking strategy. Try:
- Semantic chunking (split at logical boundaries)
- Parent document retrieval (retrieve chunks, include surrounding context)
- Overlapping windows (redundancy helps)

### Use metadata aggressively

Filter by:
- Document type
- Recency
- User access level
- Topic/category

Retrieval without filtering is like searching Google without site-specific results.

### Hybrid search is usually better

Pure vector search misses keyword matches. Pure keyword search misses semantic relationships. Use both:

```typescript
const results = await Promise.all([
  vectorSearch(query, { limit: 10 }),
  keywordSearch(query, { limit: 10 })
]);

// Re-rank combined results
return rerank(merge(results), query);
```

### Have a fallback

When retrieval fails, your system should gracefully handle it:

```typescript
const docs = await retrieve(question);

if (docs.length === 0 || docs[0].score < 0.7) {
  return "I couldn't find specific information about that. " +
         "Could you rephrase or ask about something else?";
}
```

## The Bottom Line

RAG is a legitimate architecture pattern. It's also vastly overused.

**Build RAG when:**
- You're at scale (millions of queries or documents)
- Semantic search is core to your product
- Context windows are genuinely too expensive
- You need dynamic, frequently-updated knowledge

**Don't build RAG when:**
- Your docs fit in a context window
- Keyword search works fine
- You're doing a hackathon demo
- Someone said "we should use AI"

The best RAG system is the one you don't build. The second best is one with great evaluation, thoughtful chunking, and hybrid retrieval.

If you're still reading and still want to build one: godspeed. Set aside a month, not a weekend. And don't say I didn't warn you.

---

*The complexity of AI systems should match the complexity of your problem. Most problems are simpler than they appear.*
