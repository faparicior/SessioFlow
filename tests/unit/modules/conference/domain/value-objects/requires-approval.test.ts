import {describe, expect, it} from 'vitest';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';

describe('RequiresApproval', () => {
  it('wraps a boolean flag', () => {
    expect(RequiresApproval.create(true).value).toBe(true);
    expect(RequiresApproval.create(false).value).toBe(false);
  });

  it('reports the approval requirement', () => {
    expect(RequiresApproval.create(true).isApprovalRequired()).toBe(true);
    expect(RequiresApproval.create(false).isApprovalRequired()).toBe(false);
  });

  it('implements structural equality', () => {
    expect(RequiresApproval.create(true).equals(RequiresApproval.create(true))).toBe(true);
    expect(RequiresApproval.create(true).equals(RequiresApproval.create(false))).toBe(false);
  });
});
