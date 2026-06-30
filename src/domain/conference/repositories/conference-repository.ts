import type {ConferenceSlug} from './value-objects/conference-slug.ts';
import type {ConferenceStatus} from './value-objects/conference-status.ts';
import type {Conference} from './conference.ts';

/**
 * ConferenceRepository interface (domain port).
 */
export type ConferenceRepository = {
  findById(id: string): Promise<Conference | undefined>;
  findBySlug(slug: ConferenceSlug): Promise<Conference | undefined>;
  findByOrganizerId(organizerId: string): Promise<Conference[]>;
  findByStatus(status: ConferenceStatus): Promise<Conference[]>;
  save(conference: Conference): Promise<void>;
  delete(id: string): Promise<void>;
};
