import {describe, it, expect} from 'vitest';
import {CfpConfig} from '@/domain/conference/value-objects/cfp-config.ts';

describe('CfpConfig', () => {
  const now = new Date('2026-07-01T00:00:00Z');

  it('creates a valid CfpConfig', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        maxSubmissions: 100,
        requiresApproval: true,
      },
      {now},
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBeDefined();
    expect(result.value!.startDate.getValue()).toEqual(start);
    expect(result.value!.endDate.getValue()).toEqual(end);
    expect(result.value!.maxSubmissions.toString()).toBe('100');
    expect(result.value!.requiresApproval).toBe(true);
  });

  it('creates a CfpConfig without maxSubmissions (unlimited)', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: false,
      },
      {now},
    );
    expect(result.ok).toBe(true);
    expect(result.value!.maxSubmissions.isUnlimited()).toBe(true);
  });

  it('rejects when end date is before start date (INV-002)', () => {
    const start = new Date('2026-09-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: true,
      },
      {now},
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('End date must be after start date');
  });

  it('rejects when start date is in the past (new CfP)', () => {
    const start = new Date('2026-06-01T00:00:00Z');
    const end = new Date('2026-08-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: true,
      },
      {now, requireFutureStart: true},
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Start date must be in the future');
  });

  it('rejects negative maxSubmissions', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        maxSubmissions: -1,
        requiresApproval: true,
      },
      {now},
    );
    expect(result.ok).toBe(false);
  });

  it('isActive returns true when within window', () => {
    const start = new Date('2026-06-01T00:00:00Z'); // Already started
    const end = new Date('2026-12-01T00:00:00Z'); // Not yet ended
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: true,
      },
      {now, requireFutureStart: false},
    );
    expect(result.ok).toBe(true);
    expect(result.value!.isActive(now)).toBe(true);
  });

  it('isActive returns false when outside window', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-31T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: true,
      },
      {now, requireFutureStart: false},
    );
    expect(result.ok).toBe(true);
    expect(result.value!.isActive(now)).toBe(false);
  });

  it('isActive returns false when window hasn\'t started yet', () => {
    const start = new Date('2026-12-01T00:00:00Z');
    const end = new Date('2027-01-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        requiresApproval: true,
      },
      {now},
    );
    expect(result.ok).toBe(true);
    expect(result.value!.isActive(now)).toBe(false);
  });

  it('toJSON serializes correctly', () => {
    const start = new Date('2026-08-01T00:00:00Z');
    const end = new Date('2026-09-01T00:00:00Z');
    const result = CfpConfig.create(
      {
        startDate: start,
        endDate: end,
        maxSubmissions: 50,
        requiresApproval: true,
      },
      {now},
    );
    expect(result.ok).toBe(true);
    const json = result.value!.toJson();
    expect(json.startDate).toBeDefined();
    expect(json.endDate).toBeDefined();
    expect(json.maxSubmissions).toBe('50');
    expect(json.requiresApproval).toBe(true);
    expect(json.status).toBe('ACTIVE');
  });
});
