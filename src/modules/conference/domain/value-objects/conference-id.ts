import {v4 as uuidv4} from 'uuid';

/**
 * ConferenceId - Unique identifier for a Conference aggregate.
 *
 * Value Object: UUIDv4
 * Invariant: Must be a valid UUIDv4
 */
export type ConferenceId = {
  readonly value: string;
};

export class ConferenceId implements ConferenceId {
  private constructor(private readonly _value: string) {}

  static create(): ConferenceId {
    return new ConferenceId(uuidv4());
  }

  static fromString(value: string): ConferenceId {
    if (!this.isValidUuid(value)) {
      throw new Error(`Invalid ConferenceId: ${value}`);
    }

    return new ConferenceId(value);
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  private static isValidUuid(value: string): boolean {
    const uuidRegex = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
