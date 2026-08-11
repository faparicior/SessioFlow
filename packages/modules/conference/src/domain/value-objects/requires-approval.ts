/**
 * RequiresApproval - Whether submissions require organizer approval.
 *
 * Value Object: Boolean
 * Default: true
 */

export class RequiresApproval {
  static create(approval = true): RequiresApproval {
    return new RequiresApproval(approval);
  }

  private constructor(private readonly _value: boolean) {}

  get value(): boolean {
    return this._value;
  }

  equals(other: RequiresApproval): boolean {
    return this._value === other._value;
  }
}
