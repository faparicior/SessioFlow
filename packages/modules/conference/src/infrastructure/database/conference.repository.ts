import {and, eq, ne} from 'drizzle-orm';
import {db, type DatabaseClient} from '@sessioflow/shared-database/client';
import {conferencesTable} from '@sessioflow/shared-database/schema';
import {Conference} from '../../domain/conference.js';
import type {
  ConferenceRepository,
  TransactionClient,
} from '../../domain/conference-repository.interface.js';
import {CfpConfig, type CfpConfigData} from '../../domain/value-objects/cfp-config.js';
import {ConferenceDescription} from '../../domain/value-objects/conference-description.js';
import {ConferenceId} from '../../domain/value-objects/conference-id.js';
import {ConferenceName} from '../../domain/value-objects/conference-name.js';
import {ConferenceSlug} from '../../domain/value-objects/conference-slug.js';
import {ConferenceStatus} from '../../domain/value-objects/conference-status.js';
import {OrganizerId} from '../../domain/value-objects/organizer-id.js';

/** Persisted row shape of the `conferences` table. */
type ConferenceRow = typeof conferencesTable.$inferSelect;

/** JSONB annotation of `conferences.cfp_config` (shared-database schema). */
type CfpConfigJson = ConferenceRow['cfpConfig'];

/**
 * The shared schema annotates the JSONB as `maxSubmissions?: number`, while
 * the domain composite VO uses an explicit `number | null`. JSON serialization
 * drops `undefined`, so an unlimited CfP round-trips as a missing key. These
 * two mappers keep the domain and the persisted contract aligned.
 */
const toCfpConfigJson = (data: CfpConfigData): CfpConfigJson => ({
  startDate: data.startDate,
  endDate: data.endDate,
  maxSubmissions: data.maxSubmissions ?? undefined,
  requiresApproval: data.requiresApproval,
  status: data.status,
});

const fromCfpConfigJson = (json: CfpConfigJson): CfpConfigData => ({
  startDate: json.startDate,
  endDate: json.endDate,
  maxSubmissions: json.maxSubmissions ?? null,
  requiresApproval: json.requiresApproval,
  status: json.status,
});

/**
 * DrizzleConferenceRepository - Infrastructure adapter for the Conference
 * aggregate. Maps rows to Value Objects and reconstitutes the aggregate via
 * `Conference.fromData(...)` (no creation-time validation on reads).
 */
export class DrizzleConferenceRepository implements ConferenceRepository {
  private readonly client: DatabaseClient;

  constructor(client?: DatabaseClient) {
    this.client = client ?? db;
  }

  public async findById(id: ConferenceId): Promise<Conference | null> {
    const [row] = await this.client
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.id, id.value))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  public async findBySlug(slug: ConferenceSlug): Promise<Conference | null> {
    const [row] = await this.client
      .select()
      .from(conferencesTable)
      .where(eq(conferencesTable.slug, slug.value))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  /** BR-004: every status except DELETED counts against the organizer quota. */
  public async countActiveByOrganizerId(organizerId: OrganizerId): Promise<number> {
    const rows = await this.client
      .select({id: conferencesTable.id})
      .from(conferencesTable)
      .where(
        and(
          eq(conferencesTable.organizerId, organizerId.value),
          ne(conferencesTable.status, 'DELETED'),
        ),
      );
    return rows.length;
  }

  /**
   * Upserts the aggregate. When a `tx` handle is provided (ADR-017), the
   * write joins the caller's transaction so aggregate + outbox persist
   * atomically. The handle is opaque here by design (D5); Drizzle
   * transaction clients expose the same insert API as `db`.
   */
  public async save(conference: Conference, tx?: TransactionClient): Promise<void> {
    const target = (tx as DatabaseClient | undefined) ?? this.client;
    const data = conference.toData();

    const values = {
      id: data.id.value,
      name: data.name.value,
      description: data.description.value,
      slug: data.slug.value,
      status: data.status.value,
      organizerId: data.organizerId.value,
      cfpConfig: toCfpConfigJson(data.cfpConfig.value),
      createdAt: data.createdAt,
      updatedAt: new Date(),
    };

    await target
      .insert(conferencesTable)
      .values(values)
      .onConflictDoUpdate({
        target: conferencesTable.id,
        set: {...values, createdAt: data.createdAt},
      });
  }

  /** Maps a persistence row back into the domain aggregate (fromData). */
  private toDomain(row: ConferenceRow): Conference {
    return Conference.fromData({
      id: ConferenceId.fromData(row.id),
      name: ConferenceName.fromData(row.name),
      description: ConferenceDescription.fromData(row.description ?? ''),
      slug: ConferenceSlug.fromData(row.slug),
      status: ConferenceStatus.fromData(row.status),
      organizerId: OrganizerId.fromData(row.organizerId),
      cfpConfig: CfpConfig.fromData(fromCfpConfigJson(row.cfpConfig)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
