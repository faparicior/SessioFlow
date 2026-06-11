# 002b-Authentication Strategy and Vendor Abstraction

* **Status:** Under Discussion
* **Date:** 2026-06-11
* **Decision Makers:** Product Team, Technical Lead
* **Related:** ADR-002 (Supabase Backend), ADR-002a (Supabase Vendor Lock-in Alternatives), **ADR-009 (Domain-Driven Design Structure)**
* **Amended By:** N/A

---

## Context and Problem Statement

Following ADR-002a's analysis of Supabase vendor lock-in risks and **ADR-009's adoption of Domain-Driven Design (DDD)**, this ADR addresses the **authentication layer strategy**. The core question is:

> **How do we implement authentication in a way that balances development speed with vendor independence, while aligning with our DDD architecture?**

Key concerns:
1. **Auth0**: Enterprise-grade but introduces auth-specific vendor lock-in
2. **Self-hosted (NextAuth/Lucia)**: Full control but requires 4-6 weeks development
3. **Supabase Auth**: Fast but tightly coupled to Supabase ecosystem
4. **Migration Cost**: If we choose a vendor, how expensive is it to switch later?
5. **DDD Alignment**: How does this fit with the DDD structure established in ADR-009?

---

## Alignment with ADR-009

This ADR extends the Domain-Driven Design (DDD) structure established in **ADR-009: Adopt Domain-Driven Design Structure**. The authentication abstraction follows the same architectural pattern:

| ADR-009 Layer | ADR-002b Component | Purpose |
|---------------|-------------------|---------|
| **Domain** | `IAuthProvider` interface, `User` entity | Business logic, vendor-agnostic |
| **Application** | `AuthService` use cases | Orchestrate authentication flows |
| **Infrastructure** | `Auth0Provider`, `NextAuthProvider` | SDK implementations |
| **Interfaces** | Auth pages, API routes | User-facing entry points |

This ensures consistency with the broader DDD architecture and leverages existing team knowledge.

---

## DDD-Aligned Project Structure

```typescript
src/
├── domains/
│   └── auth/
│       ├── entities/
│       │   └── user.ts               # User entity with domain behavior
│       ├── value-objects/
│       │   ├── user-id.ts            # Value object with validation
│       │   └── email.ts              # Value object with validation
│       ├── services/
│       │   └── auth-rules.ts         # Domain rules (password policy, etc.)
│       └── repositories/
│           └── i-auth-provider.ts    # Repository interface (port)
│
├── application/
│   └── auth/
│       ├── login.ts                  # Use case: Login
│       ├── logout.ts                 # Use case: Logout
│       ├── get-current-user.ts       # Use case: Get current user
│       └── auth-dto.ts               # DTOs for interfaces
│
├── infrastructure/
│   └── external/
│       ├── auth0-provider.ts         # Auth0 adapter (implements IAuthProvider)
│       ├── nextauth-provider.ts      # NextAuth adapter (implements IAuthProvider)
│       └── auth-service.ts           # Email, OAuth integrations
│
└── interfaces/
    ├── web/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── signup/page.tsx
    │   └── api/
    │       └── auth/
    │           └── [...nextauth]/route.ts
    └── api/
        └── auth/
            └── login/route.ts        # REST API endpoint
```

---

## Why DDD Makes Auth Migration Cheap

ADR-009 established DDD to prevent business logic leakage and enable long-term maintainability. For authentication specifically, DDD provides:

1. **Repository Pattern**: `IAuthProvider` is a repository interface (same pattern as `EventRepository`, `SubmissionRepository`)
2. **Infrastructure Isolation**: Auth SDKs (Auth0, NextAuth) live **only** in infrastructure layer
3. **Application Services**: `AuthService` orchestrates flows without knowing the provider
4. **Domain Purity**: Business logic depends only on domain types (`User`, `Session`), not SDK types

**Result:** Swapping Auth0 for NextAuth requires changes **only** in:
- `infrastructure/external/nextauth-provider.ts` (new file)
- Composition root (1 line to swap provider)

**Zero changes** to:
- Domain layer (entities, value objects)
- Application layer (use cases)
- Interface layer (pages, components)

This is the **same migration cost** as swapping database providers or email services—making auth a fully swappable component.

---

## Authentication Options Analysis

### Option 1: Auth0 (SaaS Authentication)

**Overview:** Complete authentication-as-a-service platform (Okta-owned)

**Free Tier (2026):**
- **25,000 Monthly Active Users (MAU)** - Updated from 7,000
- **$0/month** - No credit card required
- Unlimited OAuth providers
- 5 Organizations (B2B support)
- Basic attack protection

**Pros:**
- ✅ **30-minute setup** vs 4-6 weeks self-hosted
- ✅ Enterprise-grade security (SOC2, HIPAA, GDPR compliant)
- ✅ 30+ OAuth providers built-in
- ✅ Built-in MFA, password reset, email verification
- ✅ Excellent Next.js integration (`@auth0/nextjs-auth0`)
- ✅ No DevOps overhead

**Cons:**
- ❌ **High vendor lock-in** - proprietary auth flows
- ❌ Migration requires rebuilding authentication from scratch **(unless using DDD abstraction)**
- ❌ Cost at scale (beyond 25K MAU)
- ❌ Limited customization of auth logic
- ❌ User data hosted on Auth0 servers

**Best For:** MVPs, teams without security expertise, B2B SaaS needing SSO

**DDD Migration Cost:** 8-14 hours (with abstraction) vs. 52-112 hours (without)

---

### Option 2: NextAuth.js (Auth.js v5)

**Overview:** Open-source authentication library for Next.js with database adapters

**Setup:**
```typescript
// app/auth.ts
import NextAuth from "next-auth"
import { Pool } from "pg"
import PostgresAdapter from "@auth/pg-adapter"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),  // Uses YOUR PostgreSQL
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Custom auth logic with YOUR database
      }
    })
  ]
})
```

**Pros:**
- ✅ **Standard PostgreSQL** - no vendor lock-in for database
- ✅ 30+ OAuth providers
- ✅ JWT or database session strategies
- ✅ Active community (5+ years)
- ✅ Free and open-source

**Cons:**
- ❌ 2-4 weeks to implement properly
- ❌ You handle security, password hashing, token management
- ❌ Need to implement OAuth providers manually
- ❌ Maintenance burden (security patches, updates)

**Best For:** Teams with security expertise, vendor independence priority

**DDD Migration Cost:** 8-14 hours (with abstraction) vs. 52-112 hours (without)

---

### Option 3: Better Auth

**Overview:** Modern TypeScript-first authentication library (2025-2026)

```typescript
// auth.ts
import { betterAuth } from "better-auth"
import { Pool } from "pg"

export const auth = betterAuth({
  database: {
    type: "postgresql",
    pool: pool,  // Your PostgreSQL
  },
  emailAndPassword: { enabled: true }
})
```

**Pros:**
- ✅ Modern API design
- ✅ Built-in email/password, OAuth, MFA
- ✅ Flexible schema mapping
- ✅ Active development

**Cons:**
- ❌ Newer (less community support)
- ❌ Smaller ecosystem than NextAuth

**Best For:** Teams wanting modern auth with PostgreSQL integration

---

### Option 4: Lucia Auth

**Overview:** Lightweight, unopinionated authentication library

**Pros:**
- ✅ Maximum control - you write auth logic
- ✅ Works with any database schema
- ✅ Very lightweight (~5kb)

**Cons:**
- ❌ Most code to write yourself
- ❌ Manual OAuth implementation
- ❌ Higher complexity

**Best For:** Teams wanting complete control, minimal abstraction

---

## Implementation Pattern (DDD-Aligned)

### Step 1: Define the Port (Repository Interface)

```typescript
// domains/auth/repositories/i-auth-provider.ts
export interface IUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface IAuthProvider {
  login(credentials: LoginCredentials): Promise<IUser>;
  logout(token: string): Promise<void>;
  getCurrentUser(token: string): Promise<IUser | null>;
  verifyToken(token: string): Promise<boolean>;
}
```

**This is a repository interface** following the same pattern as `EventRepository`, `SubmissionRepository` in ADR-009.

---

### Step 2: Create Auth0 Adapter (Infrastructure Implementation)

```typescript
// infrastructure/external/auth0-provider.ts
import { IAuthProvider, IUser } from '@/domains/auth/repositories/i-auth-provider';
import { auth0Client } from '@/lib/auth0';

export class Auth0Provider implements IAuthProvider {
  constructor(private auth0Client: typeof auth0Client) {}

  async login(credentials: LoginCredentials): Promise<IUser> {
    // Auth0-specific implementation
    await this.auth0Client.loginWithRedirect();
    const data = await this.auth0Client.getUser();
    
    // Translate Auth0 types to domain types
    return {
      id: data.sub,
      email: data.email,
      name: data.nickname,
      role: data['role'] || 'user'
    };
  }

  async logout(token: string): Promise<void> {
    await this.auth0Client.logout({ federated: true });
  }

  async getCurrentUser(token: string): Promise<IUser | null> {
    const data = await this.auth0Client.getUser();
    if (!data) return null;
    
    return {
      id: data.sub,
      email: data.email,
      name: data.nickname,
      role: data['role'] || 'user'
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.auth0Client.getUser();
      return true;
    } catch {
      return false;
    }
  }
}
```

**All Auth0 SDK calls are contained here.** Domain never sees them.

---

### Step 3: Create NextAuth Adapter (Future Implementation)

```typescript
// infrastructure/external/nextauth-provider.ts
import { IAuthProvider, IUser } from '@/domains/auth/repositories/i-auth-provider';
import { getServerSession, signIn, signOut } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export class NextAuthProvider implements IAuthProvider {
  async login(credentials: LoginCredentials): Promise<IUser> {
    // NextAuth-specific implementation
    const session = await signIn('credentials', {
      redirect: false,
      username: credentials.email,
      password: credentials.password
    });
    
    if (session.error) {
      throw new Error('Login failed');
    }
    
    // Translate NextAuth types to domain types
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || 'user'
    };
  }

  async logout(token: string): Promise<void> {
    await signOut({ redirect: false });
  }

  async getCurrentUser(token: string): Promise<IUser | null> {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) return null;
    
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role || 'user'
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    const session = await getServerSession(authOptions);
    return session?.user !== undefined;
  }
}
```

**This is a NEW file. Zero changes to existing code.**

---

### Step 4: Composition Root (Single Swap Point)

```typescript
// app/config/auth-config.ts

// BEFORE (Auth0)
import { Auth0Provider } from '@/infrastructure/external/auth0-provider';
export const authProvider: IAuthProvider = new Auth0Provider(auth0Client);

// AFTER (NextAuth) - ONE LINE CHANGE
import { NextAuthProvider } from '@/infrastructure/external/nextauth-provider';
export const authProvider: IAuthProvider = new NextAuthProvider();
```

**That's it. One line. Domain code never changes.**

---

### Step 5: Application Service (Business Logic - Never Changes)

```typescript
// application/auth/login.ts
export class LoginUseCase {
  constructor(private provider: IAuthProvider) {}

  async execute(credentials: LoginCredentials) {
    const user = await this.provider.login(credentials);
    // Business logic here - never touches Auth0 or NextAuth
    return user;
  }
}
```

**This file never changes during migration.**

---

## Comparison Matrix

| Aspect | Auth0 | NextAuth | Better Auth | Lucia |
|--------|-------|----------|-------------|-------|
| **Setup Time** | 30 minutes | 2-4 weeks | 2-3 weeks | 3-4 weeks |
| **Monthly Cost** | $0 (25K MAU) | $0 | $0 | $0 |
| **Vendor Lock-in** | High | Low | Low | None |
| **Security** | Enterprise | Your responsibility | Your responsibility | Your responsibility |
| **OAuth Providers** | 30+ built-in | 30+ built-in | 20+ built-in | Manual |
| **Migration Cost (with DDD)** | 8-14 hours | 8-14 hours | 8-14 hours | 8-14 hours |
| **Migration Cost (without DDD)** | 52-112 hours | 52-112 hours | 52-112 hours | 52-112 hours |
| **Maintenance** | None | Ongoing | Ongoing | Ongoing |
| **Customization** | Limited | Full | Full | Full |

---

## Decision Outcome

### Recommended Approach: Hybrid with Abstraction

For SessioFlow's MVP goals (6-week timeline, $0 budget, vendor independence):

```
┌─────────────────────────────────────────────────────────┐
│  SessioFlow Authentication Architecture                │
├─────────────────────────────────────────────────────────┤
│  Pattern: DDD Ports & Adapters (Anti-Corruption Layer) │
│  Initial Provider: Auth0 (Free Tier - 25K MAU)         │
│  Domain: IAuthProvider interface (vendor-agnostic)     │
│  Future: Swap to NextAuth/Better Auth with 1-day effort│
└─────────────────────────────────────────────────────────┘
```

**Why This Works:**

1. **Speed to Market**: 30-minute Auth0 setup vs 4-6 weeks self-hosted
2. **Vendor Independence**: DDD abstraction makes migration cheap (8-14 hours)
3. **Cost**: $0/month for MVP (25K MAU free tier)
4. **Security**: Enterprise-grade auth without security expertise required
5. **Flexibility**: Can migrate to self-hosted later if needed
6. **Consistency**: Aligns with ADR-009 DDD architecture

---

## Migration Path

### Phase 1: Implement with Abstraction (Week 1)

1. Define `IAuthProvider` interface (2 hours)
2. Create Auth0 adapter (4-6 hours)
3. Build AuthService using interface (4-6 hours)
4. Write adapter tests (3-4 hours)
5. **Total: 13-18 hours**

### Phase 2: Migrate to Self-Hosted (Post-MVP, if needed)

1. Create NextAuth/Better Auth adapter (4-6 hours)
2. Update composition root (0.5 hours)
3. Test new adapter (2-3 hours)
4. **Total: 6.5-9.5 hours**

**Total Migration Time:** 1-2 days (vs 1-3 weeks without abstraction)

---

## Consequences

### If We Implement DDD Abstraction:

**Positive:**
- ✅ Migration cost reduced from 52-112 hours to 8-14 hours
- ✅ Can start with Auth0 for speed, migrate later if needed
- ✅ Domain logic remains vendor-agnostic
- ✅ Easier testing (mock providers)
- ✅ Can run multiple providers in parallel during migration
- ✅ **Consistent with ADR-009 DDD architecture**

**Negative:**
- ❌ Upfront investment: 10-17 hours to set up abstraction
- ❌ Slightly more complex initial architecture
- ❌ Requires team understanding of DDD patterns

### If We Don't Implement Abstraction:

**Positive:**
- ✅ Faster initial setup (just use Auth0 SDK directly)
- ✅ Simpler codebase initially

**Negative:**
- ❌ Migration requires 1-3 weeks of work
- ❌ High risk of breaking changes
- ❌ Vendor lock-in becomes expensive to escape
- ❌ All business logic coupled to Auth0 SDK

---

## Recommendations

### For MVP Launch (6-week timeline):

**Use Auth0 with DDD abstraction:**
1. Implement `IAuthProvider` interface
2. Create Auth0 adapter
3. Launch with Auth0 Free Tier (25K MAU)
4. If product succeeds, migrate to self-hosted later (1-2 days)

### For Long-term Product:

**Migrate to self-hosted if:**
- Product achieves product-market fit
- Need to customize auth flows significantly
- User base grows beyond 25K MAU (cost considerations)
- Require specific data residency compliance

### For Teams with Security Expertise:

**Consider starting with NextAuth/Better Auth:**
- Full control from day one
- No vendor lock-in
- Still requires DDD abstraction for future flexibility

---

## Discussion Questions

1. **Is the 10-17 hour upfront investment for DDD abstraction worth it?**
2. **Should we start with Auth0 or go straight to self-hosted?**
3. **Does the team have the expertise to maintain self-hosted authentication?**
4. **What is the acceptable migration timeline if we need to switch providers?**
5. **Are there compliance requirements that require specific auth providers?**

---

## Links

* [Auth0 Pricing (2026)](https://auth0.com/pricing)
* [Auth0 Next.js Quickstart](https://auth0.com/docs/quickstart/webapp/nextjs)
* [NextAuth.js Documentation](https://authjs.dev)
* [Better Auth Documentation](https://better-auth.com)
* [Lucia Auth Documentation](https://lucia-auth.com)
* [Anti-Corruption Layer Pattern](https://dev.to/gabrielanhaia/the-anti-corruption-layer-that-saves-your-next-vendor-migration-3m5i)
* [DDD Ports & Adapters](https://medium.com/@adityamah2002/from-monolith-to-microservices-a-practical-guide-using-ddd-strangler-pattern-acl-886e1b24fac5)
* [Hexagonal Architecture for Auth](https://medium.com/@salimian/third-party-trap-designing-code-that-nothing-sticks-to-sdks-6c57d80fa20e)
* **ADR-009: Domain-Driven Design Structure**

---

## Decision

**Status:** Pending Discussion

**Next Steps:**
- [ ] Review with technical team
- [ ] Assess team's DDD/hexagonal architecture experience
- [ ] Decide on initial auth provider (Auth0 vs self-hosted)
- [ ] Create `IAuthProvider` interface specification
- [ ] Make final decision by [DATE]

---

## Appendix: Cost Summary

| Scenario | Upfront Cost | Migration Cost | Total (2 migrations) |
|----------|--------------|----------------|---------------------|
| **With DDD Abstraction** | 10-17 hours | 8-14 hours | 26-45 hours |
| **Without DDD** | 0-2 hours | 52-112 hours | 104-226 hours |
| **Savings with DDD** | -10-17 hours | -44-98 hours | -78-181 hours |

**Key Insight:** DDD abstraction pays for itself on the **first migration**. If you plan to stay with one provider forever, it's optional. But if vendor independence matters, it's essential.

---

## Appendix: Alignment with ADR-009

This ADR directly implements the DDD principles established in ADR-009:

| ADR-009 Principle | ADR-002b Implementation |
|-------------------|------------------------|
| **Repository Pattern** | `IAuthProvider` interface |
| **Infrastructure Layer** | `Auth0Provider`, `NextAuthProvider` implementations |
| **Application Layer** | `LoginUseCase`, `LogoutUseCase` |
| **Domain Layer** | `User` entity, `UserId` value object |
| **Separation of Concerns** | Auth logic isolated from business logic |
| **Swappable Components** | Provider can be swapped with 1-line change |

This ensures the authentication system follows the same architectural patterns as the rest of SessioFlow's domain model.
