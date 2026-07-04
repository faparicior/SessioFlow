/**
 * ConferenceStatus - The current state of a Conference lifecycle.
 *
 * Value Object: Enum
 * States:
 *   - DRAFT: Conference created but not yet published
 *   - CFP_OPEN: Call for Papers is live, accepting submissions
 *   - CFP_CLOSED: Submission deadline passed or manually closed
 *   - REVIEWING: Organizer actively reviewing submissions
 *   - SCHEDULED: Selection complete, schedule being finalized
 *   - PUBLISHED: Conference agenda live and public
 *   - COMPLETED: Conference concluded
 *   - DELETED: Conference cancelled
 */
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
