---
description: Implement a feature or re-implement a modified feature based on a BDD specification file
---

Act as a Senior Software Engineer and React/Ink expert. Your task is to implement or re-implement a feature in the project based on the provided BDD specification file.

1- **Analyze the Specification**:

- Read the BDD feature file provided in {{input}}.
- Carefully examine the **Scenarios** (Given/When/Then) to understand the logic.
- Review the **Implementation Details** section to identify the target files, CLI routes, and data validation rules.
- **If this is a re-implementation**, compare the spec with the existing code to identify what needs to change.

2- **Context Gathering**:

- **CRITICAL**: Read `AGENTS.md` (or `aiforddd-cli/AGENTS.md` if in sub-repo) to understand the architecture, coding standards (XO, Prettier), and **Testing Strategy**. You must follow the rules defined there (e.g., test co-location, naming conventions).
- Read `./docs/specs/bdd/_shared/contracts.md` to ensure data structures (like configuration/repository models) are implemented correctly.
- If the spec references global behaviours (e.g., `GB-NAV-001`), read the corresponding file in `./docs/specs/bdd/_global-behaviours/` to respect the established patterns.

3- **Implementation Planning**:

- functionality: Break down the feature into Service logic vs UI presentation.
- Navigation: Determine how this screen is accessed and where it links in the application (e.g., updating `src/app.tsx` or `src/screens/MainScreen.tsx`).
- **Refactoring Strategy (if applicable)**: If existing code needs to change, plan minimal, targeted edits to support the new requirements without breaking existing functionality.

4- **Code Implementation**:

- **Services**: Implement or update the business logic (e.g., file system scanning, config updates) in `src/services/`.
- **UI/Screens**: Create or update the screen components in `src/screens/` or `src/commands/`. Use strictly `Ink` components (`<Box>`, `<Text>`, etc.).
- **Integration**: Register the new route/screen in the main application flow.

5- **Testing**:

- **Discover Testing Rules**: Re-read unit test location rules in `AGENTS.md`.
- **Unit Tests**: Create or update unit tests for components/logic following the location rules (e.g., `src/components/MyComponent.test.tsx`).
- **Feature Tests**: Create or update a feature test file (e.g., `tests/features/[feature-name].test.tsx`) that mirrors the BDD scenarios.
- Use `ink-testing-library` to render the component and assert the output text.
- Ensure "Given" steps are set up (mocks), "When" steps are executed (user input), and "Then" steps are verified (check last frame).

6- **Final Verification**:

- Ensure the code is compliant with `xo` linting rules (no implicitly any, used defined types).
- Verify that no hardcoded strings violate the `contracts.md` definitions.
- Run `npm test` to ensure all tests pass.

7- **Documentation Update**:

- **Mark Checkboxes**: In the feature spec file, mark all completed items with `[x]`:
  - Mark completed unit tests in the "Testing Strategy" section.
  - Mark completed feature tests in the "Testing Strategy" section.
  - Mark completed acceptance criteria in the "Acceptance Criteria" section.
- Update the status in `./docs/specs/bdd/README.md` and/or `./docs/specs/bdd/_global-behaviours/README.md` to `✅ Implemented`.
- Update the status in the spec file itself to `✅ Implemented`.
