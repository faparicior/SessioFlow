/**
 * OrganizerId - Identity of the authenticated user who owns a conference.
 * A type-safe wrapper so aggregate data never holds raw strings.
 */
export class OrganizerId {
  private constructor(private readonly _value: string) {}

  public static create(value: string): OrganizerId {
    return new OrganizerId(value);
  }

  public static fromData(value: string): OrganizerId {
    return new OrganizerId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: OrganizerId): boolean {
    if (!other || !(other instanceof OrganizerId)) return false;
    return this._value === other._value;
  }
}
