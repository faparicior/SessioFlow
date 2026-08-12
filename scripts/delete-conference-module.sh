#!/usr/bin/env bash
#
# delete-conference-module.sh
#
# Removes the conference module, its source code, tests, docs, migration,
# and all workspace/dependency references.
#
# Usage: bash scripts/delete-conference-module.sh [--dry-run]
#   --dry-run : Only print what would be deleted/changed (default: destructive)

set -e
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

if [[ "$DRY_RUN" != "true" ]]; then
  echo "⚠️  This will DELETE files and modify configs."
  read -r -p "Continue? [y/N] " confirm
  if [[ "$confirm" != [yY]* ]]; then
    echo "Aborted."
    exit 0
  fi
fi

log()  { echo "[delete-conference] $*"; }
skip() { echo "[skip     ] $*"; }
dry()  { echo "[dry-run] $*"; }

# ── 1. Directories / files to delete ──────────────────────────────────────
DELETE_PATHS=(

  # Source module
  "$ROOT/packages/modules/conference/src"

  # Build artifacts & dist (will also be cleaned by npm, but explicit)
  "$ROOT/packages/modules/conference/dist"
  "$ROOT/packages/modules/conference/tsconfig.tsbuildinfo"

  # Package manifest (keep .gitignore for reference)
  "$ROOT/packages/modules/conference/package.json"

  # API definitions
  "$ROOT/packages/api-definitions/src/types/conference.ts"
  "$ROOT/packages/api-definitions/src/zod/conference.ts"

  # App frontend sources
  "$ROOT/apps/frontend/src/app/conferences"
  "$ROOT/apps/frontend/src/modules/conference"
  "$ROOT/apps/frontend/src/app/api/v1/conferences"

  # App backend sources
  "$ROOT/apps/backend/src/interfaces/api/v1/conferences"

  # Unit tests
  "$ROOT/tests/unit/modules/conference"

  # Frontend component tests
  "$ROOT/tests/unit/apps/frontend/modules/conference"

  # Backend API tests
  "$ROOT/tests/backend/modules/conference"

  # Integration tests
  "$ROOT/tests/integration/modules/conference"

  # E2E tests
  "$ROOT/tests/e2e/conference-setup.spec.ts"

  # Database migration
  "$ROOT/drizzle/0000_create_conferences_table.sql"

  # Documentation - delete plan and feature, keep the flow
  "$ROOT/docs/product/bounded-contexts/conference/flows/journey-01-setup-conference-plan.md"
  "$ROOT/docs/product/bounded-contexts/conference/flows/features"

  # Build cache
  "$ROOT/packages/modules/conference/.turbo"
)

# ── 2. File paths to remove from package.json dependencies ────────────────
# (handled in place-edit step below)

# ── Step 1: Delete files and directories ──────────────────────────────────
for path in "${DELETE_PATHS[@]}"; do
  if [[ -e "$path" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      dry "DELETE: $path"
    else
      log "DELETE: $path"
      rm -rf "$path"
    fi
  else
    skip "SKIP (not found): $path"
  fi
done

# ── Step 2: Remove conference references from package.json files ──────────
PKG_FILES=(
  "$ROOT/apps/backend/package.json"
  "$ROOT/apps/frontend/package.json"
)

for pkg_file in "${PKG_FILES[@]}"; do
  if [[ -f "$pkg_file" ]]; then
    if [[ "$DRY_RUN" == "true" ]]; then
      dry "REMOVE DEPENDENCY: @sessioflow/conference in $pkg_file"
    else
      log "REMOVE DEPENDENCY: @sessioflow/conference in $pkg_file"
      # Remove the dependency line (including the trailing comma if needed)
      local_tmp=$(mktemp)
      sed '/@sessioflow\/conference/d' "$pkg_file" > "$local_tmp"
      mv "$local_tmp" "$pkg_file"
      # Re-format if prettier is available
      if command -v npx &>/dev/null; then
        npx --yes prettier --write "$pkg_file" 2>/dev/null || true
      fi
    fi
  fi
done

# ── Step 3: Remove conference references from tsconfig.json ───────────────
TC="$ROOT/tsconfig.json"
if [[ -f "$TC" ]]; then
  if [[ "$DRY_RUN" == "true" ]]; then
    dry "REMOVE PATH MAPPING: @sessioflow/conference references in $TC"
  else
    log "REMOVE PATH MAPPING: @sessioflow/conference references in $TC"
    local_tmp=$(mktemp)
    # Remove lines containing @sessioflow/conference mappings (paths and references)
    sed '/@sessioflow\/conference/d' "$TC" > "$local_tmp"
    mv "$local_tmp" "$TC"
  fi
fi

# ── Step 4: Check if any other modules still import from conference ───────
if [[ "$DRY_RUN" == "true" ]]; then
  dry "CHECKING remaining imports to conference..."
  grep -rn "@sessioflow/conference" "$ROOT/apps" "$ROOT/packages" --include="*.ts" --include="*.tsx" \
    --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
    2>/dev/null || dry "No remaining imports found."
else
  if grep -rn "@sessioflow/conference" "$ROOT/apps" "$ROOT/packages" --include="*.ts" --include="*.tsx" \
     --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=dist \
     2>/dev/null; then
    log "WARNING: Some files still reference @sessioflow/conference — review manually."
  else
    log "OK: No remaining @sessioflow/conference imports found."
  fi
fi

# ── Done ──────────────────────────────────────────────────────────────────
if [[ "$DRY_RUN" == "true" ]]; then
  echo ""
  echo "DRY RUN — no files were changed."
  echo "Run again without --dry-run to apply."
else
  echo ""
  log "Done. Clean up build caches with: npm run build --if-present"
fi
