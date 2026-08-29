import {ConferenceForm} from '@frontend/modules/conference/conference-form';

/**
 * Create Conference Page (F1)
 *
 * Route: /conferences/create
 * Thin server wrapper around the client form (Journey 01, steps 1-16).
 */
export default function CreateConferencePage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Create Conference</h1>
      <ConferenceForm />
    </div>
  );
}
