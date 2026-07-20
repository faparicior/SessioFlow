import {type Conference} from './conference';
import {type ConferenceId} from './value-objects/conference-id';
import {type ConferenceSlug} from './value-objects/conference-slug';

/**
 * Repository interface for Conference aggregate root.
 */
export interface ConferenceRepository {
  save(conference: Conference): Promise<void>;
  findById(id: ConferenceId): Promise<Conference | undefined>;
  findBySlug(slug: ConferenceSlug): Promise<Conference | undefined>;
}
