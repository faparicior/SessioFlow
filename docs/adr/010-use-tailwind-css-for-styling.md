# 010-use-tailwind-css-for-styling

* **Status:** ✅ **APPROVED**
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** N/A

## Context and Problem Statement

SessioFlow requires a styling solution that enables:

1. **Rapid Development**: MVP must be built within 6 weeks by 2 developers
2. **Consistency**: UI must maintain visual coherence across all features
3. **Usability**: Interface must achieve 4/5 ease-of-use rating (Usability ranked #1 in trade-offs)
4. **Maintainability**: Volunteer developers must be able to modify styles without breaking the design
5. **Accessibility**: Components must be WCAG 2.1 AA compliant for inclusive user experience

The MVP Canvas identifies "UX Enablers" including "Setup Wizard design" and "Public Landing Page template." These require a styling system that supports both custom designs and rapid prototyping.

**Decision**: While Tailwind CSS provides the styling foundation, **shadcn/ui** (see ADR-014) is the recommended component library for building accessible, consistent UI components. This combination provides the best balance of speed, accessibility, and customization.

Fernando's need for a "Simple, intuitive interface that doesn't require training" requires a polished, professional UI that can be developed quickly without a dedicated designer.

**Decision Drivers:**
- Must enable rapid UI development within 6-week MVP timeline
- Must provide consistent design system without requiring design expertise
- Must support responsive design for mobile access (Andrea submits "on the go")
- Must allow easy customization for branding by different event organizers
- Must integrate well with Next.js and React component architecture
- Must not add significant bundle size that impacts performance

## Considered Options

1. **Tailwind CSS (Utility-First Framework)**
2. **Material-UI (Component Library)**
3. **Chakra UI (Accessible Component Library)**
4. **Custom CSS with CSS Variables**

## Decision Outcome

**Chosen Option:** "Tailwind CSS with shadcn/ui Components"

**Justification:**
Tailwind CSS with shadcn/ui is the optimal choice because it provides the best balance of development speed, customization, accessibility, and maintainability:

1. **Development Speed**: shadcn/ui provides 30+ pre-built, accessible components that can be copied into the codebase, reducing custom UI development time by weeks
2. **Consistency**: Design tokens and utility classes ensure visual consistency across all features
3. **Accessibility**: shadcn/ui components are built on Radix UI, providing WCAG 2.1 AA compliance out of the box
4. **Customization**: Easy to customize theme for different event organizers without fighting framework defaults
5. **Next.js Integration**: Excellent integration with Next.js, including automatic CSS purging for production
6. **Usability**: Enables creation of accessible, responsive interfaces with built-in best practices

### Consequences

* **Positive:**
  - Fast iteration: Changes can be made directly in JSX without context switching
  - Smaller bundle size: Production builds include only used utilities (with PurgeCSS)
  - Responsive design: Built-in breakpoints make mobile-first design straightforward
  - Design consistency: Predefined spacing, colors, and typography ensure visual harmony
  - Community support: Extensive component libraries (Headless UI, daisyUI, shadcn/ui) accelerate development
  - **shadcn/ui Integration**: Pre-built accessible components reduce development time while maintaining full customization control

* **Negative:**
  - HTML can become cluttered with many utility classes
  - Learning curve for developers unfamiliar with utility-first approach
  - May require configuration to match specific design requirements
  - Some developers prefer semantic class names over utility classes
  - Building accessible components from scratch requires significant expertise (mitigated by using shadcn/ui)

* **Risks:**
  - Over-reliance on utilities may make HTML harder to read for some developers
  - Custom designs may require extending the default theme configuration
  - Migration away from Tailwind would require significant refactoring
  - Design system decisions must be made early to ensure consistency
  - Accessibility requires careful attention (mitigated by using shadcn/ui components)

### Pros and Cons of the Options

#### Option 1: Tailwind CSS with shadcn/ui Components

* Good, because it provides pre-built, accessible components that are copied into your codebase (no vendor lock-in)
* Good, because it combines Tailwind's styling flexibility with Radix UI's accessibility primitives
* Good, because it accelerates development with 30+ production-ready components
* Good, because you own and can customize every component, enabling complete design control
* Good, because it provides WCAG 2.1 AA compliant components out of the box
* Bad, because it requires understanding headless UI patterns for advanced customization
* Bad, because component updates must be applied manually rather than automatically via npm

#### Option 1b: Tailwind CSS (Utility-First Framework) - Standalone

* Good, because it enables rapid UI development with utility classes that can be applied directly in JSX
* Good, because it provides a consistent design system with predefined spacing, colors, and typography
* Good, because it supports responsive design with built-in breakpoints for mobile-first development
* Good, because it integrates seamlessly with Next.js and supports automatic CSS optimization
* Good, because it allows easy customization through configuration without fighting framework defaults
* Bad, because HTML can become cluttered with many utility classes
* Bad, because it requires learning the utility class naming convention
* Bad, because building accessible components from scratch requires significant expertise
* Bad, because it increases development time compared to using pre-built accessible components

#### Option 2: Material-UI (Component Library)

* Good, because it provides ready-made components that follow Material Design guidelines
* Good, because it includes built-in accessibility and theming support
* Bad, because Material Design may not match the desired aesthetic for all events
* Bad, because it adds significant bundle size (~100KB gzipped)
* Bad, because customization requires overriding Material Design defaults
* Bad, because it creates dependency on a specific design language

#### Option 3: Chakra UI (Accessible Component Library)

* Good, because it provides accessible components with excellent documentation
* Good, because it supports theming and customization well
* Bad, because it adds bundle size similar to Material-UI
* Bad, because it may limit design flexibility compared to utility-first approaches
* Bad, because it creates dependency on a specific component library
* Bad, because it may not align with the "Lightweight" product attribute

#### Option 4: Custom CSS with CSS Variables

* Good, because it provides complete control over styling without framework constraints
* Good, because it has zero dependencies and minimal bundle size
* Bad, because it requires significant time to build a consistent design system
* Bad, because it increases the risk of inconsistent styling across features
* Bad, because it requires more manual work for responsive design and browser compatibility
* Bad, because it would extend the 6-week MVP timeline significantly
* Bad, because it requires design expertise that volunteers may not have

## Component Strategy

### Recommended: shadcn/ui

**See ADR-014** for complete shadcn/ui decision details. Core components for MVP:

| Component | Usage | Accessibility |
|-----------|-------|---------------|
| Button | All interactive actions | Keyboard navigable |
| Input | Form fields | ARIA labels, validation |
| Textarea | Abstract descriptions | Character counts |
| Card | Dashboard summaries | Semantic HTML |
| Dialog | Modals | Focus management |
| Alert | Notifications | Screen reader announcements |
| Select | Dropdowns | Keyboard accessible |
| Avatar | Profile photos | Alt text support |

### Custom Components

For features not covered by shadcn/ui, build custom components using:
- Tailwind CSS for styling
- Radix UI primitives for accessibility (if needed)
- Consistent design tokens from theme configuration

## Design System Approach

### Color Palette
- Primary: Conference-specific branding color (configurable)
- Secondary: Neutral supporting color
- Semantic: Success, warning, error colors for feedback

### Typography
- Font family: System fonts for performance and familiarity
- Scale: Consistent heading and body text sizes

### Spacing
- Base unit: 4px or 8px scale for consistent spacing
- Breakpoints: Mobile, tablet, desktop

### Components
- Build reusable components for common patterns (buttons, forms, cards)
- Use Headless UI for accessible component primitives
- Document component usage in a style guide

## Links

* [Tailwind CSS Documentation](https://tailwindcss.com/docs)
* [MVP Canvas - UX Enablers](../inception/8-mvp-canvas-definition.md#6-technical--ux-enablers)
* [Persona: Andrea - Mobile Access Need](../inception/3-personas.md#persona-name-andrea-the-experienced-speaker)
* [Trade-offs - Usability Priority](../inception/2-tradeoffs.md#2-final-consensus-trade-off-board)
