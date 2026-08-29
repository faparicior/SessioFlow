import {describe, expect, it} from 'vitest';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceNameTooLongError} from '@sessioflow/conference/domain/exceptions/conference-name-too-long-error';
import {ConferenceNameTooShortError} from '@sessioflow/conference/domain/exceptions/conference-name-too-short-error';

describe('ConferenceName', () => {
  it('creates a valid conference name', () => {
    const name = ConferenceName.create('Tech Conference 2026');
    expect(name.value).toBe('Tech Conference 2026');
  });

  it('trims leading and trailing whitespace', () => {
    const name = ConferenceName.create('  Summit  ');
    expect(name.value).toBe('Summit');
  });

  it('accepts the 3-character minimum boundary', () => {
    expect(ConferenceName.create('ABC').value).toBe('ABC');
  });

  it('accepts the 100-character maximum boundary', () => {
    const name = 'x'.repeat(100);
    expect(ConferenceName.create(name).value).toBe(name);
  });

  it('rejects names shorter than 3 characters (BR-002)', () => {
    expect(() => ConferenceName.create('Ab')).toThrow(ConferenceNameTooShortError);
    expect(() => ConferenceName.create('')).toThrow(ConferenceNameTooShortError);
    expect(() => ConferenceName.create('   ')).toThrow(
      'Conference name must be at least 3 characters',
    );
  });

  it('rejects names longer than 100 characters (BR-002)', () => {
    expect(() => ConferenceName.create('x'.repeat(101))).toThrow(ConferenceNameTooLongError);
    expect(() => ConferenceName.create('x'.repeat(101))).toThrow(
      'Conference name cannot exceed 100 characters',
    );
  });

  it('implements structural equality', () => {
    const a = ConferenceName.create('Same Name');
    const b = ConferenceName.create('Same Name');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(ConferenceName.create('Other'))).toBe(false);
  });

  it('checks substring containment case-insensitively', () => {
    const name = ConferenceName.create('Tech Conference 2026');
    expect(name.contains('tech')).toBe(true);
    expect(name.contains('CONFER')).toBe(true);
    expect(name.contains('summit')).toBe(false);
  });
});
