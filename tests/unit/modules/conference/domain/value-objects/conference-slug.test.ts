import {describe, expect, it} from 'vitest';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';
import {EmptySlugError} from '@sessioflow/conference/domain/exceptions/empty-slug-error';

describe('ConferenceSlug', () => {
  it('generates a slug from a plain name (BR-003)', () => {
    expect(ConferenceSlug.create('Tech Conference 2026').value).toBe(
      'tech-conference-2026',
    );
  });

  it('removes special characters and collapses hyphens', () => {
    expect(ConferenceSlug.create('Startup! Summit').value).toBe('startup-summit');
    expect(ConferenceSlug.create('AI/ML Workshop').value).toBe('ai-ml-workshop');
  });

  it('trims whitespace and collapses consecutive spaces', () => {
    expect(ConferenceSlug.create('  Dev  Meetup  ').value).toBe('dev-meetup');
  });

  it('keeps digits as valid slug content', () => {
    expect(ConferenceSlug.create('Summit 2026 Final').value).toBe(
      'summit-2026-final',
    );
  });

  it('never exceeds 100 characters when derived from a valid name', () => {
    const longName = 'word '.repeat(20).trim(); // 95 chars
    const slug = ConferenceSlug.create(longName);
    expect(slug.value.length).toBeLessThanOrEqual(100);
  });

  it('rejects names that cannot be converted to a slug', () => {
    expect(() => ConferenceSlug.create('!!!')).toThrow(EmptySlugError);
    expect(() => ConferenceSlug.create('')).toThrow(EmptySlugError);
  });

  it('builds the CfP URL from a base path', () => {
    const slug = ConferenceSlug.create('Tech Conference 2026');
    expect(slug.toCfpUrl('https://sessioflow.app')).toBe(
      'https://sessioflow.app/cfp/tech-conference-2026',
    );
    expect(slug.toCfpUrl('')).toBe('/cfp/tech-conference-2026');
  });

  it('implements structural equality', () => {
    const a = ConferenceSlug.create('Tech Conference 2026');
    const b = ConferenceSlug.create('tech conference 2026');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(ConferenceSlug.create('Other Name'))).toBe(false);
  });
});
