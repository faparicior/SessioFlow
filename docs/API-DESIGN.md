# API Design Guidelines

SessioFlow follows RESTful API design principles with versioned endpoints.

## 📐 Design Principles

1. **RESTful conventions** - Use HTTP methods and status codes correctly
2. **Versioning** - All APIs prefixed with `/api/v1/`
3. **JSON format** - Request and response bodies use JSON
4. **Consistent naming** - Snake_case for JSON, camelCase for TypeScript
5. **Error handling** - Standardized error response format

## 🛣️ API Structure

### Base URL
```
/api/v1/
```

### Resource Naming

| Resource | Endpoint |
|----------|----------|
| Conferences | `/api/v1/conferences` |
| Submissions | `/api/v1/conferences/{conferenceId}/submissions` |
| Reviews | `/api/v1/submissions/{submissionId}/reviews` |
| Users | `/api/v1/users` |

## 📋 HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Retrieve resources | ✅ Yes |
| POST | Create resources | ❌ No |
| PUT | Replace resource | ✅ Yes |
| PATCH | Partial update | ❌ No |
| DELETE | Remove resource | ✅ Yes |

## 📤 Request/Response Format

### Success Response

```typescript
// 200 OK
{
  "data": {
    "id": "evt_123",
    "name": "Tech Conference 2026",
    "slug": "tech-conference-2026",
    "status": "open",
    "cfpStartDate": "2026-01-01T00:00:00Z",
    "cfpEndDate": "2026-03-31T23:59:59Z"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-06-25T10:30:00Z"
  }
}
```

### Collection Response

```typescript
// 200 OK
{
  "data": [
    { "id": "evt_123", "name": "Tech Conference 2026" },
    { "id": "evt_456", "name": "Dev Summit 2026" }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "perPage": 20,
    "requestId": "req_abc123"
  }
}
```

### Error Response

```typescript
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "eventName",
        "message": "Must be at least 3 characters"
      }
    ]
  },
  "meta": {
    "requestId": "req_xyz789",
    "timestamp": "2026-06-25T10:30:00Z"
  }
}
```

## 🔐 Authentication

### Bearer Token
```
Authorization: Bearer <jwt_token>
```

### Auth Flow
1. User logs in via magic link
2. Server returns JWT token
3. Client includes token in Authorization header
4. Server validates token on each request

## 📊 HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Business rule violation |
| 500 | Internal Server Error | Server error |

## 📝 API Examples

### Create Conference

```http
POST /api/v1/conferences
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Tech Conference 2026",
  "cfpStartDate": "2026-01-01",
  "cfpEndDate": "2026-03-31",
  "maxSubmissions": 100
}
```

### Get Conference

```http
GET /api/v1/conferences/conf_123
Authorization: Bearer <token>
```

### Submit Proposal

```http
POST /api/v1/conferences/conf_123/submissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Building Scalable Systems",
  "abstract": "Learn how to build...",
  "track": "engineering",
  "level": "intermediate"
}
```

### List Submissions (with pagination)

```http
GET /api/v1/conferences/conf_123/submissions?page=1&perPage=20
Authorization: Bearer <token>
```

## 🔍 Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `perPage` | number | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field (e.g., `createdAt`, `name`) |
| `order` | string | Sort order (`asc` or `desc`) |
| `filter` | string | Filter criteria (JSON encoded) |

### Example Query

```
GET /api/v1/conferences?sort=createdAt&order=desc&page=1&perPage=10
```

## 🛡️ Validation

All inputs validated using Zod schemas:

```typescript
// Example validation schema
export const conferenceCreateSchema = z.object({
  name: z.string().min(3).max(100),
  cfpStartDate: z.string().datetime(),
  cfpEndDate: z.string().datetime(),
  maxSubmissions: z.number().int().positive()
}).refine(data => 
  new Date(data.cfpEndDate) > new Date(data.cfpStartDate), 
  { message: "End date must be after start date" }
);
```

## 🚦 Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Anonymous | 100 requests | 15 minutes |
| Authenticated | 1000 requests | 15 minutes |
| Premium | 10000 requests | 15 minutes |

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1656162600
```

## 📚 Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Testing Strategy](./TESTING.md)
- [ADR-006: RESTful API Design](../docs/adr/006-use-restful-api-design.md)