import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
vi.stubEnv('NEXTAUTH_SECRET', 'a-secret-key-that-is-at-least-32-characters-long-for-testing');
vi.stubEnv('GOOGLE_CLIENT_ID', 'test-google-client-id');
vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-google-client-secret');
vi.stubEnv('BREVO_API_KEY', 'test-brevo-api-key');
vi.stubEnv('PAYOS_CLIENT_ID', 'test-payos-client-id');
vi.stubEnv('PAYOS_API_KEY', 'test-payos-api-key');
vi.stubEnv('PAYOS_CHECKSUM_KEY', 'test-payos-checksum-key');
vi.stubEnv('R2_ENDPOINT', 'https://test.r2.cloudflarestorage.com');
vi.stubEnv('R2_ACCESS_KEY_ID', 'test-r2-key');
vi.stubEnv('R2_SECRET_ACCESS_KEY', 'test-r2-secret');
vi.stubEnv('R2_PUBLIC_URL', 'https://cdn.test.com');
vi.stubEnv('LICENSE_API_SECRET', 'test-license-secret');

describe('env validation', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should parse valid environment variables without throwing', async () => {
        const { env } = await import('@/lib/env');
        expect(env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test');
        expect(env.NEXTAUTH_SECRET).toContain('a-secret-key');
    });

    it('should contain all required fields', async () => {
        const { env } = await import('@/lib/env');
        expect(env).toHaveProperty('DATABASE_URL');
        expect(env).toHaveProperty('NEXTAUTH_URL');
        expect(env).toHaveProperty('NEXTAUTH_SECRET');
        expect(env).toHaveProperty('GOOGLE_CLIENT_ID');
        expect(env).toHaveProperty('GOOGLE_CLIENT_SECRET');
        expect(env).toHaveProperty('BREVO_API_KEY');
        expect(env).toHaveProperty('PAYOS_CLIENT_ID');
        expect(env).toHaveProperty('PAYOS_API_KEY');
        expect(env).toHaveProperty('PAYOS_CHECKSUM_KEY');
    });
});
