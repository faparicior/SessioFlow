# SessioFlow Scaffold Plan

## Overview
Minimal base scaffolding for SessioFlow to get the development server running. This plan covers ONLY the foundational setup without implementing features or database migrations.

**Status**: Ready for Implementation  
**Date**: 2026-03-18  
**Version**: 1.0.0

---

## Technical Decisions

### Version Selection
- **Next.js**: 16.2.0 (latest stable)
- **React**: 19.2.4 (latest stable)
- **TypeScript**: Latest
- **Node.js**: ^20.0.0 required

### Tooling Stack
- **Linting**: XO (strongly opinionated, replaces ESLint)
- **Formatter**: Prettier (via xo-config-prettier)
- **UI Framework**: shadcn/ui (default theme)
- **Database Client**: @supabase/supabase-js
- **Testing**: Vitest + Playwright (framework only)
- **Pre-commit Hooks**: Husky

---

## What's Included (Minimal Scope)

### ✅ In Scope
1. Next.js 16.2.0 project with TypeScript + Tailwind + App Router
2. XO linting configured with xo-config-prettier
3. Husky pre-commit hook (runs `xo --fix`)
4. shadcn/ui initialized with minimal components (button, input, label)
5. Supabase client utilities (browser + server)
6. Base pages: root `page.tsx`, `layout.tsx`, `globals.css`
7. Basic components: Header, Footer
8. ADR-013: Linting Strategy documentation
9. .gitignore and .env.example
10. Vitest + Playwright configuration (no tests)

### ❌ Out of Scope (Deferred)
- Database migrations
- Authentication implementation
- Feature scaffolding (events, proposals, profiles)
- Form validation schemas
- Server actions
- API routes
- Supabase Edge Functions
- Complex UI components

---

## Implementation Phases

### Phase 1: Next.js Project Initialization

**Command**:
```bash
npx create-next-app@16.2.0 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**What This Creates**:
- Next.js 16.2.0 with App Router
- TypeScript configuration
- Tailwind CSS setup
- ESLint (temporarily, will replace with XO)
- src/ directory structure
- Absolute imports (@/*)

**Files Modified**:
- `package.json` - Scripts and dependencies
- `tsconfig.json` - Path aliases
- `tailwind.config.ts` - Basic configuration
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - Tailwind imports

---

### Phase 2: Linting Setup (XO)

**Commands**:
```bash
npm install -D xo xo-config-prettier eslint-config-xo xoxo-cli
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-next  # Remove Next.js ESLint
```

**Configuration**:
- File: `.xo-config.json`
- Extends: xo-prettier
- Rules:
  - Single quotes
  - Semicolons required
  - 100 character line width
  - Trailing commas in objects/arrays

**Husky Setup**:
```bash
npx husky init
# Edit .husky/pre-commit to add:
npx xo --fix
```

**Files Created**:
- `.xo-config.json` - XO configuration
- `.husky/pre-commit` - Git hook
- `.prettierignore` - Ignore patterns

---

### Phase 3: shadcn/ui Foundation

**Command**:
```bash
npx shadcn@latest init -d
```

**Minimal Components**:
```bash
npx shadcn@latest add button input label
```

**Files Created**:
- `src/components/ui/button.tsx` - Button component
- `src/components/ui/input.tsx` - Input component
- `src/components/ui/label.tsx` - Label component
- `src/lib/utils.ts` - Utility (cn function)
- `components.json` - shadcn config

---

### Phase 4: Supabase Client Setup

**Files Created**:
- `src/lib/supabase/client.ts` - Browser client
- `src/lib/supabase/server.ts` - Server client
- `.env.example` - Environment variables template

**Code Structure**:
```typescript
// client.ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { cookieStore.setAll(cookiesToSet) }
      }
    }
  )
}
```

---

### Phase 5: Base Application Structure

#### Root Layout (`src/app/layout.tsx`)
- Font optimization (Inter or similar)
- Metadata for SessioFlow
- Supabase provider setup (optional, for now minimal)

#### Homepage (`src/app/page.tsx`)
- Simple welcome message: "SessioFlow - Call for Papers Platform"
- Call-to-action button (linking to login placeholder)

#### Header Component (`src/components/shared/header.tsx`)
- Logo/Title
- Navigation links (Login, Get Started)
- Responsive design ready

#### Footer Component (`src/components/shared/footer.tsx`)
- Copyright notice
- Links placeholders (About, Contact, etc.)

---

### Phase 6: Testing Framework Setup

**Commands**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
npx playwright install
```

**Configuration**:
- `tests/setup.ts` - Vitest setup file
- `vitest.config.ts` - Vitest config
- `playwright.config.ts` - Playwright config

**Scripts Added**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "xo",
    "lint:fix": "xo --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

### Phase 7: Documentation

#### ADR-013: Linting Strategy

**File**: `docs/adr/013-use-xo.md`

**Content**:
- Context: Need for opinionated linting in MVP
- Considered options: ESLint+Prettier, Biome, Oxlint, XO
- Decision: XO for simplicity and speed
- Configuration details
- Integration with pre-commit hooks
- Rules enforced

#### .gitignore

**File**: `.gitignore`

**Includes**:
- node_modules/
- .next/
- .env.local
- Coverage files
- Editor configs (VS Code, IDEA)
- Supabase files
- OS files (DS_Store)

---

## Final File Structure

```
sessioflow/
├── .env.example                    # Environment template
├── .gitignore                      # Standard ignores
├── .prettierignore                 # Prettier ignores
├── .xo-config.json                 # XO configuration
├── .husky/
│   └── pre-commit                  # Linting hook
├── docs/
│   └── adr/
│       └── 013-use-xo.md           # Linting ADR
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   └── globals.css             # Tailwind + shadcn
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser client
│   │   │   └── server.ts           # Server client
│   │   └── utils.ts                # cn utility
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx          # shadcn button
│   │   │   ├── input.tsx           # shadcn input
│   │   │   └── label.tsx           # shadcn label
│   │   └── shared/
│   │       ├── header.tsx          # Site header
│   │       └── footer.tsx          # Site footer
│   └── types/
│       └── global.d.ts             # Global types
├── tests/
│   ├── setup.ts                    # Vitest setup
│   └── utils.ts                    # Test helpers
├── package.json                    # Scripts and deps
├── tsconfig.json                   # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── vitest.config.ts                # Vitest config
├── playwright.config.ts            # Playwright config
└── components.json                 # shadcn config
```

---

## Execution Steps

1. Create ADR-013 file
2. Create .gitignore file
3. Initialize Next.js project
4. Install all dependencies
5. Create .xo-config.json
6. Initialize Husky
7. Initialize shadcn/ui
8. Install Supabase client
9. Create Supabase client utilities
10. Create base pages and components
11. Create .env.example
12. Configure testing
13. Final cleanup and validation

---

## Validation Checklist

Before considering scaffolding complete:

- [ ] `npm run dev` starts without errors
- [ ] Homepage loads at localhost:3000
- [ ] XO linting passes (`npm run lint`)
- [ ] TypeScript type checking passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] .env.example exists with placeholder values
- [ ] All commits can be staged (Husky hook works)

---

## Future Work (Out of Scope)

These will be implemented in subsequent iterations:

1. **Authentication**: Magic link login flow
2. **Database**: Supabase migrations for users, events, proposals
3. **Features**: Event wizard, proposal form, profile management
4. **API**: Server actions for CRUD operations
5. **Testing**: Actual test cases for features
6. **Deployment**: Vercel/Social deployment configuration
7. **Email**: SendGrid/Mailgun integration for magic links

---

## Success Criteria

The scaffolding is successful when:
1. Developer can clone and run `npm install && npm run dev`
2. Application loads at localhost:3000 with a working homepage
3. Linting passes on every commit
4. TypeScript compiles without errors
5. Code is ready for feature implementation
