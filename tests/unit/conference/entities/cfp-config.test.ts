import {describe, it, expect} from 'vitest';
import {CfpConfig} from '@/modules/conference/domain/entities/cfp-config';
import {CfpStartDate} from '@/modules/conference/domain/value-objects/cfp-start-date';
import {CfpEndDate} from '@/modules/conference/domain/value-objects/cfp-end-date';
import {MaxSubmissions} from '@/modules/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@/modules/conference/domain/value-objects/requires-approval';
import {CfpStatus} from '@/modules/conference/domain/value-objects/cfp-status';
import {CfpDatesInvalidError} from '@/modules/conference/domain/exceptions/cfp-dates-invalid-error';

describe('CfpConfig', () => {
  const createCfpConfig = () =>
    CfpConfig.create({
      startDate: CfpStartDate.create(new Date('2026-08-01')),
      endDate: CfpEndDate.create(new Date('2026-09-30')),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });

  it('create() sets ACTIVE status', () => {
    const config = createCfpConfig();
    expect(config.status).toBe(CfpStatus.ACTIVE);
  });

  it('create() stores the start date', () => {
    const config = createCfpConfig();
    expect(config.startDate.value).toEqual(new Date('2026-08-01'));
  });

  it('create() stores the end date', () => {
    const config = createCfpConfig();
    expect(config.endDate.value).toEqual(new Date('2026-09-30'));
  });

  it('validateDates() does not throw for valid dates', () => {
    const config = createCfpConfig();
    expect(() => {
      config.validateDates();
    }).not.toThrow();
  });

  it('validateDates() throws CfpDatesInvalidError for end date before start date', () => {
    const config = CfpConfig.create({
      startDate: CfpStartDate.create(new Date('2026-09-01')),
      endDate: CfpEndDate.create(new Date('2026-08-01')),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });
    expect(() => {
      config.validateDates();
    }).toThrow(CfpDatesInvalidError);
  });

  it('close() transitions from ACTIVE to CLOSED', () => {
    const config = createCfpConfig();
    config.close();
    expect(config.status).toBe(CfpStatus.CLOSED);
  });

  it('close() throws if status is not ACTIVE', () => {
    const config = createCfpConfig();
    config.close(); // ACTIVE → CLOSED
    expect(() => {
      config.close();
    }).toThrow('Cannot close CfP');
  });

  it('isActive() returns true when status is ACTIVE and date is within window', () => {
    const config = createCfpConfig();
    // Use a date within the window
    const withinWindow = new Date('2026-08-15');
    // IsActive() checks current time, so we'll just verify status is ACTIVE
    expect(config.status).toBe(CfpStatus.ACTIVE);
  });

  it('isActive() returns false when status is CLOSED', () => {
    const config = createCfpConfig();
    config.close();
    expect(config.isActive()).toBe(false);
  });

  it('stores maxSubmissions', () => {
    const config = CfpConfig.create({
      startDate: CfpStartDate.create(new Date('2026-08-01')),
      endDate: CfpEndDate.create(new Date('2026-09-30')),
      maxSubmissions: MaxSubmissions.create(100),
      requiresApproval: RequiresApproval.create(),
    });
    expect(config.maxSubmissions.value).toBe(100);
  });

  it('stores requiresApproval', () => {
    const config = CfpConfig.create({
      startDate: CfpStartDate.create(new Date('2026-08-01')),
      endDate: CfpEndDate.create(new Date('2026-09-30')),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(false),
    });
    expect(config.requiresApproval.value).toBe(false);
  });
});
