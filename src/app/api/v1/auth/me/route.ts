import {type NextRequest, NextResponse} from 'next/server';
import {ConferenceRepository} from '@/modules/conference/domain/repositories/conference-repository';
import {ConferenceStatus} from '@/modules/conference/domain/value-objects/conference-status';
import {conferencesTable} from '@/modules/conference/infrastructure/database/drizzle-schema';

/**
 * GET /api/v1/auth/me
 *
 * Returns the current authenticated user.
 * TODO: Integrate with Auth0 or Supabase Auth
 */
export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line no-warning-comments
    // TODO: Get user from auth context (Auth0, Supabase Auth, etc.)
    // For now, return a mock user for development
    const user = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Test User',
    };

    return NextResponse.json({data: user});
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      {error: {code: 'UNAUTHORIZED', message: 'Authentication required'}},
      {status: 401},
    );
  }
}
