import { type ConferenceId } from '../value-objects/conference-id';
import { type CfpConfig } from '../cfp-config';

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
    readonly timestamp: Date = new Date()
  ) {}

  toJSON(): CfpOpenedEventData {
    return {
      conferenceId: this.conferenceId,
      cfpConfig: this.cfpConfig,
      timestamp: this.timestamp,
    };
  }
}
