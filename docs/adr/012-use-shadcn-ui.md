# Use "shadcn/ui" for Component Library

* **Status:** Proposed
* **Date:** 2026-01-09
* **Decision Makers:** Core Team
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

The Inception Workshop mandates a **"Premium" and "Wow" design aesthetics** (System Instructions) while sticking to a tight timeline (8 weeks MVP). While **Tailwind CSS** (ADR-003) provides the utility classes, building complex accessible components (Modals, Dropdowns, Date Pickers, Data Tables) from scratch is time-consuming and error-prone. We need a component solution that accelerates development for the **Organizer Dashboard** (Fernando) and **CfP Forms** (Andrea) without lock-in to a heavy runtime framework or generic "Material Design" look.

**Decision Drivers:**
*   **Constraint:** "Rich Aesthetics" and "Dynamic Design" required by System Instructions.
*   **Constraint:** Tight Schedule (8 Weeks for MVP with complex features like Auth & Profiles).
*   **Requirement:** Accessibility (WCAG compliance for public forms).
*   **Alignment:** Must work seamlessly with **Next.js** (ADR-001) and **Tailwind CSS** (ADR-003).
*   **Preference:** Total control over styles (avoid fighting a library's defaults).

## Considered Options

*   **shadcn/ui**
*   **Material UI (MUI)**
*   **Chakra UI**
*   **Headless UI + Manual Styling**
*   **DaisyUI**

## Decision Outcome

**Chosen Option:** "shadcn/ui"

**Justification:**
**shadcn/ui** is not a component library in the traditional sense; it is a collection of re-usable components that you copy and paste into your apps. It is built on top of **Radix UI** (for accessible, headless primitives) and **Tailwind CSS** (for styling). This perfectly aligns with our existing architectural choices. It allows us to achieve a "Premium" look immediately (high-quality defaults) while retaining 100% control over the code, as the components live in our project. It significantly accelerates the construction of the "Review & Score" dashboard (Data Tables) and "Co-Speaker Invite" forms.

### Consequences

*   **Positive:** "Premium" design out-of-the-box with minimal effort.
*   **Positive:** Fully accessible (Radix UI under the hood).
*   **Positive:** Zero bundle size overhead for unused components (unlike MUI).
*   **Positive:** Easy integration with **Zod** and **React Hook Form**.
*   **Negative:** Updates are manual (since we own the code).
*   **Risks:** "Copy-paste" model can lead to divergent code if not managed well (ADR-011 Colocation helps here).

## Pros and Cons of the Options

### shadcn/ui

*   Good, because it gives complete ownership of the component code.
*   Good, because it uses Tailwind CSS (ADR-003) natively.
*   Good, because it provides complex components like Data Tables and Date Pickers essential for the Organizer Dashboard.
*   Bad, because we are responsible for maintaining the component code after copying it.

### Material UI (MUI)

*   Good, because it is extremely comprehensive and battle-tested.
*   Bad, because it brings a heavy runtime CSS-in-JS engine.
*   Bad, because it has a very distinct "Google" look that contradicts the "Unique/Premium" design goal without heavy customization.
*   Bad, because it conflicts with the Tailwind CSS decision.

### Chakra UI

*   Good, because it is easy to use and accessible.
*   Bad, because it relies on runtime style props (CSS-in-JS), which can have performance costs in React Server Components.
*   Bad, because the default theme is generic.

### Headless UI + Manual Styling

*   Good, because complete freedom.
*   Bad, because it requires significant time to style every state (hover, focus, active) from scratch, risking the 8-week timeline.

## Links

*   [shadcn/ui Documentation](https://ui.shadcn.com/)
*   [Radix UI](https://www.radix-ui.com/)
*   [ADR-003: Use Tailwind CSS](./003-use-tailwind-css.md)
