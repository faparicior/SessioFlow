# Global Behaviour: [Behaviour Name]

**Feature ID**: GB-[CATEGORY]-XXX  
**Category**: [e.g., Navigation, System, UI]  
**Priority**: [Critical/High/Medium/Low]  
**Status**: [📋 Planned / ✅ Implemented]

## Description

[1-2 sentence description of the global behavior and its purpose.]

**Applies To:**

- All screens
- Specific screen categories (e.g., lists, menus)

---

## Scenarios

### Scenario: [Behaviour description]

```gherkin
Given the CLI application is running
And the user is on any screen [state description]
When the user [triggers behavior, e.g., presses ESC]
Then [expected outcome]
```

---

## Implementation Details

### Affected Components

- `src/components/Layout.tsx`
- `src/hooks/useGlobalKey.ts`

### Logic Implementation

[Brief description of how this behavior is centralized.]

```typescript
// Example snippet of the global listener or logic
```

### Related Specs & Behaviours

- [FEAT-001: Check MCP Configuration](../configuration/feat-001-check-mcp-configuration.md)
- GB-[CATEGORY]-YYY: [Description]
