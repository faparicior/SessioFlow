# 002-Supabase Backend Amendment: DDD Abstraction Layer

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-11
* **Decision Makers:** Product Team, Technical Lead
* **Amends:** ADR-002 (Use Supabase for Backend and Database)
* **Related:** ADR-002a (Supabase Vendor Lock-in Alternatives), ADR-002b (Authentication Strategy and Vendor Abstraction), ADR-009 (Domain-Driven Design Structure)

---

## Purpose of This Amendment

This document amends **ADR-002** to address critical updates discovered during subsequent analysis:

1. **Auth0 pricing correction** (25,000 MAU free tier, not 7,000)
2. **DDD abstraction pattern** significantly reduces vendor lock-in risk
3. **Hybrid architecture** is now a viable option with $0/month cost
4. **Migration cost** is dramatically lower when using DDD patterns

---

## Critical Updates to ADR-002

### Update 1: Auth0 Pricing Correction

**Original ADR-002 stated:**
> "Auth0 free tier: 7,000 users, but paid tiers start at $23/month"

**Correction (2026):**
> Auth0 Free Tier now provides **25,000 Monthly Active Users (MAU)** with no credit card required. This makes the hybrid approach (Auth0 + PostgreSQL + R2) fully compliant with the $0/month constraint.

**Source:** [Auth0 Pricing 2026](https://auth0.com/pricing)

---

### Update 2: DDD Abstraction Mitigates Vendor Lock-in

**Original ADR-002 stated:**
> "Vendor lock-in: Migration away from Supabase requires significant refactoring"

**New Analysis:**
With DDD architecture (ADR-009) in place, vendor lock-in risk is **significantly mitigated**:

| Component | Without DDD | With DDD Abstraction |
|-----------|-------------|---------------------|
| **Database Migration** | 52-112 hours | 8-14 hours |
| **Auth Migration** | 52-112 hours | 8-14 hours |
| **Storage Migration** | 52-112 hours | 8-14 hours |
| **Total Migration Cost** | 156-336 hours | 24-42 hours |

**Key Insight:** DDD abstraction reduces migration cost by **85%** by isolating vendor SDKs to infrastructure layer only.

---

### Update 3: Hybrid Architecture is Now Viable

**Original ADR-002 dismissed hybrid approach:**
> "PlanetScale + Auth0 + Cloud Storage... Bad, because combining three services increases cost quickly"

**New Analysis:**
With corrected pricing and DDD abstraction, a **hybrid approach** is now fully viable:

```
┌─────────────────────────────────────────────────────────┐
│  SessioFlow Hybrid Architecture                         │
├─────────────────────────────────────────────────────────┤
│  Database: Supabase PostgreSQL (or Oracle Cloud Free)  │
│  Auth: Auth0 Free Tier (25,000 MAU)                    │
│  Storage: Cloudflare R2 (10GB free, no egress fees)    │
│  Pattern: DDD Ports & Adapters (ADR-009)               │
└─────────────────────────────────────────────────────────┘
```

**Cost Breakdown:**
- Database: $0/month (Supabase free tier or Oracle Cloud Always Free)
- Auth: $0/month (Auth0 free tier up to 25K MAU)
- Storage: $0/month (Cloudflare R2 up to 10GB)
- **Total: $0/month**

**Benefits:**
- ✅ No vendor lock-in for any component
- ✅ Each layer is swappable with 8-14 hours effort
- ✅ Enterprise-grade auth (Auth0) without lock-in
- ✅ S3-compatible storage (portable)
- ✅ Standard PostgreSQL (no vendor-specific features)

---

## Revised Decision Options

### Option 1: Supabase Full Stack (Original ADR-002 Decision)

**Description:** Use Supabase for database, auth, and storage

**Updated Assessment:**
- ✅ Complete BaaS (auth, database, storage, RLS)
- ✅ $0/month free tier (50K users, 500MB DB, 1GB storage)
- ⚠️ **Migration cost with DDD:** 24-42 hours (not 156-336 hours)
- ⚠️ Still introduces vendor lock-in across all layers
- ⚠️ Limited customization of auth flows

**Best For:** Teams prioritizing maximum speed over vendor independence

---

### Option 1b: Supabase Database + DDD Abstraction (NEW)

**Description:** Use Supabase for database only, with DDD abstraction for auth and storage

**Updated Assessment:**
- ✅ Supabase PostgreSQL with DDD repository interfaces
- ✅ Auth0 or NextAuth for authentication (swappable)
- ✅ Cloudflare R2 or MinIO for storage (S3-compatible)
- ✅ $0/month (Supabase free tier + Auth0 25K MAU + R2 10GB)
- ✅ **Migration cost:** 8-14 hours per component
- ⚠️ Requires 10-17 hours upfront abstraction investment

**Best For:** Teams wanting Supabase database benefits without full lock-in

---

### Option 2: Full Hybrid with DDD Abstraction (NEW RECOMMENDATION)

**Description:** Independent services with DDD abstraction for all external dependencies

**Updated Assessment:**
- ✅ Database: Supabase PostgreSQL or Oracle Cloud Free
- ✅ Auth: Auth0 Free Tier (25K MAU)
- ✅ Storage: Cloudflare R2 (10GB free)
- ✅ $0/month total
- ✅ **Migration cost:** 8-14 hours per component
- ✅ No vendor lock-in for any layer
- ⚠️ Requires 10-17 hours upfront per abstraction
- ⚠️ More complex initial setup (multiple services)

**Best For:** Teams prioritizing vendor independence while maintaining $0 budget

---

## Revised Consequences

### If We Choose Supabase Full Stack (Original Decision):

**Positive:**
- ✅ Rapid development: Auth and Storage ready in hours, not days
- ✅ PostgreSQL provides familiar SQL querying and migration tools
- ✅ Real-time subscriptions available for future features
- ✅ Strong community and documentation

**Negative:**
- ⚠️ **With DDD:** Migration cost reduced to 24-42 hours (was "significant")
- ⚠️ Limited customization of authentication flows
- ⚠️ File storage tied to Supabase ecosystem
- ⚠️ Free tier has rate limits that may impact high-traffic events

**Risk Mitigation:** Implement DDD abstraction from the start to reduce migration cost by 85%

---

### If We Choose Hybrid with DDD Abstraction (New Recommendation):

**Positive:**
- ✅ No vendor lock-in for any component
- ✅ Each layer is independently swappable
- ✅ Enterprise-grade auth (Auth0) without lock-in
- ✅ $0/month for MVP
- ✅ Consistent with ADR-009 DDD architecture
- ✅ Migration cost: 8-14 hours per component

**Negative:**
- ❌ Requires 30-51 hours upfront investment (3 abstractions × 10-17 hours)
- ❌ More complex initial setup (multiple services to integrate)
- ❌ Requires team understanding of DDD patterns
- ❌ Need to manage multiple service configurations

---

## Revised Decision Outcome

### Updated Recommendation

**For MVP (6-week timeline, $0 budget):**

**Option 1a: Supabase Database + DDD Abstraction**

```
┌─────────────────────────────────────────────────────────┐
│  SessioFlow MVP Architecture (Revised)                 │
├─────────────────────────────────────────────────────────┤
│  Database: Supabase PostgreSQL                         │
│  Auth: Auth0 Free Tier (25K MAU) with DDD abstraction  │
│  Storage: Supabase Storage (initially)                 │
│  Pattern: DDD Ports & Adapters (ADR-009)               │
└─────────────────────────────────────────────────────────┘
```

**Rationale:**
1. **Speed:** Auth0 setup is 30 minutes vs 4-6 weeks for self-hosted
2. **Flexibility:** DDD abstraction allows migration later (8-14 hours)
3. **Cost:** $0/month (Auth0 25K MAU + Supabase free tier)
4. **Consistency:** Aligns with ADR-009 DDD architecture
5. **Risk Mitigation:** Can migrate auth/storage later without touching domain logic

**Migration Path:**
- Phase 1: Launch with Supabase DB + Auth0 (Week 1-2)
- Phase 2: If product succeeds, migrate storage to Cloudflare R2 (1-2 days)
- Phase 3: If needed, migrate auth to self-hosted (1-2 days)

---

## Updated Links

* [Supabase Documentation](https://supabase.com/docs)
* [Auth0 Pricing (2026)](https://auth0.com/pricing) - **Updated: 25K MAU free tier**
* [Cloudflare R2 Pricing](https://www.cloudflare.com/products/r2/)
* [ADR-002a: Supabase Vendor Lock-in Alternatives](./_to-discuss/002a-supabase-vendor-lock-in-alternatives.md)
* [ADR-002b: Authentication Strategy and DDD Abstraction](./_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
* [ADR-009: Domain-Driven Design Structure](./009-adopt-domain-driven-design-structure.md)
* [DDD Ports & Adapters Pattern](https://medium.com/@salimian/third-party-trap-designing-code-that-nothing-sticks-to-sdks-6c57d80fa20e)

---

## Decision

**Status:** ✅ **APPROVED**

**Approved By:** Technical Lead, Product Team  
**Approval Date:** 2026-06-25

**Decision:** Hybrid Architecture with DDD Abstraction

**This Amendment Supersedes:**
- Original ADR-002 cost analysis (Auth0 pricing correction)
- Original ADR-002 vendor lock-in assessment (DDD mitigation)
- Original ADR-002 dismissal of hybrid approach (now viable with DDD)

**Implementation Directive:**
- [x] Implement DDD abstraction layer from the start
- [x] Use Supabase PostgreSQL as primary database
- [x] Implement `AuthProvider` interface for authentication
- [x] Implement `StorageProvider` interface for file storage
- [ ] Begin implementation of abstraction layers

---

## Appendix: Migration Cost Comparison

### With DDD Abstraction

| Migration Scenario | Effort | Files Changed | Risk |
|-------------------|--------|---------------|------|
| Auth0 → NextAuth | 8-14 hours | 2-3 | Low |
| Supabase Auth → Auth0 | 8-14 hours | 2-3 | Low |
| Supabase Storage → R2 | 8-14 hours | 2-3 | Low |
| Supabase DB → PostgreSQL | 8-14 hours | 2-3 | Low |
| **Full Stack Migration** | **24-42 hours** | **6-12** | **Low** |

### Without DDD Abstraction

| Migration Scenario | Effort | Files Changed | Risk |
|-------------------|--------|---------------|------|
| Auth0 → NextAuth | 52-112 hours | 50-200+ | High |
| Supabase Auth → Auth0 | 52-112 hours | 50-200+ | High |
| Supabase Storage → R2 | 52-112 hours | 50-200+ | High |
| Supabase DB → PostgreSQL | 52-112 hours | 50-200+ | High |
| **Full Stack Migration** | **156-336 hours** | **200-800+** | **Very High** |

**Key Finding:** DDD abstraction reduces migration cost by **85%** and risk from "Very High" to "Low".

---

## Appendix: DDD Abstraction Investment vs. Savings

| Metric | Without DDD | With DDD | Difference |
|--------|-------------|----------|------------|
| **Upfront Investment** | 0-2 hours | 30-51 hours | -30-51 hours |
| **First Migration** | 52-112 hours | 8-14 hours | +44-98 hours saved |
| **Second Migration** | 52-112 hours | 8-14 hours | +44-98 hours saved |
| **Total (2 migrations)** | 104-226 hours | 46-79 hours | **58-147 hours saved** |

**Break-even Point:** After **first migration**, DDD abstraction has already paid for itself.

**Recommendation:** If there's any chance of needing to migrate (vendor lock-in concern), implement DDD abstraction from the start.
