# 014-use-shadcn-ui-for-components

* **Status:** Proposed
* **Date:** 2026-06-05
* **Decision Makers:** Product Team, Technical Lead
* **Supersedes:** N/A
* **Amended By:** ADR-010 (Tailwind CSS for Styling)

## Context and Problem Statement

SessioFlow requires a UI component strategy that enables:

1. **Rapid Development**: MVP must be built within 6 weeks by 2 developers
2. **Accessibility**: Interface must achieve 4/5 ease-of-use rating (Usability ranked #1 in trade-offs)
3. **Consistency**: UI must maintain visual coherence across all features without a dedicated designer
4. **Customization**: Different event organizers should be able to brand the application

The MVP Canvas identifies "UX Enablers" including "Setup Wizard design" and "Public Landing Page template." These require accessible, polished UI components that can be developed quickly.

Fernando's need for a "Simple, intuitive interface that doesn't require training" and Andrea's need for a "smooth an easy way to create a session proposal" require UI components that are both functional and accessible.

**Decision Drivers:**
- Must accelerate UI development within 6-week MVP timeline
- Must provide WCAG 2.1 AA compliant components for accessibility
- Must maintain consistency across features without design expertise
- Must allow easy customization for event branding
- Must integrate with Tailwind CSS (per ADR-010)
- Must not add vendor lock-in or licensing costs

## Considered Options

1. **shadcn/ui (Copy-Paste Components with Radix UI)**
2. **Material-UI (MUI) Component Library**
3. **Chakra UI Component Library**
4. **Custom Tailwind Components from Scratch**
5. **Headless UI Only (No Pre-built Components)**

## Decision Outcome

**Chosen Option:** "shadcn/ui (Copy-Paste Components with Radix UI)"

**Justification:**
shadcn/ui is the optimal choice because it uniquely balances development speed, accessibility, and customization:

1. **Development Speed**: Pre-built, production-ready components eliminate weeks of custom component development, supporting the 6-week MVP timeline
2. **Accessibility**: Built on Radix UI which provides WCAG 2.1 AA compliant, keyboard-navigable components out of the box
3. **Customization**: Components are copied into your codebase, allowing complete customization without fighting framework defaults
4. **Tailwind Integration**: Native integration with Tailwind CSS (per ADR-010), using the same design tokens and utility classes
5. **Cost Compliance**: Free and open source, respecting the $0/month infrastructure constraint
6. **No Vendor Lock-in**: You own the component code, enabling migration or modification at any time

### Consequences

* **Positive:**
  - Rapid development: 30+ accessible components ready to use immediately
  - Accessibility: WCAG 2.1 AA compliance built-in, supporting the 4/5 ease-of-use goal
  - Full control: Copy-paste model means no dependency version conflicts
  - Developer experience: Excellent TypeScript support and documentation
  - Theme customization: Easy to customize colors, spacing, and typography
  - Bundle optimization: Only include components you actually use
  - Community: Large, active community with extensive third-party resources

* **Negative:**
  - Initial setup requires understanding Radix UI primitives
  - Component updates must be applied manually (not automatic via npm)
  - May need to build custom components for highly specific use cases
  - Learning curve for developers unfamiliar with headless UI patterns

* **Risks:**
  - Component library is relatively new (launched 2022), may have undiscovered bugs
  - Rapid evolution may require frequent updates to stay current
  - Custom modifications may conflict with upstream updates
  - Documentation may lag behind feature additions

### Pros and Cons of the Options

#### Option 1: shadcn/ui (Copy-Paste Components with Radix UI)

* Good, because it provides production-ready, accessible components that you copy into your codebase
* Good, because it is built on Radix UI which provides excellent accessibility and keyboard navigation
* Good, because it integrates natively with Tailwind CSS, using the same design system
* Good, because you own the component code, eliminating vendor lock-in concerns
* Good, because it significantly accelerates development time for forms, dialogs, tables, and navigation
* Good, because it is free and open source with no licensing costs
* Bad, because component updates require manual application rather than automatic npm updates
* Bad, because it requires understanding headless UI patterns for customization
* Bad, because the library is relatively new with less long-term stability history

#### Option 2: Material-UI (MUI) Component Library

* Good, because it is a mature, well-established component library with extensive documentation
* Good, because it provides a complete design system with theming capabilities
* Bad, because Material Design may not match the desired aesthetic for all events
* Bad, because it adds significant bundle size (~100KB gzipped for core components)
* Bad, because customization requires overriding Material Design defaults
* Bad, because it creates dependency on external library versioning
* Bad, because accessibility, while good, requires more manual configuration than Radix

#### Option 3: Chakra UI Component Library

* Good, because it provides accessible components with excellent documentation
* Good, because it has built-in theming and dark mode support
* Bad, because it adds bundle size similar to Material-UI
* Bad, because it uses its own styling system rather than Tailwind
* Bad, because it creates dependency on external library versioning
* Bad, because it may limit design flexibility compared to Tailwind-based solutions

#### Option 4: Custom Tailwind Components from Scratch

* Good, because it provides complete control over design and behavior
* Good, because it has zero dependencies and minimal bundle size
* Bad, because it requires significant time to build accessible components from scratch
* Bad, because it increases the risk of inconsistent styling and accessibility issues
* Bad, because it would extend the 6-week MVP timeline significantly
* Bad, because it requires design expertise that volunteers may not have
* Bad, because accessibility testing would be required for each custom component

#### Option 5: Headless UI Only (No Pre-built Components)

* Good, because it provides unstyled, accessible primitives from Tailwind Labs
* Good, because it is fully compatible with Tailwind CSS
* Bad, because it requires building all visual styling from scratch
* Bad, because it provides less complete component coverage than shadcn/ui
* Bad, because it requires more development time than using pre-built components
* Bad, because it doesn't provide the same level of polish out of the box

## Component Strategy

### Core Components for MVP

The following shadcn/ui components will be used for MVP Wave 1:

| Component | Usage | ADR Traceability |
|-----------|-------|------------------|
| **Button** | All interactive actions | Journey 1, 2, 3 |
| **Input** | Form fields for proposals | Journey 2 |
| **Label** | Form field labels | Journey 2 |
| **Textarea** | Abstract descriptions | Journey 2 |
| **Card** | Dashboard summaries | Journey 3 |
| **Dialog** | Modals for confirmations | Journey 2, 3 |
| **Alert** | Success/error messages | Journey 2, 4 |
| **Form** | Complete form validation | Journey 2 |
| **Select** | Dropdown selections | Journey 1, 3 |
| **Avatar** | Speaker profile photos | Journey 2 |

### Future Components (Wave 2+)

- **Table**: Session review and scoring dashboard
- **Tabs**: Navigation between different views
- **Dropdown Menu**: User account menus
- **Toast**: Notification messages
- **Skeleton**: Loading states

### Accessibility Standards

shadcn/ui components provide:

- ✅ Keyboard navigation support
- ✅ Screen reader compatibility (ARIA labels)
- ✅ Focus management
- ✅ Color contrast compliance
- ✅ Error message announcements
- ✅ Semantic HTML structure

This directly supports the **4/5 ease-of-use rating goal** by ensuring the interface is accessible to users with disabilities.

### Theming Approach

```
Components will use Tailwind CSS theme configuration:
- Primary colors: Configurable per event
- Typography: System fonts for performance
- Spacing: 4px/8px scale consistency
- Dark mode: Supported via Tailwind dark mode
```

## Integration with Existing ADRs

This ADR complements and enhances:

- **ADR-001 (Next.js)**: shadcn/ui is optimized for Next.js App Router
- **ADR-010 (Tailwind CSS)**: shadcn/ui is built on Tailwind, not a replacement
- **ADR-007 (Zod Validation)**: Form components integrate with React Hook Form + Zod
- **ADR-013 (TypeScript)**: All components are fully typed

## Implementation Guidelines

### Installation
```bash
npx shadcn-ui@latest init
```

### Adding Components
```bash
npx shadcn-ui@latest add button input card dialog
```

### Customization
```
Components are copied to @/components/ui/
Modify directly for event-specific branding
```

### Usage Pattern
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Use like any React component
<Button>Submit Proposal</Button>
<Input placeholder="Session title" />
```

## Links

* [shadcn/ui Documentation](https://ui.shadcn.com/)
* [Radix UI Primitives](https://www.radix-ui.com/)
* [ADR-010: Tailwind CSS for Styling](./010-use-tailwind-css-for-styling.md)
* [MVP Canvas - UX Enablers](../inception/8-mvp-canvas-definition.md#6-technical--ux-enablers)
* [Persona: Andrea - Usability Requirement](../inception/3-personas.md#persona-name-andrea-the-experienced-speaker)
* [Trade-offs - Usability Priority](../inception/2-tradeoffs.md#2-final-consensus-trade-off-board)
