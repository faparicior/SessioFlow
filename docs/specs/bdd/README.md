# BDD Specifications Repository

Comprehensive Behavior-Driven Development documentation for SessionFlow.

---

## 📂 Structure

- `feat-[number]-[name].md` - Feature specifications
- `/_global-behaviours/` - Shared system behaviors
- `/_shared/` - Shared utilities and contracts

---

## 🎯 Features

### Configuration

- [FEAT-001: Setup Event (Event Creation Wizard)](./feat-001-setup-event.md) - Organizers can create new events through a 4-step wizard with automatic slug generation and UUID assignment

### Content Management

- [FEAT-004: Collect Proposals (CfP)](./feat-004-collect-proposals.md) - Public Call for Papers form for speakers to submit session proposals with co-speaker support and custom validation

### User Management

- [FEAT-003: Speaker Profile with Photo Upload](./feat-003-speaker-profile.md) - Speakers can create and manage profiles with bio, photo upload, and social media links

### Authentication

- [FEAT-002: User Authentication](./feat-002-user-authentication.md) - Secure email-based magic link authentication with role-based access control for organizers and speakers

---

## 📐 Guidelines

- Use sequential IDs (`FEAT-001`, `FEAT-002`, etc.)
- Follow `TEMPLATE.md` for format consistency
- All scenarios must have `Given/When/Then` steps in Gherkin syntax
- Include acceptance criteria for each feature
- Link related specifications where applicable
- Keep scenarios focused and testable

---

## 📋 Global Behaviours

### Validation

- [GB-VAL-001: Date Validation Rules](./_global-behaviours/validation/gb-val-001-date-validation.md) - Centralized date validation logic for all date inputs

### Navigation

- *(pending)*

### Error Handling

- *(pending)*

---

## 🔧 Data Contracts

Data contracts are defined per feature. See individual feature files for specific contract definitions.

---

**Last Updated**: 2026-03-18  
**Version**: 1.0.0  
**Features Documented**: 4 (MVP Wave 1)
