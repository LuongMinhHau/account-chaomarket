import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create a chainable mock that also acts as an array result
function createWhereResult() {
    const result = Object.assign([], {
        orderBy: vi.fn(() => ({
            limit: vi.fn(() => []),
        })),
        limit: vi.fn(() => []),
    });
    return result;
}

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => createWhereResult()),
            })),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    userDevices: {
        id: 'id', userId: 'userId', lastActiveAt: 'lastActiveAt',
    },
    accounts: { userId: 'userId', provider: 'provider', type: 'type' },
    users: { id: 'id', email: 'email', createdAt: 'createdAt' },
    auditLogs: { userId: 'userId', action: 'action', createdAt: 'createdAt' },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

// Default: authenticated session
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com', name: 'Test', role: 'user', image: null },
    })),
}));

describe('GET /api/account/devices (authenticated)', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with devices array', async () => {
        const { GET } = await import('@/app/api/account/devices/route');
        const response = await GET();
        expect(response.status).toBe(200);
    });
});

describe('GET /api/me (authenticated)', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with user data', async () => {
        const { GET } = await import('@/app/api/me/route');
        const response = await GET();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.user).toBeDefined();
        expect(body.user.id).toBe('user-1');
        expect(body.user.email).toBe('test@test.com');
    });

    it('should return user fields', async () => {
        const { GET } = await import('@/app/api/me/route');
        const response = await GET();
        const body = await response.json();
        expect(body.user).toHaveProperty('id');
        expect(body.user).toHaveProperty('name');
        expect(body.user).toHaveProperty('email');
    });
});

describe('GET /api/account/privacy (authenticated)', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with privacy data', async () => {
        const { GET } = await import('@/app/api/account/privacy/route');
        const response = await GET();
        expect(response.status).toBe(200);
    });
});

describe('GET /api/account/security/audit-logs (authenticated)', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 200 with audit logs', async () => {
        const { GET } = await import('@/app/api/account/security/audit-logs/route');
        const response = await GET();
        expect(response.status).toBe(200);
    });
});
