import { type Conference } from './conference';
import { type ConferenceId } from './value-objects/conference-id';
import { type ConferenceSlug } from './value-objects/conference-slug';

/**
 * ConferenceRepository Interface Contract.
 * Placed directly at domain root (no repositories/ subfolder).
 */
export interface ConferenceRepository {
  save(conference: Conference): Promise<void>;
  findById(id: ConferenceId | string): Promise<Conference | null>;
  findBySlug(slug: ConferenceSlug | string): Promise<Conference | null>;
  delete(id: ConferenceId | string): Promise<void>;
}
