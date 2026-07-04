import {type Conference} from '../entities/conference';
import {type ConferenceId} from '../value-objects/conference-id';
import {type ConferenceSlug} from '../value-objects/conference-slug';
import {type ConferenceStatus} from '../value-objects/conference-status';

/**
 * ConferenceRepository - Interface for Conference data access.
 *
 * DDD Pattern: Repository Interface lives in domain layer (no external dependencies).
 * Implementation lives in infrastructure/database layer.
 *
 * This interface defines the contract for all Conference data operations.
 */
export type ConferenceRepository = {
  /**
   * Find a conference by its unique ID.
   */
  findById(id: ConferenceId): Promise<Conference | undefined>;

  /**
   * Find a conference by its URL-safe slug.
   */
  findBySlug(slug: ConferenceSlug): Promise<Conference | undefined>;

  /**
   * Find all conferences for a specific organizer.
   */
  findByOrganizerId(organizerId: string): Promise<Conference[]>;

  /**
   * Find all conferences with a specific status.
   */
  findByStatus(status: ConferenceStatus): Promise<Conference[]>;

  /**
   * Save (create or update) a conference aggregate.
   */
  save(conference: Conference): Promise<void>;

  /**
   * Delete a conference by its ID.
   */
  delete(id: ConferenceId): Promise<void>;
};
