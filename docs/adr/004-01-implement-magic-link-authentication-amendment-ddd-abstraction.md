# 004-01-Implement Magic Link Authentication Amendment: DDD Abstraction: DDD Abstraction

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-11
* **Decision Makers:** Product Team, Technical Lead
* **Amends:** ADR-004 (Implement Magic Link Authentication)
* **Related:** ADR-002-03 (Authentication Strategy and Vendor Abstraction), ADR-009 (Domain-Driven Design Structure)

---

## Purpose of This Amendment

This document amends **ADR-004** to incorporate the DDD abstraction pattern established in ADR-002b. The original ADR-004 assumed tight coupling to Supabase Auth, but with DDD abstraction, the authentication layer becomes vendor-agnostic and swappable.

---

## Critical Update: Authentication Abstraction Pattern

### Original ADR-002 Assumption

The original ADR-004 assumed:
- Direct Supabase Auth SDK integration
- Magic links and OAuth tightly coupled to Supabase
- Migration away from Supabase Auth would require significant refactoring

### New Reality with DDD Abstraction

With ADR-002b's DDD pattern:
- **All authentication** flows through `AuthProvider` interface
- **Supabase Auth** becomes one implementation (adapter)
- **Migration cost** reduced from 52-112 hours to 8-14 hours
- **Provider independence** - can swap without touching business logic

---

## Revised Decision

### Updated Decision: Hybrid Authentication with Abstraction

**Chosen Option:** "Hybrid: Magic Link + Social Login with DDD Abstraction"

**Updated Justification:**
With DDD abstraction (ADR-002b), the authentication strategy provides optimal flexibility:

1. **Usability Priority**: Magic links eliminate password friction (supports #1 trade-off priority)
2. **Vendor Independence**: Can swap Supabase Auth ↔ Auth0 ↔ NextAuth with 8-14 hours effort
3. **Security Baseline**: Enterprise-grade security through abstraction, not tied to specific vendor
4. **MVP Timeline**: Start with Supabase Auth for speed, migrate later if needed
5. **GDPR Compliance**: Can choose provider based on data residency requirements

---

## Implementation Pattern

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  Application Layer (Use Cases)                          │
│  - LoginUseCase                                         │
│  - LogoutUseCase                                        │
│  - GetCurrentUserUseCase                                │
│  - Depends only on: AuthProvider interface              │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ depends on abstraction
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Domain Layer (Port)                                      │
│  - AuthProvider interface                                 │
│  - User entity (domain type)                              │
│  - LoginCredentials value object                          │
└────────────────────────┬─────────────────────────────────┘
                         │ implemented by
                         │
┌────────────────────────┴─────────────────────────────────┐
│  Infrastructure Layer (Adapters)                          │
│  - SupabaseAuthAdapter (current)                         │
│  - Auth0Provider (future option)                         │
│  - NextAuthProvider (future option)                      │
│  - MockAuthProvider (for testing)                        │
└─────────────────────────────────────────────────────────┘
```

### Domain Interface (Port)

```typescript
// domains/auth/repositories/auth-provider.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'organizer' | 'speaker' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password?: string; // Optional for magic links
  provider?: 'magic-link' | 'google' | 'github';
}

export interface AuthProvider {
  /**
   * Authenticate user and return user data
   * Supports magic links, OAuth, and credentials
   */
  login(credentials: LoginCredentials): Promise<User>;
  
  /**
   * Terminate user session
   */
  logout(token: string): Promise<void>;
  
  /**
   * Get current user from token/session
   */
  getCurrentUser(token: string): Promise<User | null>;
  
  /**
   * Verify token validity
   */
  verifyToken(token: string): Promise<boolean>;
}
```

### Supabase Auth Adapter (Current Implementation)

```typescript
// infrastructure/external/supabase-auth-adapter.ts
import { AuthProvider, User, LoginCredentials } from '@/domains/auth/repositories/auth-provider';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class SupabaseAuthAdapter implements AuthProvider {
  async login(credentials: LoginCredentials): Promise<User> {
    if (credentials.provider === 'magic-link') {
      // Magic link flow
      const { data, error } = await supabase.auth.signInWithOtp({
        email: credentials.email
      });
      
      if (error) throw error;
      // User will be returned when they click the link
      // This is handled via session callback
      return this.getCurrentUserFromSession();
    }
    
    if (credentials.provider === 'google' || credentials.provider === 'github') {
      // OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: credentials.provider,
        redirectTo: `${window.location.origin}/auth/callback`
      });
      
      if (error) throw error;
      return this.getCurrentUserFromSession();
    }
    
    throw new Error('Unsupported authentication method');
  }
  
  async logout(token: string): Promise<void> {
    await supabase.auth.signOut();
  }
  
  async getCurrentUser(token: string): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return null;
    
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      role: user.user_metadata?.role || 'speaker'
    };
  }
  
  async verifyToken(token: string): Promise<boolean> {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return user !== null && error === null;
  }
  
  private async getCurrentUserFromSession(): Promise<User> {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('Authentication failed');
    }
    
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      role: user.user_metadata?.role || 'speaker'
    };
  }
}
```

### Application Service (Use Case - Never Changes)

```typescript
// application/auth/login-use-case.ts
import { AuthProvider, User, LoginCredentials } from '@/domains/auth/repositories/auth-provider';

export class LoginUseCase {
  constructor(private authProvider: AuthProvider) {}
  
  async execute(credentials: LoginCredentials): Promise<User> {
    // Business logic for login
    // Never touches Supabase SDK directly
    const user = await this.authProvider.login(credentials);
    
    // Additional business logic can be added here
    // e.g., logging, analytics, etc.
    
    return user;
  }
}
```

### Composition Root (Single Swap Point)

```typescript
// app/config/auth-config.ts
import { AuthProvider } from '@/domains/auth/repositories/auth-provider';
import { SupabaseAuthAdapter } from '@/infrastructure/external/supabase-auth-adapter';

// Current implementation
export const authProvider: AuthProvider = new SupabaseAuthAdapter();

// Future migration: Just change this one line
// export const authProvider: AuthProvider = new Auth0Provider();
// export const authProvider: AuthProvider = new NextAuthProvider();
```

---

## Revised Consequences

### Positive Consequences (Updated)

- ✅ **Eliminates password reset support** - Magic links reduce overhead
- ✅ **Reduces barrier to entry** - Smooth onboarding for speakers
- ✅ **Social login flexibility** - Can add/remove providers easily
- ✅ **Vendor independence** - Can swap auth providers with 8-14 hours
- ✅ **Built-in security** - Rate limiting and attack protection from provider
- ✅ **GDPR compliance** - Can choose provider based on data residency
- ✅ **Testability** - Mock providers enable isolated unit testing

### Negative Consequences (Updated)

- ⚠️ **Email delivery dependency** - Magic links require reliable email
- ⚠️ **Provider configuration** - Each provider needs setup
- ⚠️ **Multiple flows** - Must maintain magic link + OAuth
- ⚠️ **Abstraction overhead** - Initial 10-17 hours investment

### Risks (Updated)

- ⚠️ **Email deliverability** - Spam filters may block magic links
- ⚠️ **Provider API changes** - Adapters must be updated
- ⚠️ **GDPR consent** - Email-based auth requires explicit consent
- ✅ **Mitigated**: Vendor lock-in reduced by DDD abstraction

---

## Migration Scenarios

### Scenario 1: Supabase Auth → Auth0

**Trigger:** Need enterprise features or better pricing at scale

**Effort:** 8-14 hours
1. Create `Auth0Provider` implementing `AuthProvider` (4-6 hours)
2. Update composition root (0.5 hours)
3. Test new provider (2-3 hours)
4. Deploy (0.5 hours)

**Zero changes to:**
- Domain layer
- Application layer
- Interface layer
- Business logic

### Scenario 2: Supabase Auth → NextAuth.js

**Trigger:** Want self-hosted auth with PostgreSQL

**Effort:** 8-14 hours
1. Create `NextAuthProvider` implementing `AuthProvider` (4-6 hours)
2. Update composition root (0.5 hours)
3. Test new provider (2-3 hours)
4. Deploy (0.5 hours)

---

## Comparison: With vs Without DDD Abstraction

| Aspect | Without DDD (Original ADR-004) | With DDD (This Amendment) |
|--------|-------------------------------|---------------------------|
| **Migration Cost** | 52-112 hours | 8-14 hours |
| **Files Changed** | 50-200+ | 2-3 |
| **Risk Level** | High | Low |
| **Downtime** | Possible | None |
| **Business Logic Changes** | Required | None |
| **Testing Effort** | Full regression | Adapter tests only |

---

## Links

* [ADR-002b: Authentication Strategy and Vendor Abstraction](./_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
* [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
* [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
* [Auth0 Next.js Integration](https://auth0.com/docs/quickstart/webapp/nextjs)
* [NextAuth.js Documentation](https://authjs.dev)

---

## Decision

**Status:** ✅ **APPROVED**

**Approved By:** Technical Lead, Product Team  
**Approval Date:** 2026-06-25

**Decision:** Magic Link Authentication with DDD Abstraction

**This Amendment Supersedes:**
- Original ADR-004 assumption of tight Supabase Auth coupling
- Migration cost estimates (updated from 52-112 hours to 8-14 hours)

**Implementation Directive:**
- [x] Implement `AuthProvider` interface as the authentication port
- [x] Create vendor-specific adapters (SupabaseAuthAdapter, Auth0Provider, etc.)
- [x] All authentication flows must go through the abstraction
- [x] Application layer depends only on `AuthProvider` interface
- [ ] Begin implementation of auth abstraction

---

## Appendix: Testing Strategy

### Unit Tests with Mock Provider

```typescript
// tests/unit/auth/login-use-case.test.ts
import { LoginUseCase } from '@/application/auth/login-use-case';
import { AuthProvider, User, LoginCredentials } from '@/domains/auth/repositories/auth-provider';

// Mock provider for testing
class MockAuthProvider implements AuthProvider {
  async login(credentials: LoginCredentials): Promise<User> {
    return {
      id: 'test-user-id',
      email: credentials.email,
      name: 'Test User',
      role: 'speaker'
    };
  }
  
  async logout(token: string): Promise<void> {}
  async getCurrentUser(token: string): Promise<User | null> { return null; }
  async verifyToken(token: string): Promise<boolean> { return true; }
}

describe('LoginUseCase', () => {
  it('should authenticate user successfully', async () => {
    const mockProvider = new MockAuthProvider();
    const useCase = new LoginUseCase(mockProvider);
    
    const result = await useCase.execute({
      email: 'test@example.com',
      provider: 'magic-link'
    });
    
    expect(result.email).toBe('test@example.com');
    expect(result.id).toBe('test-user-id');
  });
});
```

**Benefits:**
- ✅ No external dependencies in tests
- ✅ Tests run in milliseconds
- ✅ Can test error scenarios easily
- ✅ No API keys or credentials needed
