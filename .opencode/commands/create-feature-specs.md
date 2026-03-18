---
description: Create a feature spec using a filename with basic information
---

Act as a QA and BDD expert. Your task is to generate a professional feature file based on the provided definition.

1- Read the filename {{input}}, extract any relevant information.

2- **Select the Correct Template**:

- If the filename starts with `gb-` or describes a "Global Behaviour", use the template from `./docs/specs/bdd/_global-behaviours/TEMPLATE.md`.
- Otherwise, use the standard feature template from `./docs/specs/bdd/TEMPLATE.md`.

3- Use the **selected template** to create a feature file with the extracted information.

4- Ensure the feature file is well-structured, clear, and follows BDD best practices.

5- The feature file should include a clear title, description, and well-defined scenarios with Given/When/Then steps.

6- If the filename lacks sufficient information, make reasonable assumptions to fill in the gaps while maintaining clarity and relevance to the feature being described.

7- **Rename the filename** to fit into the directory structure: - For **Features**: Use `./docs/specs/bdd/feat-[number]-[name].md` (ID: `FEAT-[NUMBER]`). - For **Global Behaviours**: Use `./docs/specs/bdd/_global-behaviours/[category]/gb-[category]-[number]-[name].md` (ID: `GB-[CATEGORY]-[NUMBER]`). - Use the next available sequential ID (check the README or file list).

8- Update the `./docs/specs/bdd/README.md` file to include a link to the newly created feature file in the appropriate section.

9- Ensure that the new feature file is properly linked in the README.md under the correct category (e.g., Configuration, Repository Management, etc.).

10- Validate that the feature file adheres to the data contracts defined in `./docs/specs/bdd/_shared/contracts.md`.

11- Finally, review the feature file for clarity, completeness, and correctness before finalizing it.
