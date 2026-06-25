# SessioFlow - Quick Architecture Reference

**Last Updated:** 2026-06-25  
**Status:** ✅ All Decisions Approved

---

## 🎯 Technology Stack

| Layer | Technology | Free Tier | Notes |
|-------|-----------|-----------|-------|
| **Frontend** | Next.js 15 + TypeScript | $0 | App Router, Server Components |
| **UI** | Tailwind CSS + shadcn/ui | $0 | Accessible, customizable |
| **Database** | Supabase PostgreSQL | 500MB, 50K MAU | With DDD abstraction |
| **Authentication** | Auth0 | 25K MAU | With DDD abstraction |
| **Storage** | Cloudflare R2 | 10GB, no egress fees | With DDD abstraction |
| **Email** | Resend | 3K/month | Direct integration |
| **Architecture** | DDD + Abstraction | $0 | Vendor-independent |

**Total Cost:** $0/month for MVP

---

## 📁 Project Structure

```
src/
├── domains/                    # Business logic (vendor-agnostic)
│   ├── auth/
│   │   ├── entities/
│   │   │   └── user.ts
│   │   ├── repositories/
│   │   │   └── auth-provider.ts    # Interface (port)
│   │   └── services/
│   ├── storage/
│   │   └── repositories/
│   │       └── storage-provider.ts # Interface (port)
│   ├── event/
│   ├── submission/
│   └── review/
├── application/                # Use cases
│   ├── auth/
│   │   ├── login.ts
│   │   └── logout.ts
│   └── storage/
│       └── upload-file.ts
├── infrastructure/             # External service implementations
│   ├── external/
│   │   ├── auth0-provider.ts       # Implements AuthProvider
│   │   ├── cloudflare-r2-adapter.ts # Implements StorageProvider
│   │   └── resend-email-adapter.ts  # Implements EmailProvider
│   └── database/
│       └── supabase-adapter.ts
└── interfaces/               # UI and API entry points
    ├── web/
    └── api/
```

---

## 🔑 Key Interfaces

### AuthProvider

```typescript
// domains/auth/repositories/auth-provider.ts
export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<User>;
  logout(token: string): Promise<void>;
  getCurrentUser(token: string): Promise<User | null>;
  verifyToken(token: string): Promise<boolean>;
}
```

### StorageProvider

```typescript
// domains/storage/repositories/storage-provider.ts
export interface StorageProvider {
  upload(request: UploadFileRequest): Promise<UploadFileResult>;
  download(path: string): Promise<Buffer>;
  getUrl(path: string): Promise<string>;
  delete(path: string): Promise<void>;
}
```

---

## 🔄 Migration Costs

| Component | Migration Effort | Files Changed |
|-----------|-----------------|---------------|
| Auth0 → NextAuth | 8-14 hours | 2-3 |
| R2 → Supabase Storage | 8-14 hours | 2-3 |
| Supabase DB → PostgreSQL | 8-14 hours | 2-3 |
| **Full Stack Migration** | **24-42 hours** | **6-12** |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Run development server
npm run dev

# 4. Run tests
npm test
```

---

## 📚 Documentation

- **ADR Index:** [docs/adr/README.md](./README.md)
- **Decision Summary:** [docs/adr/_reports/DECISION_SUMMARY_2026-06-25.md](./_reports/DECISION_SUMMARY_2026-06-25.md)
- **Free Tier Analysis:** [docs/specs/free-tier-comparison.md](../specs/free-tier-comparison.md)
- **Interface Naming:** [docs/adr/INTERFACE_NAMING_CONVENTION.md](./INTERFACE_NAMING_CONVENTION.md)

---

## ✅ Approved Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| 002 | Supabase PostgreSQL | ✅ Approved |
| 002 Amendment | DDD Abstraction Layer | ✅ Approved |
| 002a | Supabase Alternatives | ✅ Accepted |
| 002b | Auth0 with DDD | ✅ Accepted |
| 004 | Magic Link Auth | ✅ Approved |
| 004 Amendment | Auth with DDD | ✅ Approved |
| 005 | Supabase Storage | ✅ Approved |
| 005 Amendment | Storage with DDD | ✅ Approved |
| 011 | Resend Email | ✅ Approved |
| 011 Amendment | Email Abstraction (Optional) | ✅ Approved |
| 009 | DDD Architecture | ✅ Approved |

---

**Questions?** Check the ADR documentation or contact the Technical Lead.