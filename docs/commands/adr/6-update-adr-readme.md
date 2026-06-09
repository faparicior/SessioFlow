# Update ADR README Index

This document provides instructions for updating the `docs/adr/README.md` index when new ADRs are created or existing ADRs are modified.

---

## Why Update the README

The `docs/adr/README.md` serves as the central index and quick reference for all architectural decisions. Keeping it updated ensures:

- **Discoverability**: Team members can quickly find all ADRs
- **Overview**: Provides a high-level view of architectural decisions
- **Navigation**: Easy access to specific decisions by topic
- **Statistics**: Tracks ADR count and categories

---

## When to Update

Update the README.md whenever:

✅ **New ADR is created** - Add to the Quick Reference table and appropriate category
✅ **ADR status changes** - Update status in the table
✅ **ADR is superseded** - Update superseded ADRs and note the replacement
✅ **Categories are reorganized** - Update category sections
✅ **Statistics change** - Update total count and date ranges

---

## Manual Update Process

### Step 1: Add to Quick Reference Table

Locate the Quick Reference table in `docs/adr/README.md` and add the new ADR:

```markdown
| # | Decision | Status | Date |
|---|----------|--------|------|
| [001](001-use-nextjs-as-frontend-framework.md) | Use Next.js as Frontend Framework | Proposed | 2026-06-05 |
| [002](002-use-supabase-for-backend-and-database.md) | Use Supabase for Backend and Database | Proposed | 2026-06-05 |
| ...
| [015](015-new-decision-name.md) | New Decision Title | Proposed | 2026-XX-XX |  ← Add this line
```

**Format:**
- **Number**: Next sequential number in brackets with link to file
- **Decision**: Descriptive title (sentence case)
- **Status**: Current status (Proposed, Accepted, Deprecated, Superseded)
- **Date**: Creation date in YYYY-MM-DD format

### Step 2: Add to Category Section

Identify the appropriate category and add the ADR:

```markdown
### Core Technology Stack
- **001** - Frontend Framework: Next.js
- **002** - Backend/Database: Supabase
- **015** - [Category]: Brief description  ← Add this line
```

**Category Guidelines:**

| Category | When to Use |
|----------|-------------|
| **Core Technology Stack** | Frameworks, languages, libraries |
| **Infrastructure & Deployment** | Hosting, containers, CI/CD |
| **Data & Storage** | Databases, file storage, caching |
| **API Design** | API patterns, protocols, documentation |
| **Authentication** | Auth methods, security, identity |
| **Development Practices** | Testing, code quality, workflows |

### Step 3: Update Statistics

Update the Statistics section at the bottom:

```markdown
## Statistics

- **Total ADRs**: 15  ← Update count
- **Date Range**: 2026-06-05 to 2026-06-XX  ← Update range if needed
- **Most Active Category**: Core Technology Stack (5 decisions)  ← Update if needed
```

### Step 4: Update Last Updated Date

```markdown
---

**Last Updated**: 2026-06-09  ← Update to current date
**Maintained By**: Technical Team
```

---

## Automated Update Script

For convenience, you can use this Node.js script to automatically update the README:

```bash
# Create the script
cat > scripts/update-adr-readme.js << 'EOF'
const fs = require('fs');
const path = require('path');

const ADR_DIR = path.join(__dirname, '..', 'docs', 'adr');
const README_PATH = path.join(ADR_DIR, 'README.md');

// Get all ADR files
const adrFiles = fs.readdirSync(ADR_DIR)
  .filter(file => file.match(/^\d{3}-.*\.md$/))
  .sort();

// Parse ADR metadata
function parseADR(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const titleMatch = content.match(/^# (\d+)-.*$/m);
  const statusMatch = content.match(/\*\*Status:\*\* (\w+)/i);
  const dateMatch = content.match(/\*\*Date:\*\* (\d{4}-\d{2}-\d{2})/i);
  
  return {
    id: titleMatch ? titleMatch[1] : '000',
    title: filePath.replace(/^\d{3}-/, '').replace(/\.md$/, ''),
    status: statusMatch ? statusMatch[1] : 'Unknown',
    date: dateMatch ? dateMatch[1] : 'Unknown',
    filename: filePath
  };
}

// Generate Quick Reference table
function generateTable(adrs) {
  let table = '| # | Decision | Status | Date |\n';
  table += '|---|----------|--------|------|\n';
  
  adrs.forEach(adr => {
    table += `| [${adr.id}](docs/adr/${adr.filename}) | ${formatTitle(adr.title)} | ${adr.status} | ${adr.date} |\n`;
  });
  
  return table;
}

function formatTitle(title) {
  return title.replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Read existing README
let readme = fs.readFileSync(README_PATH, 'utf8');

// Replace Quick Reference table
const tableStart = readme.indexOf('| # | Decision | Status | Date |');
const tableEnd = readme.indexOf('|---|----------|--------|------|') + 30;
const nextSection = readme.indexOf('\n## ADR Categories', tableEnd);

if (tableStart !== -1 && nextSection !== -1) {
  const newTable = generateTable(adrs.map(parseADR));
  readme = readme.substring(0, tableStart) + newTable + readme.substring(nextSection);
}

// Update statistics
const totalMatch = readme.match(/\*\*Total ADRs:\*\* (\d+)/);
if (totalMatch) {
  readme = readme.replace(totalMatch[0], `**Total ADRs**: ${adrs.length}`);
}

// Update last updated date
const today = new Date().toISOString().split('T')[0];
const dateMatch = readme.match(/\*\*Last Updated\*\*: .+/);
if (dateMatch) {
  readme = readme.replace(dateMatch[0], `**Last Updated**: ${today}`);
}

// Write updated README
fs.writeFileSync(README_PATH, readme);

console.log(`✅ Updated README with ${adrs.length} ADRs`);
console.log(`📅 Last updated: ${today}`);
EOF

# Run the script
node scripts/update-adr-readme.js
```

---

## Update Examples

### Example 1: Adding ADR-015

**Before:**
```markdown
| # | Decision | Status | Date |
|---|----------|--------|------|
| [014](014-use-shadcn-ui-for-components.md) | Use shadcn-ui for Components | Proposed | 2026-06-05 |
```

**After:**
```markdown
| # | Decision | Status | Date |
|---|----------|--------|------|
| [014](014-use-shadcn-ui-for-components.md) | Use shadcn-ui for Components | Proposed | 2026-06-05 |
| [015](015-implement-graphql-api.md) | Implement GraphQL API | Proposed | 2026-06-10 |
```

### Example 2: Updating Status

**Before:**
```markdown
| [001](001-use-nextjs-as-frontend-framework.md) | Use Next.js as Frontend Framework | Proposed | 2026-06-05 |
```

**After:**
```markdown
| [001](001-use-nextjs-as-frontend-framework.md) | Use Next.js as Frontend Framework | **Accepted** | 2026-06-05 |
```

### Example 3: Adding New Category

If you have ADRs that don't fit existing categories:

```markdown
### Monitoring & Observability  ← New category
- **016** - Logging: Winston
- **017** - Monitoring: DataDog
```

---

## Quality Checklist

Before committing README updates:

- [ ] Quick Reference table includes all ADRs
- [ ] ADRs are sorted by number
- [ ] All links are valid
- [ ] Status values are consistent
- [ ] Date format is YYYY-MM-DD
- [ ] Categories are logical and non-overlapping
- [ ] Statistics match actual ADR count
- [ ] Last Updated date is current

---

## Related Documents

- [ADR Workflow](0-ADR-WORKFLOW.md) - Overall ADR process
- [Generate ADRs](1-generate-adrs-from-inception.md) - Creating new ADRs
- [ADR Structure](../../adr/STRUCTURE.md) - ADR organization guidelines

---

**Last Updated**: 2026-06-09
