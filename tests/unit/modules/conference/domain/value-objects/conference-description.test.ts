import {describe, expect, it} from 'vitest';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';

describe('ConferenceDescription', () => {
  it('wraps a description string', () => {
    expect(
      ConferenceDescription.create('A conference about technology').value,
    ).toBe('A conference about technology');
  });

  it('allows an empty description (optional field)', () => {
    expect(ConferenceDescription.create('').value).toBe('');
  });

  it('accepts the 1000-character boundary', () => {
    const description = 'x'.repeat(1000);
    expect(ConferenceDescription.create(description).value).toBe(description);
  });

  it('rejects descriptions over 1000 characters', () => {
    expect(() => ConferenceDescription.create('x'.repeat(1001))).toThrow(
      'Description cannot exceed 1000 characters',
    );
  });

  it('implements structural equality', () => {
    expect(
      ConferenceDescription.create('same').equals(
        ConferenceDescription.create('same'),
      ),
    ).toBe(true);
    expect(
      ConferenceDescription.create('a').equals(ConferenceDescription.create('b')),
    ).toBe(false);
  });
});
