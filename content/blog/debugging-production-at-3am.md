---
title: "Debugging Production at 3 AM: War Stories and Lessons"
excerpt: "Every developer has 3 AM debugging stories. Here are mine, and what they taught me about building resilient systems."
category: deep-dives
publishedAt: 2024-08-15
tags:
  - Debugging
  - Production
  - DevOps
  - War Stories
coverImage: /blog/debugging-production-at-3am.svg
featured: false
seo:
  title: "Production Debugging War Stories | Lessons from 3 AM Incidents"
  description: "Real production debugging stories from a senior developer with 21 years of experience. Lessons learned from outages, bugs, and late-night firefighting."
  keywords: ["production debugging", "debugging war stories", "software incidents", "on-call developer", "production outages"]
---

# Debugging Production at 3 AM: War Stories and Lessons

If you haven't been woken up at 3 AM by a PagerDuty alert, you haven't truly lived the software engineering experience.

I've had dozens of middle-of-the-night incidents over 21 years. Some were my fault. Some were cosmic injustice. All of them taught me something.

Here are the stories I tell over drinks at conferences.

## The Christmas Eve Memory Leak

**The Setup:** 2019. Retail application handling holiday traffic. I'm at my parents' house.

**The Alert:** "CRITICAL: API response times > 30 seconds"

**The Scene:** Midnight. My parents' guest room. Laptop balanced on a pillow because there's no desk. Extended family sleeping upstairs. Christmas stockings hung with care. PagerDuty screaming.

**The Investigation:**

First, the basics: CPU fine, disk fine, but memory climbing steadily. The Node.js process was at 1.8GB and growing.

```bash
# Memory snapshot
node --inspect=0.0.0.0:9229 server.js
```

Chrome DevTools showed thousands of objects that should have been garbage collected. But what was holding them?

Two hours in, I found it:

```javascript
// The culprit
const cache = {};

app.get('/api/products/:id', async (req, res) => {
  if (!cache[req.params.id]) {
    cache[req.params.id] = await fetchProduct(req.params.id);
  }
  res.json(cache[req.params.id]);
});
```

Innocent-looking cache. Except we had hundreds of thousands of products. And the cache had no TTL. And no max size. It just grew. Forever.

**The Fix:**

```javascript
import LRU from 'lru-cache';

const cache = new LRU({ 
  max: 1000,
  ttl: 1000 * 60 * 5 // 5 minutes
});
```

**The Lesson:** Every cache needs a eviction strategy. "Just store it" is not a strategy.

---

## The Timezone Apocalypse

**The Setup:** 2021. Booking system. Clients across 30 timezones.

**The Alert:** "500 errors on booking confirmation"

**The Investigation:**

Errors started at exactly midnight UTC. The error: `RangeError: Invalid time value`.

The code:

```javascript
const bookingDate = new Date(booking.scheduledAt);
const localTime = bookingDate.toLocaleTimeString('en-US', {
  timeZone: booking.timezone
});
```

Looked fine. Except some bookings had `timezone: "America/New_York"` and others had `timezone: "EST"`. 

JavaScript's `toLocaleTimeString` accepts IANA timezone names. `"EST"` isn't valid IANA. It's an abbreviation. And it fails silently... sometimes.

**The Fix:**

```javascript
import { IANAZone } from 'luxon';

function normalizeTimezone(tz) {
  // Validate IANA timezone
  if (IANAZone.isValidZone(tz)) {
    return tz;
  }
  
  // Map common abbreviations
  const mappings = {
    'EST': 'America/New_York',
    'PST': 'America/Los_Angeles',
    'CST': 'America/Chicago',
    // ...
  };
  
  return mappings[tz] || 'UTC';
}
```

**The Lesson:** Never trust user-provided timezone data. Validate and normalize everything.

---

## The Database Connection Massacre

**The Setup:** 2022. Video conferencing platform. Major client demo scheduled for 9 AM.

**The Alert:** 8:47 AM. "Database connection pool exhausted"

**The Scene:** 13 minutes before a demo to a Fortune 500 client. No pressure.

**The Investigation:**

Connection pool maxed at 100. But we had way fewer users than that. Where were the connections going?

```sql
SELECT * FROM pg_stat_activity WHERE state = 'idle';
```

Dozens of idle connections, all from the same code path. The culprit:

```javascript
app.get('/api/users/:id', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  res.json(result.rows[0]);
  // Missing: client.release()
});
```

No `release()`. Every request grabbed a connection and never let go. 100 requests = 100 connections = pool exhausted.

**The Fix:**

```javascript
app.get('/api/users/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } finally {
    client.release(); // ALWAYS release
  }
});
```

Or better, use the pool directly:

```javascript
const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
// Connection automatically released
```

**The Lesson:** Always release resources in a `finally` block. Always.

---

## The Case-Sensitive Catastrophe

**The Setup:** 2020. File upload system. Worked perfectly in development.

**The Alert:** "404 errors on file downloads"

**The Investigation:**

Files uploaded successfully. Files stored successfully. Files... not found on download?

```javascript
// Upload
const fileName = `${uuid()}_${file.originalname}`;
await storage.upload(fileName, file.buffer);
await db.files.insert({ id: uuid(), filename: fileName });

// Download
const record = await db.files.findById(req.params.id);
const file = await storage.download(record.filename);
```

Nothing wrong there. Except:

```
Uploaded filename: "ABC123_Report.PDF"
Stored filename:   "ABC123_Report.PDF"
S3 object key:     "abc123_report.pdf"  // S3 lowercased it? No...
```

Development was on macOS. Filesystem is case-insensitive.
Production was on Linux. Filesystem is case-sensitive.

The download code was using a slightly different casing than what was stored.

**The Fix:**

```javascript
// Normalize to lowercase on upload
const fileName = `${uuid()}_${file.originalname}`.toLowerCase();
```

**The Lesson:** Test on production-equivalent environments. macOS filesystem lies.

---

## The Infinite Loop That Billed $4,000

**The Setup:** 2023. Serverless function processing webhooks.

**The Alert:** AWS bill notification. "$4,382.17 for Lambda."

**The Investigation:**

Normal daily Lambda cost: ~$5. Yesterday's cost: $4,382. That's a lot of invocations.

CloudWatch logs showed millions of invocations. All the same function. All triggered by... the same webhook?

```javascript
// Webhook handler
export async function handler(event) {
  const data = JSON.parse(event.body);
  await processData(data);
  
  // Notify external service
  await fetch('https://external-api.com/webhook', {
    method: 'POST',
    body: JSON.stringify({ status: 'processed' })
  });
  
  return { statusCode: 200 };
}
```

The external service? It sent a webhook back to us when it received our notification. Which triggered our handler. Which sent another notification. Which triggered another webhook...

Infinite loop via HTTP.

**The Fix:**

```javascript
export async function handler(event) {
  // Deduplicate
  const eventId = event.headers['x-event-id'];
  if (await cache.has(eventId)) {
    return { statusCode: 200, body: 'Already processed' };
  }
  await cache.set(eventId, true, { ttl: 86400 });
  
  // ... rest of handler
}
```

**The Lesson:** Idempotency isn't optional. And webhooks can create feedback loops.

---

## What Every Incident Taught Me

### 1. Logs Are Everything

Can't debug what you can't see. Structured logging with context:

```javascript
logger.info('Processing order', { 
  orderId: order.id,
  userId: order.userId,
  items: order.items.length,
  total: order.total
});
```

### 2. Have a Runbook

At 3 AM, you're not thinking clearly. Pre-written steps save lives:

```markdown
## API High Latency

1. Check CloudWatch metrics
2. Check database connection count
3. Check for recent deployments
4. Rollback if recent deploy exists
5. Escalate to on-call DBA if database-related
```

### 3. Test Your Rollback

The fastest fix is often reverting. But if you've never rolled back, you don't know if it works.

Practice deployments. Practice rollbacks. The drill is the point.

### 4. Blameless Postmortems

After every incident, write it up:
- What happened?
- How did we detect it?
- How did we fix it?
- How do we prevent it?

No blame. Just learning. The goal is to make the system more resilient.

### 5. Sleep Is Not Optional

The best debugging happens with a rested brain. If it's 4 AM and you're stuck, set an alert for deterioration and get a few hours of sleep. Fresh eyes solve problems.

---

## The Glamorous Life

Software engineering looks like writing elegant code in a cool office.

The reality includes debugging production in your parents' guest room on Christmas Eve, praying the fix works before anyone wakes up.

But honestly? Solving those impossible problems, at 3 AM, when everything's on fire? That's when you really learn what you're made of.

---

*21 years of production incidents. Some my fault. Most educational. All exhausting.*
