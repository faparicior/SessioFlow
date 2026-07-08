import {describe, it, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'vitest-axe';
import '@testing-library/jest-dom/vitest';
import {type ConferenceFormData, ConferenceForm} from '@/modules/conference/interfaces/web/components/conference-form';

// Mock the API call
const mockCreateConference = vi.fn<
  (
    data: ConferenceFormData,
  ) => Promise<{success: boolean; data?: any; errors?: any[]}>
>();

describe('ConferenceForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    expect(screen.getByLabelText(/conference name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cfp start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cfp end date/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /create conference/i}),
    ).toBeInTheDocument();
  });

  it('does not submit form with short conference name', async () => {
    const user = userEvent.setup();
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    const nameInput = screen.getByLabelText(/conference name/i);
    const submitButton = screen.getByRole('button', {
      name: /create conference/i,
    });

    await user.type(nameInput, 'Ab');
    await user.click(submitButton);

    // The form should not submit (mock should not be called)
    expect(mockCreateConference).not.toHaveBeenCalled();
  });

  it('shows error when end date is before start date', async () => {
    const user = userEvent.setup();
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    const nameInput = screen.getByLabelText(/conference name/i);
    const startDateInput = screen.getByLabelText(/cfp start date/i);
    const endDateInput = screen.getByLabelText(/cfp end date/i);
    const submitButton = screen.getByRole('button', {
      name: /create conference/i,
    });

    await user.type(nameInput, 'Tech Conference');
    await user.type(startDateInput, '2026-09-30');
    await user.type(endDateInput, '2026-08-01');
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(
          screen.getByText(/end date must be after start date/i),
        ).toBeInTheDocument();
      },
      {timeout: 2000},
    );
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    const nameInput = screen.getByLabelText(/conference name/i);
    const startDateInput = screen.getByLabelText(/cfp start date/i);
    const endDateInput = screen.getByLabelText(/cfp end date/i);
    const submitButton = screen.getByRole('button', {
      name: /create conference/i,
    });

    await user.type(nameInput, 'Tech Conference 2026');
    await user.type(startDateInput, '2026-08-01');
    await user.type(endDateInput, '2026-09-30');

    // Click submit button
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateConference).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tech Conference 2026',
          cfpStartDate: '2026-08-01',
          cfpEndDate: '2026-09-30',
        }),
      );
    });
  });

  it('shows success message after successful submission', async () => {
    const user = userEvent.setup();
    mockCreateConference.mockResolvedValue({
      success: true,
      data: {id: 'test-id'},
    });
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    const nameInput = screen.getByLabelText(/conference name/i);
    const startDateInput = screen.getByLabelText(/cfp start date/i);
    const endDateInput = screen.getByLabelText(/cfp end date/i);
    const submitButton = screen.getByRole('button', {
      name: /create conference/i,
    });

    await user.type(nameInput, 'Tech Conference');
    await user.type(startDateInput, '2026-08-01');
    await user.type(endDateInput, '2026-09-30');

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/conference created successfully/i),
      ).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup();
    mockCreateConference.mockResolvedValue({
      success: false,
      errors: [
        {
          code: 'SLUG_EXISTS',
          message: 'A conference with this name already exists',
        },
      ],
    });
    render(<ConferenceForm onSubmit={mockCreateConference} />);

    const nameInput = screen.getByLabelText(/conference name/i);
    const startDateInput = screen.getByLabelText(/cfp start date/i);
    const endDateInput = screen.getByLabelText(/cfp end date/i);
    const submitButton = screen.getByRole('button', {
      name: /create conference/i,
    });

    await user.type(nameInput, 'Existing Conference');
    await user.type(startDateInput, '2026-08-01');
    await user.type(endDateInput, '2026-09-30');

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });
});
