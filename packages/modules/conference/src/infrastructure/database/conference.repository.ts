import { eq } from 'drizzle-orm';
import { db } from '@sessioflow/shared-database/client';
import { conferencesTable, outboxMessagesTable } from '@sessioflow/shared-database/schema';
import { type ConferenceRepository } from '../../domain/conference-repository.interface';
import { Conference } from '../../domain/conference';
import { ConferenceId } from '../../domain/value-objects/conference-id';
import { ConferenceName } from '../../domain/value-objects/conference-name';
import { ConferenceSlug } from '../../domain/value-objects/conference-slug';
import { ConferenceStatusFromString } from '../../domain/value-objects/conference-status';
import { CfpConfig } from '../../domain/cfp-config';
import { CfpStatus } from '../../domain/value-objects/cfp-status';
import { CfpStartDate } from '../../domain/value-objects/cfp-start-date';
import { CfpEndDate } from '../../domain/value-objects/cfp-end-date';
import { ConferenceDescription } from '../../domain/value-objects/conference-description';
import { OrganizerId } from '../../domain/value-objects/organizer-id';
import { MaxSubmissions } from '../../domain/value-objects/max-submissions';
import { RequiresApproval } from '../../domain/value-objects/requires-approval';

export class DrizzleConferenceRepository implements ConferenceRepository {
  async save(conference: Conference): Promise<void> {
    const data = {
      id: conference.id.value,
      name: conference.name.value,
      description: conference.description.value,
      slug: conference.slug.value,
      status: conference.status,
      organizerId: conference.organizerId.value,
      cfpConfig: {
        startDate: conference.cfpConfig.startDate.value.toISOString(),
        endDate: conference.cfpConfig.endDate.value.toISOString(),
        maxSubmissions: conference.cfpConfig.maxSubmissions.value,
        requiresApproval: conference.cfpConfig.requiresApproval.value,
        status: conference.cfpConfig.status,
      },
      updatedAt: conference.updatedAt,
    };

    await db
      .insert(conferencesTable)
      .values(data)
      .onConflictDoUpdate({
        target: conferencesTable.id,
        set: data,
      });
  }

  async findById(id: ConferenceId | string): Promise<Conference | null> {
    const rawId = typeof id === 'string' ? id : id.value;
    const [row] = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.id, rawId));

    return row ? this.mapToDomain(row) : null;
  }

  async findBySlug(slug: ConferenceSlug | string): Promise<Conference | null> {
    const rawSlug = typeof slug === 'string' ? slug : slug.value;
    const [row] = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.slug, rawSlug));

    return row ? this.mapToDomain(row) : null;
  }

  async findByOrganizerId(organizerId: string): Promise<Conference[]> {
    const rows = await db
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.organizerId, organizerId));

    return rows.map((row) => this.mapToDomain(row));
  }

  async delete(id: ConferenceId | string): Promise<void> {
    const rawId = typeof id === 'string' ? id : id.value;
    await db.delete(conferencesTable).where(eq(conferencesTable.id, rawId));
  }

  private mapToDomain(row: typeof conferencesTable.$inferSelect): Conference {
    const cfpData = row.cfpConfig as {
      startDate: string;
      endDate: string;
      maxSubmissions?: number;
      requiresApproval: boolean;
      status: string;
    };

    return Conference.fromData({
      id: ConferenceId.fromString(row.id),
      name: ConferenceName.create(row.name),
      description: ConferenceDescription.create(row.description ?? ''),
      slug: ConferenceSlug.create(row.slug),
      status: ConferenceStatusFromString(row.status),
      organizerId: OrganizerId.create(row.organizerId),
      cfpConfig: CfpConfig.fromData({
        startDate: CfpStartDate.create(new Date(cfpData.startDate)),
        endDate: CfpEndDate.create(new Date(cfpData.endDate)),
        maxSubmissions: MaxSubmissions.create(cfpData.maxSubmissions),
        requiresApproval: RequiresApproval.create(cfpData.requiresApproval),
        status: (cfpData.status as CfpStatus) ?? CfpStatus.ACTIVE,
      }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
