import {describe, it, expect} from 'vitest';
import {Conference} from '@sessioflow/conference/domain/conference';
import {ConferenceName} from '@sessioflow/conference/domain/value-objects/conference-name';
import {ConferenceDescription} from '@sessioflow/conference/domain/value-objects/conference-description';
import {OrganizerId} from '@sessioflow/conference/domain/value-objects/organizer-id';
import {CfpStartDate} from '@sessioflow/conference/domain/value-objects/cfp-start-date';
import {CfpEndDate} from '@sessioflow/conference/domain/value-objects/cfp-end-date';
import {MaxSubmissions} from '@sessioflow/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@sessioflow/conference/domain/value-objects/requires-approval';
import {CfpStartDateNotInFutureError} from '@sessioflow/conference/domain/exceptions/cfp-start-date-not-in-future-error';
import {InvalidCfpStartDateError} from '@sessioflow/conference/domain/exceptions/invalid-cfp-start-date-error';

describe('CfpStartDate', () => {
  it('creates a valid date (any date, including past)', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const start = CfpStartDate.create(past);
    expect(start.value).toBe(past);
  });

  it('creates today as start date', () => {
    const today = new Date();
    const start = CfpStartDate.create(today);
    expect(start.value).toBe(today);
  });

  it('rejects invalid date (NaN)', () => {
    expect(() => CfpStartDate.create(new Date('invalid'))).toThrow(InvalidCfpStartDateError);
  });

  it('creates from ISO string', () => {
    const iso = new Date();
    iso.setDate(iso.getDate() + 1);
    const start = CfpStartDate.fromISOString(iso.toISOString());
    expect(start.value.getTime()).toBe(iso.getTime());
  });

  it('rejects invalid ISO string', () => {
    expect(() => CfpStartDate.fromISOString('not-a-date')).toThrow(InvalidCfpStartDateError);
  });

  it('checks if before another date', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-01-02');
    const start = CfpStartDate.create(d1);
    expect(start.isBefore(d2)).toBe(true);
  });

  it('checks if after another date', () => {
    const d1 = new Date('2024-01-02');
    const d2 = new Date('2024-01-01');
    const start = CfpStartDate.create(d1);
    expect(start.isAfter(d2)).toBe(true);
  });
  
  it('Conference.create rejects past CfpStartDate', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const future = new Date();
    future.setDate(future.getDate() + 1);
    
    expect(() => Conference.create({
      name: ConferenceName.create('Test Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(past),
      cfpEndDate: CfpEndDate.create(future),
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    })).toThrow(CfpStartDateNotInFutureError);
  });
  
  it('Conference.create accepts future CfpStartDate', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    const outcome = Conference.create({
      name: ConferenceName.create('Test Conference'),
      description: ConferenceDescription.create(),
      organizerId: OrganizerId.create('org-123'),
      cfpStartDate: CfpStartDate.create(future),
      cfpEndDate: CfpEndDate.create(new Date(future.getTime() + 30 * 24 * 60 * 60 * 1000)), // 30 days later
      maxSubmissions: MaxSubmissions.create(),
      requiresApproval: RequiresApproval.create(),
    });
    expect(outcome).toBeDefined();
  });
});
