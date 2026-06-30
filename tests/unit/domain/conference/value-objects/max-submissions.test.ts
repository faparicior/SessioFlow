import {describe, it, expect} from 'vitest';
import {MaxSubmissions} from '@/domain/conference/value-objects/max-submissions.ts';

describe('MaxSubmissions', () => {
  it('creates with a valid positive integer', () => {
    const ms = MaxSubmissions.create(100);
    expect(ms.toString()).toBe('100');
    expect(ms.isUnlimited()).toBe(false);
  });

  it('creates with undefined for unlimited', () => {
    const ms = MaxSubmissions.create(undefined);
    expect(ms.isUnlimited()).toBe(true);
    expect(ms.canAccept(50)).toBe(true);
    expect(ms.remaining(50)).toBe(Infinity);
  });

  it('creates with undefined for unlimited', () => {
    const ms = MaxSubmissions.create(undefined);
    expect(ms.isUnlimited()).toBe(true);
  });

  it('throws on zero', () => {
    expect(() => MaxSubmissions.create(0)).toThrow();
  });

  it('throws on negative number', () => {
    expect(() => MaxSubmissions.create(-1)).toThrow();
  });

  it('throws on non-integer', () => {
    expect(() => MaxSubmissions.create(1.5)).toThrow();
  });

  it('throws when exceeding max value (10000)', () => {
    expect(() => MaxSubmissions.create(10_001)).toThrow();
  });

  it('accepts maximum allowed value (10000)', () => {
    const ms = MaxSubmissions.create(10_000);
    expect(ms.isUnlimited()).toBe(false);
  });

  it('canAccept returns false when at limit', () => {
    const ms = MaxSubmissions.create(5);
    expect(ms.canAccept(5)).toBe(false);
  });

  it('canAccept returns true when under limit', () => {
    const ms = MaxSubmissions.create(5);
    expect(ms.canAccept(4)).toBe(true);
  });

  it('remaining calculates correctly', () => {
    const ms = MaxSubmissions.create(100);
    expect(ms.remaining(50)).toBe(50);
    expect(ms.remaining(100)).toBe(0);
  });
});
