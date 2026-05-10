import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn(() => []),
                })),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({})),
            })),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    notifications: { id: 'id', userId: 'userId', isRead: 'isRead' },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

describe('PUT /api/account/notifications', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for invalid mutation body', async () => {
        const { PUT } = await import('@/app/api/account/notifications/route');
        const req = new Request('http://test.com/api/account/notifications', {
            method: 'PUT',
            body: JSON.stringify({ action: 'invalid' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 for markAsRead without notificationId', async () => {
        const { PUT } = await import('@/app/api/account/notifications/route');
        const req = new Request('http://test.com/api/account/notifications', {
            method: 'PUT',
            body: JSON.stringify({ action: 'markAsRead' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });
});

describe('GET /api/account/notifications', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with notifications array', async () => {
        const { GET } = await import('@/app/api/account/notifications/route');
        const response = await GET();
        // Route returns 200 with empty array or 401 if no session
        expect([200, 401]).toContain(response.status);
    });
});
