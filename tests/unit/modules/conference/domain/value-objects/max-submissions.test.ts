import {describe, expect, it} from 'vitest';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {MaxSubmissionsInvalidError} from '@sessioflow/conference/domain/exceptions/max-submissions-invalid-error';

describe('MaxSubmissions', () => {
  it('creates a limited submission cap', () => {
    const limit = MaxSubmissions.create(100);
    expect(limit.value).toBe(100);
    expect(limit.isUnlimited()).toBe(false);
  });

  it('creates an unlimited submission cap from null/undefined', () => {
    expect(MaxSubmissions.create(null).isUnlimited()).toBe(true);
    expect(MaxSubmissions.create(undefined).isUnlimited()).toBe(true);
    expect(MaxSubmissions.create(null).value).toBeUndefined();
  });

  it('rejects zero, negative, and non-integer values', () => {
    expect(() => MaxSubmissions.create(0)).toThrow(MaxSubmissionsInvalidError);
    expect(() => MaxSubmissions.create(-5)).toThrow(MaxSubmissionsInvalidError);
    expect(() => MaxSubmissions.create(2.5)).toThrow(MaxSubmissionsInvalidError);
    expect(() => MaxSubmissions.create(2.5)).toThrow(
      'Max submissions must be a positive integer',
    );
  });

  it('rejects values above the 10000 sanity cap', () => {
    expect(() => MaxSubmissions.create(10001)).toThrow(MaxSubmissionsInvalidError);
  });

  it('checks capacity', () => {
    const limit = MaxSubmissions.create(100);
    expect(limit.canAccept(99)).toBe(true);
    expect(limit.canAccept(100)).toBe(false);
    expect(MaxSubmissions.create(null).canAccept(99999)).toBe(true);
  });

  it('computes remaining slots (null when unlimited)', () => {
    expect(MaxSubmissions.create(100).remaining(50)).toBe(50);
    expect(MaxSubmissions.create(100).remaining(150)).toBe(0);
    expect(MaxSubmissions.create(null).remaining(10)).toBeNull();
  });

  it('implements structural equality', () => {
    expect(MaxSubmissions.create(100).equals(MaxSubmissions.create(100))).toBe(
      true,
    );
    expect(MaxSubmissions.create(100).equals(MaxSubmissions.create(50))).toBe(
      false,
    );
    expect(
      MaxSubmissions.create(null).equals(MaxSubmissions.create(undefined)),
    ).toBe(true);
  });
});
