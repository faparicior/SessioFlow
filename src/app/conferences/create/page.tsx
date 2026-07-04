'use client';

import {ConferenceForm} from '@/modules/conference/interfaces/web/components/conference-form';

/**
 * Conference Creation Page
 *
 * Route: /conferences/create
 * This page renders the ConferenceForm component and handles the submission
 * by calling the POST /api/v1/conferences endpoint.
 */
export default function CreateConferencePage() {
  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/v1/conferences', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: data.name,
          description: data.description || '',
          cfpStartDate: data.cfpStartDate,
          cfpEndDate: data.cfpEndDate,
          maxSubmissions: data.maxSubmissions,
          requiresApproval: data.requiresApproval ?? true,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        return {success: true, data: result.data};
      } else {
        const error = result.error || {message: 'An error occurred'};
        return {success: false, errors: [{code: error.code, message: error.message}]};
      }
    } catch (error) {
      console.error('Conference creation error:', error);
      return {
        success: false,
        errors: [{code: 'INTERNAL_ERROR', message: 'An unexpected error occurred'}],
      };
    }
  };

  const handleSuccess = (data: any) => {
    console.log('[Page] handleSuccess called with data:', data);
    // Redirect after a brief delay so the success alert renders
    setTimeout(() => {
      console.log('[Page] Redirecting to /conferences/' + data.id);
      window.location.href = `/conferences/${data.id}`;
    }, 100);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Conference</h1>
      <ConferenceForm onSubmit={handleSubmit} onSuccess={handleSuccess} />
    </div>
  );
}