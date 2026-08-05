import {expect, test, type Page} from '@playwright/test';
import {deleteConferences} from './utils/cleanup';

/**
 * Formats a Date as YYYY-MM-DD.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a Date object N days from today (including today when n=0).
 */
function daysFromNow(n: number): Date {
  const now = new Date();
  now.setDate(now.getDate() + n);
  return now;
}

/**
 * Creates a conference directly via the API (bypasses UI).
 * Returns the conference ID on success.
 */
async function createConferenceViaApi(
  page: Page,
  name: string,
  startDate: Date,
  endDate: Date,
): Promise<string> {
  // Define formatDate inside browser context since page.evaluate runs isolated
  const response = await page.evaluate(
    async (params: {name: string; startDate: Date; endDate: Date}) => {
      function formatDate(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const result = await fetch('/api/v1/conferences', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: params.name,
          description: 'Test conference',
          cfpStartDate: formatDate(params.startDate),
          cfpEndDate: formatDate(params.endDate),
          maxSubmissions: 100,
          requiresApproval: true,
        }),
      });
      return await result.json();
    },
    {name, startDate, endDate},
  );
  return (response as {data: {id: string}}).data.id;
}

/**
 * E2E Test: Conference Setup (Journey 01)
 *
 * This test defines the complete user journey for creating a conference
 * and configuring its Call for Papers (CfP) settings.
 *
 * Acceptance Criteria:
 * 1. User can create a conference with valid name, description, and CfP dates
 * 2. Conference is created in DRAFT state then transitions to CFP_OPEN
 * 3. CfpConfig child entity is created with ACTIVE status
 * 4. ConferenceCreated and CfpOpened domain events are published
 * 5. CfP URL is generated and returned in response
 * 6. User is redirected to conference dashboard with CfP link
 *
 * Expected Result: This test FAILS initially (no implementation yet)
 * It defines the "North Star" for the implementation phases.
 */

test.describe('Conference Setup E2E', () => {
  /**
   * Helper: Create a conference via the UI.
   * Extracted to avoid await-in-loop lint errors.
   * Uses dynamic dates so tests don't drift.
   */
  async function createConference(
    page: Page,
    name: string,
  ): Promise<void> {
    await page.getByLabel('Conference Name').fill(name);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();
    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);
    await page.goto('/conferences/create');
  }

  test.beforeEach(async ({page}) => {
    // Clean up conferences before each test to avoid free tier limit
    await deleteConferences();

    // Navigate to conference creation page
    await page.goto('/conferences/create');
  });

  test('should create a conference with CfP configuration (Happy Path)', async ({
    page,
  }) => {
    // Step 1: Fill conference name (use timestamp for uniqueness)
    const timestamp = Date.now();
    await page
      .getByLabel('Conference Name')
      .fill(`Tech Conference ${timestamp}`);

    // Step 2: Fill description
    await page
      .getByLabel('Description')
      .fill('A conference about technology and innovation');

    // Step 3: Select CfP start date (must be in future)
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();

    // Step 4: Select CfP end date (must be after start date)
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    // Step 5: Verify CfP URL preview updates (code element text content)
    const slug = `tech-conference-${timestamp}`;
    const cfpCode = page.locator('code').first();
    await expect(cfpCode).toContainText(slug);

    // Step 6: Submit the form
    await page.getByRole('button', {name: /create conference/i}).click();

    // Step 7: Wait for redirect to conference dashboard (UUID)
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Step 8: Verify CfP link is displayed in dashboard (code element)
    await expect(page.locator('code').filter({hasText: slug})).toBeVisible();
  });

  test('should reject conference with invalid CfP dates (End date before start date)', async ({
    page,
  }) => {
    // Fill valid fields with start date after end date (client-side validation)
    await page.getByLabel('Conference Name').fill('Invalid Dates Conference');
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(1))); // End before start
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for validation errors
    await page.waitForLoadState('networkidle');

    // Verify validation error is displayed
    await expect(
      page.getByText(/end date must be after start date/i),
    ).toBeVisible();
  });

  test('should reject conference with duplicate slug', async ({page}) => {
    // First, create a conference with a static name via UI
    const conferenceName = 'Duplicate Slug Test Conference';
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for redirect to conference dashboard (UUID)
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Navigate back to create page
    await page.goto('/conferences/create');

    // Try to create another conference with the same name (duplicate slug)
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(60)));
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for form submission to complete
    await page.waitForLoadState('networkidle');

    // Verify conflict error is displayed (actual error: "Conference slug already exists")
    await expect(
      page.getByText(/conference slug already exists/i),
    ).toBeVisible();
  });

  test('should reject conference with free tier limit exceeded', async ({
    page,
  }) => {
    // Create 5 conferences via API (much faster than UI) to hit the free tier limit
    for (let i = 0; i < 5; i++) {
      await createConferenceViaApi(
        page,
        `Limit Test Conference ${i + 1}`,
        daysFromNow(1),
        daysFromNow(30),
      );
    }

    // Clean up API-created conferences for subsequent tests
    await deleteConferences();

    // Now try to create a 6th conference via UI - should fail with free tier limit
    const timestamp = Date.now();
    await page
      .getByLabel('Conference Name')
      .fill(`Too Many Conferences ${timestamp}`);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for error
    await page.waitForLoadState('networkidle');

    // Verify upgrade prompt is displayed
    await expect(page.getByText(/upgrade your plan/i)).toBeVisible();
  });

  test('should reject conference with past CfP date', async ({page}) => {
    // Fill form with past date
    const timestamp = Date.now();
    await page
      .getByLabel('Conference Name')
      .fill(`Past Date Conference ${timestamp}`);
    await page.getByLabel('CfP Start Date').fill('2020-01-01'); // Past date
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for error
    await page.waitForLoadState('networkidle');

    // Verify past date error is displayed (matches the actual server error message)
    await expect(
      page.getByText(/cfpstartdate must be in the future or today/i),
    ).toBeVisible();
  });
});
