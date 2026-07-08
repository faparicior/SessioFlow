'use client';

import {type SyntheticEvent, useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Alert, AlertDescription} from '@/components/ui/alert';

/**
 * ConferenceForm - Form component for creating a new conference.
 *
 * Features:
 *   - Real-time validation
 *   - Loading state during submission
 *   - Error handling and display
 *   - Success notification
 *
 * ADR-014: Use shadcn-ui for Components
 * ADR-007: Use Zod for Validation (client-side validation mirrors server schema)
 */
type ConferenceFormProps = {
  readonly onSubmit: (
    data: ConferenceFormData,
  ) => Promise<{success: boolean; data?: any; errors?: any[]}>;
  readonly onSuccess?: (data: any) => void;
};

export type ConferenceFormData = {
  name: string;
  description?: string;
  cfpStartDate: string;
  cfpEndDate: string;
  maxSubmissions?: number;
  requiresApproval?: boolean;
};

type FormErrors = {
  name?: string;
  description?: string;
  cfpStartDate?: string;
  cfpEndDate?: string;
  general?: string;
};

export function ConferenceForm({onSubmit, onSuccess}: ConferenceFormProps) {
  const [formData, setFormData] = useState<ConferenceFormData>({
    name: '',
    description: '',
    cfpStartDate: '',
    cfpEndDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Conference name must be at least 3 characters';
    }

    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Conference name must be at most 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be at most 1000 characters';
    }

    // Date validation
    if (!formData.cfpStartDate) {
      newErrors.cfpStartDate = 'Start date is required';
    }

    if (!formData.cfpEndDate) {
      newErrors.cfpEndDate = 'End date is required';
    }

    if (formData.cfpStartDate && formData.cfpEndDate) {
      const startDate = new Date(formData.cfpStartDate);
      const endDate = new Date(formData.cfpEndDate);
      if (endDate <= startDate) {
        newErrors.cfpEndDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSuccess(false);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(formData);

      if (result.success) {
        setIsSuccess(true);
        setFormData({
          name: '',
          description: '',
          cfpStartDate: '',
          cfpEndDate: '',
        });
        if (onSuccess && result.data) {
          try {
            onSuccess(result.data);
          } catch (error) {
            console.error('[Form] onSuccess callback error:', error);
          }
        }
      } else if (result.errors) {
        setErrors({general: result.errors[0]?.message || 'An error occurred'});
      }
    } catch (error) {
      console.error('[Form] Submission error:', error);
      setErrors({general: 'An unexpected error occurred. Please try again.'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ConferenceFormData, value: string) => {
    setFormData(previous => ({...previous, [field]: value}));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(previous => ({...previous, [field]: undefined}));
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replaceAll(/[^a-z\d\s-]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/^-|-$/g, '');

  const slug = formData.name ? generateSlug(formData.name) : '';
  const cfpUrl = slug ? `https://sessioflow.app/cfp/${slug}` : '';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Conference</CardTitle>
        <CardDescription>
          Set up your conference and Call for Papers (CfP) to start accepting
          proposals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess
          ? (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Conference created successfully! You can now share the CfP link
                with potential speakers.
              </AlertDescription>
            </Alert>
          )
          : null}

        {errors.general
          ? (
            <Alert className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800">
                {errors.general}
              </AlertDescription>
            </Alert>
          )
          : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Conference Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Conference Name</Label>
            <Input
              required
              id="name"
              type="text"
              placeholder="e.g., Tech Conference 2026"
              value={formData.name}
              className={errors.name ? 'border-red-500' : ''}
              onChange={e => {
                handleChange('name', e.target.value);
              }}
            />
            {errors.name
              ? (
                <p className="text-sm text-red-600">{errors.name}</p>
              )
              : null}
            {slug
              ? (
                <p className="text-sm text-muted-foreground">
                  Slug: <code>{slug}</code>
                </p>
              )
              : null}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your conference..."
              value={formData.description}
              className={errors.description ? 'border-red-500' : ''}
              rows={3}
              onChange={e => {
                handleChange('description', e.target.value);
              }}
            />
            {formData.description
              ? (
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              )
              : null}
            {errors.description
              ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              )
              : null}
          </div>

          {/* CfP Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cfpStartDate">CfP Start Date</Label>
              <Input
                required
                id="cfpStartDate"
                type="date"
                value={formData.cfpStartDate}
                className={errors.cfpStartDate ? 'border-red-500' : ''}
                onChange={e => {
                  handleChange('cfpStartDate', e.target.value);
                }}
              />
              {errors.cfpStartDate
                ? (
                  <p className="text-sm text-red-600">{errors.cfpStartDate}</p>
                )
                : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cfpEndDate">CfP End Date</Label>
              <Input
                required
                id="cfpEndDate"
                type="date"
                value={formData.cfpEndDate}
                className={errors.cfpEndDate ? 'border-red-500' : ''}
                onChange={e => {
                  handleChange('cfpEndDate', e.target.value);
                }}
              />
              {errors.cfpEndDate
                ? (
                  <p className="text-sm text-red-600">{errors.cfpEndDate}</p>
                )
                : null}
            </div>
          </div>

          {/* CfP URL Preview */}
          {cfpUrl
            ? (
              <div className="space-y-2">
                <Label>CfP URL Preview</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm flex-1">{cfpUrl}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => navigator.clipboard.writeText(cfpUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )
            : null}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Conference'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
