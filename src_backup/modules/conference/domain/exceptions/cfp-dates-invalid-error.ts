/**
 * CfpDatesInvalidError - CfP dates are invalid (end date before start date).
 */
export class CfpDatesInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CfpDatesInvalidError';
  }
}
