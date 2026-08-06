# 🎯 DDD UI Layer - REST Controllers - {{PackageName}} Package (Generic Guidelines)

> **Instructions**: Fill in each section below with patterns and examples found in the specific codebase. Use generic business concepts (Order, User, Product, etc.) instead of actual business logic from the codebase.

> This document defines the REST Controller patterns and guidelines for the `{{PackageName}}` package following DDD architectural principles.
>
> **Related templates**: `template-ddd-event-consumer-wow.md` | `template-ddd-scheduler-wow.md`

---

## 🧭 Table of Contents

1. [📌 Overview](#-overview)
2. [🏗️ Architecture Position](#-architecture-position)
3. [📐 Core Patterns and Rules](#-core-patterns-and-rules)
4. [🗺️ Request / Response Mapping](#-request--response-mapping)
5. [🔢 HTTP Status Code Strategy](#-http-status-code-strategy)
6. [🛠️ Implementation Guidelines](#-implementation-guidelines)
7. [⚠️ Error Handling Strategy](#-error-handling-strategy)
8. [🧪 Testing Approach](#-testing-approach)
9. [⚡ Performance Considerations](#-performance-considerations)
10. [🔒 Security Guidelines](#-security-guidelines)
11. [📝 Implementation Notes](#-implementation-notes)
12. [🚫 Anti-Patterns to Avoid](#-anti-patterns-to-avoid)
13. [Summary](#summary)
14. [Pattern Index](#pattern-index)
15. [❓ Open Questions](#-open-questions)

---

## 📌 Overview

**Package:** `{{PackageName}}`  
**Description:** {{PackageDescription}}  
**Responsibility:** {{PrimaryResponsibility}}

**Domain Purpose:** {{DomainPurpose}}

**Architecture Layer:** UI Layer - REST Controllers

---

## 🏗️ Architecture Position

```
HTTP Client → Controller ({{PackageName}}) → Application Layer ({{ApplicationComponents}}) → Domain Layer
```

The `{{PackageName}}` controllers sit at the HTTP boundary, translating HTTP requests into application layer commands/queries and mapping domain responses back to HTTP, while maintaining proper separation of concerns.

### Package Structure Convention

_[Describe the package naming and organization pattern]_

Examples:

- _[Add 2-3 generic examples of package structure]_

---

## 📐 Core Patterns and Rules

### Categories Analyzed

| Category          | Description              |
| ----------------- | ------------------------ |
| **{{Category1}}** | {{CategoryDescription1}} |
| **{{Category2}}** | {{CategoryDescription2}} |

---

### Rules by Category

#### {{CategoryName}}

**Total Patterns Found**: {{PatternCount}}

{{#PatternRules}}

##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{UseCasePatternDescription}}:**

```
{{GoodPatternExample}}
```

**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**Key Benefits:**
{{#Benefits}}

- **{{BenefitName}}**: {{BenefitDescription}}
  {{/Benefits}}

**❌ BAD - {{UseCaseAntiPatternDescription}}:**

```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}

- {{Reason}}
  {{/AntiPatternReasons}}

{{/PatternRules}}

---

## 🗺️ Request / Response Mapping

### Request Mapping Strategy

- **{{RequestMappingPattern}}**: {{RequestMappingDescription}}
- **Validation Approach**: {{ValidationApproach}}
- **Deserialization**: {{DeserializationStrategy}}

### Response Mapping Strategy

- **{{ResponseMappingPattern}}**: {{ResponseMappingDescription}}
- **Serialization**: {{SerializationStrategy}}
- **Null Handling**: {{NullHandlingStrategy}}

{{#MappingPatternRules}}

##### Rule {{RuleId}}: {{PatternName}} Pattern

**✅ GOOD - {{PatternDescription}}:**

```
{{GoodPatternExample}}
```

**Source**: {{#SourceFiles}}[{{ClassIndexIdentifier}}] {{FileName}}{{#HasNext}}, {{/HasNext}}{{/SourceFiles}}

**❌ BAD - {{AntiPatternDescription}}:**

```
{{AntiPatternExample}}
```

**Why it's bad:**
{{#AntiPatternReasons}}

- {{Reason}}
  {{/AntiPatternReasons}}

{{/MappingPatternRules}}

---

## 🔢 HTTP Status Code Strategy

### Domain Exception to HTTP Status Mapping

| Domain Exception / Outcome | HTTP Status       | Description            |
| -------------------------- | ----------------- | ---------------------- |
| `{{DomainException1}}`     | `{{HttpStatus1}}` | {{StatusDescription1}} |
| `{{DomainException2}}`     | `{{HttpStatus2}}` | {{StatusDescription2}} |
| `{{DomainException3}}`     | `{{HttpStatus3}}` | {{StatusDescription3}} |

### Status Code Rules

- **{{StatusCodeRule1}}**: {{StatusCodeRuleDescription1}}
- **{{StatusCodeRule2}}**: {{StatusCodeRuleDescription2}}

---

## 🛠️ Implementation Guidelines

### Dependency Injection

- **{{DIPattern}}**: {{DIDescription}}
- **Configuration**: {{ConfigurationApproach}}
- **Lifecycle**: {{LifecycleManagement}}

### Input Validation

- **{{ValidationPattern}}**: {{ValidationDescription}}
- **Boundary Validation**: {{BoundaryValidationDescription}}

{{#ImplementationGuidelines}}

### {{GuidelineName}}

{{GuidelineDescription}}

{{/ImplementationGuidelines}}

---

## ⚠️ Error Handling Strategy

### {{ErrorHandlingPattern}}

{{ErrorHandlingDescription}}

**Example:**

```
{{ErrorHandlingExample}}
```

### {{ErrorRecoveryPattern}}

{{ErrorRecoveryDescription}}

### {{ErrorLoggingPattern}}

{{ErrorLoggingDescription}}

---

## 🧪 Testing Approach

### Unit Testing

- **{{UnitTestPattern}}**: {{UnitTestDescription}}
- **Mock Strategy**: {{MockStrategy}}
- **Coverage Target**: {{CoverageTarget}}

### Integration Testing (MockMvc / WebMvcTest)

- **{{IntegrationTestPattern}}**: {{IntegrationTestDescription}}
- **Test Environment**: {{TestEnvironment}}
- **Data Setup**: {{DataSetupStrategy}}

### Controller Testing Rules

{{#GoodTestExamples}}

#### ✅ Good Test Structure

```
{{GoodTestExample}}
```

{{/GoodTestExamples}}

{{#BadTestExamples}}

#### ❌ Bad Test Patterns

```
{{BadTestExample}}
```

{{/BadTestExamples}}

---

## ⚡ Performance Considerations

{{#PerformancePatterns}}

### {{PerformancePatternName}}

{{PerformancePatternDescription}}

{{/PerformancePatterns}}

---

## 🔒 Security Guidelines

### Input Sanitization

- **{{InputSanitizationPattern}}**: {{InputSanitizationDescription}}

### Authentication & Authorization

- **{{AuthPattern}}**: {{AuthDescription}}

### CSRF Protection

- **{{CsrfPattern}}**: {{CsrfDescription}}

{{#SecurityPatterns}}

### {{SecurityPatternName}}

{{SecurityPatternDescription}}

{{/SecurityPatterns}}

---

## 📝 Implementation Notes

{{#ImplementationNotes}}

### {{ImplementationNoteName}}

{{ImplementationNoteDescription}}

{{/ImplementationNotes}}

---

## 🚫 Anti-Patterns to Avoid

{{#AntiPatterns}}

### ❌ {{AntiPatternName}}

**Problem:** {{AntiPatternProblem}}  
**Solution:** {{AntiPatternSolution}}

{{/AntiPatterns}}

---

## Summary

**Key Implementation Principles** _(actionable guidelines for developers)_

{{SummaryIntroduction}}

1. **{{KeyPrinciple1}}** - {{KeyPrinciple1Description}}
2. **{{KeyPrinciple2}}** - {{KeyPrinciple2Description}}
3. **{{KeyPrinciple3}}** - {{KeyPrinciple3Description}}
4. **{{KeyPrinciple4}}** - {{KeyPrinciple4Description}}
5. **{{KeyPrinciple5}}** - {{KeyPrinciple5Description}}

- **DDD Patterns:** {{DDDPatternReferences}}
- **Architecture Documentation:** {{ArchitectureDocumentation}}

**What to Avoid** _(common anti-patterns and restrictions)_

{{WhatToAvoid}}

---

## Pattern Index

{{#PatternCategories}}

### {{CategoryName}} Patterns

{{#Patterns}}
{{PatternIndex}}. **{{PatternId}}**: {{PatternName}} - [{{ClassIndexIdentifier}}] {{FileName}}
{{/Patterns}}

{{/PatternCategories}}

### Coverage Summary

**Total UI Layer Controllers Analyzed**: {{TotalInterfaceCount}}
{{#CoverageByCategory}}

- **{{CategoryName}}**: {{InterfaceCount}} controllers ({{CoveragePercentage}}% coverage)
  {{/CoverageByCategory}}

**Key Files Analyzed**:
{{#AnalyzedFiles}}

- [{{ClassIndexIdentifier}}] {{FileName}} ✓
  {{/AnalyzedFiles}}
  {{#AdjacentCollaborators}}
- [{{ClassIndexIdentifier}}] {{FileName}} _(adjacent collaborator)_
  {{/AdjacentCollaborators}}

---

## ❓ Open Questions

{{#OpenQuestions}}

- [ ] {{OpenQuestion}}
      {{/OpenQuestions}}

---

> **⚠️ TEMPLATE INSTRUCTIONS BELOW THIS POINT - DO NOT INCLUDE THIS SECTION IN FINAL DOCUMENTS**

Use @context/templates/ai-development/ai-definitions/ddd-discovery/definition-template-generic-id-management-guidelines.md for pattern ID management.

## Template Variables Reference

### Pattern Definition Variables

- `{{PatternCount}}` - Total number of patterns found in analysis
- `{{PatternRules}}` - Array of pattern rule objects for dynamic iteration
- `{{MappingPatternRules}}` - Array of request/response mapping pattern rules
- `{{PatternCategories}}` - Array of pattern category objects with nested patterns
- `{{PatternId}}` - Unique pattern identifier (e.g., "CTL-REQ-01", "CTL-RSP-01")
- `{{PatternName}}` - Descriptive name of the pattern (e.g., "Command Delegation Pattern")
- `{{ClassIndexIdentifier}}` - Hash identifier from class index (e.g., "a1b2c3d4e5f6")
- `{{FileName}}` - Source file name (e.g., "OrderController.ext")
- `{{Benefits}}` - Array of benefit objects with BenefitName and BenefitDescription
- `{{AntiPatternReasons}}` - Array of reason strings for anti-pattern explanations
- `{{SourceFiles}}` - Array of source file objects with ClassIndexIdentifier and FileName

### HTTP Status Mapping Variables

- `{{DomainException1}}` - Domain exception class name (e.g., "OrderNotFoundException")
- `{{HttpStatus1}}` - HTTP status code (e.g., "404 Not Found")
- `{{StatusDescription1}}` - Description of when this status is returned

### Coverage Summary Variables

- `{{TotalInterfaceCount}}` - Total number of controllers analyzed
- `{{CoverageByCategory}}` - Array of coverage objects with CategoryName, InterfaceCount, and CoveragePercentage

### File Analysis Variables

- `{{AnalyzedFiles}}` - List of all files that were analyzed
- `{{ClassIndexIdentifier}}` - Unique hash for file identification
- `{{FileName}}` - Name of the analyzed file

## Usage Instructions

### 1. Pattern Identification

For each controller pattern found in your analysis:

1. Assign a unique pattern ID following the format: `CTL-{{CategoryPrefix}}-{{Number}}`
   - `CTL-REQ-XX`: Request handling and deserialization patterns
   - `CTL-RSP-XX`: Response mapping and serialization patterns
   - `CTL-ERR-XX`: Error handling and HTTP status mapping patterns
   - `CTL-VAL-XX`: Input validation patterns
   - `CTL-SEC-XX`: Security and authorization patterns

2. Create descriptive pattern names that capture the architectural intent
3. Reference the source file using the class index identifier

### 2. What to Analyze

- **Request Structure**: DTO definitions, deserialization, validation annotations
- **Application Layer Delegation**: How controllers delegate to use cases (Command/Query objects)
- **Response Mapping**: How domain results are converted to response DTOs
- **HTTP Status Strategy**: Exception handler mappings, centralized error handler usage
- **Authentication/Authorization**: How security context is accessed and validated

### 3. Pattern Naming Conventions

#### Good Pattern Names

- ✅ **Command Delegation Pattern** - Describes application layer interaction
- ✅ **Domain Exception Translation Pattern** - Describes HTTP error mapping
- ✅ **Boundary DTO Pattern** - Describes isolation of transport model
- ✅ **Request Validation Gate Pattern** - Describes input validation at boundary

#### Bad Pattern Names

- ❌ **Spring Controller Pattern** - Too technology-specific
- ❌ **REST Pattern** - Too generic
- ❌ **Handler Pattern** - Vague and unhelpful

### 4. Controller Analysis Guidelines

#### What to Look For

- **Thin Controller Rule**: Controllers should only translate and delegate — no business logic
- **DTO Isolation**: Request/response objects must not leak domain types to clients
- **Use Case Dependency**: Each endpoint delegates to exactly one use case
- **Error Boundary**: All domain exceptions are translated to HTTP responses in one place

#### Anti-Patterns to Identify

- **Fat Controller**: Business logic or multiple domain operations in one endpoint handler
- **Domain Leakage**: Domain objects used directly as request/response bodies
- **Inline Error Handling**: `try/catch` blocks in each method instead of a centralized error handler
- **Validation Bypass**: Accepting raw user input without boundary validation

### 5. Template Completion Checklist

- [ ] All controller files analyzed and catalogued
- [ ] Pattern IDs assigned following `CTL-XX-XX` convention
- [ ] HTTP status mapping table completed
- [ ] Request/response mapping patterns documented
- [ ] Good/bad examples provided for major patterns
- [ ] Source references include class index identifiers
- [ ] Input validation approach documented
- [ ] Security section completed (auth, CSRF, sanitization)
- [ ] MockMvc/WebMvcTest integration testing approach described
- [ ] Performance considerations addressed
- [ ] Anti-patterns documented with solutions
- [ ] Summary section completed with actionable guidelines
