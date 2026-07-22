import {describe, it, expect} from 'vitest';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';

describe('ConferenceName', () => {
  it('creates a valid conference name', () => {
    const name = ConferenceName.create('Tech Conference 2026');
    expect(name.value).toBe('Tech Conference 2026');
  });

  it('rejects names shorter than 3 characters', () => {
    expect(() => ConferenceName.create('Ab')).toThrow('at least 3 characters');
  });

  it('rejects names longer than 100 characters', () => {
    const longName = 'A'.repeat(101);
    expect(() => ConferenceName.create(longName)).toThrow(
      'at most 100 characters',
    );
  });

  it('trims whitespace', () => {
    const name = ConferenceName.create('  Tech Conference  ');
    expect(name.value).toBe('Tech Conference');
  });

  it('rejects empty string', () => {
    expect(() => ConferenceName.create('')).toThrow('at least 3 characters');
  });

  it('checks equality', () => {
    const name1 = ConferenceName.create('Test Conference');
    const name2 = ConferenceName.create('Test Conference');
    expect(name1.equals(name2)).toBe(true);
  });
});
