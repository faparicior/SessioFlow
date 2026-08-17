/**
 * Opaque transaction port (ADR-017 / decision D5).
 *
 * The concrete Drizzle client (`db.transaction`) satisfies this interface
 * structurally; unit tests inject a fake. The `tx` handle handed to the work
 * callback is deliberately `unknown` — the application layer never depends
 * on ORM types. Deliberately non-generic so test doubles stay trivially
 * assignable.
 */
export interface TransactionRunner {
  transaction(work: (tx: unknown) => Promise<unknown>): Promise<unknown>;
}
