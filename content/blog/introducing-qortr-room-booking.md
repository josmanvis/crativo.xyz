---
title: "Introducing Qortr: The Modern Room Booking Platform I Built"
excerpt: "I built Qortr to solve the frustrating experience of booking meeting rooms and coworking spaces. Here's why it exists and how it works."
category: projects
publishedAt: 2025-01-20
tags:
  - Qortr
  - SaaS
  - Room Booking
  - Next.js
  - Product Launch
coverImage: /blog/introducing-qortr.svg
featured: true
seo:
  title: "Qortr - Modern Room Booking Platform | Built by Jose Viscasillas"
  description: "Qortr is a modern room booking platform for coworking spaces, meeting rooms, and creative studios. Learn why I built it and how it works."
  keywords: ["Qortr", "room booking software", "coworking space booking", "meeting room booking", "space rental platform", "venue booking system"]
---

# Introducing Qortr: The Modern Room Booking Platform I Built

Every time I tried to book a meeting room at a coworking space, the experience was... painful. Clunky interfaces. Outdated calendars. Confusing pricing. Phone calls to confirm availability.

So I built [Qortr](https://qortr.com).

![Qortr Homepage](/blog/qortr/homepage.jpg)
*The Qortr homepage - clean, modern, and focused on simplicity*

## The Problem

Booking a room should be as easy as booking a restaurant table. But most room booking systems are:

- **Outdated**: Built in the early 2010s and never updated
- **Complicated**: Require training to use basic features
- **Expensive**: Enterprise pricing for simple needs
- **Ugly**: Interfaces that feel like using Windows XP

Coworking spaces, creative studios, and meeting venues deserve better.

## What Qortr Does

Qortr is a modern room booking platform built for:

- **Coworking Spaces** managing hot desks, private offices, and meeting rooms
- **Creative Studios** renting podcast rooms, photo studios, and event spaces
- **Corporate Offices** with internal meeting room booking
- **Venues** offering hourly or daily space rentals

### For Space Owners

**Unlimited Spaces & Rooms**: Add as many locations and rooms as you need. No per-room pricing.

**Interactive Floor Plans**: Upload floor plans and let users see exactly where each room is located.

**Flexible Pricing**: Set hourly, half-day, or full-day rates. Add custom pricing for different times.

**Real-Time Availability**: No more double bookings. Availability updates instantly.

**Booking Management**: View all bookings, approve pending requests, manage cancellations.

### For Bookers

**Browse & Filter**: Find rooms by location, capacity, amenities, or availability.

**Instant Booking**: Book available rooms immediately. No phone calls.

**Calendar Integration**: Export bookings to Google Calendar, Outlook, or any iCal-compatible app.

**Booking History**: View past and upcoming bookings in one place.

## The Tech Stack

I built Qortr with modern, proven technologies:

```
Framework:      Next.js 15 (App Router)
Language:       TypeScript
Database:       PostgreSQL + Prisma
Auth:           Auth.js (NextAuth v5)
Styling:        Tailwind CSS
Components:     shadcn/ui
Deployment:     Vercel
Payments:       Stripe (coming soon)
```

### Why These Choices?

**Next.js 15**: Server components for fast initial loads. App Router for clean routing. API routes built-in.

**PostgreSQL + Prisma**: Relational data (users → organizations → locations → rooms → bookings) fits perfectly. Prisma gives us type-safe queries.

**Tailwind + shadcn/ui**: Rapid development without sacrificing quality. Every component is accessible and customizable.

**Vercel**: Zero-config deployment. Automatic previews for every PR. Edge functions where needed.

## Key Features Deep Dive

### Multi-Tenant Architecture

Qortr supports multiple organizations from day one. Each organization can have:

- Multiple locations (buildings, addresses)
- Multiple rooms per location
- Custom branding (colors, logo)
- Their own team members with different roles
- Separate booking settings and pricing

### Real-Time Availability

No more "let me check and get back to you."

```typescript
// Availability is calculated in real-time
const availability = await getAvailability({
  roomId: 'room-123',
  date: new Date('2025-01-25'),
  startTime: '09:00',
  endTime: '17:00',
});

// Returns available time slots with pricing
[
  { start: '09:00', end: '12:00', available: true, price: 75 },
  { start: '12:00', end: '13:00', available: false }, // Already booked
  { start: '13:00', end: '17:00', available: true, price: 100 },
]
```

### Calendar Subscriptions

Users can subscribe to room calendars via iCal. Bookings appear in their calendar app automatically and stay synced.

Space owners can subscribe to all their rooms' calendars to see everything in one view.

### Interactive Floor Plans (Coming Soon)

Upload a floor plan image. Click to place rooms. Users can visually navigate your space.

This feature is in development and will launch Q1 2025.

## The Business Model

Qortr follows a simple SaaS model:

| Plan | Price | Features |
|------|-------|----------|
| **Starter** | Free | 1 location, 5 rooms, basic booking |
| **Pro** | $29/mo | Unlimited locations & rooms, custom branding |
| **Business** | $99/mo | API access, analytics, priority support |
| **Enterprise** | Custom | SSO, SLA, dedicated support |

We're launching with generous free tiers to build trust. Paid plans are coming.

## Why I Built This

I've booked hundreds of meeting rooms and coworking spaces over 21 years of working in tech. The experience has barely improved since 2010.

Most booking systems are:

1. **Built for enterprise sales, not users**: They demo well but are painful to actually use.
2. **Priced per room**: Discouraging owners from adding all their spaces.
3. **Designed by people who don't book rooms**: They don't feel the pain.

Qortr is the room booking tool I wanted to exist.

## What's Next

The roadmap for Q1 2025:

- ✅ Core booking functionality
- ✅ Organization & team management
- ✅ Calendar integration
- 🔄 Stripe payments integration
- 🔄 Interactive floor plans
- 📋 Mobile app (React Native)
- 📋 API for third-party integrations
- 📋 Analytics dashboard

## Try It

Qortr is live at [qortr.com](https://qortr.com).

**For space owners**: Sign up and add your first location in under 5 minutes.

**For bookers**: Browse available spaces and book instantly.

No credit card required. No sales calls. Just start using it.

---

**Qortr: Simple Space Booking**

[Visit Qortr →](https://qortr.com)

---

*Built with ❤️ by [Jose Viscasillas](https://crativo.xyz). Questions? [Contact me](/contact).*
