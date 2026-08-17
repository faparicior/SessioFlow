import {describe, expect, it} from 'vitest';
import {CfpConfig} from '@sessioflow/conference/domain/value-objects/cfp-config';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {CfpStatus} from '@sessioflow/conference/domain/value-objects/cfp-status';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {CfpDatesInvalidError} from '@sessioflow/conference/domain/exceptions/cfp-dates-invalid-error';
import {futureDate, pastDate} from '../../../__helpers__/date';

function validConfig() {
  return {
    startDate: CfpStartDate.create(futureDate(1)),
    endDate: CfpEndDate.create(futureDate(30)),
    maxSubmissions: MaxSubmissions.create(100),
    requiresApproval: RequiresApproval.create(true),
  };
}

describe('CfpConfig (composite VO)', () => {
  it('creates an ACTIVE configuration with a valid window (BR-001)', () => {
    const config = CfpConfig.create(validConfig());
    expect(config.status.equals(CfpStatus.create('ACTIVE'))).toBe(true);
    expect(config.isActive()).toBe(true);
  });

  it('allows unlimited submissions', () => {
    const config = CfpConfig.create({
      ...validConfig(),
      maxSubmissions: undefined,
    });
    expect(config.maxSubmissions.isUnlimited()).toBe(true);
  });

  it('rejects end dates equal to start dates (INV-002)', () => {
    const same = futureDate(10);
    expect(() =>
      CfpConfig.create({
        startDate: CfpStartDate.create(same),
        endDate: CfpEndDate.create(same),
        requiresApproval: RequiresApproval.create(true),
      }),
    ).toThrow(CfpDatesInvalidError);
    expect(() =>
      CfpConfig.create({
        startDate: CfpStartDate.create(same),
        endDate: CfpEndDate.create(same),
        requiresApproval: RequiresApproval.create(true),
      }),
    ).toThrow('End date must be after start date');
  });

  it('rejects end dates before start dates (INV-002)', () => {
    expect(() =>
      CfpConfig.create({
        startDate: CfpStartDate.create(futureDate(30)),
        endDate: CfpEndDate.create(futureDate(1)),
        requiresApproval: RequiresApproval.create(true),
      }),
    ).toThrow('End date must be after start date');
  });

  it('rejects windows longer than 180 days', () => {
    expect(() =>
      CfpConfig.create({
        startDate: CfpStartDate.create(futureDate(1)),
        endDate: CfpEndDate.create(futureDate(182)),
        requiresApproval: RequiresApproval.create(true),
      }),
    ).toThrow('Cfp window cannot be more than 180 days');
  });

  it('accepts the 180-day window boundary', () => {
    expect(() =>
      CfpConfig.create({
        startDate: CfpStartDate.create(futureDate(1)),
        endDate: CfpEndDate.create(futureDate(181)),
        requiresApproval: RequiresApproval.create(true),
      }),
    ).not.toThrow();
  });

  it('reconstitutes historical configurations via fromData (past dates allowed)', () => {
    const config = CfpConfig.fromData({
      startDate: pastDate(30).toISOString(),
      endDate: pastDate(1).toISOString(),
      maxSubmissions: 50,
      requiresApproval: false,
      status: 'CLOSED',
    });
    expect(config.status.equals(CfpStatus.create('CLOSED'))).toBe(true);
    expect(config.isActive()).toBe(false);
    expect(config.maxSubmissions.value).toBe(50);
    expect(config.requiresApproval.value).toBe(false);
  });

  it('closes the submission window exactly once', () => {
    const config = CfpConfig.create(validConfig());
    config.close();
    expect(config.status.equals(CfpStatus.create('CLOSED'))).toBe(true);
    expect(config.isActive()).toBe(false);
    expect(() => config.close()).toThrow();
  });

  it('checks whether a date falls within the window', () => {
    const config = CfpConfig.create(validConfig());
    expect(config.isWithinWindow(futureDate(10))).toBe(true);
    expect(config.isWithinWindow(pastDate(1))).toBe(false);
    expect(config.isWithinWindow(futureDate(60))).toBe(false);
  });

  it('exposes a plain data value and structural equality', () => {
    const config = CfpConfig.create(validConfig());
    const value = config.value;
    expect(value.startDate).toBe(futureDate(1).toISOString());
    expect(value.status).toBe('ACTIVE');
    expect(config.equals(CfpConfig.create(validConfig()))).toBe(true);
    expect(
      config.equals(
        CfpConfig.create({
          ...validConfig(),
          endDate: CfpEndDate.create(futureDate(45)),
        }),
      ),
    ).toBe(false);
  });
});
