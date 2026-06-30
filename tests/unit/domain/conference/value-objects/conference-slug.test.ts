import {describe, it, expect} from 'vitest';
import {ConferenceSlug} from '@/domain/conference/value-objects/conference-slug.ts';

describe('ConferenceSlug', () => {
  it('generates a slug from a conference name', () => {
    const slug = ConferenceSlug.generate('Tech Conference 2026');
    expect(slug.getValue()).toBe('tech-conference-2026');
  });

  it('handles special characters', () => {
    const slug = ConferenceSlug.generate('My @Conference & More!');
    expect(slug.getValue()).toBe('my-conference-more');
  });

  it('handles leading/trailing dashes', () => {
    const slug = ConferenceSlug.generate('  test  ');
    expect(slug.getValue()).toBe('test');
  });

  it('handles multiple spaces', () => {
    const slug = ConferenceSlug.generate('one   two   three');
    expect(slug.getValue()).toBe('one-two-three');
  });

  it('creates from raw string', () => {
    const slug = ConferenceSlug.create('custom-slug');
    expect(slug.getValue()).toBe('custom-slug');
  });

  it('compares equality correctly', () => {
    const slug1 = ConferenceSlug.generate('Test Event');
    const slug2 = ConferenceSlug.generate('Test Event');
    expect(slug1.equals(slug2)).toBe(true);
  });

  it('is case insensitive', () => {
    const slug1 = ConferenceSlug.generate('Test Event');
    const slug2 = ConferenceSlug.create('test-event');
    expect(slug1.equals(slug2)).toBe(true);
  });
});
