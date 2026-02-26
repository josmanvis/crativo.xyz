---
title: "My Infrastructure Costs $5/Month (And Yours Is $500 for the Same Traffic)"
excerpt: "How to run a real production app on pocket change. The art of not over-engineering your stack when you're small."
category: tutorials
publishedAt: 2026-02-26
tags:
  - infrastructure
  - cost-optimization
  - hosting
  - startup
coverImage: /blog/five-dollar-infrastructure.svg
featured: true
seo:
  title: "Run Production Apps for $5/Month: Infrastructure on a Budget"
  description: "How I run real production applications for $5/month. No, seriously. Here's the stack that makes it possible."
  keywords: ["cheap hosting", "infrastructure costs", "startup infrastructure", "serverless pricing", "hobby projects"]
---

# My Infrastructure Costs $5/Month (And Yours Is $500 for the Same Traffic)

I was reviewing my infrastructure costs last month and realized something: I'm running three production applications, handling ~50k requests per month, for $5. Total.

Meanwhile, I see indie hackers posting their AWS bills: $200, $500, sometimes $1000+ for similar traffic. Same order of magnitude of users. Twenty times the cost.

The difference isn't scale. It's choices.

## The Stack That Costs $5

Here's the breakdown:

**Hosting: Vercel (Free tier)**
- Static site generation
- Serverless functions for API routes
- Automatic HTTPS
- Global CDN

**Database: Turso (Free tier)**
- 9GB storage
- Billions of reads per month
- Edge replication built-in

**Auth: Clerk (Free tier)**
- 5,000 MAU
- Social logins
- MFA support

**File Storage: Cloudflare R2 ($0.20/GB after free tier)**
- S3-compatible
- No egress fees
- Currently free for my usage

**Email: Resend (Free tier)**
- 3,000 emails/month
- Perfect for transactional email

**Total: $0-5/month**

I pay for a domain ($12/year) and that's it. The $5 is for R2 storage when I occasionally go over the free tier.

## How Your Bill Got to $500

Let me guess your stack:

- **AWS EC2 or ECS**: $20-100/month for instances you don't fully utilize
- **RDS**: $15-50/month for a database that's idle 99% of the time
- **Elasticache**: $15-30/month because you heard Redis is fast
- **Load Balancer**: $20/month because the blog post said you need one
- **CloudFront**: $10-50/month for CDN
- **S3**: $5-20/month for storage plus egress fees
- **Various AWS services**: $50/month for things you forgot you enabled

The cloud providers love this. They've convinced us that "enterprise architecture" is necessary from day one. It isn't.

## The Principles of Cheap Infrastructure

**1. Free tiers are generous now**

The free tier war between Vercel, Netlify, Cloudflare, and others has created incredible opportunities. Each service's free tier used to be a demo. Now it's a legitimate production option.

If you're paying for hosting at small scale, you're doing it wrong.

**2. Serverless scales to zero**

Traditional servers cost money whether they're used or not. Serverless costs nothing when idle.

At 50k requests/month, serverless is essentially free. At 500k requests/month, it's still cheaper than a VPS in many cases.

**3. SQLite everywhere**

I wrote about this before, but it bears repeating: SQLite is free. Postgres is not. Turso/libsql gives you SQLite with replication for free.

Use SQLite until you have a specific reason not to.

**4. Avoid AWS**

AWS is optimized for enterprise. Enterprise pays for convenience and doesn't optimize for cost. AWS pricing reflects this.

For indie hackers and small apps, specialized services (Vercel, Turso, Clerk) offer better free tiers and simpler pricing.

**5. Question every service**

Before adding a service, ask:
- Is this solving a real problem I have?
- Can I solve this with what I already have?
- Is the free tier generous enough?

Most services are nice-to-haves that become $20/month line items.

## What You're Paying for That I'm Not

**Kubernetes**: You don't need it. You have one container. Use a PaaS.

**Redis caching**: Do you actually need it? SQLite with proper indexes is fast. The database isn't your bottleneck yet.

**Load balancing**: Your traffic doesn't require it. Vercel/Netlify handle this automatically.

**Multiple environments**: Do you actually need staging, dev, and prod? For an indie app, prod and a local dev environment is often enough.

**Monitoring suite**: $50/month for Datadog is overkill when Vercel analytics and simple logging work fine.

## When to Actually Spend Money

I'm not advocating for being cheap forever. Spend when it makes sense:

**When you hit free tier limits**: If you're hitting 100k MAU, the Clerk free tier won't cut it. Pay for what you use.

**When it saves time**: If a $20/month service saves you 5 hours of maintenance, it's worth it.

**When reliability matters**: Free tiers have softer SLAs. If downtime costs you money, pay for reliability.

**When you need enterprise features**: SOC2, SSO, custom domains—these cost money.

The key is paying for value, not paying because you think you're supposed to.

## The Stack I Recommend

For a new project today:

- **Frontend**: Vercel or Cloudflare Pages (free)
- **Backend**: Vercel Functions or Cloudflare Workers (free)
- **Database**: Turso (free) or Planetscale (generous free tier)
- **Auth**: Clerk (free) or NextAuth (free, self-hosted)
- **Files**: Cloudflare R2 (free tier, no egress)
- **Email**: Resend (free) or Postmark (cheap)
- **Monitoring**: Built-in platform analytics

This stack handles 10k-100k users without paying a dime. When you outgrow it, you'll have revenue to justify the cost.

## The Mental Shift

Stop thinking about infrastructure as an investment. It's a cost to minimize.

Every dollar you spend on AWS is a dollar not spent on:
- Marketing
- Product development
- Your salary

Infrastructure doesn't create value. It enables value creation. Minimize it.

---

*Spending $500/month on infrastructure for 1000 users? I'd love to see your itemized bill. We can probably cut it by 80%.*