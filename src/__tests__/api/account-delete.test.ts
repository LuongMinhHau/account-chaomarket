import { describe, it, expect, vi } from 'vitest';

// Mock the database and dependencies before importing the route
vi.mock('@/lib/db', () => ({
    db: {
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
        delete: vi.fn(() => ({
            where: vi.fn(),
        })),
    },
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/audit-logger', () => ({
    logAuditEvent: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
}));

vi.mock('@/db/schema', () => ({
    users: { id: 'id' },
    accounts: { userId: 'userId' },
    sessions: { userId: 'userId' },
}));

import { getServerSession } from 'next-auth';
import { checkRateLimit } from '@/lib/rate-limiter';

describe('DELETE /api/account/delete', () => {
    it('should return 401 when not authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const { DELETE } = await import('@/app/api/account/delete/route');
        const response = await DELETE();
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json.message).toBe('Unauthorized');
    });

    it('should return 429 when rate limited', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: 'user-1', email: 'test@example.com' },
            expires: '',
        });
        vi.mocked(checkRateLimit).mockReturnValueOnce(false);

        const { DELETE } = await import('@/app/api/account/delete/route');
        const response = await DELETE();
        const json = await response.json();

        expect(response.status).toBe(429);
        expect(json.message).toBe('Too many requests');
    });

    it('should return 200 on successful deletion', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: 'user-1', email: 'test@example.com' },
            expires: '',
        });
        vi.mocked(checkRateLimit).mockReturnValueOnce(true);

        const { DELETE } = await import('@/app/api/account/delete/route');
        const response = await DELETE();
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.success).toBe(true);
    });
});
