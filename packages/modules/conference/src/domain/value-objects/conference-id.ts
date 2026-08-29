import {DomainInvariantError} from '@sessioflow/shared-domain/exceptions';

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ConferenceId - UUIDv4 identity of a Conference aggregate.
 */
export class ConferenceId {
  private constructor(private readonly _value: string) {}

  /**
   * Creates a validated id from a UUID string (case-insensitive).
   */
  public static create(raw: string): ConferenceId {
    const normalized = raw.trim().toLowerCase();
    if (!UUID_V4_PATTERN.test(normalized)) {
      throw new DomainInvariantError(
        'INVALID_CONFERENCE_ID',
        `ConferenceId "${raw}" must be a valid UUID`,
      );
    }
    return new ConferenceId(normalized);
  }

  /**
   * Reconstitutes a persisted id (format validated, no other rules).
   */
  public static fromData(raw: string): ConferenceId {
    return ConferenceId.create(raw);
  }

  /**
   * Generates a fresh UUIDv4 identifier.
   */
  public static generate(): ConferenceId {
    return new ConferenceId(crypto.randomUUID());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ConferenceId): boolean {
    if (!other || !(other instanceof ConferenceId)) return false;
    return this._value === other._value;
  }
}
