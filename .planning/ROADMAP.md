# Roadmap: crativo.xyz

## Overview

Deliver an immersive portfolio site in four phases: establish the Remotion-powered landing experience first (the "wow" moment), then build out the project showcase and detail pages (the core content), add supporting pages (about/contact), and finish with cross-cutting polish and performance optimization. Placeholder content throughout; real projects added post-launch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Landing Experience** - Remotion intro animation and project scaffold
- [ ] **Phase 2: Project Portfolio** - Showcase grid, filtering, and individual project pages
- [ ] **Phase 3: About & Contact** - Bio, skills, timeline, and contact options
- [ ] **Phase 4: Polish & Performance** - Responsive design, animations, SEO, and optimization

## Phase Details

### Phase 1: Landing Experience
**Goal**: Visitors are immediately captivated by a full-screen animated intro that smoothly reveals the portfolio
**Depends on**: Nothing (first phase)
**Requirements**: LAND-01, LAND-02
**Success Criteria** (what must be TRUE):
  1. Visitor sees a full-screen Remotion animation on page load (no layout shift, no flash of unstyled content)
  2. Animation transitions smoothly into the main portfolio view without jarring cuts or reloads
  3. Site runs locally in dev mode with hot reload and builds to static output
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md -- Project scaffold (Next.js 15 + Tailwind + Remotion)
- [ ] 01-02-PLAN.md -- Remotion intro animation and transition to portfolio

### Phase 2: Project Portfolio
**Goal**: Visitors can browse curated projects, filter by category, and dive into rich detail pages
**Depends on**: Phase 1
**Requirements**: SHOW-01, SHOW-02, SHOW-03, SHOW-04, SHOW-05, PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, PROJ-07
**Success Criteria** (what must be TRUE):
  1. Main page displays a grid of 10-20 project cards with preview image, title, and tech stack
  2. Visitor can filter the grid by category and see results update immediately
  3. Hovering a project card triggers a smooth animation/transition effect
  4. Clicking a project card navigates to a dedicated page showing hero image, description, tech stack, links, metrics, gallery, and code snippets
  5. Project pages use placeholder data that demonstrates the layout and interactions
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: About & Contact
**Goal**: Visitors understand who built these projects and can easily get in touch
**Depends on**: Phase 1
**Requirements**: ABUT-01, ABUT-02, ABUT-03, ABUT-04, CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. About section shows bio, skills/expertise, profile photo, and a career timeline
  2. Contact section displays email and social links (GitHub, LinkedIn) that open correctly
  3. Contact form submits a message (or displays confirmation with placeholder integration)
  4. Calendar/scheduling link is present and functional for booking conversations
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Polish & Performance
**Goal**: The site feels premium on every device -- fast, smooth, and discoverable by search engines
**Depends on**: Phase 2, Phase 3
**Requirements**: TECH-01, TECH-02, TECH-03, TECH-04, TECH-05, POLH-01, POLH-02, POLH-03
**Success Criteria** (what must be TRUE):
  1. Site displays correctly and looks intentional on mobile, tablet, and desktop viewports
  2. Initial page load completes in under 3 seconds on a throttled connection
  3. Scroll-based animations and custom cursor effects are visible throughout the site
  4. All animations run at 60fps without jank on modern devices
  5. Page source includes proper meta tags, Open Graph tags, and a sitemap exists at /sitemap.xml
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4
(Note: Phase 2 and 3 could run in parallel since both depend only on Phase 1)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Landing Experience | 0/2 | Planned | - |
| 2. Project Portfolio | 0/TBD | Not started | - |
| 3. About & Contact | 0/TBD | Not started | - |
| 4. Polish & Performance | 0/TBD | Not started | - |
