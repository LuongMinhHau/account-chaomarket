import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@test.com',
                        phone: null,
                        gender: 'male',
                        dateOfBirth: null,
                        image: null,
                        createdAt: '2026-01-01',
                        emailVerified: null,
                    }]),
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
    users: {
        id: 'id', email: 'email', name: 'name',
        phone: 'phone', gender: 'gender', dateOfBirth: 'dateOfBirth',
        image: 'image', createdAt: 'createdAt', emailVerified: 'emailVerified',
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test User' },
    })),
}));

describe('GET /api/account/profile', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with user profile', async () => {
        const { GET } = await import('@/app/api/account/profile/route');
        const response = await GET();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.user).toBeDefined();
        expect(body.user.id).toBe('user-1');
    });
});

describe('PUT /api/account/profile', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for invalid gender value', async () => {
        const { PUT } = await import('@/app/api/account/profile/route');
        const req = new Request('http://test.com/api/account/profile', {
            method: 'PUT',
            body: JSON.stringify({ gender: 'invalid' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 for name exceeding 100 chars', async () => {
        const { PUT } = await import('@/app/api/account/profile/route');
        const req = new Request('http://test.com/api/account/profile', {
            method: 'PUT',
            body: JSON.stringify({ name: 'A'.repeat(101) }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });

    it('should accept valid profile update', async () => {
        const { PUT } = await import('@/app/api/account/profile/route');
        const req = new Request('http://test.com/api/account/profile', {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated Name', gender: 'female' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(200);
    });

    it('should accept partial update (phone only)', async () => {
        const { PUT } = await import('@/app/api/account/profile/route');
        const req = new Request('http://test.com/api/account/profile', {
            method: 'PUT',
            body: JSON.stringify({ phone: '+84123456789' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(200);
    });

    it('should accept nullable phone', async () => {
        const { PUT } = await import('@/app/api/account/profile/route');
        const req = new Request('http://test.com/api/account/profile', {
            method: 'PUT',
            body: JSON.stringify({ phone: null }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(200);
    });
});
