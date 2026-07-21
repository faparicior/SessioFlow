# ADR-024: Finish Turbo Setup with Compiled Package Outputs

* **Status:** Proposed
* **Date:** 2026-07-21
* **Decision Makers:** Fernando (Lead Developer)
* **Amends:** [ADR-023](./023-superseat-009-01-monorepo-backend-frontend-separation.md)

## Context and Problem Statement

The monorepo uses Turborepo to orchestrate tasks across packages and apps. However, the setup is currently **half-done**: packages export raw `.ts` source files directly instead of compiled output. This creates two concrete problems:

### Problem 1: XO cannot resolve types from workspace packages

XO (ESLint) creates its own TypeScript program from each app's `tsconfig.json`. When it follows an import like:

```ts
import {ConferenceName} from '@sessioflow/conf-module/domain/conference-name';
```

It hits a raw `.ts` file that needs to be compiled in the context of the full build graph — something XO's isolated TypeScript program cannot do under `moduleResolution: bundler`. The type comes back as the synthetic `error` type, causing the entire `@typescript-eslint/no-unsafe-*` rule family to fire on every usage. These are false positives, not real type errors.

**Current workaround:** The entire `no-unsafe-*` family is disabled in both `apps/frontend/xo.config.ts` and `apps/backend/xo.config.ts` with the comment:

> "XO's TS program can't fully resolve workspace package imports under moduleResolution:bundler, producing spurious 'error'-typed values."

This workaround silences real potential bugs alongside the false positives.

### Problem 2: `"dependsOn": ["^build"]` in turbo.json does nothing

The root `turbo.json` declares:

```json
"lint": { "dependsOn": ["^build"] },
"typecheck": { "dependsOn": ["^build"] }
```

This means: "before linting/typechecking a package, build its dependencies first." But none of the workspace packages have a `build` script. Turbo silently skips the dependency step, so lint and typecheck run without any guarantee that upstream packages are up to date.

### Root cause

Both problems have the same cause: packages export source files, not compiled output.

```json
// Current — raw source export
"exports": {
  "./domain/*": "./src/domain/*.ts"
}
```

XO can't resolve `.ts` exports across package boundaries. Turbo has nothing to build.

## Considered Options

### Option A: Add build scripts to packages, export from `dist/` (Recommended)

Each package gets:
- A `build` script: `tsc -p tsconfig.json`
- `outDir: dist` and `composite: true` in its tsconfig
- Exports pointing to `dist/` `.js` files with `.d.ts` declarations alongside

Turbo's `^build` chain becomes real. XO follows imports to `.d.ts` files and resolves types correctly.

### Option B: TypeScript Project References, drop Turbo

Use native `tsc --build` with `"composite": true` and `references` in each tsconfig. Simpler toolchain, but loses Turbo's remote cache, parallel task execution, and cross-task orchestration (lint, test). Given that the project expects more collaborators, remote cache becomes valuable.

### Option C: Keep current setup, leave `no-unsafe-*` disabled

Zero migration effort. Works today. But the type safety gap grows as more packages and features are added, and the `^build` no-op continues to give false confidence.

## Decision Outcome

**Chosen Option: A — Add build scripts to packages, export from `dist/`.**

This is the standard Turbo pattern and completes the setup that was already started. It fixes both problems at their root rather than working around them.

### Changes required

**1. Each package tsconfig adds `outDir` and `composite`:**

```json
{
  "extends": "../../config/tsconfig/base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true
  },
  "include": ["src/**/*"]
}
```

**2. Each package gets a `build` script:**

```json
"scripts": {
  "build": "tsc -p tsconfig.json",
  "typecheck": "tsc --noEmit"
}
```

**3. Package exports point to `dist/`:**

```json
"exports": {
  "./domain/*": "./dist/domain/*.js"
}
```

**4. `dist/` added to each package's `.gitignore`.**

**5. `no-unsafe-*` rules re-enabled in both XO configs** once type resolution works correctly.

**6. `turbo.json` adds `dist/**` to build outputs** so Turbo caches compiled packages:

```json
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
}
```

### Affected packages

| Package | Has build today | After change |
|---------|----------------|--------------|
| `@sessioflow/shared-database` | No | `tsc → dist/` |
| `@sessioflow/shared-logging` | No | `tsc → dist/` |
| `@sessioflow/api-definitions` | No | `tsc → dist/` |
| `@sessioflow/conf-module` | No | `tsc → dist/` |
| `@sessioflow/frontend` | No | `tsc → dist/` |
| `apps/backend` | No (noEmit) | Unchanged — app, not a package |
| `apps/frontend` | No (noEmit) | Unchanged — Next.js handles this |

## Consequences

### Positive
- `no-unsafe-*` lint rules can be re-enabled — real `any` propagation is caught again
- `"dependsOn": ["^build"]` in turbo.json becomes meaningful
- Turbo can cache compiled package output across developers and CI
- `turbo lint` and `turbo typecheck` are guaranteed to run against up-to-date package types
- Type errors in packages surface before apps are checked

### Negative
- `dist/` directories must be gitignored and regenerated on `npm install` / `turbo build`
- Adds a build step for packages that didn't have one — contributors must run `turbo build` before `turbo lint` on a fresh clone
- Package exports need updating whenever new entry points are added

### Risks
- ⚠️ `postinstall` must trigger `turbo build` for packages, or contributors will hit confusing "module not found" errors on a fresh clone
- ⚠️ `moduleResolution: bundler` in the base tsconfig may require switching packages to `"moduleResolution": "node16"` for `tsc` to emit correctly — needs verification during implementation

## Related ADRs

* [ADR-023](./023-superseat-009-01-monorepo-backend-frontend-separation.md) — Monorepo structure this amends
* [ADR-013](./013-adopt-typescript-with-strict-mode.md) — TypeScript strict mode, motivates re-enabling `no-unsafe-*`

---

**Status:** PROPOSED

**Owner:** Fernando
**Implementation:** Pending approval of this ADR
