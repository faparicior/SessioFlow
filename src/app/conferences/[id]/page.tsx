'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';

/**
 * Conference Detail Page
 *
 * Route: /conferences/[id]
 * Displays conference details and allows organizers to manage their conference.
 */
export default function ConferenceDetailPage({
  params,
}: {
  readonly params: Promise<{id: string}>;
}) {
  const router = useRouter();
  const [conference, setConference] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(null);

  // Unwrap params Promise using React.use()
  const {id} = React.use(params);

  useEffect(() => {
    fetchConference(id);
  }, [id]);

  const fetchConference = async (conferenceId: string) => {
    try {
      const response = await fetch(`/api/v1/conferences/${conferenceId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Conference not found');
          return;
        }

        throw new Error('Failed to fetch conference');
      }

      const data = await response.json();
      setConference(data.data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading conference...</p>
      </div>
    );
  }

  if (error || !conference) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Conference not found'}</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => {
            router.push('/dashboard');
          }}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{conference.name}</CardTitle>
          <CardDescription>Conference ID: {conference.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="text-muted-foreground">{conference.status}</p>
          </div>

          <div>
            <h3 className="font-semibold">CfP Configuration</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>
                Start Date:{' '}
                {new Date(conference.cfpStartDate).toLocaleDateString()}
              </li>
              <li>
                End Date: {new Date(conference.cfpEndDate).toLocaleDateString()}
              </li>
              <li>Status: {conference.cfpStatus}</li>
              {conference.maxSubmissions
                ? (
                  <li>Max Submissions: {conference.maxSubmissions}</li>
                )
                : null}
              <li>
                Requires Approval: {conference.requiresApproval ? 'Yes' : 'No'}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">CfP URL</h3>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="text-sm flex-1">{conference.cfpUrl}</code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () =>
                  navigator.clipboard.writeText(conference.cfpUrl)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                router.push('/dashboard');
              }}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(conference.cfpUrl, '_blank')}
            >
              Open CfP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
