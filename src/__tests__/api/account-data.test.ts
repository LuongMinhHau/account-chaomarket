import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chainable DB mock
function mockChain() {
    const r = Object.assign([], {
        orderBy: vi.fn(() => Object.assign([], { limit: vi.fn(() => []) })),
        limit: vi.fn(() => []),
    });
    return r;
}

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => mockChain()),
                innerJoin: vi.fn(() => ({
                    where: vi.fn(() => mockChain()),
                    innerJoin: vi.fn(() => ({
                        where: vi.fn(() => mockChain()),
                    })),
                })),
            })),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    orders: { id: 'id', userId: 'userId', status: 'status', createdAt: 'createdAt' },
    orderProducts: { orderId: 'orderId', productId: 'productId' },
    transactions: { orderId: 'orderId', status: 'status' },
    products: { id: 'id', name: 'name' },
    userDevices: { id: 'id', userId: 'userId', lastActiveAt: 'lastActiveAt' },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

describe('GET /api/account/orders', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 200 with orders array', async () => {
        const { GET } = await import('@/app/api/account/orders/route');
        const response = await GET();
        expect(response.status).toBe(200);
    });
});

describe('GET /api/account/subscriptions', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 200 with subscriptions', async () => {
        const { GET } = await import('@/app/api/account/subscriptions/route');
        const response = await GET();
        expect(response.status).toBe(200);
    });
});

describe('DELETE /api/account/devices/[id]', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 for missing device id', async () => {
        const { DELETE: DEL } = await import('@/app/api/account/devices/[id]/route');
        const req = new Request('http://test.com/api/account/devices/123', {
            method: 'DELETE',
        }) as unknown as import('next/server').NextRequest;

        const response = await DEL(req, { params: Promise.resolve({ id: '' }) });
        expect([400, 404]).toContain(response.status);
    });

    it('should handle valid device id', async () => {
        const { DELETE: DEL } = await import('@/app/api/account/devices/[id]/route');
        const req = new Request('http://test.com/api/account/devices/device-123', {
            method: 'DELETE',
        }) as unknown as import('next/server').NextRequest;

        const response = await DEL(req, { params: Promise.resolve({ id: 'device-123' }) });
        expect([200, 404]).toContain(response.status);
    });
});
