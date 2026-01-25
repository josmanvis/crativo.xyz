---
title: "AI Coding Assistants: What They're Actually Good At"
excerpt: I use AI assistants daily. Here's where they help, where they fail, and how I actually use them.
category: deep-dives
publishedAt: 2025-01-25
tags:
  - AI
  - Developer Tools
  - Productivity
coverImage: /blog/ai-coding-assistants-honest-review.svg
featured: false
---

# AI Coding Assistants: What They're Actually Good At

I've been using AI coding assistants for two years now. GitHub Copilot since the beta. Claude, GPT-4, various local models. They're part of my daily workflow.

The discourse around them is polarized. Either "AI will replace developers" or "AI is useless hype." Neither is true.

Here's my honest assessment of what AI assistants are actually good at, where they fail badly, and how I use them effectively.

## What They're Great At

### 1. Boilerplate Generation

This is the killer feature. AI is excellent at writing code you already know how to write but don't want to type.

"Create a React component that takes a user object and displays their profile card with avatar, name, and bio."

```tsx
interface User {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string;
}

function ProfileCard({ user }: { user: User }) {
  return (
    <div className="profile-card">
      <img 
        src={user.avatarUrl} 
        alt={`${user.name}'s avatar`}
        className="profile-avatar"
      />
      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-bio">{user.bio}</p>
    </div>
  );
}
```

That took 2 seconds instead of 30. Multiply by hundreds of similar tasks daily.

### 2. API Documentation Lookup

"How do I use the Intersection Observer API to detect when an element enters the viewport?"

AI gives you a working example immediately. No searching MDN, no piecing together Stack Overflow answers.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Stop observing after first intersection
    }
  });
}, {
  threshold: 0.1, // Trigger when 10% visible
  rootMargin: '50px' // Start 50px before entering viewport
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
  observer.observe(el);
});
```

I use this constantly. Faster than documentation for common APIs.

### 3. Regex and One-Liners

Regex is a weakness for many developers (including me). AI makes it trivial:

"Write a regex that matches US phone numbers in formats: (555) 123-4567, 555-123-4567, 5551234567"

```javascript
const phoneRegex = /^(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}$/;
```

Same for complex array transformations, date formatting, string manipulation. AI gets these right ~90% of the time, and it's easy to verify.

### 4. Test Generation

"Write tests for this function:"

```typescript
function calculateDiscount(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  return price * (1 - discountPercent / 100);
}
```

AI output:
```typescript
describe('calculateDiscount', () => {
  it('calculates correct discount', () => {
    expect(calculateDiscount(100, 20)).toBe(80);
    expect(calculateDiscount(50, 10)).toBe(45);
  });

  it('handles 0% discount', () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it('handles 100% discount', () => {
    expect(calculateDiscount(100, 100)).toBe(0);
  });

  it('throws for negative discount', () => {
    expect(() => calculateDiscount(100, -5)).toThrow();
  });

  it('throws for discount over 100', () => {
    expect(() => calculateDiscount(100, 105)).toThrow();
  });
});
```

Test generation is tedious. AI handles the tedium while I think about edge cases it might miss.

### 5. Code Explanation

"Explain what this code does" is genuinely useful for:
- Unfamiliar codebases
- Dense algorithms
- Regex you didn't write
- Code in languages you don't know

I often paste legacy code and ask AI to explain it before I modify it.

### 6. Refactoring Suggestions

"Refactor this to use async/await instead of callbacks."
"Convert this to use React hooks instead of class components."
"Simplify this nested conditional."

AI handles mechanical refactoring well. It sees patterns and applies transformations consistently.

## Where They Fail Badly

### 1. Complex Architecture Decisions

"Should I use a microservices or monolith architecture for my startup?"

AI will give you a reasonable-sounding answer that might be completely wrong for your situation. Architecture depends on context AI doesn't have: team size, deployment constraints, existing infrastructure, growth trajectory.

**My rule:** AI for tactics, humans for strategy.

### 2. Debugging Complex Issues

"My React app re-renders infinitely when I add this useEffect."

AI will guess. Sometimes correctly. Often wrong. It can't run your code, see your state, examine your network requests.

For debugging, AI helps when you can give it complete context. For "my app does weird thing X," you're usually better off with debugger and console.log.

### 3. Up-to-Date Information

AI training has a cutoff. It might suggest deprecated APIs, old syntax, libraries that have changed significantly.

I've gotten suggestions for:
- React class components when hooks are preferred
- Moment.js when date-fns is standard
- Old Next.js Pages Router patterns when App Router is current

**Always verify** that AI suggestions match current best practices.

### 4. Security-Sensitive Code

"Write a function to hash passwords."

AI will produce something that looks right but might have subtle vulnerabilities. Crypto code, authentication flows, input sanitization—these need expert review, not AI generation.

Use AI to draft, then have it reviewed by someone who understands the security implications.

### 5. Code That's Correct but Wrong

This is insidious. AI can write syntactically correct code that doesn't match your requirements:

You: "Fetch users and display them sorted by name"
AI: Sorts by `user.name` alphabetically
You wanted: Sort by last name first

AI completes patterns. It doesn't understand your domain unless you tell it explicitly.

## How I Actually Use AI

### Copilot in Editor

I keep Copilot on but with a critical eye. Accept useful completions, ignore bad ones. Tab is your friend, but so is Escape.

The biggest productivity gain: writing test files. Start typing a test name, Copilot often writes the entire test correctly because it can see the code being tested.

### Claude/GPT for Complex Tasks

For anything beyond autocomplete, I switch to a chat interface:

- "Here's my schema. Write CRUD operations for the User table."
- "Here's a component. Add comprehensive tests."
- "Here's an error message and stack trace. What's likely wrong?"

Context matters. More context = better output.

### The Prompt Engineering That Works

I don't do elaborate prompt engineering. But these patterns help:

**Be specific:**
- ❌ "Write a function to process data"
- ✅ "Write a TypeScript function that takes an array of products with price and quantity, returns the total value, and handles empty arrays by returning 0"

**Provide examples:**
- "Like this existing function: [paste example]"
- "The output should look like: [paste example]"

**Specify constraints:**
- "Use React hooks, not class components"
- "Don't use any external libraries"
- "Make it compatible with Node 18"

### Review Everything

I treat AI output like a junior developer's first draft. Usually close, needs review, occasionally wrong.

- Run the code
- Read it carefully
- Check edge cases
- Verify it matches requirements

This sounds obvious, but I've seen production bugs from blindly accepting AI suggestions.

## The Productivity Reality

AI assistants have genuinely increased my productivity. Not 10x. Maybe 1.3x? For certain tasks, much higher.

The distribution is uneven:
- Boilerplate: 5x faster
- Learning new APIs: 3x faster
- Tests: 2x faster
- Complex logic: 0.8x (AI suggestions often wrong, cost time)
- Architecture: 1x (AI not helpful)

The net effect is significant. But "AI will replace programmers" is wrong. AI automates typing, not thinking. The thinking is the hard part, and it's still on us.

## My Setup

- **GitHub Copilot** in VS Code for autocomplete
- **Claude** for longer conversations (better than GPT-4 for code, IMO)
- **Local models** for sensitive code (Ollama + CodeLlama)

Total cost: ~$30/month. Worth it.

---

*The best use of AI is understanding what it's good at and staying out of the way. The worst is trusting it blindly or dismissing it entirely.*
