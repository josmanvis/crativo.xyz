---
title: "The Art of Code Review: What 20 Years Taught Me"
excerpt: "Code review is a skill. Most people are bad at it. Here's how to get better—whether you're giving feedback or receiving it."
category: engineering
publishedAt: 2024-08-29
tags:
  - Code Review
  - Engineering
  - Teams
  - Best Practices
coverImage: /blog/art-of-code-review.svg
featured: false
seo:
  title: "Code Review Best Practices | 20 Years of Software Engineering Experience"
  description: "Master the art of code review with practical tips from 20+ years of software development. Learn how to give and receive feedback effectively."
  keywords: ["code review best practices", "how to review code", "pull request review", "software engineering", "code review tips"]
---

# The Art of Code Review: What 20 Years Taught Me

I've been on both sides of thousands of code reviews. As the nervous junior whose first PR got 47 comments. As the senior who left too many nitpicks on a simple fix. As the tech lead trying to balance quality with velocity.

Code review is a skill, and most of us were never taught it. Here's what I've learned.

## The Purpose of Code Review (It's Not What You Think)

Many engineers think code review is about:
- Finding bugs
- Enforcing style consistency
- Gatekeeping quality

Those are side effects. The real purposes are:

1. **Knowledge sharing** — Spreading understanding of the codebase
2. **Teaching** — Helping engineers level up
3. **Collaboration** — Building shared ownership
4. **Documentation** — PRs become historical records

If your code reviews only catch bugs, you're missing 80% of the value.

## For Reviewers: How to Give Feedback

### 1. Start With Context

Before you write a single comment, understand:
- What problem is this solving?
- What constraints is the author working under?
- What does the ticket/issue say?

I've left "why didn't you use X?" comments only to realize X wasn't available in that part of the codebase. Embarrassing.

### 2. Differentiate Your Comments

Not all feedback is equal. I use prefixes:

```
nit: Trailing comma missing here

suggestion: Consider extracting this to a helper function

question: Why did you choose this approach over X?

blocker: This will cause a race condition in production
```

This tells the author what's optional vs. required.

### 3. Ask Questions Instead of Making Demands

❌ "This is wrong. Use a Set instead."

✅ "What led you to use an Array here? I'm wondering if a Set might help with the deduplication—but maybe I'm missing context."

The second approach:
- Assumes good intent
- Acknowledges you might be wrong
- Invites discussion

### 4. Praise What's Good

```
Great catch on the edge case handling here 👍

This abstraction is really clean—I'll use this pattern in my next PR.

Love how readable this function is.
```

Positive feedback isn't just nice. It reinforces good patterns and builds confidence.

### 5. Don't Nitpick to Death

If you have 30 comments on a 50-line PR, something's wrong. Either:
- The code has fundamental issues (talk to the author directly)
- You're being too pedantic (step back)
- Your team needs better linting/formatting tools

For style issues, automate them:

```json
// .eslintrc
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error"
  }
}
```

Let the robots argue about semicolons. You focus on logic.

### 6. Review Promptly

A PR sitting for 3 days kills momentum. I aim to review within 4 hours during work hours. If I can't do a thorough review, I'll at least leave a comment:

```
Taking a look now—will have feedback by EOD tomorrow.
```

Context-switching back to a PR after days is painful for everyone.

## For Authors: How to Receive Feedback

### 1. Your Code Is Not Your Identity

The hardest lesson: criticism of your code is not criticism of you.

I still have to remind myself sometimes. That function I was proud of? Apparently it's a memory leak. That's not a personal attack—it's valuable information.

### 2. Make Your PRs Easy to Review

```markdown
## Summary
Added user authentication using Auth.js

## Changes
- Added NextAuth configuration
- Created login/logout pages
- Added session middleware
- Updated user model in Prisma

## Testing
- [ ] Login flow works
- [ ] Session persists across refreshes
- [ ] Logout clears session

## Screenshots
[screenshot of login page]
```

A good PR description reduces back-and-forth by 80%.

### 3. Keep PRs Small

```
500 lines: Easy to review, quick feedback
1000 lines: "I'll get to this later"
2000+ lines: Gets approved without being read
```

If your PR is huge, break it up. Feature flags and incremental changes are your friends.

### 4. Respond to Every Comment

Even if it's just "Done" or "Good point, fixed." This tells the reviewer their time was valued and that you've addressed their feedback.

For disagreements:
```
I considered that approach, but went with X because of [reason]. 
Happy to change it if you still think Y is better—what do you think?
```

### 5. Don't Approve Immediately After Feedback

If you make changes based on review feedback, don't immediately approve your own PR. Give the reviewer a chance to verify their concerns were addressed.

## Team-Level Code Review Culture

### 1. Define What "Approved" Means

Some teams:
- Require 2 approvals
- Have different rules for different file types
- Allow self-approval for hotfixes

Document this. Ambiguity leads to resentment.

### 2. Rotate Reviewers

If the same two people review every PR:
- They become bottlenecks
- Knowledge stays siloed
- Others don't grow

Use round-robin assignment or CODEOWNERS wisely.

### 3. Time-box Reviews

I've seen reviews turn into architecture debates that last weeks. Set a rule: if discussion exceeds 10 comments, move to a call.

### 4. Review Your Own Review

Periodically look back at your comments. Ask:
- Was I being helpful or just showing off?
- Did I consider the author's perspective?
- Would I want to receive this feedback?

## The Code Review Checklist I Actually Use

```markdown
## Logic
- [ ] Does this solve the stated problem?
- [ ] Are edge cases handled?
- [ ] Are there potential race conditions?

## Maintainability
- [ ] Is the code understandable without comments?
- [ ] Are functions/classes appropriately sized?
- [ ] Is there unnecessary duplication?

## Testing
- [ ] Are tests present for new functionality?
- [ ] Do tests cover edge cases?
- [ ] Are tests readable and maintainable?

## Security
- [ ] Is user input validated/sanitized?
- [ ] Are there potential injection vulnerabilities?
- [ ] Are secrets properly managed?

## Performance
- [ ] Are there obvious performance issues?
- [ ] Is this code path hot? If so, is it optimized?
```

I don't run through this formally for every PR, but it's internalized.

## Final Thoughts

Code review is a conversation, not a judgment. The best reviewers make authors feel supported, not attacked. The best authors make reviewers feel their time is valued.

It takes practice. It takes empathy. It takes remembering that there's a person on the other side of that diff.

---

*20+ years of code reviews. Some I'm proud of. Some I'd rather forget. All of them taught me something.*
