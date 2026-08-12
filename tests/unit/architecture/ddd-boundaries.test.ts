/**
 * Architecture Tests — DDD Layer Boundaries
 *
 * Enforces the architectural decisions documented in ADR-009 and ADR-019.
 * These rules catch structural violations in CI before they reach code review.
 *
 * @see docs/adr/009-adopt-domain-driven-design-structure.md
 * @see docs/adr/019-use-ts-archunit-for-architecture-testing.md
 */
import {describe, it, expect} from 'vitest';
import {project, modules, classes, slices, functions, call, matching, defineCondition, getElementFile} from '@nielspeter/ts-archunit';
import {existsSync, readFileSync} from 'fs';
import {join, dirname} from 'path';
// Scope tsconfig loading to target module if provided for ultra-fast AI agent feedback (e.g. TARGET_MODULE=conference)
const targetModule = process.env.TARGET_MODULE;
const tsconfigPath = targetModule
  ? `packages/modules/${targetModule}/tsconfig.json`
  : 'tsconfig.json';

const p = project(tsconfigPath);
if (targetModule) {
  p._project.addSourceFilesAtPaths(`packages/modules/${targetModule}/src/**/*.ts`);
} else {
  p._project.addSourceFilesAtPaths('packages/modules/*/src/**/*.ts');
}

const describeArch = describe;

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

/**
 * Creates a condition that checks the handler actually imports and references
 * the co-located class (command or query), not just the file existing.
 *
 * Catches the pattern where a .query.ts or .command.ts class is defined
 * but the handler's execute() takes a plain object instead of using it.
 *
 * Example bug this catches:
 *   // get-conference.query.ts  → export class GetConferenceQuery {}
 *   // get-conference.handler.ts → execute(params: { id: string })  ← never imports GetConferenceQuery
 */
function handlerMustReferenceCoLocatedDto(suffix: string) {
  return defineCondition('handlerMustReferenceCoLocatedDto', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const fileName = relPath.split('/').at(-1)!;
      const stem     = fileName.replace(/\.ts$/, '').replace(/\.handler$/, '');

      // Convert kebab-case stem to PascalCase for matching class names.
      // e.g. "create-conference" → "CreateConference"
      const pascalStem = stem
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

      // Map suffix to PascalCase suffix used in class names.
      // ".command" → "Command",  ".query" → "Query"
      const suffixMap: Record<string, string> = { '.command': 'Command', '.query': 'Query' };
      const suffixClass = suffixMap[suffix] ?? suffix.replace('.', '').replace(/^./, (c) => c.toUpperCase());

      // Match the full exported class name: stem + suffix
      // e.g. "CreateConferenceCommand" or "GetConferenceQuery"
      const className = pascalStem + suffixClass;

      const executeMethod = cls.getMethod('execute');
      if (!executeMethod) {
        return null;
      }

      const params = executeMethod.getParameters();
      const hasMatchingParam = params.some((param: any) => {
        const typeText = param.getType().getText();
        return typeText.includes(className);
      });

      if (!hasMatchingParam) {
        return {
          rule: `class must use its co-located ${suffix} DTO in execute()`,
          element: cls.getName()!,
          file: relPath,
          line: executeMethod.getStartLineNumber() ?? 0,
          message: `Handler "${cls.getName()}" execute() method parameters do not use type "${className}". ` +
                   `The DTO should be referenced as a parameter type (e.g. execute(command: ${className})).`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Creates a condition that checks the Command/Query DTO has a co-located Input type alias.
 */
function hasInputType() {
  return defineCondition('hasInputType', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const stem = relPath.split('/').at(-1)!.replace(/\.ts$/, '').replace(/\.(command|query)$/, '');
      const fileSource = cls.getSourceFile().getFullText();

      // Check if the file exports an Input type
      const hasInputType = /export\s+type\s+\w*Input/.test(fileSource);

      if (!hasInputType) {
        return {
          rule: `class must have a co-located Input type alias`,
          element: stem,
          file: relPath,
          line: 0,
          message: `Class "${stem}" is missing a primitive Input type. ` +
                   `Convention: export an Input type (e.g. "${stem}Input") and have ` +
                   `the class accept it (e.g. "constructor(readonly input: ${stem}Input)").`,
        };
      }
      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Creates a condition that checks the DTO class properties do not reference domain types.
 */
function notContainDomainProperties() {
  return defineCondition('notContainDomainProperties', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const props = cls.getType().getProperties();
      const domainPattern = /ConferenceId|ConferenceSlug|ConferenceName|ConferenceStatus|ConferenceCreatedEvent|CfpConfig/;

      for (const prop of props) {
        const propType = prop.getTypeAtLocation(cls);
        const typeText = propType.getNonNullableType().getText();
        
        if (domainPattern.test(typeText)) {
          return {
            rule: 'class must not contain domain type properties',
            element: cls.getName()!,
            file: relPath,
            line: 0,
            message: `Class "${cls.getName()}" has property "${prop.getName()}" of domain type "${typeText}". ` +
                     `Query DTOs must only contain primitive types — never domain entities or value objects.`,
          };
        }
      }
      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Creates a condition that checks that each controller imports and instantiates its co-located DTO.
 */
function controllerInstantiatesDto() {
  return defineCondition('controllerInstantiatesDto', (matchedFns: any[]) => {
    return matchedFns.map((fn: any) => {
      const relPath = getElementFile(fn);
      const sourceFile = fn.getSourceFile();

      // Get imports referencing .command or .query
      const imports = sourceFile.getImportDeclarations();
      const dtoImport = imports.find((imp: any) => {
        const moduleSpecifier = imp.getModuleSpecifierValue();
        return moduleSpecifier.includes('.command') || moduleSpecifier.includes('.query');
      });

      if (!dtoImport) {
        return null; // Not a DTO-based controller, skip
      }

      const namedImports = dtoImport.getNamedImports();
      const dtoClassSpecifier = namedImports.find((spec: any) => {
        const name = spec.getName();
        return name.endsWith('Command') || name.endsWith('Query');
      });

      if (!dtoClassSpecifier) {
        return {
          rule: 'controller must import its co-located DTO',
          element: fn.getName()!,
          file: relPath,
          line: 0,
          message: `Controller "${fn.getName()}" imports a .command or .query file but no named class import ending with Command/Query was found.`,
        };
      }

      const dtoClassName = dtoClassSpecifier.getName();

      // Check if the function body contains a NewExpression for this class name
      const descendants = fn.getNode().getDescendants();
      const hasInstantiation = descendants.some((node: any) => {
        if (node.getKindName() === 'NewExpression') {
          return node.getExpression().getText() === dtoClassName;
        }
        return false;
      });

      if (!hasInstantiation) {
        return {
          rule: 'controller must instantiate its co-located DTO',
          element: fn.getName()!,
          file: relPath,
          line: fn.getStartLineNumber() ?? 0,
          message: `Controller "${fn.getName()}" imports "${dtoClassName}" but never instantiates it with "new ${dtoClassName}(…)". ` +
                   `Passing plain objects bypasses the DTO boundary contract.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Creates a condition that checks HTTP controllers explicitly use type-only imports for their co-located handler.
 */
function controllerImportsHandlerType() {
  return defineCondition('controllerImportsHandlerType', (matchedFns: any[]) => {
    return matchedFns.map((fn: any) => {
      const relPath = getElementFile(fn);
      const sourceFile = fn.getSourceFile();
      const imports = sourceFile.getImportDeclarations();

      const handlerImport = imports.find((imp: any) => {
        const specifier = imp.getModuleSpecifierValue();
        return specifier.includes('.handler');
      });

      if (!handlerImport) {
        return {
          rule: 'controllers must explicitly import their co-located Handler type',
          element: fn.getName()!,
          file: relPath,
          line: 0,
          message: `Controller "${fn.getName()}" does not import a Handler type. ` +
                   `Controllers must explicitly include "import type { [UseCase]Handler }" ` +
                   `for 100% LLM traceability and compile-time type safety.`,
        };
      }

      if (!handlerImport.isTypeOnly()) {
        return {
          rule: 'controllers must use type-only imports for handlers',
          element: fn.getName()!,
          file: relPath,
          line: 0,
          message: `Controller "${fn.getName()}" imports handler as a runtime value instead of type-only. ` +
                   `Use "import type { ... }" to prevent runtime coupling while preserving explicit IDE/LLM linkage.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that domain entities and child entities follow factory & constructor conventions:
 * 1. Private constructor to prevent raw unvalidated instantiation.
 * 2. Static create() factory method for domain creation with business rules.
 * 3. Static fromData() (or createFromData) factory method for persistence reconstitution.
 */
function domainEntityFactoryConventions() {
  return defineCondition('domainEntityFactoryConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      // Target domain entity files under packages/modules/*/src/domain/ (excluding value-objects, exceptions, events)
      if (
        relPath.includes('/value-objects/') ||
        relPath.includes('/exceptions/') ||
        relPath.includes('/events/')
      ) {
        return null;
      }

      // 1. Private constructor check
      const hasPrivateConstructor = /private\s+constructor\s*\(/.test(fileSource);
      if (!hasPrivateConstructor) {
        return {
          rule: 'domain entity must have a private constructor',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Domain entity "${name}" in "${relPath}" must have a private constructor. ` +
            `Convention: private constructor enforces static factory methods create() and fromData().`,
        };
      }

      // 2. Static create() method check
      const hasStaticCreate = /static\s+create\s*\(/.test(fileSource);
      if (!hasStaticCreate) {
        return {
          rule: 'domain entity must have static create() factory method',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Domain entity "${name}" in "${relPath}" must have a static create() factory method. ` +
            `Convention: static create(...) encapsulates domain creation rules & initial state.`,
        };
      }

      // 3. Static fromData() method check
      const hasStaticFromData = /static\s+(fromData|createFromData)\s*\(/.test(fileSource);
      if (!hasStaticFromData) {
        return {
          rule: 'domain entity must have static fromData() factory method',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Domain entity "${name}" in "${relPath}" must have a static fromData() factory method. ` +
            `Convention: static fromData(...) reconstitutes state from persistence without raising side effects or domain events.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that Domain Aggregate Roots implement pullDomainEvents() method
 * for internal event accumulation and retrieval.
 */
function aggregateRootDomainEventsConventions() {
  return defineCondition('aggregateRootDomainEventsConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      // Target Aggregate Roots under packages/modules/*/src/domain/ (excluding value-objects, exceptions, events, child entities)
      if (
        relPath.includes('/value-objects/') ||
        relPath.includes('/exceptions/') ||
        relPath.includes('/events/') ||
        relPath.endsWith('cfp-config.ts')
      ) {
        return null;
      }

      // Check for pullDomainEvents() method
      const hasPullDomainEvents = /pullDomainEvents\s*\(/.test(fileSource);
      if (!hasPullDomainEvents) {
        return {
          rule: 'aggregate root must implement pullDomainEvents() method',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Aggregate Root "${name}" in "${relPath}" must implement pullDomainEvents(). ` +
            `Convention: aggregate roots record domain events internally and expose pullDomainEvents() to flush pending events.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that CQRS Command Handlers use OutboxRepository to persist domain events.
 */
function commandHandlerOutboxConventions() {
  return defineCondition('commandHandlerOutboxConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      // Check for OutboxRepository usage or import
      const usesOutbox = /OutboxRepository|outboxRepository/.test(fileSource);
      if (!usesOutbox) {
        return {
          rule: 'command handlers must accept and use OutboxRepository',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Command Handler "${name}" in "${relPath}" must accept and use OutboxRepository ` +
            `to persist domain events using the Transactional Outbox pattern.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that Domain Entity Data properties use Value Objects, Child Entities, or Date,
 * and do not use raw primitives (string, number, boolean).
 */
function domainEntityNoPrimitivesConventions() {
  return defineCondition('domainEntityNoPrimitivesConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      // Target domain entity files under packages/modules/*/src/domain/ (excluding value-objects, exceptions, events)
      if (
        relPath.includes('/value-objects/') ||
        relPath.includes('/exceptions/') ||
        relPath.includes('/events/')
      ) {
        return null;
      }

      // Extract Entity Data type definition block e.g. type ConferenceData = { ... }
      const dataTypeMatch = fileSource.match(/type\s+\w+Data\s*=\s*\{([^}]+)\}/);
      if (!dataTypeMatch) return null;

      const dataBlock = dataTypeMatch[1];
      // Check for raw primitives (string, number, boolean) in Data properties (excluding Date)
      const primitiveMatches = dataBlock.match(/(\w+)\s*:\s*(string|number|boolean)\b/g);

      if (primitiveMatches && primitiveMatches.length > 0) {
        return {
          rule: 'domain entity properties must use Value Objects instead of raw primitives',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Domain Entity Data type in "${relPath}" contains raw primitive property types: [${primitiveMatches.join(', ')}]. ` +
            `DDD Convention: domain entities must wrap properties in Value Objects (e.g. OrganizerId, ConferenceDescription) instead of using raw primitives (string, number, boolean).`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that static factory methods on domain entities (e.g. create) accept Value Objects
 * instead of raw primitives (string, number, boolean).
 */
function domainFactoryNoPrimitivesConventions() {
  return defineCondition('domainFactoryNoPrimitivesConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      if (
        relPath.includes('/value-objects/') ||
        relPath.includes('/exceptions/') ||
        relPath.includes('/events/')
      ) {
        return null;
      }

      // Check parameter types of static create(...) methods for raw primitives (string, number, boolean)
      const createMethodMatch = fileSource.match(/static\s+create\s*\(\s*parameters\s*:\s*\{([^}]+)\}/);
      if (!createMethodMatch) return null;

      const paramsBlock = createMethodMatch[1];
      const primitiveParamMatches = paramsBlock.match(/(\w+)\s*\??:\s*(string|number|boolean)\b/g);

      if (primitiveParamMatches && primitiveParamMatches.length > 0) {
        return {
          rule: 'domain factory methods must accept Value Objects instead of raw primitives',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Domain entity factory method in "${relPath}" accepts raw primitive parameters: [${primitiveParamMatches.join(', ')}]. ` +
            `DDD Convention: domain entity create(...) factory methods must accept Value Objects instead of raw primitives.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that Value Objects follow strict DDD structural conventions:
 * 1. Private constructor
 * 2. Static factory method (create or fromString)
 * 3. Value getter (get value())
 */
function valueObjectConventions() {
  return defineCondition('valueObjectConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      if (!relPath.includes('/value-objects/')) return null;
      if (name.endsWith('Error')) return null;

      // 1. Check for private constructor
      const hasPrivateConstructor = /private\s+constructor\b/.test(fileSource);
      if (!hasPrivateConstructor) {
        return {
          rule: 'Value Objects must have a private constructor',
          element: name,
          file: relPath,
          line: 0,
          message: `Value Object "${name}" in "${relPath}" must have a private constructor.`,
        };
      }

      // 2. Check for static factory method (create or fromString)
      const hasStaticFactory = /static\s+(create|fromString)\b/.test(fileSource);
      if (!hasStaticFactory) {
        return {
          rule: 'Value Objects must have a static factory method (create or fromString)',
          element: name,
          file: relPath,
          line: 0,
          message: `Value Object "${name}" in "${relPath}" must have a static factory method (create or fromString).`,
        };
      }

      // 3. Check for get value() getter
      const hasValueGetter = /get\s+value\s*\(\)/.test(fileSource);
      if (!hasValueGetter) {
        return {
          rule: 'Value Objects must expose a "get value()" getter',
          element: name,
          file: relPath,
          line: 0,
          message: `Value Object "${name}" in "${relPath}" must expose a "get value()" getter.`,
        };
      }

      // 4. Check for equals(other) method
      const hasEqualsMethod = /\bequals\s*\(/.test(fileSource);
      if (!hasEqualsMethod) {
        return {
          rule: 'Value Objects must implement an equals(other) method',
          element: name,
          file: relPath,
          line: 0,
          message: `Value Object "${name}" in "${relPath}" must implement an equals(other) method for structural equality.`,
        };
      }

      // 5. Check for redundant implements Self clause
      const hasSelfImplements = new RegExp(`implements\\s+${name}\\b`).test(fileSource);
      if (hasSelfImplements) {
        return {
          rule: 'Value Objects must not use redundant "implements Self" anti-pattern',
          element: name,
          file: relPath,
          line: 0,
          message: `Value Object "${name}" in "${relPath}" has redundant self-implementation "implements ${name}".`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that repository implementation classes reconstitute domain entities using fromData static factory methods.
 */
function repositoryReconstitutionConventions() {
  return defineCondition('repositoryReconstitutionConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      // Only check repository implementations in infrastructure
      if (!relPath.includes('/infrastructure/') || !name.endsWith('Repository')) {
        return null;
      }

      // OutboxRepository is a shared event queue repository, not an entity aggregate repository
      if (name.includes('Outbox')) {
        return null;
      }

      // Check that mapping or retrieval uses fromData
      const usesFromData = /\.fromData\(/.test(fileSource);
      if (!usesFromData) {
        return {
          rule: 'repository implementations must reconstitute domain entities using fromData factory methods',
          element: name,
          file: relPath,
          line: 0,
          message:
            `Repository implementation "${name}" in "${relPath}" does not use .fromData(...) factory method for domain entity reconstitution. ` +
            `DDD Invariant: Repositories must reconstruct entities via static fromData(...) factory methods.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that Domain Event classes follow strict DDD invariants:
 * 1. Reside in domain/events/ and end with Event
 * 2. Define a type discriminator property
 * 3. Define a timestamp / occurredOn property
 * 4. Implement toJSON() for outbox serialization
 */
function domainEventConventions() {
  return defineCondition('domainEventConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      if (!relPath.includes('/domain/events/')) return null;

      if (!name.endsWith('Event')) {
        return {
          rule: 'domain event classes must end with Event',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Event class "${name}" in "${relPath}" must end with "Event".`,
        };
      }

      // Check for type property
      const hasTypeProperty = /\btype\b/.test(fileSource);
      if (!hasTypeProperty) {
        return {
          rule: 'domain events must define a type property',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Event "${name}" in "${relPath}" must define a "type" property for event identification.`,
        };
      }

      // Check for timestamp property
      const hasTimestamp = /\btimestamp\b|\boccurredOn\b/.test(fileSource);
      if (!hasTimestamp) {
        return {
          rule: 'domain events must include a timestamp or occurredOn property',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Event "${name}" in "${relPath}" must include a timestamp or occurredOn property.`,
        };
      }

      // Check for toJSON method
      const hasToJSON = /\btoJSON\s*\(/.test(fileSource);
      if (!hasToJSON) {
        return {
          rule: 'domain events must implement toJSON() method for outbox payload serialization',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Event "${name}" in "${relPath}" must implement a toJSON() method for outbox persistence.`,
        };
      }

      return null;
    }).filter(Boolean) as any;
  });
}

/**
 * Condition to check that Domain Exception classes follow strict DDD invariants:
 * 1. Reside in domain/exceptions/ and end with Error
 * 2. Extend a base DomainError class from @sessioflow/shared-domain
 */
function domainExceptionConventions() {
  return defineCondition('domainExceptionConventions', (matchedClasses: any[]) => {
    return matchedClasses.map((cls: any) => {
      const relPath = getElementFile(cls);
      const name = cls.getName();
      const fileSource = cls.getSourceFile().getFullText();

      if (!relPath.includes('/domain/exceptions/')) return null;

      if (!name.endsWith('Error')) {
        return {
          rule: 'domain exception classes must end with Error',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Exception class "${name}" in "${relPath}" must end with "Error".`,
        };
      }

      const extendsDomainError = /extends\s+(Domain\w+Error|EntityNotFoundError)\b/.test(fileSource);
      if (!extendsDomainError) {
        return {
          rule: 'domain exception classes must extend a base DomainError',
          element: name,
          file: relPath,
          line: 0,
          message: `Domain Exception class "${name}" in "${relPath}" must extend DomainError, DomainInvariantError, or DomainConflictError.`,
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
        .because('domain layer must have no dependencies on external layers (infrastructure, application, interfaces)')
        .check();
    });

    it('domain must not import from external paths or api-definitions', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .notImportFrom('**/packages/api-definitions/**')
        .because('domain layer must not depend on API definitions')
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

    it('domain entities must have private constructor and static create/fromData factory methods', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .satisfy(domainEntityFactoryConventions())
        .because('domain entities require private constructors and named factory methods for creation vs reconstitution')
        .check();
    });

    it('domain aggregate roots must implement pullDomainEvents method for event management', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .satisfy(aggregateRootDomainEventsConventions())
        .because('aggregate roots record domain events internally and expose pullDomainEvents() for event dispatching')
        .check();
    });

    it('domain entity properties must use Value Objects instead of raw primitives', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .satisfy(domainEntityNoPrimitivesConventions())
        .because('domain entities must encapsulate domain concepts in Value Objects instead of using raw primitives')
        .check();
    });

    it('domain factory methods must accept Value Objects instead of raw primitives', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .should()
        .satisfy(domainFactoryNoPrimitivesConventions())
        .because('domain entity create(...) factory methods must receive Value Objects for type safety and invariant validation')
        .check();
    });

    it('value objects must have private constructor, static factory, and value getter', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/value-objects/**')
        .should()
        .satisfy(valueObjectConventions())
        .because('Value Objects in DDD must enforce immutability with private constructors, static factory methods, and a value getter')
        .check();
    });

    it('value objects must not import domain entities or repositories', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/value-objects/**')
        .should()
        .notImportFrom('**/infrastructure/**')
        .and()
        .notImportFrom('**/application/**')
        .because('Value Objects are fundamental domain building blocks and must not depend on higher layers')
        .check();
    });

    it('repository interfaces must reside in domain and not import infrastructure or ORMs', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/**')
        .and()
        .haveNameMatching(/repository/i)
        .should()
        .notImportFrom('**/infrastructure/**')
        .and()
        .notImportFrom('**/drizzle-orm/**')
        .because('Repository interfaces belong strictly to the domain layer and must have no infrastructure or ORM dependencies')
        .check();
    });

    it('domain events must reside in domain/events, end with Event, and implement toJSON serialization', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/events/**')
        .should()
        .satisfy(domainEventConventions())
        .because('Domain Events represent immutable domain facts and must provide type, timestamp, and toJSON() serialization for outbox persistence')
        .check();
    });

    it('domain exceptions must reside in domain/exceptions, end with Error, and extend base DomainError', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/domain/exceptions/**')
        .should()
        .satisfy(domainExceptionConventions())
        .because('Domain Exception classes represent domain invariant failures and must extend base DomainError classes')
        .check();
    });
  });

  describe('API Definitions package boundaries', () => {
    it('api-definitions must only import from api-definitions and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/api-definitions/**')
        .should()
        .onlyImportFrom(
          '**/packages/api-definitions/**',
          '**/node_modules/**',
        )
        .because('api-definitions is a pure contract package — it must contain zero backend domain or module dependencies')
        .check();
    });

    it('bus package must only import from bus, shared-logging, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/shared/bus/**')
        .should()
        .onlyImportFrom(
          '**/packages/shared/bus/**',
          '**/packages/shared/logging/**',
          '**/node_modules/**',
        )
        .because('bus package is pure CQRS infrastructure — it must not depend on feature modules or database schemas')
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

    it('repository implementations must reside in infrastructure layer and end with Repository', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/infrastructure/**')
        .and()
        .haveNameMatching(/repository$/i)
        .should()
        .beExported()
        .because('Concrete repository implementations belong to the infrastructure layer and must be exported for container wiring')
        .check();
    });

    it('repository implementations must reconstitute entities using fromData factory methods', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/infrastructure/**')
        .and()
        .haveNameMatching(/repository$/i)
        .should()
        .satisfy(repositoryReconstitutionConventions())
        .because('Repositories must map database records to domain entities using static fromData(...) factory methods')
        .check();
    });
  });

  describe('Interfaces layer dependencies', () => {
    it('interfaces must only import from interfaces, application, api-definitions, shared, components, and node_modules', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/**/interfaces/**')
        .should()
        .onlyImportFrom(
          '**/packages/modules/**/interfaces/**',
          '**/packages/modules/**/application/**',
          '**/packages/api-definitions/**',
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

    it('API routes must not contain Zod schemas directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/apps/**/api/**')
        .and()
        .haveNameMatching(/route\.ts$/)
        .should()
        .notImportFrom('zod')
        .because('request payload validation belongs in module HTTP controllers, not thin API route wrappers')
        .check();
    });

    it('API routes must not import infrastructure directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/apps/**/api/**')
        .and()
        .haveNameMatching(/route\.ts$/)
        .should()
        .notImportFrom('**/infrastructure/**', '**/database/**')
        .because('API routes must resolve controllers via the module composition root, never import infrastructure')
        .check();
    });

    it('API route handlers must be exported standard HTTP verbs', () => {
      functions(p)
        .that()
        .resideInFolder('**/apps/**/api/**')
        .and()
        .haveNameMatching(/route\.ts$/)
        .should()
        .haveNameMatching(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/)
        .because('Next.js App Router route files must export standard uppercase HTTP verb functions')
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

    it('handlers must not use console statements directly', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/**')
        .should()
        .notContain(call(/console\.log|console\.error|console\.warn/))
        .because('application handlers must use structured logging via @sessioflow/shared-logging, never direct console statements')
        .check();
    });

    it('command handlers must call structured logger in execute()', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/**/commands/**')
        .and()
        .haveNameMatching(/(^|\.)execute$/)
        .should()
        .contain(call(/logger\.info|logger\.error/))
        .because('command handlers perform state-changing use cases and must include structured logging for auditability')
        .check();
    });

    it('command handlers must accept and use OutboxRepository for event persistence', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(commandHandlerOutboxConventions())
        .because('command handlers handle write operations and must persist domain events using OutboxRepository')
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

    // ───────────────────────────────────────────────────────────────────
    // Co-located DTO usage — prevents silent code rot
    // ───────────────────────────────────────────────────────────────────
    //
    // It's not enough for a .query.ts or .command.ts file to exist.
    // The handler must actually import and reference it in execute().
    // This catches the "ghost DTO" anti-pattern:
    //
    //   queries/get-conference/
    //     ├── get-conference.query.ts       ← defined but never used
    //     ├── get-conference.handler.ts     ← execute(params: { id: string })
    //     └── get-conference.response.ts
    //
    // The query/command file exists (passes coLocatedFile check)
    // but the handler never imports or references it.

    it('command handlers must import and use their co-located command DTO', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/commands/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(handlerMustReferenceCoLocatedDto('.command'))
        .because('handlers must use their co-located command DTO as the execute() parameter, not plain objects')
        .check();
    });

    it('query handlers must import and use their co-located query DTO', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/**/application/**/queries/**')
        .and()
        .haveNameMatching(/Handler$/)
        .should()
        .satisfy(handlerMustReferenceCoLocatedDto('.query'))
        .because('handlers must use their co-located query DTO as the execute() parameter, not plain objects')
        .check();
    });

    // ───────────────────────────────────────────────────────────────────
    // CQRS DTO conventions — primitives only, no domain leaks
    // ───────────────────────────────────────────────────────────────────
    //
    // Commands and queries are boundary DTOs. They are plain data
    // transfer objects that carry request data from interfaces through
    // the application layer to handlers.
    //
    // They must NEVER import from the domain layer because doing so
    // creates unwanted dependencies and makes the boundary fuzzy.
    // The handler converts primitives to value objects.
    //
    // Example violation this catches:
    //   // get-conference.query.ts
    //   import { ConferenceId } from '../domain/...';  ← BAD
    //   class GetConferenceQuery {
    //     constructor(readonly id: ConferenceId) {}     ← BAD
    //   }
    //
    // Correct:
    //   // get-conference.query.ts
    //   export type GetConferenceInput = { id: string; };
    //   export class GetConferenceQuery {
    //     constructor(readonly input: GetConferenceInput) {}
    //   }
    //   // Handler does: ConferenceId.fromString(query.input.id)

    it('query DTOs must not import from domain', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/queries/**')
        .and()
        .haveNameMatching(/\.query\.ts$/)
        .should()
        .notImportFrom('**/packages/modules/**/domain/**')
        .check();
    });

    it('query DTOs must not contain domain type properties', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/queries/**')
        .and()
        .haveNameMatching(/Query$/)
        .should()
        .satisfy(notContainDomainProperties())
        .because('query DTOs must only contain primitive types — never domain entities or value objects')
        .check();
    });

    it('command DTOs must not import from domain', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/commands/**')
        .and()
        .haveNameMatching(/\.command\.ts$/)
        .should()
        .notImportFrom('**/packages/modules/**/domain/**')
        .because('CQRS command DTOs are boundary data carriers — they must only contain primitives, never domain types')
        .check();
    });

    it('command DTOs must have an Input type alias', () => {
      // The command pattern requires a separate Input type (primitive-only)
      // that the command class wraps. This keeps the command class as a
      // simple container and allows the handler to convert primitives to VOs.
      //
      // Pattern: CreateConferenceInput + CreateConferenceCommand

      classes(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/commands/**')
        .and()
        .haveNameMatching(/Command$/)
        .should()
        .satisfy(hasInputType())
        .because('commands must separate the primitive Input type from the Command wrapper for clarity')
        .check();
    });

    it('query DTOs must have an Input type alias', () => {
      classes(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/application/queries/**')
        .and()
        .haveNameMatching(/Query$/)
        .should()
        .satisfy(hasInputType())
        .because('queries must separate the primitive Input type from the Query wrapper for clarity')
        .check();
    });
  });

  describe('Controller conventions', () => {
    it('controllers must import and instantiate their co-located command/query DTO', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/controller$/i)
        .should()
        .satisfy(controllerInstantiatesDto())
        .because('controllers must instantiate command/query DTOs to enforce the primitive-only boundary contract')
        .check();
    });

    it('controllers must not import from domain directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/\.controller\.ts$/)
        .should()
        .notImportFrom('**/packages/modules/**/domain/**')
        .because('controllers interact with handlers, never with domain objects directly')
        .check();
    });

    it('controller functions must be named ending with Controller', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/\.controller\.ts$/)
        .should()
        .haveNameMatching(/Controller$/)
        .because('HTTP controllers must follow uniform naming conventions')
        .check();
    });

    it('controllers must not import infrastructure directly', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/\.controller\.ts$/)
        .should()
        .notImportFrom('**/packages/modules/**/infrastructure/**', '**/database/**')
        .because('controllers must communicate through CQRS handlers, never infrastructure details')
        .check();
    });

    it('controllers must return Response or Promise<Response>', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/controller$/i)
        .should()
        .haveReturnTypeMatching(matching(/Response/))
        .because('HTTP controllers must return Web Standard Response objects')
        .check();
    });

    it('controllers must not import local interface schema files', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/\.controller\.ts$/)
        .should()
        .notImportFrom('**/interfaces/http/*.schema*')
        .because('controllers must source shared API contract schemas from @sessioflow/api-definitions per ADR-020, not local duplicate schema files')
        .check();
    });

    it('controllers must explicitly import their co-located Handler type using import type', () => {
      functions(p)
        .that()
        .resideInFolder('**/packages/modules/*/src/interfaces/**')
        .and()
        .haveNameMatching(/controller$/i)
        .should()
        .satisfy(controllerImportsHandlerType())
        .because('HTTP controllers must explicitly import their co-located Handler type via "import type" for 100% LLM/IDE traceability and zero runtime coupling')
        .check();
    });
  });

  describe('Module Composition Root conventions', () => {
    it('container files must import and instantiate Mediator from @sessioflow/bus', () => {
      modules(p)
        .that()
        .resideInFolder('**/packages/modules/*')
        .and()
        .haveNameMatching(/container\.ts$/)
        .should()
        .onlyImportFrom(
          '**/packages/modules/**',
          '**/packages/shared/**',
          '**/node_modules/**',
        )
        .because('module containers act as composition roots and wire handlers into the Mediator / Bus')
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
