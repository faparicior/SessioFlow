import {eq} from 'drizzle-orm';
import {conferencesTable} from './drizzle-schema';
import {getDb} from '@/shared/infrastructure/database/db-client';
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
 * ConferenceRepository - PostgreSQL/Drizzle implementation.
 *
 * Implements the ConferenceRepository interface using Drizzle ORM
 * with PostgreSQL.
 */
export class SupabaseConferenceRepository implements ConferenceRepository {
  async findById(id: ConferenceId): Promise<Conference | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.id, id.value))
      .limit(1);

    if (rows.length === 0) {
      return undefined;
    }

    return this.mapToConference(rows[0]);
  }

  async findBySlug(slug: ConferenceSlug): Promise<Conference | undefined> {
    const db = getDb();
    const rows = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.slug, slug.value))
      .limit(1);

    console.log('[Repo] findBySlug rows:', JSON.stringify(rows));

    if (rows.length === 0) {
      return undefined;
    }

    return this.mapToConference(rows[0]);
  }

  async findByOrganizerId(organizerId: string): Promise<Conference[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.organizerId, organizerId));

    return rows.map(row => this.mapToConference(row));
  }

  async findByStatus(status: ConferenceStatus): Promise<Conference[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.status, status));

    return rows.map(row => this.mapToConference(row));
  }

  async save(conference: Conference): Promise<void> {
    const db = getDb();

    console.log('[Repo] Saving conference:', {
      id: conference.id.value,
      name: conference.name.value,
      organizerId: conference.organizerId,
    });

    const data = {
      id: conference.id.value,
      name: conference.name.value,
      description: conference.description,
      slug: conference.slug.value,
      status: conference.status,
      organizerId: conference.organizerId,
      cfpConfig: {
        startDate: conference.cfpConfig.startDate.toISOString(),
        endDate: conference.cfpConfig.endDate.toISOString(),
        maxSubmissions: conference.cfpConfig.maxSubmissions.value,
        requiresApproval: conference.cfpConfig.requiresApproval.value,
        status: conference.cfpConfig.status,
      },
      createdAt: conference.createdAt,
      updatedAt: new Date(),
    };

    // Check if conference exists
    const existing = await db
      .select({id: conferencesTable.id})
      .from(conferencesTable)
      .where(eq(conferencesTable.id, conference.id.value))
      .limit(1);

    if (existing.length > 0) {
      // Update
      await db
        .update(conferencesTable)
        .set(data)
        .where(eq(conferencesTable.id, conference.id.value));
    } else {
      // Insert
      await db.insert(conferencesTable).values(data);
    }
  }

  async delete(id: ConferenceId): Promise<void> {
    const db = getDb();
    await db
      .delete(conferencesTable)
      .where(eq(conferencesTable.id, id.value));
  }

  /**
   * Map a database row to a Conference entity.
   */
  private mapToConference(row: any): Conference {
    // Drizzle maps snake_case columns to camelCase properties
    const {cfpConfig} = row;

    return Conference.fromData({
      id: ConferenceId.fromString(row.id),
      name: ConferenceName.create(row.name),
      description: row.description || '',
      slug: ConferenceSlug.create(row.slug),
      status: row.status as ConferenceStatus,
      organizerId: row.organizerId,
      cfpConfig: CfpConfig.create({
        startDate: CfpStartDate.fromISOString(cfpConfig.startDate),
        endDate: CfpEndDate.fromISOString(cfpConfig.endDate),
        maxSubmissions: MaxSubmissions.create(cfpConfig.maxSubmissions),
        requiresApproval: RequiresApproval.create(cfpConfig.requiresApproval ?? true),
      }),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
