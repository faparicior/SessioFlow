import {describe, it, expect} from 'vitest';
import {RequiresApproval} from '@backend/modules/conference/domain/value-objects/requires-approval';

describe('RequiresApproval', () => {
  it('defaults to true', () => {
    const approval = RequiresApproval.create();
    expect(approval.value).toBe(true);
  });

  it('creates with true', () => {
    const approval = RequiresApproval.create(true);
    expect(approval.value).toBe(true);
  });

  it('creates with false', () => {
    const approval = RequiresApproval.create(false);
    expect(approval.value).toBe(false);
  });
});
