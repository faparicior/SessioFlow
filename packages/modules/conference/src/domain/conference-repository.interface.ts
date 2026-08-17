import {Conference} from './conference.js';
import {ConferenceId} from './value-objects/conference-id.js';
import {ConferenceSlug} from './value-objects/conference-slug.js';
import {OrganizerId} from './value-objects/organizer-id.js';

/**
 * Opaque database transaction handle (decision D5). The concrete type is
 * defined by the ORM in the infrastructure layer; the domain only passes it
 * through so the application layer can drive atomicity (ADR-017).
 */
export type TransactionClient = unknown;

/**
 * ConferenceRepository - Persistence port for the Conference aggregate.
 * Implemented in infrastructure (Drizzle) and injected via the container.
 */
export interface ConferenceRepository {
  findById(id: ConferenceId): Promise<Conference | null>;
  findBySlug(slug: ConferenceSlug): Promise<Conference | null>;
  /** Counts non-DELETED conferences for an organizer (BR-004). */
  countActiveByOrganizerId(organizerId: OrganizerId): Promise<number>;
  save(conference: Conference, tx?: TransactionClient): Promise<void>;
}
