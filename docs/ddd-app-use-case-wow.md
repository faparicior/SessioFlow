# 🎯 DDD Application Layer - OrderModule (Generic Guidelines)

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#️-architecture-position)
3. [📋 Architecture Rules](#-architecture-rules)
   - [Layer Responsibility](#1-layer-responsibility)
   - [Package Structure Convention](#2-package-structure-convention)
4. [📐 Command Patterns](#-command-patterns)
5. [🔄 Use Case Patterns](#-use-case-patterns)
6. [🛠️ Implementation Guidelines](#️-implementation-guidelines)
7. [⚠️ Error Handling Strategy](#️-error-handling-strategy)
8. [🧪 Testing Approach](#-testing-approach)
9. [⚡ Performance Considerations](#-performance-considerations)
10. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
11. [Summary](#summary)
12. [Pattern Index](#pattern-index)
13. [❓ Open Questions](#-open-questions)

## 📌 Overview

**Module / Package(s):** `OrderModule`  
**Description:** Manages order lifecycle operations including creation, retrieval, and state transitions.  
**Responsibility:** Orchestrate business processes via domain interaction and data access.

**Domain Purpose:** Coordinate domain aggregates, repositories, and external services to fulfill user intents while maintaining clear separation between business rules and infrastructure.

**Architecture Layer:** Application Layer - Command and Query Handlers

## 🏗️ Architecture Position

```
Web API / UI Layer (OrderController) → Application Layer (OrderModule) → Domain Layer (Order Aggregate)
```

The `OrderModule` layer sits at the system boundary, acting as the orchestrator between external requests and internal domain logic, while maintaining proper separation of concerns and decoupling business rules from infrastructure concerns.

---

## 📋 Architecture Rules

### 1. Layer Responsibility

- **Purpose**: Orchestrate domain operations, manage transaction boundaries, and translate data between external interfaces and domain models.
- **Dependencies**: Domain Layer (Aggregates, Repositories interfaces), Infrastructure Layer (Repository implementations), Shared Kernel.
- **Restrictions**: No business rules implementation, no direct database queries, no UI formatting, no command logic/payload validation beyond basic structure.

### 2. Package Structure Convention

Group operations by intent (Commands/Queries) and specific action to ensure discoverability and separation of read/write concerns.

```text
src/application/
├── commands/
│   └── create-order/
│       ├── create-order.command.ts
│       └── create-order.handler.ts
├── queries/
│   └── get-order/
│       ├── get-order.query.ts
│       └── get-order.handler.ts
└── common/
    ├── result.ts
    └── handler-base.ts
```

Examples:

- `src/application/commands/create-order/create-order.command.ts` [c4d5e6f7] — Defines command payload, intent, and transactional attributes
- `src/application/commands/create-order/create-order.handler.ts` [h1d2r3a4] — Orchestrates domain creation logic, manages transaction scope
- `src/application/queries/get-order/get-order.query.ts` [q5r6s7t8] — Defines query parameters, intent, and read constraints
- `src/application/queries/get-order/get-order.handler.ts` [h2d5r8a9] — Orchestrates data retrieval, maps to DTO, handles read model projection

## 📐 Command Patterns

### Command rules by Category

#### Command Data Patterns

##### Rule UC-CMD-01: Command Payload Pattern

**✅ GOOD - Immutable Command Structure:**

```typescript
export class CreateOrderCommand {
  constructor(
    public readonly orderNumber: string,
    public readonly customerId: string,
    public readonly items: OrderItemDto[]
  ) {}
}
```

**Source**: [c4d5e6f7] CreateOrderCommand

**Key Benefits:**
- **Immutability**: `readonly` fields prevent mutation after creation
- **Type Safety**: Strong typing ensures payload integrity
- **Intent Clarity**: Command name clearly expresses the intent

**❌ BAD - Logic in Commands:**

```typescript
export class CreateOrderCommand {
  calculateTotal(): number {
    // Calculation logic in command
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}
```

**Why it's bad:**
- Commands should be passive data carriers
- Logic belongs in Domain or Service layer
- Creates tight coupling and testing difficulties

## 🔄 Use Case Patterns

### Use case rules by Category

#### Application Orchestration Patterns

##### Rule UC-ORD-01: Domain Orchestration Pattern

**✅ GOOD - Handler Orchestration:**

```typescript
export class CreateOrderHandler {
  constructor(
    private orderRepository: OrderRepository,
    private idGenerator: IdGenerator
  ) {}

  async handle(command: CreateOrderCommand): Promise<OrderId> {
    const orderId = this.idGenerator.next();
    const order = Order.create({
      id: orderId,
      orderNumber: command.orderNumber,
      customerId: command.customerId,
      items: command.items
    });

    await this.orderRepository.save(order);
    return orderId;
  }
}
```

**Source**: [h1d2r3a4] CreateOrderHandler

**Key Benefits:**
- **Single Responsibility**: Handler focuses on orchestration only
- **Domain Integrity**: Business rules encapsulated in Aggregate
- **Transaction Management**: Clear boundary for commit/rollback

**❌ BAD - God Handler:**

```typescript
export class CreateOrderHandler {
  async handle(command: CreateOrderCommand) {
    // Validation, pricing, inventory check, persistence, event publishing
    // All in one handler - too complex
  }
}
```

**Why it's bad:**
- Violates Single Responsibility Principle
- Difficult to test and maintain
- Blurs separation between application and domain layer

##### Rule UC-QRY-02: Read Model Projection Pattern

**✅ GOOD - Query Projection:**

```typescript
export class GetOrderHandler {
  async handle(query: GetOrderQuery): Promise<OrderDto> {
    const order = await this.orderRepository.findById(query.orderId);
    
    if (!order) {
      throw new OrderNotFoundException(query.orderId);
    }

    return {
      id: order.id.value,
      orderNumber: order.orderNumber,
      status: order.status.name,
      totalAmount: order.calculateTotal()
    };
  }
}
```

**Source**: [h2d5r8a9] GetOrderHandler

**Key Benefits:**
- **Decoupled Read Model**: Returns DTO, not Entity
- **Projection Safety**: Domain entity internals remain protected
- **Query Optimization**: Can use specialized read repositories

**❌ BAD - Entity Leakage:**

```typescript
export class GetOrderHandler {
  async handle(query: GetOrderQuery): Promise<Order> {
    return this.orderRepository.findById(query.orderId);
  }
}
```

**Why it's bad:**
- Exposes domain internals to external consumers
- Creates coupling between read and write models
- Difficult to optimize read performance

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **Constructor Injection**: All handlers must use constructor injection for dependencies
- **Configuration**: Dependencies wired in composition root or framework-specific DI container
- **Lifecycle**: Handlers are stateless singletons; repositories injected as dependencies

### Handler Structure

```typescript
export abstract class Handler<TCommand, TResult> {
  abstract handle(command: TCommand): Promise<TResult>;
}

export class CreateOrderHandler 
  extends Handler<CreateOrderCommand, OrderId> {
  // Implementation
}
```

### Command/Query Contracts

- Commands and queries should implement standard interfaces (`ICommand`, `IQuery`)
- Use Value Objects where applicable (e.g., `OrderId`, `CustomerId`)
- Commands should be immutable; queries can be mutable for pagination/filtering

---

## ⚠️ Error Handling Strategy

### Domain Exception Propagation

Business rule violations throw domain exceptions that bubble up to be handled by the outermost layer.

**Example:**

```typescript
export class InsufficientInventoryError extends DomainError {
  constructor(item: string, required: number) {
    super(`Insufficient inventory for ${item}. Required: ${required}`);
  }
}
```

### Application Error Wrapping

Non-domain errors (infrastructure, validation) are wrapped in application-specific exceptions.

**Example:**

```typescript
export class OrderPersistenceError extends ApplicationError {
  constructor(originalError: Error) {
    super('Failed to persist order', originalError);
  }
}
```

---

## 🧪 Testing Approach

### Unit Testing

- **Handler Logic**: Test orchestration flow, mocking domain and infrastructure
- **Mock Strategy**: Mock repositories and external services
- **Coverage Target**: 100% branch coverage for handlers

### Integration Testing

- **Repository Verification**: Test actual persistence with test database
- **Test Environment**: In-memory database or test containers
- **Data Setup**: Fixture-based setup with cleanup hooks

### Use Case Testing Rules

#### ✅ Good Test Structure

```typescript
it('should create order successfully', async () => {
  // Arrange
  const command = new CreateOrderCommand('ORD-001', 'CUST-123', []);
  const orderRepository = mock<OrderRepository>();
  orderRepository.save.resolves();

  // Act
  await handler.handle(command);

  // Assert
  expect(orderRepository.save.calledOnce).toBe(true);
});
```

#### ❌ Bad Test Patterns

```typescript
it('should save to database', () => {
  // Testing infrastructure directly in handler test
  handler.handle(command);
  // Asserts on SQL or ORM internals - fragile and implementation-specific
});
```

---

## ⚡ Performance Considerations

### Read Model Optimization

- Use dedicated read repositories for complex queries
- Avoid N+1 query problems in handlers
- Consider caching for frequently accessed order data

### Command Processing

- Commands should be processed synchronously for immediate consistency
- For high-volume scenarios, consider async command processing with eventual consistency
- Batch operations where multiple changes relate to the same aggregate

---

## 🚫 Anti-Patterns to Avoid

### ❌ God Handler

**Problem**: Handler contains business logic, validation, and infrastructure calls.  
**Solution**: Extract business rules to domain entities/aggregates; create separate validators.  
**Detected Files**: None detected

### ❌ Anemic Domain

**Problem**: Handler performs calculations or business decisions that belong in domain.  
**Solution**: Move logic to domain aggregates; use domain services only when single aggregate cannot handle it.  
**Detected Files**: None detected

### ❌ ORM Leakage

**Problem**: Handler returns raw entities or DTOs that expose ORM internals.  
**Solution**: Use explicit DTOs or Value Objects; apply projection in handler or dedicated query handler.  
**Detected Files**: None detected

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

Developers should focus on clean orchestration, immutability, and proper layer boundaries.

1. **Single Responsibility** - Handlers orchestrate only; business rules belong in domain
2. **Immutability** - Commands and queries are immutable data carriers
3. **Dependency Inversion** - Depend on repository interfaces, not implementations
4. **Result Orientation** - Handlers return clear results or throw appropriate exceptions
5. **Separation of Concerns** - Commands for writes, queries for reads; never mix in same handler

- **DDD Patterns**: Command/Query Separation, Domain Orchestration, Repository Coordination
- **Architecture Documentation**: Application Layer Design Document, Module Boundaries Spec

**What to Avoid** _(common anti-patterns and restrictions)_

- Never put business logic in handlers
- Never expose domain entities directly to external interfaces
- Never handle transaction logic inside domain aggregates
- Avoid God Handlers by extracting complex operations to domain services or multi-step processes
- Do not mix command and query logic in the same handler

---

## Pattern Index

### Application Layer - Command Patterns

- **UC-CMD-01**: Command Payload Pattern - [c4d5e6f7] CreateOrderCommand

### Application Layer - Use Case Patterns

- **UC-ORD-01**: Domain Orchestration Pattern - [h1d2r3a4] CreateOrderHandler
- **UC-QRY-01**: Query Intent Pattern - [q5r6s7t8] GetOrderQuery
- **UC-QRY-02**: Read Model Projection Pattern - [h2d5r8a9] GetOrderHandler

### Coverage Summary

**Total Application Layer Use Cases Analyzed**: 2

- **Command Operations**: 1 use cases (100% coverage)
- **Query Operations**: 1 use cases (100% coverage)

**Key Files Analyzed**:
- [c4d5e6f7] CreateOrderCommand ✓
- [h1d2r3a4] CreateOrderHandler ✓
- [q5r6s7t8] GetOrderQuery ✓
- [h2d5r8a9] GetOrderHandler ✓

---

## ❓ Open Questions

- [ ] Should complex order creation be split into multi-step workflow or single command?
- [ ] Are there specific read model requirements that warrant CQRS separation beyond query handlers?
- [ ] Should domain events be published from handlers or domain aggregates?

## ⚖️ Architectural Conformance & Inconsistency Audit

### 1. Adherence Summary to Big Picture Rules
The generated `ddd-app-use-case-wow.md` documentation demonstrates **strong foundational alignment** with the Big Picture expectations across core DDD boundaries:
- ✅ **CQRS Enforcement**: Strict segregation of Commands (writes) and Queries (reads) is explicitly mandated, with dedicated handler packages and anti-pattern warnings against mixing concerns.
- ✅ **Statelessness & DI**: Handlers are correctly defined as stateless, relying on constructor injection for repositories and dependencies (`src/application/commands/...` structure).
- ✅ **Repository Isolation**: Direct DB/SQL access is prohibited; handlers interact exclusively with repository interfaces, preserving infrastructure decoupling.
- ✅ **No Business Rules**: Clear guardrails prevent domain logic leakage into handlers (`❌ BAD - Logic in Commands` & `Anemic Domain` anti-patterns).
- ✅ **Projection Discipline**: Read handlers are correctly constrained to return DTOs/projections rather than leaking aggregate internals (`UC-QRY-02`).

### 2. Specific DDD Inconsistencies & Deviations
Despite strong baseline adherence, several deviations exist between the WoW documentation and the mandated Big Picture rules:

| Big Picture Expectation | WoW Documentation Status | Deviation / Gap |
|-------------------------|--------------------------|-----------------|
| **Input Validation** | Explicitly restricted: `"no command logic/payload validation beyond basic structure"` | **Conflict**. The App layer *must* validate request shapes, types, and constraints before domain delegation. The WoW doc pushes validation entirely to the domain, which violates boundary rules. |
| **Context Injection** | Not mentioned in rules, guidelines, or examples | **Missing**. No mechanism defined for resolving security, tenant, correlation ID, or audit context from infrastructure adapters before orchestration. |
| **Error Handling Strategy** | Promotes throwing custom exceptions (`DomainError`, `ApplicationError`) | **Partial Mismatch**. Big Picture explicitly prefers `Result<T, E>` or structured outcome types for domain flow control. Exception-based flow can mask recoverable business states and complicates CQRS read-path expectations. |
| **Transaction Management** | Mentioned as a responsibility (`"manage transaction boundaries"`) but lacks operational guidance | **Under-specified**. No implementation pattern provided for opening, committing, or rolling back sessions per use case (e.g., decorators, `TransactionManager` interface, or AOP). |
| **Package Naming** | Uses `src/application/` | **Convention Drift**. Big Picture specifies `app-use-case/`. This is cosmetic but can cause confusion in monorepo routing or module scanning. |

### 3. Actionable Refactoring Recommendations
To achieve strict conformance with the Big Picture architecture, the following changes should be applied to the implementation and documentation:

1. **Introduce Explicit Input Validation Gateways**
   - Replace the blanket prohibition on validation with a dedicated validation pattern. Implement an `IValidator<TCommand>` interface or framework decorators (e.g., `@ValidatePayload()`) that run *before* handler orchestration.
   - Move structural/formatting constraints out of domain aggregates and into the application layer where payloads are hydrated.

2. **Adopt a Result/Outcome Pattern for Error Handling**
   - Define an `ApplicationResult<T>` or `DomainResult<T, E>` type (or adopt a library like `fp-ts`/`result-ts`).
   - Update `UC-CMD-01` and handler signatures to return `Result<SuccessPayload, ValidationError | DomainError>` instead of throwing exceptions for expected business states. Reserve exceptions strictly for unexpected infrastructure failures.

3. **Standardize Context Injection**
   - Define a `IRequestContext` interface (`userId`, `tenantId`, `correlationId`, `timestamp`) and inject it via a context middleware or decorator that hydrates the request scope before handler execution.
   - Explicitly document how context flows into `CreateOrderHandler.handle()` or how it's resolved via a `ContextProvider` service.

4. **Operationalize Transaction Boundaries**
   - Introduce a `TransactionManager` or `IUnitOfWork` interface that handlers must explicitly wrap their orchestration in:
     ```typescript
     await this.transactionManager.run(async () => {
       const order = Order.create(...);
       await this.orderRepository.save(order);
     });
     ```
   - Update the "Transaction Management" rule to mandate this pattern, preventing implicit DB sessions or framework-ghost transactions.

5. **Align Package & Routing Conventions**
   - Rename `src/application/` to `src/app-use-case/` (or add a strict alias/mapping rule in `tsconfig`/build config) to match the architectural contract.
   - Document that this layer is the **single entry point** for all workflow triggers, preventing controllers or event listeners from bypassing it.

6. **Update Anti-Pattern Registry**
   - Add `❌ Implicit Transaction Scope` and `❌ Missing Context Propagation` to the anti-patterns section to enforce future conformance.
   - Replace `Detected Files: None detected` with dynamic linting rules that automatically flag handlers missing `Result` returns or transaction wrappers.

**Audit Verdict**: `⚠️ CONDITIONALLY CONFORMANT` — The structural CQRS and repository isolation patterns are correctly documented, but validation, context, and result-pattern expectations require explicit implementation rules before production adoption.
