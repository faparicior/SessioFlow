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
 * Creates a conference via fetch (browser-side) to build up to 5 conferences
 * for the free tier limit test.
 */
async function createConferenceViaFetch(page: Page, name: string): Promise<void> {
  await page.evaluate(async (name: string) => {
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const daysFromNow = (n: number) => {
      const d = new Date();
      d.setDate(d.getDate() + n);
      return d;
    };
    const result = await fetch('/api/v1/conferences', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name,
        description: 'Test conference',
        cfpStartDate: formatDate(daysFromNow(1)),
        cfpEndDate: formatDate(daysFromNow(30)),
        maxSubmissions: 100,
        requiresApproval: true,
      }),
    });
    return result.ok;
  }, name);
}

test.describe('Conference Setup E2E', () => {
  test.beforeEach(async ({page}) => {
    // Start each test with a clean state so scenarios are fully isolated.
    await deleteConferences();
    await page.goto('/conferences/create');
  });

  test('should create a conference with CfP configuration (Happy Path)', async ({page}) => {
    // Fill conference name (use timestamp for uniqueness)
    const timestamp = Date.now();
    await page.getByLabel('Conference Name').fill(`Tech Conference ${timestamp}`);

    await page.getByLabel('Description').fill('A conference about technology and innovation');

    // Select CfP dates (relative so tests don't drift over time)
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    // Verify CfP URL preview updates
    const slug = `tech-conference-${timestamp}`;
    await expect(page.locator('code').first()).toContainText(slug);

    // Submit the form
    await page.getByRole('button', {name: /create conference/i}).click();

    // Redirect to conference dashboard (UUID)
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Verify CfP link is displayed in dashboard
    await expect(page.locator('code').filter({hasText: slug})).toBeVisible();
  });

  test('should reject conference with invalid CfP dates (End date before start date)', async ({
    page,
  }) => {
    await page.getByLabel('Conference Name').fill('Invalid Dates Conference');
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(1))); // End before start
    await page.getByLabel('CfP End Date').blur();

    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/end date must be after start date/i)).toBeVisible();
  });

  test('should reject conference with duplicate slug', async ({page}) => {
    const conferenceName = 'Duplicate Slug Test Conference';

    // First, create a conference with a static name
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();
    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForURL(/\/conferences\/[\da-fA-F-]{36}$/);

    // Navigate back and try the same name again
    await page.goto('/conferences/create');
    await page.getByLabel('Conference Name').fill(conferenceName);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(60)));
    await page.getByLabel('CfP End Date').blur();

    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForLoadState('networkidle');

    // Actual error: "Conference slug already exists"
    await expect(page.getByText(/conference slug already exists/i)).toBeVisible();
  });

  test('should reject conference with free tier limit exceeded', async ({page}) => {
    // Create 5 conferences via fetch to exhaust the free tier limit.
    for (let i = 0; i < 5; i++) {
      await createConferenceViaFetch(page, `Limit Test Conference ${i + 1}`);
    }

    // A 6th conference should be rejected
    const timestamp = Date.now();
    await page.getByLabel('Conference Name').fill(`Too Many Conferences ${timestamp}`);
    await page.getByLabel('CfP Start Date').fill(formatDate(daysFromNow(1)));
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForLoadState('networkidle');

    // Actual error: "Please upgrade your plan"
    await expect(page.getByText(/upgrade your plan/i)).toBeVisible();
  });

  test('should reject conference with past CfP date', async ({page}) => {
    const timestamp = Date.now();
    await page.getByLabel('Conference Name').fill(`Past Date Conference ${timestamp}`);
    await page.getByLabel('CfP Start Date').fill('2020-01-01'); // Past date
    await page.getByLabel('CfP Start Date').blur();
    await page.getByLabel('CfP End Date').fill(formatDate(daysFromNow(30)));
    await page.getByLabel('CfP End Date').blur();

    await page.getByRole('button', {name: /create conference/i}).click();
    await page.waitForLoadState('networkidle');

    // Actual error: "CfpStartDate must be in the future or today"
    await expect(page.getByText(/cfpstartdate must be in the future or today/i)).toBeVisible();
  });
});
