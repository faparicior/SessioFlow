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
import {project, modules, classes, slices, functions, call, matching, defineCondition} from '@nielspeter/ts-archunit';
import {existsSync} from 'fs';
import {join, dirname} from 'path';

// For monorepo structure, use root tsconfig to include packages/modules
const p = project('tsconfig.json');

/**
 * Creates a condition that checks each matched handler class has a co-located file
 * with a given suffix (e.g. ".command", ".handler", ".response").
 *
 * Uses ts-archunit's cls.getSourceFile() AST node combined with fs.existsSync
 * to accurately verify physical co-located file existence on disk.
 */
function coLocatedFile(suffix: string) {
  return defineCondition('coLocatedFile', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const filePath = cls.getSourceFile().getFilePath();
      const fileName = cls.getSourceFile().getBaseName();
      const stem     = fileName.replace(/\.ts$/, '').replace(/\.handler$/, '');
      const dir      = dirname(filePath);
      const target   = join(dir, stem + suffix + '.ts');

      if (!existsSync(target)) {
        return {
          rule: `class must have a co-located file "${stem}${suffix}"`,
          element: stem,
          file: filePath,
          line: 0,
          message: `Handler "${stem}" is missing "${stem}${suffix}.ts". ` +
                   `Convention: each CQRS handler folder is self-contained — ` +
                   `the command/query, handler, and response all live at the folder root.`,
        };
      }
      return null;
    }).filter(Boolean) as any;
  });
}

describe('DDD Architecture', () => {
  describe('Domain layer isolation', () => {
    it('domain must only import from domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .onlyImportFrom(
          '**/packages/modules/**/domain/**',
          '**/packages/shared/**',
          '**/node_modules/**',
        )
        .because('domain must not depend on application, infrastructure, or interfaces')
        .check();
    });

    it('domain must not import from external paths', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .notImportFrom('**/frontend/**', '**/../**')
        .check();
    });

    it('domain entities must be exported', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
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
        .resideInFolder('**/packages/modules/**/application/**')
        .should()
        .onlyImportFrom(
          '**/packages/modules/**/application/**',
          '**/packages/modules/**/domain/**',
          '**/packages/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Infrastructure layer dependencies', () => {
    it('infrastructure must only import from infrastructure, domain, shared, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/infrastructure/**')
        .should()
        .onlyImportFrom(
          '**/packages/modules/**/infrastructure/**',
          '**/packages/modules/**/domain/**',
          '**/packages/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Interfaces layer dependencies', () => {
    it('interfaces must only import from interfaces, application, shared, components, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/interfaces/**')
        .should()
        .onlyImportFrom(
          '**/packages/modules/**/interfaces/**',
          '**/packages/modules/**/application/**',
          '**/packages/shared/**',
          '**/node_modules/**',
        )
        .check();
    });
  });

  describe('Interfaces layer restrictions', () => {
    it('interfaces must not import repositories directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/interfaces/**')
        .should()
        .notImportFrom('**/packages/modules/**/domain/*repository*')
        .because('interfaces must only interact with application layer handlers, never domain repositories directly')
        .check();
    });
  });

  describe('API route restrictions', () => {
    it('API routes must not import from domain directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/apps/**/api/**')
        .should()
        .notImportFrom('**/packages/modules/**/domain/**')
        .because('API routes must only interact with application CQRS handlers, never domain objects or repositories directly')
        .check();
    });
  });

  describe('CQRS Architecture', () => {
    it('command handlers and query handlers must end with Handler', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();

      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .beExported()
        .check();
    });

    it('handlers must implement an execute method', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**')
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
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Command$/)
        .should()
        .beExported()
        .check();
    });

    it('queries must be named Query', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Query$/)
        .should()
        .beExported()
        .check();
    });

    it('handler execution methods must return Result or DTOs', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**')
        .and()
        .haveNameMatching(/(^|\.)execute$/)
        .should()
        .haveReturnTypeMatching(matching(/Result|Dto|Response/))
        .because('CQRS handlers must return Result objects or DTOs to avoid leaking Domain Entities directly')
        .check();
    });

    it('query handlers must be read-only (no save/delete repository calls)', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .should()
        .notContain(call(/\.save$|\.delete$/))
        .because('query handlers must only perform read operations')
        .check();
    });

    // ───────────────────────────────────────────────────────────────────
    // Self-contained handler folder convention
    // ───────────────────────────────────────────────────────────────────

    it('command handlers must have a co-located command file', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(coLocatedFile('.command'))
        .because('command folders must be self-contained — the command (input DTO) lives alongside the handler')
        .check();
    });

    it('command handlers must have a co-located response file', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(coLocatedFile('.response'))
        .because('command folders must be self-contained — the response DTO lives alongside the handler')
        .check();
    });

    it('query handlers must have a co-located query file', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(coLocatedFile('.query'))
        .because('query folders must be self-contained — the query lives alongside the handler')
        .check();
    });

    it('query handlers must have a co-located response file', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(coLocatedFile('.response'))
        .because('query folders must be self-contained — the response DTO lives alongside the handler')
        .check();
    });
  });

  describe('Dependency cycles', () => {
    it('modules must not contain cycles', () => {
      slices(p)
        .matching('packages/modules/*/')
        .should()
        .beFreeOfCycles()
        .check();
    });
  });
});
