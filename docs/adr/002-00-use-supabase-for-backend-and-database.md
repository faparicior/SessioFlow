# 002-00-Use Supabase for Backend and Database

* **Status:** ⚠️ **SUPERSEDED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Superseded By:** ADR-002-01 (Use Supabase Amendment: DDD Abstraction Layer)
* **Amended By:** ADR-002-01, ADR-002-02, ADR-002-03

## Context and Problem Statement

SessioFlow requires a backend solution to manage:

1. **User Authentication**: Secure login for organizers (Fernando) and speakers (Andrea)
2. **Data Storage**: Events, proposals, speaker profiles, and session scheduling data
3. **File Storage**: Profile photos and potentially session attachments
4. **Row-Level Security**: GDPR compliance for speaker data protection

The MVP Canvas explicitly identifies "Technical Enablers" including database schema, authentication system, and image storage. The Trade-offs document ranks Cost #2 and Security #5, with the hard constraint of "$0/month infrastructure" for the MVP.

**Decision Drivers:**
- Must support $0/month hosting for MVP (Product Goal #3: "Enable 80% of users to run on free-tier infrastructure")
- Must provide built-in authentication to reduce development time
- Must support file storage for speaker profile photos (MVP Wave 1 feature)
- Must implement Row-Level Security (RLS) for GDPR compliance (MVP Canvas risk mitigation)
- Database must support relational data model (events, proposals, speakers, sessions)
- Self-hosting capability for organizers who prefer full control

## Considered Options

1. **Supabase (PostgreSQL + Auth + Storage + RLS)**
2. **Firebase (Firestore + Auth + Storage)**
3. **Self-hosted PostgreSQL + Custom Auth API**
4. **PlanetScale + Auth0 + Cloud Storage**

## Decision Outcome (Historical)

**Original Decision (2026-06-05):** "Supabase (PostgreSQL + Auth + Storage + RLS)"

**⚠️ NOTE:** This decision has been **amended** by ADR-002-01. The original analysis contained errors:
- Auth0 pricing was incorrect (stated 7K MAU, actual 25K MAU free tier)
- Vendor lock-in risk was overstated (DDD reduces migration cost by 85%)
- Hybrid approach was dismissed prematurely (now viable with DDD)

**See ADR-002-01 for updated decision and analysis.**

---

## Original Justification (Historical Context)
Supabase is the optimal choice because it uniquely satisfies all critical constraints:

1. **Cost Compliance**: Free tier includes 500MB database, 1GB file storage, and 50,000 monthly active users—sufficient for MVP validation metrics (5 events, 50+ proposals)
2. **Feature Completeness**: Provides authentication, database, storage, and RLS in a single platform, eliminating the need to integrate multiple services
3. **GDPR Mitigation**: Built-in Row-Level Security enables data protection policies required for speaker privacy (addresses MVP Canvas risk)
4. **Developer Experience**: PostgreSQL familiarity with simple JavaScript client reduces learning curve
5. **Self-Hosting Path**: Supabase can be self-hosted via Docker if organizations require full data control, aligning with "Is Simple to self-host" product attribute

### Consequences

* **Positive:**
  - Rapid development: Auth and Storage ready in hours, not days
  - PostgreSQL provides familiar SQL querying and migration tools
  - Real-time subscriptions available for future features (live updates)
  - Strong community and documentation reduce troubleshooting time
  - Free tier generous enough for MVP validation without cost concerns

* **Negative:**
  - Vendor lock-in: Migration away from Supabase requires significant refactoring
  - Limited customization of authentication flows compared to self-hosted solutions
  - File storage is tied to Supabase ecosystem, not portable
  - Free tier has rate limits that may impact high-traffic events

* **Risks:**
  - Supabase is still evolving; breaking changes in API may require updates
  - Self-hosting Supabase is complex and may exceed volunteer DevOps capabilities
  - Data residency concerns for international events (GDPR data location requirements)

### Pros and Cons of the Options

#### Option 1: Supabase (PostgreSQL + Auth + Storage + RLS)

* Good, because it provides a complete backend-as-a-service with PostgreSQL, eliminating the need for multiple services
* Good, because Row-Level Security (RLS) is built into the database, enabling GDPR compliance with minimal code
* Good, because the free tier is generous enough for MVP validation (50K users, 500MB DB, 1GB storage)
* Good, because self-hosting is possible via Docker Compose for organizations requiring full control
* Bad, because vendor lock-in makes migration to another provider costly
* Bad, because custom authentication logic is limited compared to building from scratch

#### Option 2: Firebase (Firestore + Auth + Storage)

* Good, because Google's infrastructure provides excellent reliability and global CDN
* Good, because authentication supports numerous providers out of the box
* Bad, because Firestore is a NoSQL database, which complicates relational queries needed for event-proposal-speaker relationships
* Bad, because free tier limits are stricter than Supabase (1GB storage, 50K reads/day)
* Bad, because GDPR compliance requires additional configuration and may incur costs for data residency

#### Option 3: Self-hosted PostgreSQL + Custom Auth API

* Good, because it provides complete control over data and infrastructure
* Good, because no vendor lock-in; can be deployed on any VPS
* Bad, because it requires significant development time to build authentication, file handling, and security from scratch
* Bad, because self-hosting increases operational complexity (backups, updates, monitoring)
* Bad, because it conflicts with the 6-week MVP timeline and $0/month budget (VPS costs $5-10/month minimum)

#### Option 4: PlanetScale + Auth0 + Cloud Storage

* Good, because PlanetScale offers excellent MySQL scalability and branching features
* Good, because Auth0 provides enterprise-grade authentication with extensive customization
* Bad, because combining three services increases cost quickly (Auth0 free tier: 7,000 users, but paid tiers start at $23/month)
* Bad, because integrating multiple services adds architectural complexity
* Bad, because it exceeds the $0/month infrastructure constraint for MVP

## Links

* [Supabase Documentation](https://supabase.com/docs)
* [MVP Canvas - Technical Enablers](../inception/8-mvp-canvas-definition.md#6-technical--ux-enablers)
* [Trade-offs - Cost Constraint](../inception/2-tradeoffs.md#2-final-consensus-trade-off-board)
* [Persona: Andrea - Profile Photo Need](../inception/3-personas.md)
