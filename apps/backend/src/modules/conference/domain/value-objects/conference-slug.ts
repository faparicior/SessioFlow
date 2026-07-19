/**
 * ConferenceSlug - URL-safe identifier for a Conference.
 *
 * Value Object: Generated from ConferenceName
 * Invariants:
 *   - Must be URL-safe (lowercase, hyphens instead of spaces, no special chars)
 *   - Must be unique across all conferences (enforced at application layer)
 */

export class ConferenceSlug implements ConferenceSlug {
  static create(name: string): ConferenceSlug {
    const slug = name
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z\d\s-]/g, '') // Remove special characters
      .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
      .replaceAll(/-+/g, '-') // Collapse multiple hyphens
      .replaceAll(/^-|-$/g, ''); // Remove leading/trailing hyphens

    if (slug.length === 0) {
      throw new Error('ConferenceSlug cannot be empty');
    }

    return new ConferenceSlug(slug);
  }

  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  equals(other: ConferenceSlug): boolean {
    return this._value === other._value;
  }
}
