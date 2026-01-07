# Use Supabase (BaaS) for Backend

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a backend to store relational data (Sessions, Speakers, Reviews) and handle user authentication. The project constraints explicitly ban "complex microservices" and require a **$0/month** running cost. We need a solution that provides a database and authentication with minimal operational overhead.

**Decision Drivers:**
*   **Constraint:** $0/month infrastructure cost.
*   **Constraint:** "Simplicity" - Avoid managing Linux servers or Docker containers manually.
*   **Requirement:** Relational data model (Many-to-Many relationship between Speakers and Sessions).
*   **Requirement:** Secure Authentication for Organizers.
*   **Requirement:** Object Storage for Profile Photos (with security rules).

## Considered Options

*   **Supabase**
*   **Firebase**
*   **Custom Node.js + PostgreSQL on a VP S**
*   **SQLite (embedded)**

## Decision Outcome

**Chosen Option:** "Supabase"

**Justification:**
Supabase offers a "Backend-as-a-Service" experience built on top of standard PostgreSQL. It meets the relational data requirement and offers a generous free tier that fits our cost constraint. It provides **Database, Authentication, AND Object Storage** in a single package. Crucially, it allows us to secure file access using the same **Row Level Security (RLS)** policies as the database, avoiding the need for complex synchronisation with external storage providers like AWS S3.

### Consequences

*   **Positive:** immediate access to a production-grade PostgreSQL database.
*   **Positive:** Built-in Authentication (Email/Password, Magic Link) cuts dev time.
*   **Positive:** No server maintenance.
*   **Negative:** heavy reliance on a third-party service (Vendor Lock-in).
*   **Risks:** Usage limits on the free tier (though high enough for MVP).

## Pros and Cons of the Options

### Supabase

*   Good, because it is open-source based (PostgreSQL).
*   Good, because it handles Auth and Realtime out of the box.
*   Good, because it has an excellent TypeScript client.
*   Bad, because "Row Level Security" (RLS) policies can be complex to debug.

### Firebase

*   Good, because it is extremely mature and reliable.
*   Bad, because it is NoSQL (Firestore), making relational queries (Joins for Reviews/Speakers) difficult.
*   Bad, because it is proprietary technology.

### Custom Node.js + PostgreSQL

*   Good, because it offers total control.
*   Bad, because it requires hosting execution (Heroku/DigitalOcean) which usually costs money or adds DevOps complexity.
*   Bad, because we have to build Auth from scratch.

### SQLite

*   Good, because it is simple and local.
*   Bad, because it is not suitable for serverless environments (Vercel) where the filesystem is ephemeral.

## Links

*   [Supabase](https://supabase.com/)
*   [Inception Step 2: Trade-offs](../inception/2-tradeoffs.md)
