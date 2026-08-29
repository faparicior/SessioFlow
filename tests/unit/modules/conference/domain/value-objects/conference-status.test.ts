import {describe, expect, it} from 'vitest';
import {ConferenceStatus} from '@sessioflow/conference/domain/value-objects/conference-status';
import {InvalidConferenceStatusError} from '@sessioflow/conference/domain/exceptions/invalid-conference-status-error';

describe('ConferenceStatus', () => {
  it('creates valid statuses', () => {
    for (const status of [
      'DRAFT',
      'CFP_OPEN',
      'CFP_CLOSED',
      'REVIEWING',
      'SCHEDULED',
      'PUBLISHED',
      'COMPLETED',
      'DELETED',
    ]) {
      expect(ConferenceStatus.create(status).value).toBe(status);
    }
  });

  it('rejects unknown statuses', () => {
    expect(() => ConferenceStatus.create('BOGUS')).toThrow(InvalidConferenceStatusError);
    expect(() => ConferenceStatus.create('draft')).toThrow(InvalidConferenceStatusError);
  });

  it('allows the full lifecycle transition path (INV-001)', () => {
    const transitions: Array<[string, string]> = [
      ['DRAFT', 'CFP_OPEN'],
      ['CFP_OPEN', 'CFP_CLOSED'],
      ['CFP_CLOSED', 'REVIEWING'],
      ['REVIEWING', 'SCHEDULED'],
      ['SCHEDULED', 'PUBLISHED'],
      ['PUBLISHED', 'COMPLETED'],
    ];
    for (const [from, to] of transitions) {
      expect(
        ConferenceStatus.canTransitionTo(
          ConferenceStatus.create(from),
          ConferenceStatus.create(to),
        ),
      ).toBe(true);
    }
  });

  it('allows cancellation from DRAFT and CFP_OPEN', () => {
    expect(
      ConferenceStatus.canTransitionTo(
        ConferenceStatus.create('DRAFT'),
        ConferenceStatus.create('DELETED'),
      ),
    ).toBe(true);
    expect(
      ConferenceStatus.canTransitionTo(
        ConferenceStatus.create('CFP_OPEN'),
        ConferenceStatus.create('DELETED'),
      ),
    ).toBe(true);
  });

  it('rejects skipped or reversed transitions', () => {
    expect(
      ConferenceStatus.canTransitionTo(
        ConferenceStatus.create('DRAFT'),
        ConferenceStatus.create('CFP_CLOSED'),
      ),
    ).toBe(false);
    expect(
      ConferenceStatus.canTransitionTo(
        ConferenceStatus.create('CFP_CLOSED'),
        ConferenceStatus.create('DRAFT'),
      ),
    ).toBe(false);
    expect(
      ConferenceStatus.canTransitionTo(
        ConferenceStatus.create('CFP_OPEN'),
        ConferenceStatus.create('PUBLISHED'),
      ),
    ).toBe(false);
  });

  it('rejects transitions out of terminal states', () => {
    for (const from of ['COMPLETED', 'DELETED']) {
      for (const to of [
        'DRAFT',
        'CFP_OPEN',
        'CFP_CLOSED',
        'REVIEWING',
        'SCHEDULED',
        'PUBLISHED',
        'COMPLETED',
        'DELETED',
      ]) {
        expect(
          ConferenceStatus.canTransitionTo(
            ConferenceStatus.create(from),
            ConferenceStatus.create(to),
          ),
        ).toBe(false);
      }
    }
  });

  it('reconstitutes persisted statuses via fromData', () => {
    expect(ConferenceStatus.fromData('CFP_OPEN').value).toBe('CFP_OPEN');
  });

  it('implements structural equality', () => {
    expect(ConferenceStatus.create('DRAFT').equals(ConferenceStatus.create('DRAFT'))).toBe(true);
    expect(ConferenceStatus.create('DRAFT').equals(ConferenceStatus.create('CFP_OPEN'))).toBe(
      false,
    );
  });
});
