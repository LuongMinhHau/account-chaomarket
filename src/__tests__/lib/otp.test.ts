import { describe, it, expect } from 'vitest';
import { generateOTP, hashOTP } from '@/lib/otp';

describe('generateOTP', () => {
    it('should generate a 6-digit string', () => {
        const otp = generateOTP();
        expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs on successive calls', () => {
        const otps = new Set(Array.from({ length: 20 }, () => generateOTP()));
        // With 6-digit range, 20 calls should produce at least 15 unique values
        expect(otps.size).toBeGreaterThanOrEqual(15);
    });

    it('should generate OTP within valid range (100000–999999)', () => {
        for (let i = 0; i < 50; i++) {
            const otp = parseInt(generateOTP(), 10);
            expect(otp).toBeGreaterThanOrEqual(100000);
            expect(otp).toBeLessThanOrEqual(999999);
        }
    });
});

describe('hashOTP', () => {
    it('should return a 64-character hex string (SHA-256)', () => {
        const hash = hashOTP('123456');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should be deterministic — same input produces same hash', () => {
        const hash1 = hashOTP('654321');
        const hash2 = hashOTP('654321');
        expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
        const hash1 = hashOTP('123456');
        const hash2 = hashOTP('654321');
        expect(hash1).not.toBe(hash2);
    });

    it('should not return the original OTP', () => {
        const otp = '123456';
        const hash = hashOTP(otp);
        expect(hash).not.toBe(otp);
        expect(hash).not.toContain(otp);
    });
});
