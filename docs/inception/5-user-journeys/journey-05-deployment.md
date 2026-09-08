# 🗺️ Journey 5: Deployment

**Persona:** [Fernando (Volunteer Organizer)](../3-personas/01-fernando-organizer.md)  
**Main Goal:** Deploy and run SessioFlow on standard infrastructure without requiring a dedicated DevOps team.

> **Context note:** Zero-friction self-hosting experience using Docker Compose and environment template variables.

---

## Overview Visualization

```
[Fernando (Volunteer)]             [Local Machine / Server]               [SessioFlow Containers]
          │                                   │                                     │
          │── [Clone Repository] ───────────> │ Stage 1: Repository Setup           │
          │                                   │  · Downloads source code            │
          │                                   │                                     │
          │── [Configure .env File] ────────> │ Stage 2: Environment Config         │
          │                                   │  · Configures Auth & DB credentials │
          │                                   │                                     │
          │── [docker-compose up -d] ───────> │ Stage 3: Container Orchestration    │
          │                                   │  · Launches App & Postgres ────────>│ [SessioFlow Running]
```

---

## Lifecycle Overview

| Stage | Trigger | Persona's Action | System Response |
| :--- | :--- | :--- | :--- |
| **1. Acquisition** | Fernando decides to self-host | Clones GitHub repo or downloads release archive | Codebase available locally |
| **2. Configuration** | Fernando reviews `.env.example` | Copies `.env.example` to `.env` and sets secrets | Environment variables configured |
| **3. Execution** | Fernando runs terminal command | Executes `docker-compose up -d` | Spins up containers and runs database migrations automatically |

---

## Stage 1: Repository Setup

**Trigger:** Fernando downloads the application code to deploy.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | `git clone` or zip download | Code Acquisition | Source code directory on deployment server |

**Pain points addressed:**  
- ❌ **Pain 3:** New volunteers must learn complex tools to manage infrastructure.

**Gap:** 1-click cloud provider deploy button (Vercel/Render) deferred to Wave 2.

---

## Stage 2: Environment Configuration

**Trigger:** Fernando sets up runtime credentials.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | `cp .env.example .env` | Configuration Setup | Draft `.env` configuration file |
| 2 | Set `DATABASE_URL` & Auth keys | Config Customization | Validated runtime configuration |

**Pain points addressed:**  
- ✅ **Need 3:** Simple setup that doesn't require DevOps background.

**Gap:** Interactive CLI configuration wizard deferred to Wave 3.

---

## Stage 3: Container Orchestration

**Trigger:** Fernando launches the deployment containers.

| Step | Event / Action | Use Case | Output |
| :--- | :--- | :--- | :--- |
| 1 | `docker-compose up -d` | Deploy with Standard Tools | Docker containers initialized in background |
| 2 | Automated DB Migration Check | Database Bootstrap | Drizzle ORM migrations execute automatically |
| 3 | Access localhost / server IP | Platform Online | SessioFlow application accessible in browser |

**Pain points addressed:**  
- ❌ **Pain 2:** Eliminates manual database setup and configuration errors.

**Gap:** Built-in SSL cert auto-renewal (Caddy integration) deferred to Wave 2.

---

## Critical Path

**Minimum Happy Path:**

| # | Step | Stage |
| :--- | :--- | :--- |
| 1 | Clone Codebase | Stage 1 |
| 2 | Populate `.env` File | Stage 2 |
| 3 | Run `docker-compose up -d` | Stage 3 |

**Related journeys:**
- [Journey 1: Setup the Conference](./journey-01-setup-conference.md)

---

**Next Step:** In Step 7, we will sequence these features into the MVP Canvas to define the specific releases.
