import {describe, expect, it} from 'vitest';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';

describe('OrganizerId', () => {
  it('wraps an organizer identifier', () => {
    expect(OrganizerId.create('mock-user-id').value).toBe('mock-user-id');
  });

  it('reconstitutes historical identifiers via fromData', () => {
    expect(OrganizerId.fromData('org_123').value).toBe('org_123');
  });

  it('implements structural equality', () => {
    expect(
      OrganizerId.create('a').equals(OrganizerId.create('a')),
    ).toBe(true);
    expect(OrganizerId.create('a').equals(OrganizerId.create('b'))).toBe(false);
  });
});
