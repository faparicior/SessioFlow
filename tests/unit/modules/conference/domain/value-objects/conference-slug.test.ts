import {describe, it, expect} from 'vitest';
import {ConferenceSlug} from '@sessioflow/conference/domain/value-objects/conference-slug';

describe('ConferenceSlug', () => {
  it('generates URL-safe slug from name', () => {
    const slug = ConferenceSlug.create('Tech Conference 2026');
    expect(slug.value).toBe('tech-conference-2026');
  });

  it('handles special characters', () => {
    const slug = ConferenceSlug.create('My & Co. Conference!');
    expect(slug.value).toBe('my-co-conference');
  });

  it('collapses multiple spaces', () => {
    const slug = ConferenceSlug.create('Multiple   Spaces');
    expect(slug.value).toBe('multiple-spaces');
  });

  it('removes leading/trailing hyphens', () => {
    const slug = ConferenceSlug.create('- Leading -');
    expect(slug.value).toBe('leading');
  });

  it('rejects empty result after processing', () => {
    expect(() => ConferenceSlug.create('!!!')).toThrow('cannot be empty');
  });
});
