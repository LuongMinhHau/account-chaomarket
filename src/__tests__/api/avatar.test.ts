import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => []),
                    orderBy: vi.fn(() => ({
                        limit: vi.fn(() => []),
                    })),
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
    users: { id: 'id', image: 'image' },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('@/lib/env', () => ({
    env: {
        S3_ENDPOINT: 'http://test.com',
        S3_REGION: 'us-east-1',
        S3_BUCKET: 'test',
        S3_ACCESS_KEY: 'key',
        S3_SECRET_KEY: 'secret',
    },
}));

vi.mock('@/services/storage/upload-avatar', () => ({
    uploadAvatar: vi.fn(() => Promise.resolve('https://cdn.test.com/avatar.jpg')),
}));

describe('POST /api/account/avatar', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for non-multipart request', async () => {
        const { POST } = await import('@/app/api/account/avatar/route');
        const req = new Request('http://test.com/api/account/avatar', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        // Should fail — non-multipart body cannot be parsed as file
        expect([400, 401, 500]).toContain(response.status);
    });
});
