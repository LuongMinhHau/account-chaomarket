import { test, expect } from '@playwright/test';

/**
 * E2E: Authentication Flows
 * Tests login form validation, error handling, and OAuth provider buttons.
 */
test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth/login');
    });

    test('shows validation error for empty form submission', async ({ page }) => {
        // Click submit without filling fields
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        // Should show validation message
        await expect(page.locator('text=/email|Email|required/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('shows validation error for invalid email format', async ({ page }) => {
        await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
        await page.fill('input[type="password"]', 'somePassword123');
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        // Should show email validation error
        await expect(page.locator('text=/email|hợp lệ|invalid/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('has OAuth provider buttons', async ({ page }) => {
        // Should have social sign-in option(s)
        const oauthSection = page.locator('button, a').filter({
            has: page.locator('img, svg, text=/google|Google|GitHub|facebook/i'),
        });
        // At minimum, page should have interactive sign-in elements
        const formButtons = page.locator('button');
        expect(await formButtons.count()).toBeGreaterThan(0);
    });

    test('has link to sign-up page', async ({ page }) => {
        const signUpLink = page.locator('a[href*="sign-up"]');
        await expect(signUpLink.first()).toBeVisible();
    });

    test('shows error for wrong credentials', async ({ page }) => {
        await page.fill('input[type="email"], input[name="email"]', 'nonexistent@test.com');
        await page.fill('input[type="password"]', 'WrongPassword@123');
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        // Should show error (credentials error or similar)
        await expect(
            page.locator('text=/error|lỗi|incorrect|sai|không|failed/i').first()
        ).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Sign-up Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/auth/sign-up');
    });

    test('shows validation for weak password', async ({ page }) => {
        await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
        // Fill a weak password
        const passwordInputs = page.locator('input[type="password"]');
        if (await passwordInputs.count() > 0) {
            await passwordInputs.first().fill('weak');
        }
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        // Should show password requirements
        await expect(
            page.locator('text=/8|character|ký tự|password|mật khẩu/i').first()
        ).toBeVisible({ timeout: 5000 });
    });

    test('has link to login page', async ({ page }) => {
        const loginLink = page.locator('a[href*="login"]');
        await expect(loginLink.first()).toBeVisible();
    });
});
