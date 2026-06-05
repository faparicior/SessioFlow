# 001-use-nextjs-as-frontend-framework

* **Status:** Proposed
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a web application framework to deliver a user-friendly interface for two distinct personas:

- **Fernando (Organizer)**: Needs an intuitive dashboard to manage events, review submissions, and create schedules with minimal training
- **Andrea (Speaker)**: Needs a mobile-accessible, simple interface to submit proposals and access event information

The product vision explicitly states the application must be "simple to use" (Usability ranked #1 in trade-offs) and "easy to self-host" (Simplicity ranked #3). Additionally, the MVP must be achievable within 6 weeks by a 2-developer team while respecting the $0/month infrastructure constraint.

**Decision Drivers:**
- Usability is the highest priority trade-off (must achieve 4/5 ease-of-use rating)
- Infrastructure cost must be $0/month for MVP
- Development team has intermediate skill level with modern JavaScript frameworks
- Application must support both public-facing pages (CfP forms) and authenticated dashboards
- Self-hosting capability is a core product requirement
- Performance: Target <3ms page load for smooth user experience

## Considered Options

1. **Next.js (App Router)**
2. **Remix**
3. **Vite + React (Client-Side Rendering)**
4. **Django Templates (Server-Side Rendering with Python)**

## Decision Outcome

**Chosen Option:** "Next.js (App Router)"

**Justification:**
Next.js is the only option that simultaneously satisfies all critical constraints:

1. **Cost Alignment**: Next.js can be deployed to Vercel's free tier for MVP, or self-hosted on any VPS at $0-5/month, respecting the $0/month infrastructure constraint
2. **Usability**: Built-in routing, API routes, and server components enable fast, SEO-friendly public pages (essential for Andrea's CfP experience)
3. **Simplicity**: Single framework for frontend, routing, and API eliminates architectural complexity, supporting the "Is Not requiring specialized infrastructure" constraint
4. **Team Capability**: Next.js has the largest ecosystem and documentation, reducing learning curve for intermediate developers
5. **MVP Timeline**: Pre-built components (NextAuth, Tailwind integration) accelerate the 6-week development schedule

### Consequences

* **Positive:**
  - Unified framework reduces context switching between frontend/backend technologies
  - Excellent developer experience with hot reloading and TypeScript support
  - Built-in image optimization supports Andrea's need for profile photos
  - Vercel deployment provides zero-config HTTPS and CDN for free tier
  - Strong community support reduces troubleshooting time

* **Negative:**
  - Next.js App Router is relatively new, with some breaking changes in recent versions
  - Server components add complexity for developers unfamiliar with React Server Components
  - Build times can be slower than Vite for large applications
  - Vendor lock-in risk if heavily relying on Vercel-specific features

* **Risks:**
  - Rapid evolution of Next.js may require frequent updates and migration efforts
  - Self-hosting Next.js requires Node.js runtime (not just static files)
  - Server-side rendering increases memory usage compared to static sites

### Pros and Cons of the Options

#### Option 1: Next.js (App Router)

* Good, because it provides full-stack capabilities in a single framework, reducing architectural complexity
* Good, because it supports both static generation (for public CfP pages) and server-side rendering (for authenticated dashboards)
* Good, because the ecosystem includes mature solutions for authentication (NextAuth.js), forms, and UI components
* Bad, because the App Router paradigm shift from Pages Router creates a steeper learning curve for teams familiar with older patterns
* Bad, because server components require careful consideration of data fetching patterns

#### Option 2: Remix

* Good, because it has excellent data loading and mutation patterns built into the framework
* Good, because it focuses on web standards and progressive enhancement
* Bad, because smaller ecosystem compared to Next.js means fewer pre-built components
* Bad, because self-hosting requires more manual configuration than Next.js
* Bad, because less documentation and community support for troubleshooting

#### Option 3: Vite + React (Client-Side Rendering)

* Good, because it has the fastest build times and development experience
* Good, because it produces purely static assets that are trivial to self-host
* Bad, because requires additional framework (React Router) for routing logic
* Bad, because SEO suffers without server-side rendering, impacting public CfP page discoverability
* Bad, because API routes require a separate backend service, increasing architectural complexity

#### Option 4: Django Templates

* Good, because it provides a mature, batteries-included framework with built-in admin interface
* Good, because Python may be more familiar to volunteers with non-JavaScript backgrounds
* Bad, because it requires Python expertise which may not align with team skills
* Bad, because the monolithic architecture makes it harder to scale or extract services later
* Bad, because frontend modernization (interactivity, real-time updates) requires additional JavaScript frameworks

## Links

* [Next.js Documentation](https://nextjs.org/docs)
* [Product Vision & Boundaries](../inception/1-product-vision-and-boundaries.md) - Defines "Web Application" as product type
* [Trade-offs Analysis](../inception/2-tradeoffs.md) - Usability ranked #1, Cost ranked #2
* [MVP Canvas](../inception/8-mvp-canvas-definition.md) - Technical enablers section references Next.js + Tailwind
