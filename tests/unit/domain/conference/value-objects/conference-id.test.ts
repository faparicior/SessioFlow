import {describe, it, expect} from 'vitest';
import {ConferenceId} from '@/domain/conference/value-objects/conference-id.ts';

describe('ConferenceId', () => {
  it('generates a valid UUIDv4', () => {
    const id = ConferenceId.generate();
    expect(id).toBeInstanceOf(ConferenceId);
    const value = id.getValue();
    expect(value).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  });

  it('creates from valid UUID string', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = ConferenceId.create(uuid);
    expect(id.getValue()).toBe(uuid);
  });

  it('throws on invalid UUID format', () => {
    expect(() => ConferenceId.create('not-a-uuid')).toThrow();
    expect(() => ConferenceId.create('')).toThrow();
  });

  it('compares equality correctly', () => {
    const id1 = ConferenceId.generate();
    const id2 = ConferenceId.generate();
    expect(id1.equals(id2)).toBe(false);

    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id3 = ConferenceId.create(uuid);
    const id4 = ConferenceId.create(uuid);
    expect(id3.equals(id4)).toBe(true);
  });

  it('converts to string correctly', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = ConferenceId.create(uuid);
    expect(id.toString()).toBe(uuid);
  });
});
