import {describe, it, expect} from 'vitest';
import {ConferenceId} from '@/modules/conference/domain/value-objects/conference-id';

describe('ConferenceId', () => {
  it('creates a valid UUIDv4', () => {
    const id = ConferenceId.create();
    expect(id.value).toBeDefined();
    expect(id.value).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
  });

  it('creates a unique ID each time', () => {
    const id1 = ConferenceId.create();
    const id2 = ConferenceId.create();
    expect(id1.value).not.toBe(id2.value);
  });

  it('creates from a valid UUID string', () => {
    const validUuid = '12345678-1234-4123-8123-123456789012';
    const id = ConferenceId.fromString(validUuid);
    expect(id.value).toBe(validUuid);
  });

  it('rejects an invalid UUID string', () => {
    expect(() => ConferenceId.fromString('not-a-uuid')).toThrow('Invalid ConferenceId');
  });

  it('converts to string', () => {
    const id = ConferenceId.create();
    expect(id.toString()).toBe(id.value);
  });
});
