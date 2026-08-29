'use client';

import {useState} from 'react';
import {ConferenceCreateSchema} from '@sessioflow/api-definitions/zod/conference';
import type {ConferenceApiResponse} from '@sessioflow/api-definitions/types/conference';
import {Alert, AlertDescription} from '@frontend/components/ui/alert';
import {Button} from '@frontend/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@frontend/components/ui/card';
import {Input} from '@frontend/components/ui/input';
import {Label} from '@frontend/components/ui/label';
import {Textarea} from '@frontend/components/ui/textarea';
import {describeApiError, readEnvelope} from '../../lib/api-response';

/** Raw form state: every field is a controlled string input. */
type FormValues = {
  name: string;
  description: string;
  cfpStartDate: string;
  cfpEndDate: string;
};

/** Validated body accepted by `POST /api/v1/conferences`. */
type ConferenceCreateBody = {
  name: string;
  description: string;
  cfpStartDate: string;
  cfpEndDate: string;
  maxSubmissions?: number;
  requiresApproval?: boolean;
};

const EMPTY_FORM: FormValues = {
  name: '',
  description: '',
  cfpStartDate: '',
  cfpEndDate: '',
};

const PLACEHOLDER_SLUG = 'conference-slug';

/**
 * Mirrors the domain `ConferenceSlug` slugification for the *preview only*.
 * The server remains authoritative (it re-derives and persists the real slug),
 * so this mirror can never corrupt data — ADR-022 keeps domain code out of the
 * frontend bundle.
 */
function previewSlug(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z\d]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

  return slug === '' ? PLACEHOLDER_SLUG : slug;
}

/**
 * Conference creation form (F1, Journey 01 steps 1-16).
 *
 * Validation uses the shared `ConferenceCreateSchema` (@sessioflow/
 * api-definitions) so client and API share one contract (ADR-007/ADR-020);
 * server-side business-rule failures (BR-001..BR-004) are displayed verbatim
 * from the API error envelope.
 */
export function ConferenceForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const onFieldChange = (field: keyof FormValues, value: string): void => {
    setValues(previous => ({...previous, [field]: value}));
  };

  const createConference = async (
    body: ConferenceCreateBody,
  ): Promise<void> => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/v1/conferences', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      const envelope = await readEnvelope<ConferenceApiResponse>(response);

      if (!response.ok) {
        setErrorMessage(describeApiError(envelope));

        return;
      }

      if (envelope.data) {
        globalThis.location.href = `/conferences/${envelope.data.id}`;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setErrorMessage(undefined);

    // Client pre-validation mirrors the API boundary: same schema, same
    // messages, and no request when the body is already invalid.
    const parsed = ConferenceCreateSchema.safeParse(values);

    if (!parsed.success) {
      const [issue] = parsed.error.issues;
      setErrorMessage(issue?.message ?? 'Please review the form fields.');

      return;
    }

    void createConference(parsed.data);
  };

  const slug = previewSlug(values.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conference details</CardTitle>
        <CardDescription>
          Set the identity of the conference and open its Call-for-Papers
          window. Conferences are created in CFP_OPEN state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="space-y-6"
          onSubmit={event => {
            handleSubmit(event);
          }}
        >
          {errorMessage !== undefined && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="conference-name">Conference Name</Label>
            <Input
              id="conference-name"
              placeholder="Tech Conference 2026"
              value={values.name}
              onChange={event => {
                onFieldChange('name', event.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Submissions URL will be <code>/cfp/{slug}</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conference-description">Description</Label>
            <Textarea
              id="conference-description"
              placeholder="What is this conference about?"
              value={values.description}
              onChange={event => {
                onFieldChange('description', event.target.value);
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cfp-start-date">CfP Start Date</Label>
              <Input
                id="cfp-start-date"
                type="date"
                value={values.cfpStartDate}
                onChange={event => {
                  onFieldChange('cfpStartDate', event.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfp-end-date">CfP End Date</Label>
              <Input
                id="cfp-end-date"
                type="date"
                value={values.cfpEndDate}
                onChange={event => {
                  onFieldChange('cfpEndDate', event.target.value);
                }}
              />
            </div>
          </div>

          <Button disabled={submitting} type="submit">
            Create Conference
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
