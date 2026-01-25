---
title: "AI Code Review: My Bot Found 47 Bugs (12 Were Real)"
excerpt: I built an AI code reviewer and ran it on our codebase. The results were humbling—for both the AI and our code quality.
category: deep-dives
publishedAt: 2025-01-14
tags:
  - AI
  - Code Review
  - Developer Tools
  - Automation
coverImage: /blog/ai-code-review-reality-check.svg
featured: false
---

# AI Code Review: My Bot Found 47 Bugs (12 Were Real)

I got tired of manual code reviews taking forever, so I built an AI code reviewer. It would scan every PR, flag issues, and free up senior developers for real work.

The experiment ran for a month. The AI found 47 "bugs." After manual review, 12 were actual issues. The rest ranged from false positives to hilariously wrong interpretations.

Here's what I learned about AI code review: what it catches, what it misses, and whether it's actually worth using.

## The Setup

I built a GitHub Action that:
1. Triggers on every PR
2. Extracts the diff
3. Sends code to GPT-4 with a review prompt
4. Posts comments on flagged lines
5. Creates a summary comment

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Get diff
        run: |
          git diff origin/main...HEAD > diff.txt
      
      - name: AI Review
        run: node scripts/ai-review.js
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The review script:

```typescript
const reviewPrompt = `
You are a senior code reviewer. Review this diff for:

1. **Bugs**: Logic errors, null pointer issues, race conditions
2. **Security**: SQL injection, XSS, auth bypasses, exposed secrets
3. **Performance**: N+1 queries, unnecessary re-renders, memory leaks
4. **Best Practices**: Error handling, type safety, code clarity

For each issue, provide:
- Severity (critical/high/medium/low)
- File and line number
- Description of the issue
- Suggested fix

Only flag real issues. Do not flag style preferences.
Respond in JSON format.

Diff:
${diff}
`;
```

## The Results: A Taxonomy of AI Opinions

### Category 1: Actually Useful Findings (12 bugs)

These were real issues the AI caught:

**Bug #1: Missing null check**
```typescript
// AI flagged this
function getUserName(user) {
  return user.profile.name; // user.profile could be undefined
}
```

Legitimate catch. We'd see this crash in production.

**Bug #2: SQL injection risk**
```typescript
// AI flagged this
const query = `SELECT * FROM users WHERE id = '${userId}'`;
```

100% correct. This is a security vulnerability.

**Bug #3: Unhandled promise rejection**
```typescript
// AI flagged this  
async function fetchData() {
  const response = await fetch(url);
  return response.json(); // No error handling
}
```

Valid point. Production code needs try/catch or error boundaries.

**Bug #4: Race condition**
```typescript
// AI flagged this
let cache = null;

async function getData() {
  if (!cache) {
    cache = await fetchFromAPI(); // Multiple calls can start before first completes
  }
  return cache;
}
```

Good catch. Concurrent calls could all trigger fetches.

### Category 2: True But Unhelpful (15 findings)

These were technically correct but not actionable:

**Finding: "Consider adding input validation"**
```typescript
function processOrder(orderId: string) {
  // AI wants validation here
  return db.orders.findOne({ id: orderId });
}
```

The function takes a typed string. TypeScript already ensures it's a string. Adding runtime validation adds noise without value.

**Finding: "This could throw an error"**
```typescript
JSON.parse(data);
```

Yes, it could. But it's already inside a try/catch two levels up. The AI couldn't see the context.

**Finding: "Magic number detected"**
```typescript
const pageSize = 20;
```

It's a constant. It's named. It's fine. Not every number needs to be in a config file.

### Category 3: Style Preferences Disguised as Issues (11 findings)

These were the AI imposing opinions:

**"Use optional chaining instead"**
```typescript
// AI wanted this changed
if (user && user.profile && user.profile.name) {}
// To this
if (user?.profile?.name) {}
```

Fine suggestion, but not a bug. And our codebase had a mix of styles.

**"Prefer const over let"**
```typescript
let count = 0;
// ... later
count += 1; // Actually mutated, let is correct
```

The AI saw `let` and flagged it without noticing the mutation below.

**"Consider using destructuring"**
```typescript
const name = props.name;
const email = props.email;
```

Personal preference. Not an issue.

### Category 4: Completely Wrong (9 findings)

These were embarrassing AI mistakes:

**False positive: "Unused variable"**
```typescript
const { data, error } = useQuery();
// AI said `data` was unused

return <div>{data?.name}</div>; // AI couldn't see JSX reference
```

The AI parsed the diff incorrectly and missed the JSX usage.

**False positive: "Missing await"**
```typescript
function syncOperation() {
  return someComputedValue; // Not async, doesn't need await
}
```

The AI assumed every function returning something should be awaited.

**Hallucination: "Import not found"**
```typescript
import { formatDate } from '@/utils/date';
// AI: "The module '@/utils/date' doesn't exist"
```

It does exist. The AI just couldn't see our file structure.

## What AI Code Review Actually Catches

After a month, here's the pattern:

### Reliably Catches

1. **Obvious security issues**: SQL injection, XSS, hardcoded secrets
2. **Null/undefined risks**: Missing checks before property access
3. **Basic type errors**: String where number expected (in JS)
4. **Missing error handling**: Unhandled promises, no try/catch
5. **Simple logic errors**: Off-by-one, wrong comparison operators

### Sometimes Catches

1. **Race conditions**: If they're simple and explicit
2. **Performance issues**: Obvious N+1 patterns
3. **Incomplete implementations**: Missing cases in switch statements

### Rarely Catches

1. **Business logic errors**: AI doesn't know your requirements
2. **Architectural problems**: Wrong patterns, poor abstractions
3. **Complex bugs**: Anything requiring understanding of program flow
4. **Context-dependent issues**: Depends on code elsewhere

### Never Catches

1. **Design problems**: AI can't tell if your API makes sense
2. **Requirement mismatches**: Did you build the right thing?
3. **Scalability issues**: Will this work with 10x load?
4. **Maintainability**: Is this code easy to change?

## Making AI Review Actually Useful

Based on my experiment, here's how to get value:

### 1. Narrow the scope

Don't ask AI to review everything. Focus on what it's good at:

```typescript
const focusedPrompt = `
Review ONLY for:
- Security vulnerabilities
- Unhandled errors
- Null pointer risks

Do NOT comment on:
- Code style
- Naming conventions
- Performance (unless severe)
`;
```

Fewer false positives, more signal.

### 2. Provide context

The AI can't see your whole codebase. Give it what it needs:

```typescript
const contextualPrompt = `
Project context:
- TypeScript with strict mode
- All database calls are already wrapped in error handlers
- We use path aliases (@/) for imports
- React Query handles API caching

Review this diff:
${diff}
`;
```

### 3. Require confidence levels

Make the AI self-assess:

```typescript
const confidentPrompt = `
For each issue, rate your confidence:
- HIGH: I'm certain this is a bug
- MEDIUM: This looks problematic but might be intentional
- LOW: This is a suggestion, not a bug

Only report HIGH and MEDIUM issues.
`;
```

This cuts down on noise significantly.

### 4. Two-pass review

First pass: AI review for automated catches
Second pass: Human review for everything else

Don't let AI review replace human review. Let it pre-filter.

### 5. Tune over time

Track false positives and adjust:

```typescript
// After a month, I added this to my prompt:
const refinedPrompt = `
Known exceptions (do NOT flag these):
- useQuery destructuring where data appears unused
- Try/catch is often in parent components
- Path aliases (@/) are valid in our config
`;
```

## The Real ROI

After a month:
- **Time saved**: ~30 minutes/week (quick catches AI finds)
- **Time lost**: ~45 minutes/week (reviewing false positives)
- **Cost**: ~$50/month in API calls

Net result: **Slightly negative ROI**

But here's the thing—four of those 12 real bugs were security issues. Without AI review, they might have shipped. One SQL injection in production is worth more than a year of AI review costs.

## My Revised Approach

I still use AI code review, but differently:

**Automated pipeline:**
```yaml
# Only runs on:
# - Files touching auth/security
# - Database queries
# - External API integrations
```

**Prompt focuses on:**
- Security vulnerabilities only
- High confidence findings only
- No style feedback

**Human reviewers:**
- Still do full reviews
- AI is a safety net, not a replacement
- Explicitly told to ignore AI style comments

## When to Use AI Code Review

**Good fit:**
- Large teams with varied experience levels
- Security-sensitive codebases
- High PR volume where humans can't review everything
- Compliance requirements for security scanning

**Bad fit:**
- Small teams who know the codebase
- Rapid prototyping
- When you'd spend more time configuring than reviewing
- If false positives would frustrate your team

## Tools to Try

If you don't want to build your own:

- **CodeRabbit**: Full-featured AI review
- **Sourcery**: Python-focused
- **GitHub Copilot PR review**: Built into Copilot Enterprise
- **Amazon CodeGuru**: AWS's offering

Or build your own for maximum control (what I recommend if you have time).

## The Bottom Line

AI code review is useful but overhyped. It catches surface-level issues reliably—null checks, obvious security holes, missing error handling. It misses everything requiring context—business logic, architecture, requirements.

The math is simple: If AI catches one critical bug per month that humans would miss, it's worth it. In my experience, it catches about one every two months. Your mileage may vary based on your team's review rigor and codebase complexity.

Use it as a safety net, not a replacement. Narrow its focus to what it's good at. And never, ever trust it without human verification.

My bot found 47 bugs. 12 were real. That's a 25% accuracy rate. Would you trust a human reviewer with that track record?

Me neither. But as a first-pass filter? It's fine. Just calibrate your expectations accordingly.

---

*AI tools amplify human capability; they don't replace human judgment. Use them to catch what you'd miss, not to avoid doing the work.*
