import {test, expect} from '@playwright/test';
import {deleteConferences} from './utils/cleanup';

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
    await page.getByLabel('CfP Start Date').fill('2026-08-01');
    await page.getByLabel('CfP Start Date').blur();

    // Step 4: Select CfP end date (must be after start date)
    await page.getByLabel('CfP End Date').fill('2026-09-30');
    await page.getByLabel('CfP End Date').blur();

    // Step 5: Verify CfP URL preview updates
    await expect(
      page.getByText(`https://sessioflow.app/cfp/tech-conference-${timestamp}`),
    ).toBeVisible();

    // Step 6: Submit the form
    await page.getByRole('button', {name: /create conference/i}).click();

    // Step 7: Wait for redirect to conference dashboard (UUID)
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Step 8: Verify CfP link is displayed in dashboard
    await expect(page.getByText(/cfp\/tech-conference-/i)).toBeVisible();
  });

  test('should reject conference with invalid CfP dates (End date before start date)', async ({
    page,
  }) => {
    // Fill valid fields
    await page.getByLabel('Conference Name').fill('Invalid Dates Conference');
    await page.getByLabel('CfP Start Date').fill('2026-09-30');
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill('2026-08-01'); // End before start
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
    // First, create a conference with a static name
    const conferenceName = 'Duplicate Slug Test Conference';
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill('2026-08-01');
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill('2026-09-30');
    await page.getByLabel('CfP End Date').blur();
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for redirect to conference dashboard (UUID)
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Navigate back to create page
    await page.goto('/conferences/create');

    // Try to create another conference with the same name (duplicate slug)
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill('2026-10-01');
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill('2026-11-30');
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for form submission to complete
    await page.waitForLoadState('networkidle');

    // Verify conflict error is displayed
    await expect(
      page.getByText(/conference name already taken/i),
    ).toBeVisible();
  });

  test('should reject conference with free tier limit exceeded', async ({
    page,
  }) => {
    // First, create 5 conferences to hit the free tier limit
    for (let i = 0; i < 5; i++) {
      const timestamp = Date.now() + i;
      await page
        .getByLabel('Conference Name')
        .fill(`Limit Test Conference ${timestamp}`);
      await page.getByLabel('CfP Start Date').fill('2026-08-01');
      await page.getByLabel('CfP Start Date').blur();
      await page.getByLabel('CfP End Date').fill('2026-09-30');
      await page.getByLabel('CfP End Date').blur();

      // Submit
      await page.getByRole('button', {name: /create conference/i}).click();

      // Wait for navigation to conference dashboard (UUID)
      await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

      // Go back to create page for next iteration
      await page.goto('/conferences/create');
    }

    // Now try to create a 6th conference - should fail with free tier limit
    const timestamp = Date.now();
    await page
      .getByLabel('Conference Name')
      .fill(`Too Many Conferences ${timestamp}`);
    await page.getByLabel('CfP Start Date').fill('2026-08-01');
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill('2026-09-30');
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
    await page.getByLabel('CfP End Date').fill('2026-09-30');
    await page.getByLabel('CfP End Date').blur();

    // Submit
    await page.getByRole('button', {name: /create conference/i}).click();

    // Wait for error
    await page.waitForLoadState('networkidle');

    // Verify past date error is displayed
    await expect(page.getByText(/dates must be in the future/i)).toBeVisible();
  });
});
