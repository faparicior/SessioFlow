/**
 * RequiresApproval - Whether accepted submissions need manual approval
 * before being scheduled (default: true).
 */
export class RequiresApproval {
  private constructor(private readonly _value: boolean) {}

  public static create(value: boolean): RequiresApproval {
    return new RequiresApproval(value);
  }

  public static fromData(value: boolean): RequiresApproval {
    return new RequiresApproval(value);
  }

  public get value(): boolean {
    return this._value;
  }

  public isApprovalRequired(): boolean {
    return this._value;
  }

  public equals(other: RequiresApproval): boolean {
    if (!other || !(other instanceof RequiresApproval)) return false;
    return this._value === other._value;
  }
}
