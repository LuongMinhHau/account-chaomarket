import { describe, it, expect } from 'vitest';
import { formatTransactionCode } from '@/lib/format-transaction-code';

describe('formatTransactionCode', () => {
    it('should format numeric code with # prefix', () => {
        expect(formatTransactionCode(1100526001)).toBe('#1100526001');
    });

    it('should format string code with # prefix', () => {
        expect(formatTransactionCode('2150526003')).toBe('#2150526003');
    });

    it('should handle zero', () => {
        expect(formatTransactionCode(0)).toBe('#0');
    });

    it('should handle large numbers', () => {
        expect(formatTransactionCode(9999999999)).toBe('#9999999999');
    });
});
