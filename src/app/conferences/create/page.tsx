'use client';

import { ConferenceForm } from '@/modules/conference/interfaces/web/components/conference-form';
import { CreateConferenceHandler } from '@/modules/conference/application/commands/create-conference/create-conference.handler';
import { SupabaseConferenceRepository } from '@/modules/conference/infrastructure/database/conference-repository';
import { getSupabaseClient } from '@/shared/infrastructure/database/db-client';

/**
 * Conference Creation Page
 *
 * Route: /conferences/create
 * This page renders the ConferenceForm component and handles the submission
 * by calling the CreateConference CQRS command handler.
 */
export default function CreateConferencePage() {
  const handleSubmit = async (data: any) => {
    try {
      // Initialize repository and handler
      const repository = new SupabaseConferenceRepository();
      const handler = new CreateConferenceHandler(repository, async () => {});

      // Execute the command
      const result = await handler.execute({
        input: {
          name: data.name,
          description: data.description || '',
          organizerId: 'auth-user-id', // TODO: Get from auth context
          cfpStartDate: data.cfpStartDate,
          cfpEndDate: data.cfpEndDate,
          maxSubmissions: data.maxSubmissions,
          requiresApproval: data.requiresApproval ?? true,
        },
      });

      if (result.success) {
        // Redirect to conference dashboard
        window.location.href = `/conferences/${result.data!.id}`;
        return result;
      } else {
        return { success: false, errors: result.errors };
      }
    } catch (error) {
      console.error('Conference creation error:', error);
      return {
        success: false,
        errors: [{ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }],
      };
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Conference</h1>
      <ConferenceForm onSubmit={handleSubmit} />
    </div>
  );
}