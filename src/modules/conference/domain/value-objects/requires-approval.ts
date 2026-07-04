/**
 * RequiresApproval - Whether submissions require organizer approval.
 *
 * Value Object: Boolean
 * Default: true
 */

export class RequiresApproval implements RequiresApproval {
  private constructor(private readonly _value: boolean) {}

  static create(approval = true): RequiresApproval {
    return new RequiresApproval(approval);
  }

  get value(): boolean {
    return this._value;
  }
}
