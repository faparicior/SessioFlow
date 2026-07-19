/**
 * CfpStatus - The current state of a CfP submission window.
 *
 * Value Object: Enum
 * States:
 *   - ACTIVE: CfP is open, accepting submissions
 *   - CLOSED: CfP has been closed
 *   - ARCHIVED: CfP configuration archived with conference
 */
export enum CfpStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}
