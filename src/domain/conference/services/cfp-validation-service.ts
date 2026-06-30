export const CfpValidationService = {
  validateCfpDates(
    cfpStartDate: Date,
    cfpEndDate: Date,
    now?: Date,
  ): {ok: boolean; error?: string} {
    const referenceTime = now ?? new Date();
    if (cfpStartDate < referenceTime) {
      return {ok: false, error: 'Start date must be in the future'};
    }

    if (cfpEndDate <= cfpStartDate) {
      return {ok: false, error: 'End date must be after start date'};
    }

    const maxDurationMs = 180 * 24 * 60 * 60 * 1000;
    const durationMs = cfpEndDate.getTime() - cfpStartDate.getTime();
    if (durationMs > maxDurationMs) {
      return {ok: false, error: 'CfP window cannot exceed 180 days'};
    }

    return {ok: true};
  },
};
