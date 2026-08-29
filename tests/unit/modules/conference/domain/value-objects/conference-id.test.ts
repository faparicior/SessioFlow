import {describe, expect, it} from 'vitest';
import {ConferenceId} from '@sessioflow/conference/domain/value-objects/conference-id';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('ConferenceId', () => {
  it('creates a valid id from a UUIDv4 string', () => {
    const id = ConferenceId.create(VALID_UUID);
    expect(id.value).toBe(VALID_UUID);
  });

  it('normalizes uppercase UUIDs and compares case-insensitively', () => {
    const upper = ConferenceId.create(VALID_UUID.toUpperCase());
    const lower = ConferenceId.create(VALID_UUID);
    expect(upper.equals(lower)).toBe(true);
  });

  it('rejects invalid UUID formats', () => {
    expect(() => ConferenceId.create('not-a-uuid')).toThrow('must be a valid UUID');
    expect(() => ConferenceId.create('')).toThrow('must be a valid UUID');
  });

  it('reconstitutes historical ids via fromData', () => {
    const id = ConferenceId.fromData(VALID_UUID);
    expect(id.value).toBe(VALID_UUID);
  });

  it('generates a new unique UUIDv4', () => {
    const generated = ConferenceId.generate();
    expect(generated.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(ConferenceId.generate().value).not.toBe(generated.value);
  });

  it('implements structural equality', () => {
    const a = ConferenceId.create(VALID_UUID);
    const b = ConferenceId.create(VALID_UUID);
    const c = ConferenceId.create('6ba7b810-9dad-41d4-80b4-00c04fd430c8');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
    expect(a.equals(undefined as unknown as ConferenceId)).toBe(false);
  });
});
