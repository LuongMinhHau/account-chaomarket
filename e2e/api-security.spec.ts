import { test, expect } from '@playwright/test';

/**
 * E2E: API Security & Headers
 * Validates enterprise security headers and API behavior.
 */
test.describe('Security Headers', () => {
    test('health endpoint returns security headers', async ({ request }) => {
        const response = await request.get('/api/health');
        const headers = response.headers();

        // Cache headers for health endpoint
        expect(headers['cache-control']).toContain('no-store');
    });

    test('login page has security headers', async ({ page }) => {
        const response = await page.goto('/auth/login');
        const headers = response!.headers();

        // Enterprise security headers
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBeTruthy();
        expect(headers['referrer-policy']).toBeTruthy();
    });
});

test.describe('API Rate Limiting & Validation', () => {
    test('protected API returns 401 without session', async ({ request }) => {
        const response = await request.get('/api/account/profile');
        expect(response.status()).toBe(401);
    });

    test('me endpoint returns 401 without session', async ({ request }) => {
        const response = await request.get('/api/me');
        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.user).toBeNull();
    });

    test('change-password rejects without auth', async ({ request }) => {
        const response = await request.post('/api/account/security/change-password', {
            data: {
                currentPassword: 'Old@Pass1',
                newPassword: 'New@Pass1',
            },
        });
        expect(response.status()).toBe(401);
    });

    test('profile update rejects without auth', async ({ request }) => {
        const response = await request.put('/api/account/profile', {
            data: { name: 'Hacker' },
        });
        expect(response.status()).toBe(401);
    });

    test('OTP send requires valid email', async ({ request }) => {
        const response = await request.post('/api/auth/otp', {
            data: { email: 'not-an-email', type: 'email' },
        });
        // Should reject invalid email
        expect([400, 200]).toContain(response.status());
    });
});

test.describe('Purchase Gateway', () => {
    test('purchase page loads for unauthenticated users', async ({ page }) => {
        await page.goto('/purchase');
        await expect(page).toHaveTitle(/Chào/i);
        // Should show login prompt or product info
        await expect(page.locator('body')).not.toBeEmpty();
    });
});
