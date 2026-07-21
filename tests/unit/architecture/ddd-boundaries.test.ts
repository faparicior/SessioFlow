/**
 * Architecture Tests — DDD Layer Boundaries
 *
 * Enforces the architectural decisions documented in ADR-009, ADR-019, and ADR-023.
 * These rules catch structural violations in CI before they reach code review.
 *
 * @see docs/adr/009-adopt-domain-driven-design-structure.md
 * @see docs/adr/019-use-ts-archunit-for-architecture-testing.md
 * @see docs/adr/023-superseat-009-01-monorepo-backend-frontend-separation.md
 */
import {describe, it} from 'vitest';
import {project, modules, classes, slices, functions, call, matching} from '@nielspeter/ts-archunit';

// Use backend tsconfig for project scanning
const p = project('apps/backend/tsconfig.json');

describe('DDD Architecture', () => {
  describe('Domain layer isolation', () => {
    it('domain must only import from domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/domain/**')
        .should()
        .onlyImportFrom(
          '**/{backend,packages}/modules/**/domain/**',
          '**/{backend,packages}/shared/**',
          '**/node_modules/**',
        )
        .because('domain must not depend on application, infrastructure, or interfaces')
        .check();
    });

    it('domain must not import from frontend paths', () => {
      modules(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/domain/**')
        .should()
        .notImportFrom('**/frontend/**')
        .check();
    });

    it('domain entities must be exported', () => {
      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/domain/**')
        .should()
        .beExported()
        .because('domain entities are used by other layers')
        .check();
    });
  });

  describe('Application layer dependencies', () => {
    it('application must only import from application, domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**')
        .should()
        .onlyImportFrom(
          '**/{backend,packages}/modules/**/application/**',
          '**/{backend,packages}/modules/**/domain/**',
          '**/{backend,packages}/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Infrastructure layer dependencies', () => {
    it('infrastructure must only import from infrastructure, domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/infrastructure/**')
        .should()
        .onlyImportFrom(
          '**/{backend,packages}/modules/**/infrastructure/**',
          '**/{backend,packages}/modules/**/domain/**',
          '**/{backend,packages}/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('CQRS Architecture', () => {
    it('command handlers and query handlers must end with Handler', () => {
      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();

      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();
    });

    it('handlers must implement an execute method', () => {
      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .haveMethodNamed('execute')
        .because('CQRS handlers must implement an execute method to be executed')
        .check();
    });

    it('commands must be named Command', () => {
      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Command$/)
        .should()
        .beExported()
        .check();
    });

    it('queries must be named Query', () => {
      classes(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Query$/)
        .should()
        .beExported()
        .check();
    });

    it('handler execution methods must return Result or DTO types', () => {
      functions(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**')
        .and()
        .haveNameMatching(/^execute$/)
        .should()
        .haveReturnTypeMatching(matching(/Result|Dto/))
        .because('CQRS handlers must return Result objects or DTOs to avoid leaking Domain Entities directly')
        .check();
    });

    it('query handlers must be read-only (no save/delete repository calls)', () => {
      functions(p)
        .that()
        .resideInFolder('**/{backend,packages}/modules/**/application/**/queries/**')
        .should()
        .notContain(call(/\.save$|\.delete$/))
        .because('query handlers must only perform read operations')
        .check();
    });
  });
});
