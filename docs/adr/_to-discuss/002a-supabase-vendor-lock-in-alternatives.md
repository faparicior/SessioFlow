# 002a-Supabase Vendor Lock-in and Self-Hosted Alternatives

* **Status:** ✅ **ACCEPTED**
* **Date:** 2026-06-09
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** ADR-002 (Use Supabase for Backend and Database)
* **Amended By:** N/A

---

## Context and Problem Statement

ADR-002 selected Supabase as the backend solution for SessioFlow, citing benefits including rapid development, built-in authentication, file storage, and Row-Level Security (RLS). However, this decision introduces **vendor lock-in risks**:

1. **Migration Cost**: Moving away from Supabase requires significant refactoring of auth, storage, and database layers
2. **Limited Customization**: Supabase abstracts away authentication flows and storage logic, reducing control
3. **Pricing Changes**: Free tier limits or pricing changes could impact the $0/month MVP constraint
4. **Feature Limitations**: Custom business logic may be difficult to implement within Supabase's framework

**Question:** Can we achieve the same MVP goals with a self-hosted PostgreSQL solution that avoids vendor lock-in while maintaining the $0/month budget?

---

## Considered Alternatives

### Option 1: Continue with Supabase (Current Decision - ADR-002)

**What We Get:**
- Complete backend-as-a-service (database, auth, storage, RLS)
- $0/month free tier (500MB DB, 1GB storage, 50K users)
- Rapid development (hours vs weeks)
- Built-in Row-Level Security for GDPR compliance
- Self-hosting path available via Docker

**Vendor Lock-in Risks:**
- Supabase-specific APIs for auth and storage
- Migration requires rebuilding auth system, file handling, and RLS policies
- Limited customization of authentication flows
- File storage tied to Supabase ecosystem

---

### Option 2: Self-Hosted PostgreSQL + Custom Implementation

**What We Build:**

#### A. Multi-Tenancy with Row-Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfp_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Organizers can only view their own events
CREATE POLICY "organizers_can_view_own_events"
ON events FOR SELECT
USING (organizer_id = current_setting('app.current_user_id')::uuid);

-- Policy: Organizers can only create events for their own account
CREATE POLICY "organizers_can_create_events"
ON events FOR INSERT
WITH CHECK (organizer_id = current_setting('app.current_user_id')::uuid);

-- Policy: Cascade delete for child entities
CREATE POLICY "organizers_can_delete_own_events"
ON events FOR DELETE
USING (organizer_id = current_setting('app.current_user_id')::uuid);

-- Child entity policies
CREATE POLICY "cfp_configs_inherit_event_access"
ON cfp_configs FOR ALL
USING (
  event_id IN (
    SELECT id FROM events 
    WHERE organizer_id = current_setting('app.current_user_id')::uuid
  )
);
```

**Implementation Requirements:**
- Set `app.current_user_id` session variable from auth middleware on each request
- Test policies thoroughly (easy to make security mistakes)
- Maintain policies as schema evolves

#### B. Custom Authentication System

```typescript
// User registration with password hashing
async function register(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  
  await db.query(
    `INSERT INTO users (id, email, password_hash, created_at) 
     VALUES ($1, $2, $3, NOW())`,
    [userId, email, hashedPassword]
  );
  
  return userId;
}

// Login with JWT generation
async function login(email: string, password: string) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 AND active = true', [email]
  );
  
  if (rows.length === 0) {
    throw new Error('Invalid credentials');
  }
  
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  
  if (!valid) {
    throw new Error('Invalid credentials');
  }
  
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h', issuer: 'sessioflow' }
  );
  
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

// Middleware to set RLS context
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'sessioflow'
    });
    
    // Set session variable for RLS policies
    await db.query(
      "SELECT set_config('app.current_user_id', $1, true)",
      [decoded.userId]
    );
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

**What We Build:**
- Password hashing (bcrypt/argon2)
- JWT token generation and verification
- Session management
- Password reset email flows
- Email verification
- OAuth integrations (Google, GitHub, etc.)

#### C. File Storage Solutions

**Option C1: MinIO (S3-compatible, self-hosted)**

```bash
# Docker Compose for MinIO
version: '3'
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: sessioflow-admin
      MINIO_ROOT_PASSWORD: secure-password-here
    volumes:
      - minio-data:/data
    command: server /data --console-address ":9001"

volumes:
  minio-data:
```

```typescript
// MinIO client integration
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Upload event logo
async function uploadEventLogo(eventId: string, file: Buffer, mimetype: string) {
  const filename = `${eventId}/logo.${mimetype.split('/')[1]}`;
  
  await minioClient.putObject(
    'events-bucket',
    filename,
    file,
    { 'Content-Type': mimetype }
  );
  
  return `https://storage.sessioflow.app/events-bucket/${filename}`;
}

// Generate presigned URL for secure download
async function getLogoUrl(eventId: string) {
  const filename = `${eventId}/logo.jpg`;
  const url = await minioClient.presignedGetObject(
    'events-bucket',
    filename,
    3600 // 1 hour expiry
  );
  
  return url;
}
```

**Option C2: Local Filesystem (Simplest)**

```typescript
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

async function uploadLocalFile(userId: string, file: Buffer, extension: string) {
  const filename = `${userId}_${crypto.randomBytes(16).toString('hex')}.${extension}`;
  const filepath = path.join(process.env.UPLOADS_DIR, 'profiles', filename);
  
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  await fs.writeFile(filepath, file);
  
  return `/uploads/profiles/${filename}`;
}
```

**What We Build:**
- File upload/download endpoints
- Image validation (type, size limits)
- Image processing (resizing, thumbnails)
- CDN integration for performance
- Backup strategy
- Storage quota enforcement

#### D. Database Schema with Constraints

```sql
-- Core tables with multi-tenant constraints
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'organizer',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cfp_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Indexes for performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_cfp_configs_event ON cfp_configs(event_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfp_configs ENABLE ROW LEVEL SECURITY;
```

---

## Decision Outcome

### Comparison Matrix

| Aspect | Supabase (Option 1) | Self-Hosted PostgreSQL (Option 2) |
|--------|---------------------|-----------------------------------|
| **Development Time** | 1-2 weeks (built-in) | 4-6 weeks (build everything) |
| **Initial Cost** | $0/month | $0-5/month (VPS) |
| **Ongoing Maintenance** | Supabase handles it | You handle backups, updates, security |
| **Vendor Lock-in** | High (Supabase APIs) | None (standard PostgreSQL) |
| **Multi-tenancy** | Built-in RLS | Custom RLS policies (see above) |
| **Authentication** | Built-in (magic links, OAuth) | Custom JWT + bcrypt + OAuth |
| **File Storage** | Built-in (Supabase Storage) | MinIO or local filesystem |
| **Scalability** | Automatic | Manual (connection pooling, indexing) |
| **GDPR Compliance** | Supabase provides tools | You implement policies, data residency |
| **Customization** | Limited by Supabase features | Full control |
| **Migration Path** | Difficult (vendor-specific) | Easy (standard PostgreSQL) |
| **Team Expertise Required** | Low (BaaS) | High (DevOps, security, auth) |

---

### Recommended Hybrid Approach

For teams wanting to **avoid vendor lock-in** while **minimizing development time**, consider this hybrid:

```
┌─────────────────────────────────────────────────────────┐
│  SessioFlow Architecture (Hybrid)                      │
├─────────────────────────────────────────────────────────┤
│  Auth: Auth0 Free Tier (7,000 users, $0/month)         │
│  Database: Self-hosted PostgreSQL (Oracle Cloud Free)  │
│  Storage: Cloudflare R2 ($0/month up to 10GB)          │
│  RLS: Custom PostgreSQL policies                       │
│  Email: Resend Free Tier (100 emails/day)              │
└─────────────────────────────────────────────────────────┘
```

**Estimated Cost:** $0-5/month (depending on VPS choice)

**Benefits:**
- No vendor lock-in for database (standard PostgreSQL)
- Auth0 provides enterprise-grade authentication
- Cloudflare R2 has no egress fees
- Full control over data and schemas
- Modular: can replace any component independently

**Downsides:**
- Still need to integrate and maintain multiple services
- More complex deployment (multiple components)
- Auth0 has limited customization compared to self-built

---

## Consequences

### If We Choose Self-Hosted PostgreSQL:

**Positive:**
- ✅ No vendor lock-in; standard PostgreSQL everywhere
- ✅ Full control over authentication flows and security
- ✅ Can migrate to any PostgreSQL host (AWS RDS, Neon, PlanetScale, etc.)
- ✅ File storage is portable (MinIO is S3-compatible)
- ✅ Learning opportunity for team (auth, security, DevOps)

**Negative:**
- ❌ 4-6 weeks additional development time to build auth, storage, RLS
- ❌ Ongoing maintenance burden (security patches, backups, monitoring)
- ❌ Requires DevOps expertise (Docker, PostgreSQL tuning, scaling)
- ❌ Higher risk of security vulnerabilities (auth is hard to get right)
- ❌ Need to implement features Supabase provides out-of-box (real-time, edge functions)

**Risks:**
- Security vulnerabilities in custom auth implementation
- Data loss without proper backup strategy
- Performance issues without proper indexing and connection pooling
- Compliance gaps (GDPR, data residency) if not carefully designed

---

## Migration Path from Supabase to Self-Hosted

If we start with Supabase and migrate later:

### Phase 1: Abstraction Layer (2 weeks)
```typescript
// Create repository pattern to abstract data access
interface EventRepository {
  findById(id: string): Promise<Event | null>;
  findBySlug(slug: string): Promise<Event | null>;
  create(event: Event): Promise<Event>;
  update(event: Event): Promise<Event>;
  delete(id: string): Promise<void>;
}

// Supabase implementation
class SupabaseEventRepository implements EventRepository {
  async create(event: Event) {
    const { data } = await supabase.from('events').insert(event);
    return data;
  }
}

// PostgreSQL implementation
class PostgresEventRepository implements EventRepository {
  async create(event: Event) {
    const { rows } = await db.query(
      'INSERT INTO events (...) VALUES (...) RETURNING *',
      [event]
    );
    return rows[0];
  }
}
```

### Phase 2: Auth Migration (2 weeks)
- Implement custom JWT auth alongside Supabase Auth
- Migrate users gradually
- Deprecate Supabase Auth

### Phase 3: Storage Migration (1 week)
- Implement MinIO or S3-compatible storage
- Migrate files
- Switch to new storage provider

### Phase 4: Deprecate Supabase (1 week)
- Remove Supabase dependencies
- Test thoroughly
- Deploy self-hosted solution

**Total Migration Time:** 6 weeks (significant but manageable)

---

## Recommendations

### For MVP (6-week timeline, $0 budget):

**Stick with Supabase** because:
- Development time is critical for MVP validation
- Free tier is sufficient for MVP metrics (50K users, 500MB DB)
- Built-in features reduce security risks
- Can migrate later if product succeeds

### For Long-term Product (post-MVP):

**Consider hybrid or self-hosted** if:
- Product achieves product-market fit
- Need to customize auth flows significantly
- Require specific data residency compliance
- Want to avoid ongoing SaaS costs at scale

### For Teams with DevOps Expertise:

**Self-hosted PostgreSQL** is viable if:
- Team has PostgreSQL and security expertise
- Can dedicate 4-6 weeks to build auth and storage
- Have resources for ongoing maintenance
- Vendor lock-in is a critical concern

---

## Links

* [PostgreSQL Row-Level Security Documentation](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)
* [Supabase vs Self-Hosted Comparison](https://selfhost.dev/blog/10-best-supabase-alternatives-in-2026-ranked/)
* [Database Free Tier Comparison 2026](https://agentdeals.dev/database-free-tier-comparison-2026)
* [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
* [Auth0 Free Tier](https://auth0.com/pricing)
* [Cloudflare R2 Pricing](https://www.cloudflare.com/products/r2/)
* [Oracle Cloud Always Free](https://www.oracle.com/cloud/free/)

---

## Discussion Questions

1. **Is the 4-6 week development time for self-hosted acceptable given our 6-week MVP timeline?**
2. **Does vendor lock-in pose a real risk for an MVP, or is it a concern for later stages?**
3. **Does the team have the DevOps expertise to maintain a self-hosted solution?**
4. **Should we start with Supabase and migrate later, or build self-hosted from the start?**
5. **Are there specific compliance requirements that require self-hosting?**

---

## Decision

**Status:** ✅ **ACCEPTED**

**Approved By:** Technical Lead, Product Team  
**Approval Date:** 2026-06-25

**Decision:** Supabase PostgreSQL with DDD Abstraction Layer

**Rationale:**
1. **Speed to Market:** Supabase provides complete backend in 1-2 weeks vs 4-6 weeks for self-hosted
2. **Local Development:** Excellent support via Supabase CLI and Docker
3. **Cost:** $0/month free tier (500MB DB, 50K MAU, 1GB storage)
4. **Vendor Independence:** DDD abstraction reduces migration cost from 156-336 hours to 24-42 hours
5. **Internet Available:** Team can work with cloud services (not restricted to offline-only)

**Implementation Directive:**
- [x] Use Supabase PostgreSQL as primary database
- [x] Implement DDD abstraction layer for database access
- [x] Create repository interfaces for all data access
- [x] Document migration procedures to self-hosted PostgreSQL if needed
- [ ] Begin implementation of database abstraction
