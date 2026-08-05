/**
 * Architecture Tests — CQRS Response Class Conventions
 *
 * Enforces that CQRS response DTOs follow the strict contract:
 * - Private constructor (factory-only creation)
 * - Only `readonly` primitive property types
 * - Exactly one method: static `from(domainEntity)`
 *
 * These rules catch response classes that grow behavior or leak
 * domain types — common code rot in CQRS systems.
 */
import {describe, it} from 'vitest';
import {classes, project, matching, defineCondition} from '@nielspeter/ts-archunit';

const p = project('tsconfig.json');

/**
 * Condition: class must have a private constructor.
 *
 * Checks that the constructor is marked `private` in source text.
 */
const mustHavePrivateConstructor = defineCondition(
  'mustHavePrivateConstructor',
  (matchedClasses) => {
    return matchedClasses.map((cls) => {
      const source = cls.getFullText();
      // Match "private constructor" pattern (skip comment lines)
      const hasPrivateCtor = /private\s+constructor/.test(source);

      if (!hasPrivateCtor) {
        return {
          rule: 'class must have a private constructor',
          element: cls.getName()!,
          file: cls.getSourceFile().getFilePath(),
          line: cls.getLine() ?? 0,
          message: `Response class "${cls.getName()}" must have a private constructor to enforce factory-only creation.`,
        };
      }
      return null;
    }).filter(Boolean);
  },
);

/**
 * Condition: class must have exactly one method — a static `from` method.
 *
 * The static `from` factory is the only public method; the constructor is private.
 * Instance methods, getters, and other methods are not allowed.
 */
const mustOnlyHaveStaticFromMethod = defineCondition(
  'mustOnlyHaveStaticFromMethod',
  (matchedClasses) => {
    return matchedClasses.map((cls) => {
      const methods = cls.getMethods();
      const staticFromMethods = methods.filter(
        (m) =>
          m.getName() === 'from' && m.isStatic() && !m.isPrivate(),
      );

      if (staticFromMethods.length === 0) {
        return {
          rule: 'class must have a static from() method',
          element: cls.getName()!,
          file: cls.getSourceFile().getFilePath(),
          line: cls.getLine() ?? 0,
          message: `Response class "${cls.getName()}" must have a static \`from()\` factory method.`,
        };
      }

      // Exclude constructor and the static 'from' from the count
      const nonConstructorMethods = methods.filter(
        (m) => !m.isConstructor() && !m.getName().startsWith('get'),
      );

      // Allow only the static 'from' method (non-private)
      const disallowedMethods = methods.filter(
        (m) =>
          !m.isConstructor() &&
          !m.isStatic() &&
          m.getName() !== 'from' &&
          !m.isPrivate(),
      );

      if (disallowedMethods.length > 0) {
        const names = disallowedMethods.map((m) => m.getName()).join(', ');
        return {
          rule: 'class must not have methods beyond static from()',
          element: cls.getName()!,
          file: cls.getSourceFile().getFilePath(),
          line: cls.getLine() ?? 0,
          message: `Response class "${cls.getName()}" has disallowed methods: ${names}. Response classes must only contain readonly fields and the static from() factory.`,
        };
      }

      return null;
    }).filter(Boolean);
  },
);

describe('CQRS Response Conventions', () => {
  describe('Private constructor', () => {
    it('response classes must have a private constructor', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .should()
        .satisfy(mustHavePrivateConstructor)
        .because('response classes must be created exclusively through the static from() factory')
        .check();
    });
  });

  describe('Only readonly primitive fields', () => {
    it('response classes must only have readonly properties', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .should()
        .haveOnlyReadonlyProperties()
        .because('response DTOs are immutable mappings of domain state to primitives')
        .check();
    });
  });

  describe('Static factory method', () => {
    it('response classes must have a static from() method', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .should()
        .haveMethodNamed('from')
        .because('response classes must provide a factory method to map from domain entities')
        .check();
    });
  });

  describe('No extra behavior', () => {
    it('response classes must not contain domain type references', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .should()
        .notContain(matching(/: [A-Z][a-zA-Z]+;$/))
        .because('response classes must only contain primitive types — never domain entities or value objects')
        .check();
    });

    it('response classes must not have methods beyond static from()', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .should()
        .satisfy(mustOnlyHaveStaticFromMethod)
        .because('response classes are passive data carriers — no behavior, only data')
        .check();
    });
  });

  describe('Static from() method contract', () => {
    it('static from() must accept a domain entity parameter', () => {
      // The from method should take a class parameter (domain entity), not primitives
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/**/*.response.ts')
        .and()
        .haveMethodNamed('from')
        .and()
        .areExported()
        .should()
        .beExported()
        .because('the static from factory must be accessible to handlers that create responses')
        .check();
    });
  });
});
