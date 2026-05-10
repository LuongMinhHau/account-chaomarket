import { randomInt, createHash } from 'crypto';

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses Node.js crypto.randomInt for uniform distribution.
 */
export function generateOTP(): string {
    return randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP using SHA-256 before storing in database.
 * One-way hash — prevents reading plaintext OTP from DB leaks.
 */
export function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}
