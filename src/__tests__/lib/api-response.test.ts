import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError, apiUnauthorized, apiRateLimited, apiInternalError, parseBody } from '@/lib/api-response';
import { z } from 'zod';

describe('apiSuccess', () => {
    it('should return 200 with success envelope', async () => {
        const res = apiSuccess({ id: '123' });
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.id).toBe('123');
    });

    it('should support custom status codes', async () => {
        const res = apiSuccess({ created: true }, 201);
        expect(res.status).toBe(201);
    });
});

describe('apiError', () => {
    it('should return error envelope', async () => {
        const res = apiError('NOT_FOUND', 'Item not found', 404);
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe('NOT_FOUND');
        expect(json.error.message).toBe('Item not found');
    });
});

describe('shorthand helpers', () => {
    it('apiUnauthorized returns 401', async () => {
        const res = apiUnauthorized();
        expect(res.status).toBe(401);
    });

    it('apiRateLimited returns 429', async () => {
        const res = apiRateLimited();
        expect(res.status).toBe(429);
    });

    it('apiInternalError returns 500', async () => {
        const res = apiInternalError();
        expect(res.status).toBe(500);
    });
});

describe('parseBody', () => {
    const schema = z.object({
        name: z.string().min(1),
        age: z.number().int().positive(),
    });

    it('should parse valid body', async () => {
        const req = new Request('http://test.com', {
            method: 'POST',
            body: JSON.stringify({ name: 'Alice', age: 30 }),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await parseBody(req, schema);
        expect(result.data).toEqual({ name: 'Alice', age: 30 });
        expect(result.error).toBeUndefined();
    });

    it('should return validation error for invalid body', async () => {
        const req = new Request('http://test.com', {
            method: 'POST',
            body: JSON.stringify({ name: '', age: -1 }),
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await parseBody(req, schema);
        expect(result.data).toBeUndefined();
        expect(result.error).toBeDefined();
        const json = await result.error!.json();
        expect(json.error.code).toBe('VALIDATION_ERROR');
        expect(json.error.details).toHaveLength(2);
    });

    it('should return parse error for non-JSON body', async () => {
        const req = new Request('http://test.com', {
            method: 'POST',
            body: 'not json',
        });
        const result = await parseBody(req, schema);
        expect(result.error).toBeDefined();
        const json = await result.error!.json();
        expect(json.error.code).toBe('PARSE_ERROR');
    });
});
