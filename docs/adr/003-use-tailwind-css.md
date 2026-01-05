# Use Tailwind CSS for Styling

* **Status:** Proposed
* **Date:** 2026-01-05
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

The MVP requires a "clean & focused" design system that looks professional but doesn't eat up weeks of development time. We need a styling solution that ensures consistency, supports mobile responsiveness (needed for the Speaker persona), and integrates well with Next.js.

**Decision Drivers:**
*   **Requirement:** Mobile-responsive design.
*   **Requirement:** "Premium" look and feel (not generic).
*   **Speed:** fast iteration on UI components.
*   **Maintainability:** Avoid "CSS file sprawl" and global namespace collisions.

## Considered Options

*   **Tailwind CSS**
*   **Vanilla CSS**
*   **CSS Modules**
*   **Bootstrap / Material UI (Component Libraries)**

## Decision Outcome

**Chosen Option:** "Tailwind CSS"

**Justification:**
Tailwind CSS allows for extremely rapid UI development by using utility classes directly in the markup. This matches the "Component" model of React/Next.js perfectly. It ensures design consistency (spacing, colors) through its configuration, preventing "magic numbers" in CSS. While Vanilla CSS provides control, Tailwind offers a significant speed advantage for an MVP while still allowing for a custom, premium design (unlike Bootstrap which has a distinct "default" look).

### Consequences

*   **Positive:** Rapid prototyping and development.
*   **Positive:** Automatically removes unused CSS for production (performance).
*   **Positive:** Mobile-first approach is built-in.
*   **Negative:** HTML markup can become cluttered with class names.
*   **Risks:** Learning curve for developers used to traditional CSS.

## Pros and Cons of the Options

### Tailwind CSS

*   Good, because it speeds up development significantly once learned.
*   Good, because it enforces a design system (constraints).
*   Bad, because "ugly" HTML classes.

### Vanilla CSS

*   Good, because it relies on standard web technologies.
*   Good, because it allows full separation of concerns.
*   Bad, because it requires more manual work to maintain consistency and responsiveness.

### Bootstrap / Material UI

*   Good, because it provides pre-built components.
*   Bad, because the site looks like every other Bootstrap site unless heavily customized.
*   Bad, because the bundle size can be large.

## Links

*   [Tailwind CSS](https://tailwindcss.com/)
