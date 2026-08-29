'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import type {ConferenceApiResponse} from '@sessioflow/api-definitions/types/conference';
import {Alert, AlertDescription} from '@frontend/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@frontend/components/ui/card';
import {describeApiError, readEnvelope} from '../../../lib/api-response';

/** 'Yes'/'No' label for a boolean detail row. */
function yesNoLabel(value: boolean): string {
  if (value) {
    return 'Yes';
  }

  return 'No';
}

/** CfP state note shown under the shareable link (BR-005/BR-006 wording). */
function cfpStatusNote(isOpen: boolean): string {
  if (isOpen) {
    return 'Submissions are open.';
  }

  return 'Submissions are closed.';
}

/**
 * Conference Dashboard (F2, Journey 01 steps 16-17).
 *
 * The F1 form redirects here after a successful creation. It reads the
 * conference through the CQRS query endpoint and surfaces the shareable CfP
 * link. Error/empty states come straight from the API error envelope.
 */
export default function ConferenceDashboardPage() {
  const {id} = useParams<{id: string}>();

  const [conference, setConference] = useState<
    ConferenceApiResponse | undefined
  >();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadConference = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/v1/conferences/${id}`);
        const envelope = await readEnvelope<ConferenceApiResponse>(response);

        if (!active) {
          return;
        }

        if (response.ok && envelope.data) {
          setConference(envelope.data);
        } else {
          setErrorMessage(describeApiError(envelope));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadConference();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <p className="text-muted-foreground">Loading conference…</p>
      </div>
    );
  }

  const failureMessage = errorMessage ?? 'Conference not found.';

  if (conference === undefined) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Alert variant="destructive">
          <AlertDescription>{failureMessage}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold">{conference.name}</h1>
        <span className="rounded-md border px-2 py-1 text-xs uppercase text-muted-foreground">
          {conference.status}
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call for Papers</CardTitle>
          <CardDescription>
            Share this link with potential speakers.{' '}
            {cfpStatusNote(conference.cfp.isOpen)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">CfP link</p>
            <code>
              /cfp/
              {conference.slug}
            </code>
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Opens</dt>
              <dd>{conference.cfp.startDate.slice(0, 10)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Closes</dt>
              <dd>{conference.cfp.endDate.slice(0, 10)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Submission limit</dt>
              <dd>{conference.cfp.maxSubmissions ?? 'Unlimited'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Approval required</dt>
              <dd>{yesNoLabel(conference.cfp.requiresApproval)}</dd>
            </div>
          </dl>
          {conference.description !== '' && (
            <p className="text-muted-foreground">{conference.description}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
