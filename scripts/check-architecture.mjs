/**
 * Standalone Architecture Rule Checker for AI Coding Agents
 *
 * Ultra-fast execution (~1.8s) for AI agents to validate architecture rules
 * on created or modified code files without Vitest test runner overhead.
 *
 * Usage:
 *   node scripts/check-architecture.mjs [optional-target-path]
 *
 * Examples:
 *   node scripts/check-architecture.mjs
 *   node scripts/check-architecture.mjs packages/modules/conference
 *   node scripts/check-architecture.mjs packages/modules/conference/src/domain/conference.ts
 */
import {project, modules, classes, defineCondition, getElementFile} from '@nielspeter/ts-archunit';

const targetArg = process.argv[2];

console.log(
  `🔍 Running Architecture Check${targetArg ? ` for target: ${targetArg}` : ' across monorepo'}...`,
);
const startTime = Date.now();

const tsconfigPath = 'tsconfig.architecture.json';
const p = project(tsconfigPath);

let violationsCount = 0;

function runRule(name, checkFn) {
  try {
    checkFn();
  } catch (err) {
    violationsCount++;
    console.error(`\n❌ Architecture Violation [${name}]:`);
    console.error(err.message || err);
  }
}

// 1. Domain Layer Isolation
runRule('Domain Layer Isolation', () => {
  modules(p)
    .that()
    .resideInFolder('**/packages/modules/**/domain/**')
    .should()
    .onlyImportFrom(
      '**/packages/modules/**/domain/**',
      '**/packages/shared/**',
      '**/shared-domain/**',
      '**/shared-logging/**',
      '**/shared-database/**',
      '@sessioflow/shared-domain/**',
      '@sessioflow/shared-logging/**',
      '@sessioflow/shared-database/**',
      '**/node_modules/**',
    )
    .check();
});

// 2. Value Object Conventions
runRule('Value Object Conventions', () => {
  classes(p)
    .that()
    .resideInFolder('**/packages/modules/**/domain/value-objects/**')
    .should()
    .satisfy(
      defineCondition('valueObjectConventions', matchedClasses => {
        return matchedClasses
          .map(cls => {
            const relPath = getElementFile(cls);
            if (targetArg && !relPath.includes(targetArg)) return null;
            const name = cls.getName();
            const fileSource = cls.getSourceFile().getFullText();

            if (name.endsWith('Error')) return null;

            if (!/private\s+constructor\b/.test(fileSource)) {
              return {
                rule: 'private constructor',
                element: name,
                file: relPath,
                line: 0,
                message: `VO "${name}" missing private constructor.`,
              };
            }
            if (!/static\s+(create|fromString)\b/.test(fileSource)) {
              return {
                rule: 'static factory',
                element: name,
                file: relPath,
                line: 0,
                message: `VO "${name}" missing static create/fromString factory.`,
              };
            }
            if (!/get\s+value\s*\(\)/.test(fileSource)) {
              return {
                rule: 'get value()',
                element: name,
                file: relPath,
                line: 0,
                message: `VO "${name}" missing get value() getter.`,
              };
            }
            if (!/\bequals\s*\(/.test(fileSource)) {
              return {
                rule: 'equals(other)',
                element: name,
                file: relPath,
                line: 0,
                message: `VO "${name}" missing equals(other) method.`,
              };
            }
            return null;
          })
          .filter(Boolean);
      }),
    )
    .check();
});

// 3. Domain Entity No Primitives
runRule('Domain Entity No Primitives', () => {
  classes(p)
    .that()
    .resideInFolder('**/packages/modules/**/domain/**')
    .should()
    .satisfy(
      defineCondition('domainEntityNoPrimitives', matchedClasses => {
        return matchedClasses
          .map(cls => {
            const relPath = getElementFile(cls);
            if (targetArg && !relPath.includes(targetArg)) return null;
            if (
              relPath.includes('/value-objects/') ||
              relPath.includes('/exceptions/') ||
              relPath.includes('/events/')
            )
              return null;

            const fileSource = cls.getSourceFile().getFullText();
            const dataTypeMatch = fileSource.match(/type\s+\w+Data\s*=\s*\{([^}]+)\}/);
            if (!dataTypeMatch) return null;

            const primitiveMatches = dataTypeMatch[1].match(
              /(\w+)\s*:\s*(string|number|boolean)\b/g,
            );
            if (primitiveMatches && primitiveMatches.length > 0) {
              return {
                rule: 'Domain Entity Data no primitives',
                element: cls.getName(),
                file: relPath,
                line: 0,
                message: `Domain entity in "${relPath}" uses raw primitives: [${primitiveMatches.join(', ')}].`,
              };
            }
            return null;
          })
          .filter(Boolean);
      }),
    )
    .check();
});

// 4. Domain Event Conventions
runRule('Domain Event Conventions', () => {
  classes(p)
    .that()
    .resideInFolder('**/packages/modules/**/domain/events/**')
    .should()
    .satisfy(
      defineCondition('domainEventConventions', matchedClasses => {
        return matchedClasses
          .map(cls => {
            const relPath = getElementFile(cls);
            if (targetArg && !relPath.includes(targetArg)) return null;
            const name = cls.getName();
            const fileSource = cls.getSourceFile().getFullText();

            if (!name.endsWith('Event')) {
              return {
                rule: 'event name suffix',
                element: name,
                file: relPath,
                line: 0,
                message: `Domain Event "${name}" must end with "Event".`,
              };
            }
            if (!/\btoJSON\s*\(/.test(fileSource)) {
              return {
                rule: 'toJSON serialization',
                element: name,
                file: relPath,
                line: 0,
                message: `Domain Event "${name}" must implement toJSON().`,
              };
            }
            return null;
          })
          .filter(Boolean);
      }),
    )
    .check();
});

// 5. Domain Exception Conventions
runRule('Domain Exception Conventions', () => {
  classes(p)
    .that()
    .resideInFolder('**/packages/modules/**/domain/exceptions/**')
    .should()
    .satisfy(
      defineCondition('domainExceptionConventions', matchedClasses => {
        return matchedClasses
          .map(cls => {
            const relPath = getElementFile(cls);
            if (targetArg && !relPath.includes(targetArg)) return null;
            const name = cls.getName();
            const fileSource = cls.getSourceFile().getFullText();

            if (!name.endsWith('Error')) {
              return {
                rule: 'exception name suffix',
                element: name,
                file: relPath,
                line: 0,
                message: `Domain Exception "${name}" must end with "Error".`,
              };
            }
            if (!/extends\s+(Domain\w+Error|EntityNotFoundError)\b/.test(fileSource)) {
              return {
                rule: 'extends DomainError',
                element: name,
                file: relPath,
                line: 0,
                message: `Domain Exception "${name}" must extend DomainError.`,
              };
            }
            return null;
          })
          .filter(Boolean);
      }),
    )
    .check();
});

const duration = Date.now() - startTime;
if (violationsCount === 0) {
  console.log(`\n✅ All architecture rules PASSED in ${duration}ms!`);
  process.exit(0);
} else {
  console.error(
    `\n💥 Architecture check failed with ${violationsCount} violation(s) in ${duration}ms.`,
  );
  process.exit(1);
}
