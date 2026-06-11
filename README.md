# SessioFlow

A Call-for-Papers (CfP) platform built with Next.js, designed to help organizers manage events, proposals, and speaker scheduling.

---

## 📚 Documentation

### Architecture Decision Records (ADRs)

Key decisions that shape the SessioFlow architecture:

| ADR | Status | Description |
|-----|--------|-------------|
| [ADR-002](./docs/adr/002-use-supabase-for-backend-and-database.md) | Proposed | Use Supabase for Backend and Database |
| [ADR-002-Amendment](./docs/adr/002-supabase-backend-amendment-ddd-abstraction.md) | **Amendment** | DDD Abstraction Layer for Vendor Independence |
| [ADR-002a](./docs/adr/_to-discuss/002a-supabase-vendor-lock-in-alternatives.md) | Under Discussion | Supabase Vendor Lock-in and Self-Hosted Alternatives |
| [ADR-002b](./docs/adr/_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md) | **Under Discussion** | Authentication Strategy and Vendor Abstraction with DDD |
| [ADR-004-Amendment](./docs/adr/004-magic-link-authentication-amendment.md) | **Amendment** | Magic Link Auth with DDD Abstraction |
| [ADR-005-Amendment](./docs/adr/005-supabase-storage-amendment.md) | **Amendment** | Storage with DDD Abstraction |
| [ADR-009](./docs/adr/009-adopt-domain-driven-design-structure.md) | Proposed | Adopt Domain-Driven Design (DDD) Structure |
| [ADR-011-Amendment](./docs/adr/011-resend-email-amendment.md) | Optional | Email Abstraction (Deferred) |

**Latest Decisions:**
- **Authentication Strategy (ADR-002b)**: Implement DDD ports & adapters pattern for vendor-agnostic authentication
- **Storage Strategy (ADR-005 Amendment)**: Supabase Storage with DDD abstraction (swappable to Cloudflare R2)
- **DDD Architecture (ADR-009)**: Adopt Domain-Driven Design structure for long-term maintainability
- **Hybrid Approach (ADR-002 Amendment)**: Consider Supabase Database + Auth0 + DDD abstraction for MVP

---

## 🏗️ Project Structure

SessioFlow follows Domain-Driven Design (DDD) principles with vendor abstraction layers:

```
src/
├── domains/                    # Domain layer (business logic)
│   ├── auth/                   # Authentication bounded context
│   │   ├── entities/           # User, Session
│   │   ├── value-objects/      # UserId, Email, Role
│   │   ├── services/           # Auth rules, validation
│   │   └── repositories/       # AuthProvider interface (port)
│   ├── storage/                # Storage bounded context
│   │   ├── entities/           # File, UploadResult
│   │   ├── value-objects/      # FileId, ContentType
│   │   └── repositories/       # StorageProvider interface (port)
│   ├── email/                  # Email bounded context (optional)
│   │   └── repositories/       # EmailProvider interface (port)
│   ├── event/                  # Event bounded context
│   ├── submission/             # Submission bounded context
│   ├── review/                 # Review bounded context
│   └── scheduling/             # Scheduling bounded context
│
├── application/                # Application layer (use cases)
│   ├── auth/                   # Login, logout, get-current-user
│   ├── storage/                # Upload-profile-photo, get-file-url
│   ├── email/                  # Send-welcome-email, send-notification
│   ├── event/                  # Create-event, publish-cfp
│   ├── submission/             # Submit-proposal, get-submission
│   ├── review/                 # Assign-reviewers, submit-review
│   └── scheduling/             # Generate-schedule, detect-conflicts
│
├── infrastructure/             # Infrastructure layer (implementations)
│   ├── database/               # Repository implementations
│   │   ├── event-repository.ts
│   │   ├── submission-repository.ts
│   │   └── review-repository.ts
│   └── external/               # External service adapters
│       ├── auth/
│       │   ├── auth0-provider.ts
│       │   ├── nextauth-provider.ts
│       │   └── supabase-auth-adapter.ts
│       ├── storage/
│       │   ├── supabase-storage-adapter.ts
│       │   ├── cloudflare-r2-adapter.ts
│       │   └── minio-adapter.ts
│       └── email/
│           ├── resend-email-adapter.ts
│           └── sendgrid-email-adapter.ts
│
└── interfaces/                 # Interface layer (entry points)
    ├── web/                    # Next.js pages and components
    └── api/                    # API endpoints
```

---

## 🛠️ Tech Stack

### Core Technologies
- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase or swappable alternative)
- **Authentication**: Auth0 / NextAuth / Supabase (swappable via DDD abstraction)
- **Storage**: Supabase Storage / Cloudflare R2 (swappable via DDD abstraction)
- **Email**: Resend (with optional abstraction)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Architecture**: Domain-Driven Design (DDD) with Ports & Adapters

### Vendor Abstraction Pattern

All external dependencies use DDD abstraction to enable vendor independence:

```typescript
// Domain layer defines the interface
interface AuthProvider {
  login(credentials): Promise<User>;
  logout(token): Promise<void>;
  getCurrentUser(token): Promise<User | null>;
}

interface StorageProvider {
  upload(file): Promise<UploadResult>;
  download(path): Promise<Buffer>;
  getUrl(path): Promise<string>;
  delete(path): Promise<void>;
}

// Infrastructure layer implements the interface
class Auth0Provider implements AuthProvider { ... }
class NextAuthProvider implements AuthProvider { ... }
class SupabaseStorageAdapter implements StorageProvider { ... }
class CloudflareR2Adapter implements StorageProvider { ... }

// Application layer uses only the interface
class LoginUseCase {
  constructor(private provider: AuthProvider) {}
}
```

**Benefits:**
- ✅ Swap providers with 8-14 hours effort (vs 52-112 hours)
- ✅ Vendor lock-in reduced by 85%
- ✅ Easy testing with mock implementations
- ✅ Can optimize costs by switching providers

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Supabase or self-hosted)
- Auth provider (Auth0, NextAuth, or custom)
- Storage provider (Supabase Storage, Cloudflare R2, or MinIO)

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# or
bun run dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (Auth0 example)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Alternative: NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Alternative: Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Storage (Supabase example)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# Alternative: Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket

# Email (Resend example)
RESEND_API_KEY=re_your-api-key
```

---

## 📖 Development

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Single test file
npx vitest run tests/unit/auth.test.ts
npx playwright test tests/e2e/auth.spec.ts
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
npm run lint:fix
npm run format
```

### Building for Production

```bash
npm run build
npm run start
```

---

## 📋 Key Features

### MVP Features (Wave 1)

- ✅ Event creation and management
- ✅ Call-for-Papers (CFP) configuration
- ✅ Proposal submission by speakers
- ✅ Speaker profiles with profile photos
- ✅ Admin dashboard for organizers
- ✅ Row-Level Security (RLS) for data protection

### Planned Features (Wave 2+)

- 📋 Review and scoring system
- 📋 Session scheduling and conflict detection
- 📋 Email notifications
- 📋 Export proposals to CSV/PDF
- 📋 Multi-language support

---

## 🏛️ Architecture Principles

### Domain-Driven Design (DDD)

SessioFlow follows DDD principles to ensure long-term maintainability:

1. **Domain Layer**: Pure business logic, vendor-agnostic
2. **Application Layer**: Use cases and orchestration
3. **Infrastructure Layer**: External service implementations (swappable)
4. **Interface Layer**: UI and API entry points

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Easy to test (domain logic has no dependencies)
- ✅ Swappable infrastructure (database, auth, storage)
- ✅ Scales well for complex domain features

### Vendor Abstraction

All external dependencies are accessed through repository interfaces:

```typescript
// Domain defines the contract
interface AuthProvider {
  login(credentials): Promise<User>;
  logout(token): Promise<void>;
  getCurrentUser(token): Promise<User | null>;
}

interface StorageProvider {
  upload(file): Promise<UploadResult>;
  download(path): Promise<Buffer>;
  getUrl(path): Promise<string>;
  delete(path): Promise<void>;
}

// Infrastructure implements the contract
class Auth0Provider implements AuthProvider { ... }
class NextAuthProvider implements AuthProvider { ... }
class SupabaseStorageAdapter implements StorageProvider { ... }
class CloudflareR2Adapter implements StorageProvider { ... }

// Application uses only the interface
class LoginUseCase {
  constructor(private provider: AuthProvider) {}
}
```

**Benefits:**
- ✅ Swap Auth0 for NextAuth with 1-line change
- ✅ Swap Supabase Storage for Cloudflare R2 with 1-line change
- ✅ Swap database provider with minimal changes
- ✅ Migration cost reduced by 85% (from 156-336 hours to 24-42 hours)

---

## 🤝 Contributing

1. Read the [ADR documentation](./docs/adr/) to understand architectural decisions
2. Follow DDD patterns when adding new features
3. Write tests for new functionality
4. Submit a pull request with a clear description

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Resources

### Architecture Documentation
- [ADR Documentation](./docs/adr/)
- [DDD Implementation Guide](./docs/adr/009-adopt-domain-driven-design-structure.md)
- [Authentication Strategy](./docs/adr/_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
- [Auth Implementation (Amendment)](./docs/adr/004-magic-link-authentication-amendment.md)
- [Storage Strategy (Amendment)](./docs/adr/005-supabase-storage-amendment.md)
- [Supabase Integration](./docs/adr/002-use-supabase-for-backend-and-database.md)

### External References
- [Pretalx (Reference CfP Platform)](https://pretalx.com/)
- [Auth0 Documentation](https://auth0.com/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Review existing ADRs for architectural context
- Check the [docs](./docs/) for detailed information

---

## 🎯 Quick Start Guide

### For New Developers

1. **Read ADR-009**: Understand the DDD architecture
2. **Read ADR-002b**: Understand authentication strategy
3. **Set up environment**: Follow installation instructions above
4. **Run tests**: `npm test` to verify setup
5. **Start coding**: Follow DDD patterns in existing code

### For Technical Decision Makers

1. **Review ADR-002 Amendment**: Understand vendor abstraction benefits
2. **Review ADR-004 Amendment**: Auth implementation details
3. **Review ADR-005 Amendment**: Storage implementation details
4. **Consider trade-offs**: Speed vs. flexibility, vendor lock-in vs. development time

---

**Last Updated**: 2026-06-11
**Maintained By**: Technical Team
