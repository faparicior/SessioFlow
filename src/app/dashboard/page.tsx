'use client';

import {Button} from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';

/**
 * Dashboard Page
 *
 * Route: /dashboard
 * Displays a list of the user's conferences with quick actions.
 */
export default function DashboardPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
        <Button onClick={() => (globalThis.location.href = '/conferences/create')}>
          Create New Conference
        </Button>
      </div>

      <div className='grid gap-4'>
        <Card>
          <CardHeader>
            <CardTitle>Your Conferences</CardTitle>
            <CardDescription>
              Manage your conferences and Call for Papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <p className='mb-4'>You don&apos;t have any conferences yet.</p>
              <Button onClick={() => (globalThis.location.href = '/conferences/create')}>
                Create Your First Conference
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
