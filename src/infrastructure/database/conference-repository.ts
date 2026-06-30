import type {ConferenceSlug} from '@/domain/conference/value-objects/conference-slug.ts';
import type {ConferenceStatus} from '@/domain/conference/value-objects/conference-status.ts';
import type {Conference} from '@/domain/conference/conference.ts';
import type {ConferenceRepository} from '@/domain/conference/repositories/conference-repository.ts';

export class SupabaseConferenceRepository implements ConferenceRepository {
  async findById(_id: string): Promise<Conference | undefined> {
    throw new Error('Not yet implemented');
  }

  async findBySlug(_slug: ConferenceSlug): Promise<Conference | undefined> {
    throw new Error('Not yet implemented');
  }

  async findByOrganizerId(_organizerId: string): Promise<Conference[]> {
    throw new Error('Not yet implemented');
  }

  async findByStatus(_status: ConferenceStatus): Promise<Conference[]> {
    throw new Error('Not yet implemented');
  }

  async save(_conference: Conference): Promise<void> {
    throw new Error('Not yet implemented');
  }

  async delete(_id: string): Promise<void> {
    throw new Error('Not yet implemented');
  }
}
