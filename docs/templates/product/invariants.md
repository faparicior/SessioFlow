# INV-[000]: [Short, Strict Title of the Invariant]

* **Status:** [Active | Proposed | Retired]
* **Bounded Context:** [e.g., Event Management Bounded Context]
* **Aggregate Root:** [e.g., `Event` Aggregate]
* **Data Integrity Risk:** [e.g., Overbooking, Corrupt State, Financial/Inventory Discrepancy]

---

## 1. Statement of Invariant
*An absolute statement of truth that must hold true at all times within the Aggregate boundary. There are no "if-else workflows" or "fallbacks" here—violating this means transaction failure.*

> **Invariant:** [e.g., The number of `ConfirmedTickets` can never exceed the `TotalCapacity` of the Event.]

## 2. Technical Context & State Boundary
*Define exactly which fields, value objects, or entities inside the Aggregate Root are involved in maintaining this consistency.*

* **Monitored Fields:**
  * `Event.capacity` (Integer)
  * `Event.tickets` (Collection of Ticket entities where status == CONFIRMED)
* **Transactional Boundary:** Enforced synchronously during any command that alters ticket state or event capacity.

## 3. Enforcement Logic & Edge Cases
*Specify the exact condition under which the operation must fail.*

```typescript
// Conceptual Enforcement inside the Aggregate Root
class Event extends AggregateRoot {
  private capacity: number;
  private tickets: Ticket[];

  public issueTicket(ticket: Ticket): void {
    const confirmedCount = this.tickets.filter(t => t.isConfirmed()).length;
    
    // Protection of the invariant
    if (confirmedCount + 1 > this.capacity) {
      throw new EventCapacityExceededException(this.id, this.capacity);
    }
    
    this.tickets.push(ticket);
  }
}
```

### Critical Edge Cases Handled:
* **Capacity Reduction:** What happens if an Organizer tries to lower the event capacity *below* the current number of confirmed tickets? (The `updateCapacity()` method must reject the command).
* **Concurrency:** If two users buy a ticket simultaneously, the aggregate locking mechanism (e.g., Optimistic Concurrency Control via a `version` column) must guarantee this check happens serially.

## 4. Failure Response (Exception Handling)
*What happens when this invariant is triggered? Invariants always result in a rejected transaction and a domain exception.*

* **Domain Exception:** `EventCapacityExceededException`
* **HTTP/API Mapping:** `409 Conflict` or `422 Unprocessable Entity`
* **Rollback Behavior:** Complete database transaction rollback. No state is persisted.

## 5. History & Evolution
*While invariants rarely change (as they define the core truth of the domain model), track any structural adjustments here.*

* **YYYY-MM-DD:** Invariant defined alongside the introduction of ticket purchasing.