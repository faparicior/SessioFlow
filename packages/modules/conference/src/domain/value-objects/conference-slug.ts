import {EmptySlugError} from '../exceptions/empty-slug-error.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * ConferenceSlug - URL-safe identifier derived from the conference name
 * (BR-003). Uniqueness is enforced at the repository level by the handler.
 */
export class ConferenceSlug {
  private constructor(private readonly _value: string) {}

  /**
   * Generates a slug from a raw name: lowercase, non-alphanumerics become
   * hyphens, consecutive hyphens collapse, edges trimmed.
   */
  public static create(name: string): ConferenceSlug {
    const slugified = ConferenceSlug.slugify(name);
    if (!slugified || !SLUG_PATTERN.test(slugified)) {
      throw new EmptySlugError();
    }
    return new ConferenceSlug(slugified);
  }

  public static fromData(slug: string): ConferenceSlug {
    if (!slug || !SLUG_PATTERN.test(slug)) {
      throw new EmptySlugError();
    }
    return new ConferenceSlug(slug);
  }

  private static slugify(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public get value(): string {
    return this._value;
  }

  public toCfpUrl(basePath: string): string {
    return `${basePath}/cfp/${this._value}`;
  }

  public equals(other: ConferenceSlug): boolean {
    if (!other || !(other instanceof ConferenceSlug)) return false;
    return this._value === other._value;
  }
}
