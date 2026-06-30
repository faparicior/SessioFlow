export enum CfpStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

const cfpAllowedTransitions: Record<CfpStatus, CfpStatus[]> = {
  [CfpStatus.ACTIVE]: [CfpStatus.CLOSED],
  [CfpStatus.CLOSED]: [CfpStatus.ARCHIVED],
  [CfpStatus.ARCHIVED]: [],
};

export const CfpStatusValidator = {
  canTransition(current: CfpStatus, target: CfpStatus): boolean {
    return cfpAllowedTransitions[current]?.includes(target) ?? false;
  },
  isAcceptingSubmissions(status: CfpStatus): boolean {
    return status === CfpStatus.ACTIVE;
  },
};
