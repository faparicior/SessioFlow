# SessioFlow

A Call-for-Papers (CfP) platform built with Next.js, designed to help organizers manage events, proposals, and speaker scheduling.

---

## 📚 Documentation

### Architecture Decision Records (ADRs)

Key decisions that shape the SessioFlow architecture:

| ADR | Status | Description |
|-----|--------|-------------|
| [ADR-002](./docs/adr/002-use-supabase-for-backend-and-database.md) | Proposed | Use Supabase for Backend and Database |
| [ADR-002a](./docs/adr/_to-discuss/002a-supabase-vendor-lock-in-alternatives.md) | Under Discussion | Supabase Vendor Lock-in and Self-Hosted Alternatives |
| [ADR-002b](./docs/adr/_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md) | Under Discussion | Authentication Strategy and Vendor Abstraction with DDD |
| [ADR-002-Amendment](./docs/adr/002-supabase-backend-amendment-ddd-abstraction.md) | Proposed | Amendment: DDD Abstraction Layer for Vendor Independence |
| [ADR-009](./docs/adr/009-adopt-domain-driven-design-structure.md) | Proposed | Adopt Domain-Driven Design (DDD) Structure |

**Latest Decisions:**
- **Authentication Strategy (ADR-002b)**: Implement DDD ports & adapters pattern for vendor-agnostic authentication
- **DDD Architecture (ADR-009)**: Adopt Domain-Driven Design structure for long-term maintainability
- **Hybrid Approach (ADR-002 Amendment)**: Consider Supabase Database + Auth0 + DDD abstraction for MVP

---

## 🏗️ Project Structure

SessioFlow follows Domain-Driven Design (DDD) principles:

```
src/
├── domains/                    # Domain layer (business logic)
│   ├── auth/                   # Authentication bounded context
│   │   ├── entities/           # User, Session
│   │   ├── value-objects/      # UserId, Email, Role
│   │   ├── services/           # Auth rules, validation
│   │   └── repositories/       # IAuthProvider interface
│   ├── event/                  # Event bounded context
│   ├── submission/             # Submission bounded context
│   ├── review/                 # Review bounded context
│   └── scheduling/             # Scheduling bounded context
│
├── application/                # Application layer (use cases)
│   ├── auth/                   # Login, logout, get-current-user
│   ├── event/                  # Create-event, publish-cfp
│   ├── submission/             # Submit-proposal, get-submission
│   ├── review/                 # Assign-reviewers, submit-review
│   └── scheduling/             # Generate-schedule, detect-conflicts
│
├── infrastructure/             # Infrastructure layer (implementations)
│   ├── database/               # Repository implementations
│   └── external/               # External services (Auth0, NextAuth, etc.)
│
└── interfaces/                 # Interface layer (entry points)
    ├── web/                    # Next.js pages and components
    └── api/                    # API endpoints
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase or self-hosted)
- **Authentication**: Auth0 / NextAuth (swappable via DDD abstraction)
- **Storage**: Supabase Storage / Cloudflare R2 (swappable via DDD abstraction)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Architecture**: Domain-Driven Design (DDD)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Supabase or self-hosted)
- Auth provider (Auth0, NextAuth, or custom)

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

# Storage (if using Cloudflare R2)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
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
interface IAuthProvider {
  login(credentials): Promise<User>;
  logout(token): Promise<void>;
  getCurrentUser(token): Promise<User | null>;
}

// Infrastructure implements the contract
class Auth0Provider implements IAuthProvider { ... }
class NextAuthProvider implements IAuthProvider { ... }

// Application uses only the interface
class LoginUseCase {
  constructor(private provider: IAuthProvider) {}
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

- [ADR Documentation](./docs/adr/)
- [DDD Implementation Guide](./docs/adr/009-adopt-domain-driven-design-structure.md)
- [Authentication Strategy](./docs/adr/_to-discuss/002b-supabase-auth-strategy-ddd-abstraction.md)
- [Supabase Integration](./docs/adr/002-use-supabase-for-backend-and-database.md)
- [Pretalx (Reference CfP Platform)](https://pretalx.com/)

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Review existing ADRs for architectural context
- Check the [docs](./docs/) for detailed information
