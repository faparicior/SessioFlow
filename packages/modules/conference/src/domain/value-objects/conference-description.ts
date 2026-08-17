import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * ConferenceDescription - Optional free-text description (max 1000 chars).
 */
export class ConferenceDescription {
  private constructor(private readonly _value: string) {}

  public static create(value: string): ConferenceDescription {
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      throw new DomainInvariantError(
        'INVALID_INVARIANT',
        'Description cannot exceed 1000 characters',
      );
    }
    return new ConferenceDescription(value);
  }

  public static fromData(value: string): ConferenceDescription {
    return new ConferenceDescription(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ConferenceDescription): boolean {
    if (!other || !(other instanceof ConferenceDescription)) return false;
    return this._value === other._value;
  }
}
