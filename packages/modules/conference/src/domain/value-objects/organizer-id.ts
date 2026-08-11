export class OrganizerId {
  static create(value: string): OrganizerId {
    if (!value || value.trim().length === 0) {
      throw new Error('OrganizerId cannot be empty');
    }
    return new OrganizerId(value.trim());
  }

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  equals(other: OrganizerId): boolean {
    return this._value === other._value;
  }
}
