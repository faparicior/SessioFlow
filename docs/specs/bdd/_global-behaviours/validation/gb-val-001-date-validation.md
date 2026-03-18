# Global Behaviour: Date Validation Rules

**Feature ID**: GB-VAL-001  
**Category**: Validation  
**Priority**: High  
**Status**: 📋 Planned  

**Applies To**:
- Event creation wizard (FEAT-001)
- Speaker submission forms (FEAT-002)
- Schedule management (FEAT-005)
- Session deadline configurations

---

## Description

Centralized date validation logic for all forms requiring date inputs across SessionFlow. Ensures consistency, prevents common date-related errors, and provides clear user feedback for invalid date selections.

---

## Scenarios

### Scenario: Validate Date is in the Future

```gherkin
Feature: Future Date Validation

  Background:
    Given today's date is March 18, 2026

  Scenario: Selecting past date
    When a user selects March 10, 2026 in a date picker
    Then the date should be marked as invalid
    And an error should display: "This date is in the past"
    And the form submit button should remain disabled

  Scenario: Selecting today's date
    When a user selects March 18, 2026 (current date)
    Then the validation should depend on context:
      | Context | Allow |
      | CfP start date | ✅ Yes |
      | Event start date | ✅ Yes |
      | Session review date | ❌ No |
    And appropriate error message should display if not allowed

  Scenario: Selecting future date
    When a user selects March 20, 2026 in a date picker
    Then the date should be accepted as valid
    And no error should display
    And the form should allow submission
```

---

### Scenario: Validate Date Range Order

```gherkin
Feature: Date Range Validation

  Background:
    Given two date inputs exist: Start Date and End Date
    And the current date is March 18, 2026

  Scenario: End before start
    When user selects:
      | Start Date | April 10, 2026 |
      | End Date | April 5, 2026 |
    Then validation should trigger
    And error should display: "End date must be after start date"
    And the End Date field should show red error state

  Scenario: Valid range
    When user selects:
      | Start Date | April 1, 2026 |
      | End Date | April 10, 2026 |
    Then validation should pass
    And no error should display
    And submit should be enabled

  Scenario: Same date
    When user selects same date for both fields (April 1, 2026)
    Then validation should fail
    And error should display: "End date must be after start date"
    And form should remain invalid

  Scenario: Empty start date
    When Start Date is empty
    And End Date is April 10, 2026
    Then validation should fail
    And error should display: "Start date is required"
    And form should be invalid regardless of end date
```

---

### Scenario: Context-Specific Date Rules

```gherkin
Feature: Context-Aware Validation

  Background:
    Given the current date is March 18, 2026

  Scenario: CfP date configuration
    When user sets CfP dates:
      | Date Type | Constraint |
      | CfP Start | Must be in past or future |
      | CfP End | Must be after CfP Start |
    Then past dates should be allowed for CfP start
    And end date must be after start date

  Scenario: Event date configuration
    When user sets event dates:
      | Date Type | Constraint |
      | Event Start | Must be in future |
      | Event End | Must be after Event Start |
    Then past event dates should be rejected
    And error displays: "Event dates must be in the future"

  Scenario: Co-speaker invitation deadline
    When user sets co-speaker deadline as past date
    And attempts to save
    Then error displays: "Deadline cannot be in the past"
    And form should remain invalid
```

---

## Implementation Details

### Affected Components

- `components/ui/date-picker.tsx` - Reusable date picker with validation
- `components/ui/date-range-picker.tsx` - Date range selection
- `lib/utils/date-validation.ts` - Shared validation logic
- `lib/validations/event.ts` - Event-specific validation schemas
- `app/(app)/events/create/page.tsx` - Wizard date steps

---

### Logic Implementation

```typescript
// Core validation utilities
export type ValidDateResult = 
  | { valid: true; value: Date }
  | { valid: false; error: string };

export function validateDateIsFuture(
  date: Date | null
): ValidDateResult {
  if (!date) {
    return { valid: false, error: "Date is required" };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate < today) {
    return { 
      valid: false, 
      error: "Date must be in the future" 
    };
  }
  
  return { valid: true, value: date };
}

export function validateDateRange(
  startDate: Date | null,
  endDate: Date | null,
  options: {
    allowSameDay?: boolean;
    requireFuture?: boolean;
  } = {}
): ValidDateResult {
  const startResult = validateDateIsPresent(startDate);
  if (!startResult.valid) return startResult;
  
  const endResult = validateDateIsPresent(endDate);
  if (!endResult.valid) return endResult;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    return {
      valid: false,
      error: "End date must be after start date"
    };
  }
  
  if (!options.allowSameDay && start.getTime() === end.getTime()) {
    return {
      valid: false,
      error: "End date must be after start date"
    };
  }
  
  if (options.requireFuture) {
    const futureCheck = validateDateIsFuture(start);
    if (!futureCheck.valid) return futureCheck;
  }
  
  return { valid: true, value: { start, end } };
}

export function validateDateIsPresent(
  date: Date | null
): ValidDateResult {
  if (!date) {
    return { valid: false, error: "Date is required" };
  }
  
  return { valid: true, value: date };
}
```

---

### Zod Integration

```typescript
import { z } from 'zod';
import { validateDateIsFuture } from '@/lib/utils/date-validation';

const baseDateSchema = z.date({
  required_error: "Date is required"
});

export const eventDatesSchema = z.object({
  cfpStartDate: baseDateSchema.refine(
    (date) => {
      // Can be past or future for CfP
      return true;
    },
    { message: "CfP start date is required" }
  ),
  cfpEndDate: baseDateSchema.refine(
    (date) => date > new Date(),
    "CfP end date must be in the future"
  ),
  eventStartDate: baseDateSchema.refine(
    (date) => date > new Date(),
    "Event start date must be in the future"
  ),
  eventEndDate: baseDateSchema.refine(
    (date) => date > new Date(),
    "Event end date must be in the future"
  )
}).refine(
  (data) => data.cfpEndDate > data.cfpStartDate,
  {
    message: "CfP end date must be after start date",
    path: ["cfpEndDate"]
  }
).refine(
  (data) => data.eventEndDate > data.eventStartDate,
  {
    message: "Event end date must be after start date",
    path: ["eventEndDate"]
  }
).refine(
  (data) => data.cfpEndDate < data.eventStartDate,
  {
    message: "CfP must end before event starts",
    path: ["cfpEndDate"]
  }
);
```

---

### UI Component Integration

```tsx
interface ValidatedDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  validate: (date: Date) => ValidDateResult;
  errorMessage?: string;
}

export function ValidatedDatePicker({
  value,
  onChange,
  validate,
  errorMessage
}: ValidatedDatePickerProps) {
  const [error, setError] = useState<string | null>(null);
  
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      onChange(null);
      setError(null);
      return;
    }
    
    const result = validate(date);
    if (result.valid) {
      onChange(date);
      setError(null);
    } else {
      setError(result.error);
    }
  };
  
  return (
    <div className="date-input-group">
      <DatePicker
        selected={value}
        onChange={handleDateChange}
        dateFormat="MMMM d, yyyy"
        minDate={new Date()}
      />
      {error && (
        <p className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Related Specifications

- **FEAT-001**: Setup Event - Uses date validation for CfP and event dates
- **FEAT-002**: Speaker Submission - Uses date validation for proposal deadlines
- **FEAT-005**: Schedule Management - Uses date validation for session timing

---

## Performance Considerations

| Consideration | Impact | Optimization |
|--------------|--------|--------------|
| Date parsing | O(1) | Cache `today` reference |
| Validation calls | Per form submission | Debounce rapid changes |
| Error rendering | React re-renders | Memoize validation results |
| Date picker re-renders | On selection | Use `React.memo` |

---

## Accessibility Considerations

- [x] Error messages use `aria-live="polite"` for screen readers
- [x] Invalid dates have `aria-invalid="true"` attribute
- [x] Error text is associated via `aria-describedby`
- [x] Date picker keyboard navigation works correctly
- [x] Focus management when error displays

---

## Testing Strategy

### Unit Tests

- [ ] `validateDateIsFuture` with past date
- [ ] `validateDateIsFuture` with future date
- [ ] `validateDateRange` valid range
- [ ] `validateDateRange` invalid range
- [ ] `validateDateRange` same date
- [ ] `validateDateRange` empty start date
- [ ] Edge case: midnight timestamps

### Integration Tests

- [ ] Date picker displays error on invalid selection
- [ ] Form submission blocked on invalid dates
- [ ] Error clears when valid date entered
- [ ] Validation works across wizard steps

### E2E Tests

- [ ] User selects past date, error displays
- [ ] User fixes date, form becomes valid
- [ ] Wizard prevents advancement on invalid dates

---

## Maintenance Guidelines

1. **Centralize all date validation** in `lib/utils/date-validation.ts`
2. **Never duplicate** date validation logic across components
3. **Update error messages** consistently across all uses
4. **Document new constraints** in this file
5. **Test edge cases** (leap years, DST changes, timezone issues)

---

**Last Updated**: 2026-03-18  
**Version**: 1.0.0
