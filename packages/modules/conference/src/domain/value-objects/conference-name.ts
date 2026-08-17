import {ConferenceNameTooLongError} from '../exceptions/conference-name-too-long-error.js';
import {ConferenceNameTooShortError} from '../exceptions/conference-name-too-short-error.js';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;

/**
 * ConferenceName - Display name of a conference (BR-002).
 */
export class ConferenceName {
  private constructor(private readonly _value: string) {}

  public static create(name: string): ConferenceName {
    const trimmed = name.trim();
    if (trimmed.length < MIN_NAME_LENGTH) {
      throw new ConferenceNameTooShortError();
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      throw new ConferenceNameTooLongError();
    }
    return new ConferenceName(trimmed);
  }

  public static fromData(name: string): ConferenceName {
    return new ConferenceName(name);
  }

  public get value(): string {
    return this._value;
  }

  public contains(search: string): boolean {
    return this._value.toLowerCase().includes(search.toLowerCase());
  }

  public equals(other: ConferenceName): boolean {
    if (!other || !(other instanceof ConferenceName)) return false;
    return this._value === other._value;
  }
}
