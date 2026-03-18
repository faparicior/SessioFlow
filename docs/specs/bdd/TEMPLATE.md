# BDD Specification Template

Feature specs use sequential IDs: `feat-[number]-[short-description].md`

---

# Feature: [Feature Name]

**Feature ID**: FEAT-XXX  
**Category**: [e.g., Configuration, Domain Discovery, Analysis]  
**Priority**: [High/Medium/Low]  
**Status**: [📋 Planned / 🏗️ In Progress / ✅ Completed]

## Description

[1-2 sentences describing the feature and its value to the user.]

**Related Specs:**

- [FEAT-001: Check MCP Configuration](./feat-001-check-mcp-configuration.md)
- [GB-NAV-001: ESC Back Navigation](../_global-behaviours/navigation/gb-nav-001-esc-back-navigation.md)

---

## Background

```gherkin
Given [common precondition 1]
And [common precondition 2]
```

---

## Scenarios

### Scenario 1: [Happy Path Name]

```gherkin
Given [initial state]
When [user action]
Then [expected outcome]
  | Column 1 | Column 2 |
  | Value 1  | Value 2  |
```

---

### Scenario 2: [Error/Alternative Path]

```gherkin
Given [initial state]
When [invalid action]
Then [system should display error]
And [provide recovery option]
```

---

## Scenario Implementation

### CLI Route

- **Main Menu** → Select "[Menu Option]"
- **Sub Menu** → Select "[Option]"
- **Interaction**: [Description of interactive steps]

### Files

- `src/screens/[Name].tsx` – [Description of UI changes]
- `src/services/[Name].ts` – [Description of logic changes]
- `src/types/[Name].ts` – [Data structure definitions]

### Data Structures

```typescript
export type MyDataType = {
	id: string;
	status: 'active' | 'inactive';
};
```

### Validation Rules

1. **[Rule Name]**: [Description]
2. **[Rule Name]**: [Description]

---

## Implementation Notes

### [Core Logic] Pseudocode

```typescript
async function myFeatureLogic() {
	// Step-by-step logic implementation
}
```

### UI Components

```tsx
// Snippet of key Ink/React components
<Box>
	<Text>Example UI structure</Text>
</Box>
```

### Security Considerations

1. **[Consideration]**: [Details]
2. **Path Sanitization**: Ensure all file operations are restricted to project boundaries.

---

## Testing Strategy

### Unit Tests (`tests/unit/[name].test.ts`)

- [ ] Test individual logic components in isolation
- [ ] Mock external dependencies (fs, child_process)

### Feature Tests (`tests/features/[name].test.tsx`)

- [ ] Test screen rendering and user interactions
- [ ] Verify state transitions

### Integration Tests

- [ ] Test full user journey across multiple screens
- [ ] Verify persistence/external side effects

---

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] ESC key returns to previous screen
- [ ] Errors are handled gracefully with helpful messages
- [ ] UI follows established design system
- [ ] All feature tests pass with 100% coverage
