import {describe, it, expect} from 'vitest';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';

describe('MaxSubmissions', () => {
  it('creates unlimited (undefined)', () => {
    const max = MaxSubmissions.create();
    expect(max.isUnlimited()).toBe(true);
    expect(max.value).toBeUndefined();
  });

  it('creates with a positive integer', () => {
    const max = MaxSubmissions.create(100);
    expect(max.isUnlimited()).toBe(false);
    expect(max.value).toBe(100);
  });

  it('rejects zero', () => {
    expect(() => MaxSubmissions.create(0)).toThrow('positive integer');
  });

  it('rejects negative number', () => {
    expect(() => MaxSubmissions.create(-5)).toThrow('positive integer');
  });

  it('rejects non-integer', () => {
    expect(() => MaxSubmissions.create(10.5)).toThrow('positive integer');
  });

  it('checks if exceeded', () => {
    const max = MaxSubmissions.create(5);
    expect(max.isExceeded(3)).toBe(false);
    expect(max.isExceeded(5)).toBe(true);
    expect(max.isExceeded(10)).toBe(true);
  });

  it('never exceeds when unlimited', () => {
    const max = MaxSubmissions.create();
    expect(max.isExceeded(100)).toBe(false);
    expect(max.isExceeded(1000)).toBe(false);
  });
});
