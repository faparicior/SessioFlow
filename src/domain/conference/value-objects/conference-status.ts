export enum ConferenceStatus {
  DRAFT = 'DRAFT',
  CFP_OPEN = 'CFP_OPEN',
  CFP_CLOSED = 'CFP_CLOSED',
  REVIEWING = 'REVIEWING',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

const allowedTransitions: Record<ConferenceStatus, ConferenceStatus[]> = {
  [ConferenceStatus.DRAFT]: [ConferenceStatus.CFP_OPEN, ConferenceStatus.DELETED],
  [ConferenceStatus.CFP_OPEN]: [ConferenceStatus.CFP_CLOSED, ConferenceStatus.DELETED],
  [ConferenceStatus.CFP_CLOSED]: [ConferenceStatus.REVIEWING],
  [ConferenceStatus.REVIEWING]: [ConferenceStatus.SCHEDULED],
  [ConferenceStatus.SCHEDULED]: [ConferenceStatus.PUBLISHED],
  [ConferenceStatus.PUBLISHED]: [ConferenceStatus.COMPLETED],
  [ConferenceStatus.COMPLETED]: [],
  [ConferenceStatus.DELETED]: [],
};

export const ConferenceStatusValidator = {
  canTransition(current: ConferenceStatus, target: ConferenceStatus): boolean {
    return allowedTransitions[current]?.includes(target) ?? false;
  },
  isTerminal(status: ConferenceStatus): boolean {
    return status === ConferenceStatus.COMPLETED || status === ConferenceStatus.DELETED;
  },
};
