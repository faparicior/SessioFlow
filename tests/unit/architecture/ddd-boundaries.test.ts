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
import {project, modules, classes, slices} from '@nielspeter/ts-archunit';

const p = project('tsconfig.json');

describe('DDD Architecture', () => {
  describe('Domain layer isolation', () => {
    it('domain must only import from domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/modules/**/domain/**')
        .should()
        .onlyImportFrom(
          '**/modules/**/domain/**',
          '**/shared/**',
          '**/node_modules/**',
        )
        .because('domain must not depend on application, infrastructure, or interfaces')
        .check();
    });

    it('domain must not import from src/** external paths', () => {
      modules(p)
        .that()
        .resideInFolder('**/modules/**/domain/**')
        .should()
        .notImportFrom('src/**')
        .check();
    });

    it('domain entities must be exported', () => {
      classes(p)
        .that()
        .resideInFolder('**/modules/**/domain/**')
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
        .resideInFolder('**/modules/*/application/**')
        .should()
        .onlyImportFrom(
          '**/modules/*/application/**',
          '**/modules/**/domain/**',
          '**/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Infrastructure layer dependencies', () => {
    it('infrastructure must only import from infrastructure, domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/modules/*/infrastructure/**')
        .should()
        .onlyImportFrom(
          '**/modules/*/infrastructure/**',
          '**/modules/**/domain/**',
          '**/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Interfaces layer dependencies', () => {
    it('interfaces must only import from interfaces, application, domain, shared, components, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/modules/*/interfaces/**')
        .should()
        .onlyImportFrom(
          '**/modules/*/interfaces/**',
          '**/modules/*/application/**',
          '**/modules/**/domain/**',
          '**/shared/**',
          '**/components/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Dependency cycles', () => {
    it('modules must not contain cycles', () => {
      slices(p)
        .matching('src/modules/*/')
        .should()
        .beFreeOfCycles()
        .check();
    });
  });
});
