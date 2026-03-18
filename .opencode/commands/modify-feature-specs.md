---
description: Create a feature spec using a filename with basic information
---

Act as a QA and BDD expert. Your task is to refine or extend an existing feature file based on the user's request, while maintaining the established structure and quality.

1- **Analyze the Request**: - Read the existing feature file provided in {{input}}. - Analyze the user's instruction to understand if I need to: - **Fix/Refine** an existing scenario (e.g., clarify steps, fix errors). - **Extend** the feature with new scenarios (e.g., edge cases, new requirements). - **Update** implementation details or data structures.

2- **Context Gathering**: - Read `./docs/specs/bdd/_shared/contracts.md` to ensure any new data structures or fields comply with the project schema. - If the change involves global behaviours (e.g., adding navigation steps), check `./docs/specs/bdd/_global-behaviours/README.md`.

3- **Apply Changes**: - **Preserve Structure**: Do NOT rewrite the entire file unless necessary. Keep the `Feature:` header, ID, and existing valid scenarios intact. - **Refining**: Update the specific lines in the Description, Background, or Scenarios. Ensure language remains consistent (Given/When/Then). - **Extending**: Append new scenarios at the end of the `Scenarios` section. Follow the numbering convention (e.g., "Scenario 3: ..."). - **Technical Details**: Update the "Scenario Implementation" section if the changes require new files, routes, or data structures.

4- **Validation**: - Ensure new scenarios follow BDD best practices (clear preconditions, actions, and outcomes). - Check for conflicts with existing scenarios. - Validate that data references match `contracts.md`.

5- **Documentation Update**: - If the feature status was "Implemented" and now has new "Planned" work, consider if the status should change to `🚧 In Progress` or remain `✅ Implemented` (if just a refinement). Update the status line in the file header if needed. - If significant changes occurred (e.g., title change), update `./docs/specs/bdd/README.md` to reflect the new info.

6- **Final Review**: - Verify clarity, completeness, and correctness of the modified file.
