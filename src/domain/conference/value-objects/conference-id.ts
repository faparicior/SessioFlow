export class ConferenceId {
  static generate(): ConferenceId {
    return new ConferenceId(crypto.randomUUID());
  }

  static create(value: string): ConferenceId {
    if (!value || value.length === 0) {
      throw new Error('ConferenceId cannot be empty');
    }

    const uuidPattern
      = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
    if (!uuidPattern.test(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }

    return new ConferenceId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ConferenceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private constructor(private readonly value: string) {}
}
