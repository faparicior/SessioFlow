# Migration Checklist: Monorepo Structure

This checklist ensures all changes from monolithic `src/` to `apps/backend/` and `apps/frontend/` are complete and working.

## ✅ Pre-Migration (Completed)

- [x] ADR-009-01 created and approved
- [x] ADR-009-01 added to README.md
- [x] Documentation updated with new structure
- [x] Root `src/` moved to `src_backup/`
- [x] Code split into `apps/backend/` and `apps/frontend/`

## ✅ Infrastructure Setup

- [x] `apps/backend/package.json` created
- [x] `apps/frontend/package.json` created
- [x] `apps/backend/tsconfig.json` with `@backend/*` paths
- [x] `apps/frontend/tsconfig.json` with `@frontend/*` paths
- [x] Root `package.json` with workspaces configured
- [x] `vitest.config.ts` updated for monorepo paths

## ✅ Code Files Moved

### Backend (`apps/backend/src/`)
- [x] `modules/conference/domain/`
- [x] `modules/conference/application/`
- [x] `modules/conference/infrastructure/`
- [x] `modules/conference/interfaces/api/`
- [x] `shared/` (backend utilities)

### Frontend (`apps/frontend/src/`)
- [x] `modules/conference/interfaces/web/`
- [x] `components/`
- [x] `app/` (Next.js pages)
- [x] `lib/utils.ts`

## ✅ Tests Updated

- [x] All unit tests import from `@backend/modules/`
- [x] Architecture test `ddd-boundaries.test.ts` updated for new paths
- [x] API tests updated (if needed)
- [x] E2E tests checked (no backend imports)
- [x] Vitest config updated

## ✅ CI/CD (Future)

- [ ] GitHub Actions updated to build and test both apps
- [ ] Docker Compose multi-service setup (if needed)
- [ ] Separate deployment pipelines for backend/frontend

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Run backend (Node)
npm run dev:backend

# Run frontend (Next.js on port 3000)
npm run dev:frontend

# Run all tests
npm run test

# Run architecture tests
npm run test:architecture

# Build frontend
npm run build:frontend

# Build backend
npm run build:backend
```

## 🔍 Verification

1. **Frontend builds:**
   ```bash
   npm run build:frontend
   ```

2. **Backend starts:**
   ```bash
   npm run dev:backend
   ```

3. **Tests pass:**
   ```bash
   npm run test
   ```

4. **Architecture tests pass:**
   ```bash
   npm run test:architecture
   ```

## 🚨 If Issues Occur

1. **Import resolution errors:**
   - Check `tsconfig.json` `paths` configuration
   - Verify `vitest.config.ts` alias paths

2. **Dependency conflicts:**
   - Use `npm install` in each app separately if needed

3. **Test failures:**
   - Check package.json scripts use correct workspace
   - Verify test imports match new directory structure

## 🔖 Future Migration Steps

When ready to swap backend stack to Go/Kotlin:

1. **Keep** `apps/frontend/` unchanged
2. **Replace** `apps/backend/src/` with new stack implementation
3. **Keep** API contracts (`interfaces/api/`) compatible (use versioned routes)
4. **Run** frontend against new backend

**Estimated migration time: 8-14 hours** (per ADR-009-01)
