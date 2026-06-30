import {describe, it, expect} from 'vitest';
import {Conference} from '@/domain/conference/conference.ts';
import {ConferenceStatus} from '@/domain/conference/value-objects/conference-status.ts';

describe('Conference', () => {
  const baseInput = {
    name: 'Tech Conference 2026',
    cfpStartDate: new Date('2026-08-01T00:00:00Z'),
    cfpEndDate: new Date('2026-09-01T00:00:00Z'),
    organizerId: 'org-123',
  };

  it('creates a conference in DRAFT state', () => {
    const result = Conference.create(baseInput);
    expect(result.isOk).toBe(true);
    expect(result.value!.status).toBe(ConferenceStatus.DRAFT);
    expect(result.value!.name.getValue()).toBe('Tech Conference 2026');
    expect(result.value!.slug.getValue()).toBe('tech-conference-2026');
    expect(result.value!.organizerId).toBe('org-123');
  });

  it('rejects conference with invalid name (too short)', () => {
    const result = Conference.create({...baseInput, name: 'AB'});
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('at least 3 characters');
  });

  it('rejects conference with invalid dates (end before start)', () => {
    const result = Conference.create({
      ...baseInput,
      cfpStartDate: new Date('2026-09-01T00:00:00Z'),
      cfpEndDate: new Date('2026-08-01T00:00:00Z'),
    });
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('End date must be after start date');
  });

  it('rejects conference with past start date', () => {
    const result = Conference.create({
      ...baseInput,
      cfpStartDate: new Date('2020-01-01T00:00:00Z'),
      cfpEndDate: new Date('2026-08-01T00:00:00Z'),
    });
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Start date must be in the future');
  });

  it('creates with default requiresApproval=true', () => {
    const result = Conference.create(baseInput);
    expect(result.isOk).toBe(true);
    expect(result.value!.cfpConfig?.requiresApproval).toBe(true);
  });

  it('creates with custom maxSubmissions', () => {
    const result = Conference.create({...baseInput, maxSubmissions: 50});
    expect(result.isOk).toBe(true);
    expect(result.value!.cfpConfig?.maxSubmissions.toString()).toBe('50');
  });

  describe('publishCfp()', () => {
    it('transitions from DRAFT to CFP_OPEN', () => {
      const result = Conference.create(baseInput);
      expect(result.isOk).toBe(true);
      const conference = result.value!;
      const publishResult = conference.publishCfp();
      expect(publishResult.isOk).toBe(true);
      expect(conference.status).toBe(ConferenceStatus.CFP_OPEN);
    });

    it('fails if conference is not in DRAFT state', () => {
      const result = Conference.create(baseInput);
      expect(result.isOk).toBe(true);
      const conference = result.value!;
      // First publish
      conference.publishCfp();
      // Then try to publish again (already CFP_OPEN)
      const publishResult = conference.publishCfp();
      expect(publishResult.isFailure).toBe(true);
      expect(publishResult.error).toContain('not DRAFT');
    });
  });

  describe('closeCfp()', () => {
    it('transitions from CFP_OPEN to CFP_CLOSED', () => {
      const result = Conference.create(baseInput);
      const conference = result.value!;
      conference.publishCfp();
      const closeResult = conference.closeCfp();
      expect(closeResult.isOk).toBe(true);
      expect(conference.status).toBe(ConferenceStatus.CFP_CLOSED);
    });

    it('fails if conference is not in CFP_OPEN state', () => {
      const result = Conference.create(baseInput);
      const conference = result.value!;
      const closeResult = conference.closeCfp();
      expect(closeResult.isFailure).toBe(true);
      expect(closeResult.error).toContain('not CFP_OPEN');
    });
  });

  describe('cancel()', () => {
    it('transitions from DRAFT to DELETED', () => {
      const result = Conference.create(baseInput);
      const conference = result.value!;
      const cancelResult = conference.cancel();
      expect(cancelResult.isOk).toBe(true);
      expect(conference.status).toBe(ConferenceStatus.DELETED);
    });

    it('transitions from CFP_OPEN to DELETED', () => {
      const result = Conference.create(baseInput);
      const conference = result.value!;
      conference.publishCfp();
      const cancelResult = conference.cancel();
      expect(cancelResult.isOk).toBe(true);
      expect(conference.status).toBe(ConferenceStatus.DELETED);
    });

    it('fails for COMPLETED conference', () => {
      const result = Conference.create(baseInput);
      const conference = result.value!;
      conference.publishCfp();
      // Manually set to COMPLETED for testing
      conference.status = ConferenceStatus.COMPLETED;
      const cancelResult = conference.cancel();
      expect(cancelResult.isFailure).toBe(true);
      expect(cancelResult.error).toContain('Cannot cancel');
    });
  });

  describe('cfpUrl', () => {
    it('generates correct CFP URL', () => {
      const result = Conference.create(baseInput);
      expect(result.isOk).toBe(true);
      expect(result.value!.cfpUrl).toBe('https://sessioflow.app/cfp/tech-conference-2026');
    });
  });

  describe('toJSON()', () => {
    it('serializes conference to JSON', () => {
      const result = Conference.create({
        ...baseInput,
        description: 'A tech conference',
        maxSubmissions: 100,
      });
      expect(result.isOk).toBe(true);
      const json = result.value!.toJson();
      expect(json.id).toBeDefined();
      expect(json.name).toBe('Tech Conference 2026');
      expect(json.slug).toBe('tech-conference-2026');
      expect(json.status).toBe(ConferenceStatus.DRAFT);
      expect(json.description).toBe('A tech conference');
      expect(json.cfpUrl).toBeDefined();
      expect(json.cfpConfig).toBeDefined();
      expect(json.cfpConfig.maxSubmissions).toBe('100');
    });
  });
});
