import { describe, it, expect } from 'vitest';
import { checkRateLimit, getRateLimitInfo } from '@/lib/rate-limiter';

describe('checkRateLimit', () => {
    it('should allow requests under the limit', () => {
        const key = `test-allow-${Date.now()}`;
        expect(checkRateLimit(key, 3, 60_000)).toBe(true);
        expect(checkRateLimit(key, 3, 60_000)).toBe(true);
        expect(checkRateLimit(key, 3, 60_000)).toBe(true);
    });

    it('should block requests over the limit', () => {
        const key = `test-block-${Date.now()}`;
        checkRateLimit(key, 2, 60_000);
        checkRateLimit(key, 2, 60_000);
        expect(checkRateLimit(key, 2, 60_000)).toBe(false);
    });

    it('should isolate different keys', () => {
        const key1 = `test-iso-a-${Date.now()}`;
        const key2 = `test-iso-b-${Date.now()}`;
        checkRateLimit(key1, 1, 60_000);
        expect(checkRateLimit(key1, 1, 60_000)).toBe(false);
        expect(checkRateLimit(key2, 1, 60_000)).toBe(true);
    });
});

describe('getRateLimitInfo', () => {
    it('should return correct remaining count', () => {
        const key = `test-info-${Date.now()}`;
        checkRateLimit(key, 5, 60_000);
        checkRateLimit(key, 5, 60_000);
        const info = getRateLimitInfo(key, 5, 60_000);
        expect(info.remaining).toBe(3);
    });

    it('should return 0 remaining when exhausted', () => {
        const key = `test-exhausted-${Date.now()}`;
        for (let i = 0; i < 3; i++) checkRateLimit(key, 3, 60_000);
        const info = getRateLimitInfo(key, 3, 60_000);
        expect(info.remaining).toBe(0);
    });
});
