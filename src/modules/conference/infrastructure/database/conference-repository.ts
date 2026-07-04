import {eq} from 'drizzle-orm';
import {conferencesTable} from './drizzle-schema';
import {getSupabaseClient} from '@/shared/infrastructure/database/db-client';
import {type ConferenceRepository} from '@/modules/conference/domain/repositories/conference-repository';
import {Conference} from '@/modules/conference/domain/entities/conference';
import {ConferenceId} from '@/modules/conference/domain/value-objects/conference-id';
import {ConferenceSlug} from '@/modules/conference/domain/value-objects/conference-slug';
import {type ConferenceStatus} from '@/modules/conference/domain/value-objects/conference-status';
import {CfpConfig} from '@/modules/conference/domain/entities/cfp-config';
import {CfpStartDate} from '@/modules/conference/domain/value-objects/cfp-start-date';
import {CfpEndDate} from '@/modules/conference/domain/value-objects/cfp-end-date';
import {MaxSubmissions} from '@/modules/conference/domain/value-objects/max-submissions';
import {RequiresApproval} from '@/modules/conference/domain/value-objects/requires-approval';
import {ConferenceName} from '@/modules/conference/domain/value-objects/conference-name';

/**
 * ConferenceRepository - Supabase/Drizzle implementation.
 *
 * Implements the ConferenceRepository interface using Drizzle ORM
 * with Supabase PostgreSQL.
 */
export class SupabaseConferenceRepository implements ConferenceRepository {
  async findById(id: ConferenceId): Promise<Conference | undefined> {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from(conferencesTable)
      .select()
      .where(eq(conferencesTable.id, id.value))
      .single();

    if (result.error || !result.data) {
      return null;
    }

    return this.mapToConference(result.data);
  }

  async findBySlug(slug: ConferenceSlug): Promise<Conference | undefined> {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from(conferencesTable)
      .select()
      .where(eq(conferencesTable.slug, slug.value))
      .single();

    if (result.error || !result.data) {
      return null;
    }

    return this.mapToConference(result.data);
  }

  async findByOrganizerId(organizerId: string): Promise<Conference[]> {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from(conferencesTable)
      .select()
      .where(eq(conferencesTable.organizerId, organizerId));

    if (result.error) {
      return [];
    }

    return (result.data || []).map(row => this.mapToConference(row));
  }

  async findByStatus(status: ConferenceStatus): Promise<Conference[]> {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from(conferencesTable)
      .select()
      .where(eq(conferencesTable.status, status));

    if (result.error) {
      return [];
    }

    return (result.data || []).map(row => this.mapToConference(row));
  }

  async save(conference: Conference): Promise<void> {
    const supabase = getSupabaseClient();

    const cfpConfig = {
      startDate: conference.cfpConfig.startDate.toISOString(),
      endDate: conference.cfpConfig.endDate.toISOString(),
      maxSubmissions: conference.cfpConfig.maxSubmissions.value,
      requiresApproval: conference.cfpConfig.requiresApproval.value,
      status: conference.cfpConfig.status,
    };

    const data = {
      id: conference.id.value,
      name: conference.name.value,
      description: conference.description,
      slug: conference.slug.value,
      status: conference.status,
      organizerId: conference.organizerId,
      cfpConfig,
      updatedAt: new Date().toISOString(),
    };

    // Check if conference exists
    const existing = await supabase
      .from(conferencesTable)
      .select('id')
      .where(eq(conferencesTable.id, conference.id.value))
      .single();

    if (existing.data) {
      // Update
      await supabase
        .from(conferencesTable)
        .update(data)
        .where(eq(conferencesTable.id, conference.id.value));
    } else {
      // Insert
      await supabase.from(conferencesTable).insert({
        ...data,
        createdAt: conference.createdAt.toISOString(),
      });
    }
  }

  async delete(id: ConferenceId): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase
      .from(conferencesTable)
      .delete()
      .where(eq(conferencesTable.id, id.value));
  }

  /**
   * Map a database row to a Conference entity.
   */
  private mapToConference(row: any): Conference {
    const cfpConfig = row.cfp_config || {};

    return Conference.fromData({
      id: ConferenceId.fromString(row.id),
      name: ConferenceName.create(row.name),
      description: row.description || '',
      slug: ConferenceSlug.create(row.slug),
      status: row.status as ConferenceStatus,
      organizerId: row.organizer_id,
      cfpConfig: CfpConfig.create({
        startDate: CfpStartDate.fromISOString(cfpConfig.startDate),
        endDate: CfpEndDate.fromISOString(cfpConfig.endDate),
        maxSubmissions: MaxSubmissions.create(cfpConfig.maxSubmissions),
        requiresApproval: RequiresApproval.create(cfpConfig.requiresApproval ?? true),
      }),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
