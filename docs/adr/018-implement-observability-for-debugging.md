# Implement Observability for AI-Assisted Debugging

* **Status:** Approved
* **Date:** 2026-07-04
* **Decision Makers:** Technical Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

As SessioFlow grows in complexity with multiple modules (conference management, submissions, reviews, scheduling), debugging errors and understanding system behavior becomes increasingly challenging. AI coding agents need comprehensive observability to:

1. **Debug errors efficiently** - Understand error contexts, stack traces, and system state
2. **Trace request flows** - Follow requests across layers (interfaces → application → domain → infrastructure)
3. **Identify performance bottlenecks** - Detect slow operations and resource constraints
4. **Understand system behavior** - Monitor application state and business logic execution

**Current Situation:**
- No centralized logging strategy
- No request tracing across DDD layers
- Limited visibility into application behavior
- Debugging relies on scattered console.log statements
- AI agents lack context for effective debugging

**Decision Drivers:**
* **Development productivity** - Reduce time spent debugging
* **AI-assisted development** - Enable AI agents to understand and debug system behavior
* **Local development** - Must work seamlessly in local dev environment
* **Production readiness** - Architecture should support future production observability vendors
* **Cost efficiency** - Start free, scale to paid solutions when needed
* **Vendor independence** - Avoid lock-in through abstraction layers

## Considered Options

1. **Structured Logging with Pino + OpenTelemetry**
   - Local: Console output with structured JSON logs
   - Future: Export to vendors (Datadog, New Relic, Honeycomb) via OpenTelemetry

2. **Full OpenTelemetry Stack**
   - Local: Jaeger/Tempo for tracing, Prometheus for metrics
   - Production: Vendor-specific backends

3. **Simple Console Logging with Debug Levels**
   - Local: Console with debug/trace levels
   - Future: Upgrade to full observability

4. **SaaS Observability from Day One**
   - Direct integration with Datadog/New Relic
   - Immediate production readiness

## Decision Outcome

**Chosen Option:** **Option 1 - Structured Logging with Pino + OpenTelemetry**

**Justification:**
- ✅ **Local-first**: Works out-of-the-box in development without complex infrastructure
- ✅ **AI-friendly**: Structured JSON logs provide rich context for AI debugging
- ✅ **Vendor-neutral**: OpenTelemetry standard allows switching vendors without code changes
- ✅ **Progressive**: Start simple, add complexity when needed
- ✅ **Cost-effective**: Free in dev, pay-only when scaling to production
- ✅ **DDD compatible**: Can instrument all layers without tight coupling

### Consequences

* **Positive:**
  - AI agents can parse structured logs to understand system behavior
  - Request tracing across DDD layers improves debugging efficiency
  - Standard OpenTelemetry API prevents vendor lock-in
  - Minimal setup complexity for local development
  - Rich context (correlation IDs, user context, request metadata) for debugging

* **Negative:**
  - Initial setup complexity (OpenTelemetry configuration)
  - Learning curve for team to understand observability patterns
  - Additional dependencies (pino, @opentelemetry/*)

* **Risks:**
  - Log volume management in production
  - Sensitive data leakage in logs (requires sanitization)
    - Vendor-specific configurations may be needed later

## Implementation Strategy

### Phase 1: Local Development (MVP)

**Tools:**
- **pino** - Fast, structured logging
- **pino-pretty** - Human-readable logs in development
- **OpenTelemetry SDK** - Instrumentation framework

**Setup:**
```typescript
// Shared infrastructure for logging
src/shared/infrastructure/logging/
├── logger.ts           // Pino logger instance
├── instrumentation.ts  // OpenTelemetry setup
└── interfaces/
    └── logger.ts       // Logger interface for DI

// Environment configuration
LOG_LEVEL=debug         // dev: debug, prod: info
LOG_FORMAT=json         // structured JSON for AI parsing
```

**Features:**
- Structured JSON logging with context
- Request correlation IDs
- DDD layer instrumentation (domain, application, infrastructure)
- Error tracking with stack traces
- Performance metrics (request duration, DB query times)

### Phase 2: Production Integration (Future)

**Vendor Options (when needed):**
1. **Datadog** - Comprehensive APM, logs, metrics
2. **Honeycomb** - Observability-first, great for debugging
3. **New Relic** - Full-stack observability
4. **Grafana Stack** - Self-hosted (Loki + Tempo + Prometheus)

**Migration Path:**
```typescript
// Change only infrastructure layer
src/shared/infrastructure/logging/
├── pino-logger.ts      // Current implementation
└── datadog-logger.ts   // Future implementation (swap without changing domain)
```

## Pros and Cons of the Options

### Option 1: Structured Logging with Pino + OpenTelemetry

**Good, because:**
- ✅ Works in local dev without Docker/complex setup
- ✅ Structured JSON logs are AI-parseable
- ✅ OpenTelemetry standard prevents vendor lock-in
- ✅ Pino is fast (low overhead)
- ✅ Progressive enhancement possible
- ✅ Cost: $0 in dev, scale to production as needed

**Bad, because:**
- ❌ Requires initial configuration effort
- ❌ Team needs to learn observability patterns
- ❌ Log management in production needs planning

### Option 2: Full OpenTelemetry Stack

**Good, because:**
- ✅ Complete observability from day one
- ✅ Self-hosted, no vendor lock-in

**Bad, because:**
- ❌ Overkill for early-stage startup
- ❌ Requires Docker/Kubernetes for local dev
- ❌ High maintenance overhead
- ❌ Dev team needs DevOps expertise

### Option 3: Simple Console Logging

**Good, because:**
- ✅ Minimal setup
- ✅ Zero dependencies

**Bad, because:**
- ❌ Limited debugging capabilities
- ❌ No request tracing
- ❌ Hard to scale to production
- ❌ AI agents get less context

### Option 4: SaaS Observability from Day One

**Good, because:**
- ✅ Production-ready immediately
- ✅ Managed service (no maintenance)

**Bad, because:**
- ❌ Cost from day one ($200-500/month minimum)
- ❌ Vendor lock-in risk
- ❌ Over-engineering for MVP
- ❌ Not suitable for local dev (cost, complexity)

## Implementation Details

### Logger Interface (DDD Abstraction)

```typescript
// src/shared/domain/logging/logger.ts
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  trace(message: string, context?: Record<string, unknown>): void;
}
```

### Pino Implementation

```typescript
// src/shared/infrastructure/logging/pino-logger.ts
import pino from 'pino';

export class PinoLogger implements Logger {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.logger.info(context, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.error(
      { ...context, error: error?.message, stack: error?.stack },
      message
    );
  }

  // ... other methods
}
```

### OpenTelemetry Instrumentation

```typescript
// src/shared/infrastructure/logging/instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

export function initObservability() {
  const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(), // Local: console output
    // Future: Vendor exporters (Datadog, Jaeger, etc.)
  });

  sdk.start();
}
```

### Usage Examples

```typescript
// In application layer use cases
export const createConference = async (input: CreateConferenceInput) => {
  const logger = container.get<Logger>('Logger');
  
  logger.info('Creating conference', { 
    conferenceName: input.name,
    organizerId: input.organizerId 
  });

  try {
    const conference = await conferenceRepository.save(input);
    logger.info('Conference created successfully', { 
      conferenceId: conference.id 
    });
    return Result.ok(conference);
  } catch (error) {
    logger.error('Failed to create conference', error as Error, {
      input,
    });
    throw error;
  }
};

// With request context (Next.js middleware)
export async function middleware(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id') || uuidv4();
  
  // Attach to logger context
  logger.bind({ correlationId, userId: request.headers.get('x-user-id') });
  
  // Continue request...
}
```

## Monitoring & Metrics

### Key Metrics to Track

1. **Request Metrics**
   - Request duration by endpoint
   - Error rates by type
   - Request volume over time

2. **Business Metrics**
   - Conferences created
   - Submissions submitted
   - Reviews completed

3. **Performance Metrics**
   - Database query times
   - External API call durations
   - Cache hit rates

### AI Debugging Context

Logs should include:
- **Correlation ID** - Trace request across services
- **User context** - Who performed the action
- **Domain context** - Which entity/aggregate was affected
- **Error details** - Stack traces, error codes
- **Performance data** - Operation duration, resource usage

## Migration Plan

### When to Upgrade to Production Observability

**Triggers:**
- Team size > 5 developers
- Production incidents increase debugging time
- Performance issues need investigation
- Customer support needs better error context

### Vendor Selection Criteria

| Vendor | Best For | Cost Estimate |
|--------|----------|---------------|
| **Datadog** | Full-stack APM, enterprise | $23/user/month |
| **Honeycomb** | Debugging complex systems | $55/month base |
| **New Relic** | Comprehensive monitoring | $99/month |
| **Grafana** | Self-hosted, cost control | Free (self-hosted) |

### Migration Steps

1. **Evaluate vendors** based on team needs and budget
2. **Configure OpenTelemetry exporter** for selected vendor
3. **Set up dashboards** for key metrics
4. **Train team** on new observability platform
5. **Archive old logs** if migrating from separate system

## Related ADRs

- **ADR-002-01** - Supabase with DDD Abstraction (infrastructure layer pattern)
- **ADR-009** - Domain-Driven Design Structure (layer separation)
- **ADR-015** - CQRS Pattern (application layer observability)
- **ADR-017** - Drizzle ORM (database observability)

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Pino Logger](https://github.com/pinojs/pino)
- [Observability Best Practices](https://opentelemetry.io/docs/semantic-conventions/)

---

*This ADR will be reviewed when:*
- *Production deployment is planned*
- *Team grows beyond 5 developers*
- *Monthly observability costs exceed $100*