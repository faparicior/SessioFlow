# Use ts-archunit for Architecture Testing

* **Status:** Approved
* **Date:** 2026-07-10
* **Decision Makers:** Fernando (Lead Developer)
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow uses Domain-Driven Design (DDD) to enforce strict layer boundaries:
- **Domain layer** must have zero external dependencies
- **Application layer** owns DTOs (queries/commands), not domain value objects
- **Interfaces/API layer** delegates to handlers — never instantiates domain VOs directly
- **Repository interfaces** live in domain; implementations live in infrastructure

Recent manual code reviews revealed a recurring problem: **layer boundary violations slip through** until discovered during review. When a developer adds a value object import to a controller or skips VO validation, the code compiles and passes unit tests — but violates the architectural contract.

The team needs an automated way to enforce these rules in CI so that:
1. **AI coding agents** (which generate most PRs) can self-correct when they violate boundaries
2. **Human reviewers** spend less time checking imports and layer compliance
3. **New developers** get immediate feedback on DDD violations before they merge

This is a decision for **how** we automate architectural enforcement, not **whether** we do it (DDD compliance is already mandated as a team practice).

**Decision Drivers:**
* **DDD enforcement** — Must verify that domain/application/interface boundaries hold at the file and body level
* **CI integration** — Must run automatically in the CI pipeline alongside existing unit tests
* **Developer experience** — Error messages must be actionable (code frames, explanations, fix suggestions) for AI agents and humans
* **Vitest compatibility** — The project uses Vitest; the library must work without switching test frameworks
* **Low adoption friction** — Should support gradual rollout (baseline mode) to avoid blocking existing PRs

## Considered Options

* [ts-archunit](https://github.com/nielspeter/ts-archunit) — AST-based architecture testing via ts-morph, body analysis, type-level rules
* [ArchUnitTS](https://github.com/LukasNiessen/ArchUnitTS) — File-graph architecture testing, inspired by Java ArchUnit
* [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) — Import graph validation, CLI-based
* [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) — ESLint-based import rules

## Decision Outcome

**Chosen Option:** "[ts-archunit]"

**Justification:**
ts-archunit is the only library that satisfies **all five** decision drivers:

1. **DDD enforcement** — Unlike the others, it can check **what happens inside function bodies** (not just which files import which). This is critical for catching violations like:
   - Controllers that directly instantiate `ConferenceId.fromString()` (VO creation)
   - Handlers that skip validation before calling repository methods
   - Domain entities that contain `new Error()` instead of using result patterns
   dependency-cruiser, ArchUnitTS, and eslint-plugin-boundaries **all only check imports** — they cannot see inside function bodies.

2. **CI integration** — Runs as standard Vitest tests. No extra CLI to invoke, no separate pipeline step.

3. **Developer experience** — Error output includes GitHub code frames, rule IDs, `because` explanations, and `suggestion` fields. This is explicitly designed for AI agent self-correction.

4. **Vitest compatibility** — First-class support with `toPassAsync()` matcher and auto-detection of Vitest projects.

5. **Low adoption friction** — Built-in **baseline mode** lets us start checking only changed files (diff-aware), then gradually expand to the full codebase.

### Consequences

* **Positive:**
  * DDD boundary violations caught in CI before review, saving human review time
  * AI coding agents get inline fix suggestions instead of failing review silently
  * Body-level rules catch issues that import-only tools miss (e.g., `new Error()` in domain, missing `fromString()` validation)
  * Pattern templates let us reuse rules across multiple DDD contexts (conference, submission, review)
  * Baseline mode enables gradual rollout without blocking existing PRs

* **Negative:**
  * New dependency to maintain; smaller community than dependency-cruiser or ESLint plugins
  * AST-level rules require TypeScript 5.3+ for full expression matching — may need tsconfig alignment
  * Initial rule authoring takes time: ~4-8 hours to write core DDD rules
  * Performance: AST parsing adds ~2-5 seconds to the test suite

* **Risks:**
  * **Maintenance burden** — If the library goes unmaintained, we'd need to fork or migrate. Mitigation: the library uses standard ts-morph (widely used) and MIT license; rules are plain TypeScript that can be adapted.
  * **Rule flakiness** — AST-level matching can break on code reformatting. Mitigation: baseline mode + exclusion comments give us escape hatches.
  * **Team adoption** — Developers need to understand the DSL to write rules. Mitigation: start with a small set of core rules; expand iteratively.

## Pros and Cons of the Options

### ts-archunit

* Good, because it performs **body-level analysis** — can verify that functions inside `handlers/` call `ConferenceId.fromString()`, or that `domain/` code never uses `new Error()`
* Good, because it supports **type-level rules** — can enforce that handlers return typed results instead of generic objects
* Good, because **baseline/diff-aware mode** lets us start small (changed files only) and expand gradually
* Good, because error output is designed for **AI agent self-correction** — includes rule ID, explanation, and suggested fix inline
* Good, because it uses **ts-morph** (widely adopted AST engine) and MIT license
* Bad, because smaller community — ~300 GitHub stars vs ~1,400 for ArchUnitTS; fewer examples and community contributions
* Bad, because AST-level rules can be sensitive to code formatting — may need periodic rule tuning after Prettier changes

### ArchUnitTS

* Good, because **larger community** (~1,400 stars) and more examples (NestJS, Express, Fastify, micro-frontend patterns)
* Good, because supports **slices** and **metrics** (LOC, LCOM) out of the box
* Bad, because it only checks **file-level imports** — cannot verify that domain functions use typed errors, or that handlers validate input before repository calls
* Bad, because no **baseline mode** — all-or-nothing rollout blocks existing PRs
* Bad, because no **type-level rules** — cannot enforce result patterns or type safety at the AST level

### dependency-cruiser

* Good, because **mature and widely adopted** — battle-tested, excellent documentation, large ecosystem of presets (clean architecture, DDD)
* Good, because supports **cycle detection, metrics, and graph visualizations**
* Good, because baseline mode exists via `--max-warnings` CLI flag
* Bad, because **import-only** — cannot see inside function bodies, cannot check for `new Error()` in domain, cannot verify `fromString()` calls in handlers
* Bad, because CLI-based — requires a separate pipeline step or config file, not integrated into Vitest
* Bad, because rule configuration uses a custom DSL — TypeScript rules written with ts-archunit are plain TS, easier to maintain

### eslint-plugin-boundaries

* Good, because it runs **within ESLint** — no new tooling surface, uses existing `npm run lint` workflow
* Good, because leverages **ESLint's rule ecosystem** — can combine with existing lint rules
* Bad, because **import-only** — same limitation as dependency-cruiser and ArchUnitTS
* Bad, because ESLint plugin rules are **simpler than AST-level** — cannot match function body content, catch expressions, or type annotations
* Bad, because ESLint performance impact on large repos is well-documented — slows down `lint:fix`

## Example Rules (What We Would Write)

```typescript
// DDD: Domain layer must not import from outside itself
modules(p)
  .that().resideInPath('**/modules/**/domain/**')
  .should().notImportFromOutside()
  .rule({ id: 'ddd/domain-no-external-imports' });

// DDD: Controllers must not instantiate domain value objects
classes(p)
  .that().resideInFolder('**/interfaces/api/**')
  .should().notContain(newExpr('ConferenceId'))
  .rule({ id: 'no-vo-in-controller', because: 'VO creation belongs in handlers' });

// DDD: Handlers must validate → call VO.fromString() before repository calls
functions(p)
  .that().resideInFolder('**/handlers/**')
  .should().satisfy(mustCall('fromString'))
  .rule({ id: 'handlers-must-validate' });

// DDD: Domain must use Result pattern, not generic Error
classes(p)
  .that().resideInPath('**/domain/**')
  .should().notContain(newExpr('Error'))
  .rule({ id: 'domain-uses-result-pattern' });
```

## References

* [ADR-009](009-adopt-domain-driven-design-structure.md) — DDD Architecture Pattern
* [DEV-RULES.md](../../DEV-RULES.md) — Coding rules requiring DDD compliance
* [ts-archunit Documentation](https://nielspeter.github.io/ts-archunit/)
* [ArchUnitTS Documentation](https://lukasniessen.github.io/ArchUnitTS/)
* [dependency-cruiser Documentation](https://github.com/sverweij/dependency-cruiser)