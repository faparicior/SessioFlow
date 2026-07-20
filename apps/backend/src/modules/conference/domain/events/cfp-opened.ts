import {type ConferenceId} from '../value-objects/conference-id';
import {type CfpConfig} from '../cfp-config';

/**
 * CfpOpenedEvent - Published when a Conference's CfP is published (DRAFT → CFP_OPEN).
 *
 * Domain Event:
 *   - Triggered by: Conference.publishCfp()
 *   - Side Effects: Send welcome email to organizer, notify subscribers
 */
export type CfpOpenedEventData = {
  conferenceId: ConferenceId;
  cfpConfig: CfpConfig;
  timestamp: Date;
};

export class CfpOpenedEvent {
  readonly type = 'CfpOpened';

  constructor(
    readonly conferenceId: ConferenceId,
    readonly cfpConfig: CfpConfig,
    readonly timestamp: Date = new Date(),
  ) {}

  toJSON(): CfpOpenedEventData {
    return {
      conferenceId: this.conferenceId,
      cfpConfig: this.cfpConfig,
      timestamp: this.timestamp,
    };
  }
}
