import {v4 as uuidv4} from 'uuid';

/**
 * ConferenceId - Unique identifier for a Conference aggregate.
 *
 * Value Object: UUIDv4
 * Invariant: Must be a valid UUIDv4
 */

import { InvalidConferenceIdError } from '../exceptions/invalid-conference-id-error';

export class ConferenceId {
  static create(): ConferenceId {
    return new ConferenceId(uuidv4());
  }

  static fromString(value: string): ConferenceId {
    if (!this.isValidUuid(value)) {
      throw new InvalidConferenceIdError();
    }

    return new ConferenceId(value);
  }

  private static isValidUuid(value: string): boolean {
    const uuidRegex =
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: ConferenceId): boolean {
    return this._value === other._value;
  }
}
