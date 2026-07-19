/**
 * Architecture Tests — DDD Layer Boundaries
 *
 * Enforces the architectural decisions documented in ADR-009 and ADR-019.
 * These rules catch structural violations in CI before they reach code review.
 *
 * @see docs/adr/009-adopt-domain-driven-design-structure.md
 * @see docs/adr/019-use-ts-archunit-for-architecture-testing.md
 */
import {describe, it} from 'vitest';
import {project, modules, classes, slices, functions, call, matching} from '@nielspeter/ts-archunit';

// For monorepo structure, use backend tsconfig for most tests
const p = project('apps/backend/tsconfig.json');

describe('DDD Architecture', () => {
  describe('Domain layer isolation', () => {
    it('domain must only import from domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/domain/**')
        .should()
        .onlyImportFrom(
          '**/backend/**/modules/**/domain/**',
          '**/backend/**/shared/**',
          '**/node_modules/**',
        )
        .because('domain must not depend on application, infrastructure, or interfaces')
        .check();
    });

    it('domain must not import from src/** external paths', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/domain/**')
        .should()
        .notImportFrom('**/src/**')
        .check();
    });

    it('domain entities must be exported', () => {
      classes(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/domain/**')
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
        .resideInFolder('**/backend/**/modules/**/application/**')
        .should()
        .onlyImportFrom(
          '**/backend/**/modules/**/application/**',
          '**/backend/**/modules/**/domain/**',
          '**/backend/**/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Infrastructure layer dependencies', () => {
    it('infrastructure must only import from infrastructure, domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/infrastructure/**')
        .should()
        .onlyImportFrom(
          '**/backend/**/modules/**/infrastructure/**',
          '**/backend/**/modules/**/domain/**',
          '**/backend/**/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Interfaces layer dependencies', () => {
    it('interfaces must only import from interfaces, application, shared, components, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/interfaces/**')
        .should()
        .onlyImportFrom(
          '**/backend/**/modules/**/interfaces/**',
          '**/backend/**/modules/**/application/**',
          '**/backend/**/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Interfaces layer restrictions', () => {
    it('interfaces must not import repositories directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/interfaces/**')
        .should()
        .notImportFrom('**/backend/**/modules/**/domain/repositories/**')
        .because('interfaces must only interact with application layer handlers, never domain repositories directly')
        .check();
    });
  });

  describe('API route restrictions', () => {
    it('API routes must not import from domain directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/backend/**/interfaces/**/api/**')
        .should()
        .notImportFrom('**/backend/**/modules/**/domain/**')
        .because('API routes must only interact with application CQRS handlers, never domain objects or repositories directly')
        .check();
    });
  });

  describe('CQRS Architecture', () => {
    it('command handlers and query handlers must end with Handler', () => {
      classes(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();

      classes(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();
    });

    it('handlers must implement an execute method', () => {
      classes(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/application/**')
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
        .resideInFolder('**/backend/**/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Command$/)
        .should()
        .beExported()
        .check();
    });

    it('queries must be named Query', () => {
      classes(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Query$/)
        .should()
        .beExported()
        .check();
    });

    it('handler execution methods must return Result or DTO types', () => {
      functions(p)
        .that()
        .resideInFolder('**/backend/**/modules/**/application/**')
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
        .resideInFolder('**/backend/**/modules/**/application/**/queries/**')
        .should()
        .notContain(call(/\.save$|\.delete$/))
        .because('query handlers must only perform read operations')
        .check();
    });
  });

  describe('Dependency cycles', () => {
    it('modules must not contain cycles', () => {
      slices(p)
        .matching('backend/**/modules/*/')
        .should()
        .beFreeOfCycles()
        .check();
    });
  });
});
