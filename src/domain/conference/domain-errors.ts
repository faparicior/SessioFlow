export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class InvalidConferenceStatusError extends DomainError {}
export class InvalidConferenceTransitionError extends DomainError {}
export class ConferenceNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Conference not found: ${id}`);
    this.name = 'ConferenceNotFoundError';
  }
}
export class ConferenceSlugConflictError extends DomainError {
  constructor(slug: string) {
    super(`Conference slug already exists: ${slug}`);
    this.name = 'ConferenceSlugConflictError';
  }
}
export class FreeTierLimitExceededError extends DomainError {
  constructor() {
    super('Free tier conference creation limit exceeded');
    this.name = 'FreeTierLimitExceededError';
  }
}
export class CfpConfigError extends DomainError {}
