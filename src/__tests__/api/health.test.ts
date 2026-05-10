import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        execute: vi.fn(() => Promise.resolve([])),
    },
}));

vi.mock('drizzle-orm', () => ({
    sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ strings, values }),
}));

describe('GET /api/health', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with healthy status when DB is up', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        expect(response.status).toBe(200);

        const body = await response.json();
        expect(body.status).toBe('healthy');
        expect(body.checks.database.status).toBe('healthy');
        expect(body.checks.database.latencyMs).toBeGreaterThanOrEqual(0);
        expect(body.timestamp).toBeDefined();
        expect(body.uptime).toBeGreaterThan(0);
        expect(body.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should return 503 when DB is down', async () => {
        const { db } = await import('@/lib/db');
        vi.mocked(db.execute).mockRejectedValueOnce(new Error('Connection refused'));

        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        expect(response.status).toBe(503);

        const body = await response.json();
        expect(body.status).toBe('degraded');
        expect(body.checks.database.status).toBe('unhealthy');
    });

    it('should include Cache-Control: no-cache header', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    });

    it('should include version field', async () => {
        const { GET } = await import('@/app/api/health/route');
        const response = await GET();
        const body = await response.json();
        expect(body.version).toBeDefined();
        expect(typeof body.version).toBe('string');
    });
});
