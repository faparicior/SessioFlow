# 007-use-zod-for-validation

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a data validation strategy to ensure:

1. **Input Integrity**: Speaker proposals must contain required fields (title, abstract, speaker info)
2. **Type Safety**: TypeScript types must be consistent between frontend forms and backend processing
3. **User Experience**: Validation errors must be clear and actionable for users (Andrea)
4. **Security**: Malicious or malformed input must be rejected before database operations

The MVP Canvas emphasizes "Strong validation on the CfP form input fields" as a risk mitigation strategy. Fernando's need for "Automated data validation to catch errors early with results in a report" directly depends on a robust validation system.

The Trade-offs document ranks Usability #1, meaning validation must provide helpful error messages without creating friction. Andrea's Pain 1 ("Difficult to find a smooth an easy way to create a session proposal") requires validation that guides rather than blocks users.

**Decision Drivers:**
- Must provide runtime validation for user inputs (form submissions, API requests)
- Must integrate with TypeScript for end-to-end type safety
- Must generate clear, user-friendly error messages for frontend display
- Must support complex validation rules (e.g., co-speaker invitations, session scheduling conflicts)
- Must be easy to maintain and extend as features evolve
- Must work within the 6-week MVP timeline

## Considered Options

1. **Zod (TypeScript-first schema validation)**
2. **Yup (Schema validation with TypeScript support)**
3. **class-validator (Decorator-based validation)**
4. **Manual validation (Custom validation functions)**

## Decision Outcome

**Chosen Option:** "Zod (TypeScript-first schema validation)"

**Justification:**
Zod is the optimal choice because it provides the best balance of type safety, developer experience, and user experience:

1. **Type Inference**: Zod schemas automatically generate TypeScript types, eliminating duplication between validation and type definitions
2. **Error Messages**: Built-in error formatting provides clear, customizable messages for user-facing validation feedback
3. **MVP Timeline**: Simple API and excellent documentation enable rapid implementation within 6-week schedule
4. **Ecosystem Integration**: Works seamlessly with Next.js, React Hook Form, and Supabase
5. **Usability**: Supports progressive validation and partial updates, reducing friction for Andrea's proposal submissions

### Consequences

* **Positive:**
  - Single source of truth: Schema defines both runtime validation and TypeScript types
  - Refactoring safety: Type errors catch schema changes at compile time
  - Error formatting: Built-in error flattening for React form integration
  - Composition: Schemas can be combined, extended, and reused across the application
  - Community support: Widely adopted with extensive documentation and examples

* **Negative:**
  - Runtime overhead: Schema parsing adds minimal performance cost on each validation
  - Learning curve: Team must understand Zod's API and error handling patterns
  - Bundle size: Adds ~12KB to client bundle (acceptable for MVP)
  - Complex schemas: Highly nested schemas may become difficult to read and maintain

* **Risks:**
  - Over-reliance on validation may hide deeper type safety issues
  - Error message customization requires careful planning for internationalization
  - Schema changes may require database migrations if constraints change
  - Validation logic in multiple layers (client + server) requires synchronization

### Pros and Cons of the Options

#### Option 1: Zod (TypeScript-first schema validation)

* Good, because it provides automatic TypeScript type inference from schemas, eliminating type duplication
* Good, because it has excellent error message formatting with customizable localization support
* Good, because it integrates well with React Hook Form and Next.js API Routes
* Good, because it supports schema composition and reuse (e.g., base speaker schema extended for proposals)
* Good, because it is actively maintained with strong community adoption
* Bad, because it adds runtime overhead for schema parsing on each validation
* Bad, because complex validation logic may make schemas difficult to read
* Bad, because error messages must be carefully customized for user-friendly display

#### Option 2: Yup (Schema validation with TypeScript support)

* Good, because it has a mature ecosystem and extensive documentation
* Good, because it integrates well with React Form libraries
* Bad, because TypeScript support requires additional configuration and type packages
* Bad, because it doesn't infer TypeScript types from schemas automatically
* Bad, because development has slowed compared to Zod
* Bad, because it requires separate type definitions, creating maintenance burden

#### Option 3: class-validator (Decorator-based validation)

* Good, because it works well with TypeScript classes and decorators
* Good, because it provides validation for both frontend and backend with shared classes
* Bad, because it requires class instances for validation, not plain objects
* Bad, because decorator syntax may be unfamiliar to some developers
* Bad, because it has limited support for complex nested validation
* Bad, because it adds complexity to the build process (decorator compilation)

#### Option 4: Manual validation (Custom validation functions)

* Good, because it provides complete control over validation logic and error messages
* Good, because it has zero dependencies and bundle size impact
* Bad, because it requires duplicating type definitions for validation and TypeScript
* Bad, because it is error-prone and difficult to maintain consistently
* Bad, because it increases development time significantly
* Bad, because it doesn't provide reusable validation patterns

## Validation Strategy

### Client-Side Validation
- Use Zod with React Hook Form for real-time form validation
- Provide immediate feedback as users type (e.g., title length, required fields)
- Show clear error messages below form fields

### Server-Side Validation
- Re-validate all inputs using the same Zod schemas in API routes
- Never trust client-side validation for security
- Return standardized error responses for programmatic handling

### Schema Organization
```
lib/validations/
  ├── event.ts        - Event creation and update schemas
  ├── proposal.ts     - Proposal submission schemas
  ├── speaker.ts      - Speaker profile schemas
  └── schedule.ts     - Schedule assignment schemas
```

## Links

* [Zod Documentation](https://zod.dev/)
* [MVP Canvas - Validation Requirement](../inception/8-mvp-canvas-definition.md#7-final-validation-checklist)
* [Persona: Fernando - Data Validation Need](../inception/3-personas.md#persona-name-fernando-the-sql-and-spreadsheet-juggler)
* [Persona: Andrea - Usability Requirement](../inception/3-personas.md#persona-name-andrea-the-experienced-speaker)
