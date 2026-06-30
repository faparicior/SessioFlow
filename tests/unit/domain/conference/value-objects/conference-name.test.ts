import {describe, it, expect} from 'vitest';
import {ConferenceName} from '@/domain/conference/value-objects/conference-name.ts';
import {Result} from '@/domain/shared/result.ts';

describe('ConferenceName', () => {
  it('creates a valid conference name', () => {
    const result = ConferenceName.create('Tech Conference 2026');
    expect(result.isOk).toBe(true);
    expect(result.value!.getValue()).toBe('Tech Conference 2026');
  });

  it('trims leading and trailing whitespace', () => {
    const result = ConferenceName.create('  Tech Conference  ');
    expect(result.isOk).toBe(true);
    expect(result.value!.getValue()).toBe('Tech Conference');
  });

  it('rejects empty names', () => {
    const result = ConferenceName.create('');
    expect(result.isFailure).toBe(true);
  });

  it('rejects whitespace-only names', () => {
    const result = ConferenceName.create('   ');
    expect(result.isFailure).toBe(true);
  });

  it('rejects names shorter than 3 characters', () => {
    expect(ConferenceName.create('AB').isFailure).toBe(true);
  });

  it('accepts names with exactly 3 characters', () => {
    const result = ConferenceName.create('ABC');
    expect(result.isOk).toBe(true);
  });

  it('accepts names with exactly 100 characters', () => {
    const name = 'A'.repeat(100);
    const result = ConferenceName.create(name);
    expect(result.isOk).toBe(true);
  });

  it('rejects names longer than 100 characters', () => {
    const name = 'A'.repeat(101);
    const result = ConferenceName.create(name);
    expect(result.isFailure).toBe(true);
  });

  it('compares equality correctly', () => {
    const name1 = ConferenceName.create('Test');
    const name2 = ConferenceName.create('Test');
    const name3 = ConferenceName.create('Other');
    expect(name1.value!.equals(name2.value)).toBe(true);
    expect(name1.value!.equals(name3.value)).toBe(false);
  });

  it('implements toString()', () => {
    const result = ConferenceName.create('Test');
    expect(result.value!.toString()).toBe('Test');
  });
});
