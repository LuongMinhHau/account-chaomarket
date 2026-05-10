import { describe, it, expect } from 'vitest';
import {
    formatCurrency,
    formatTransactionCode,
} from '@/app/(account)/transaction/_components/transaction-types';

describe('formatCurrency', () => {
    it('should format number amounts with Vietnamese locale', () => {
        expect(formatCurrency(1000000)).toBe('1.000.000');
    });

    it('should format string amounts', () => {
        expect(formatCurrency('499000')).toBe('499.000');
    });

    it('should handle zero', () => {
        expect(formatCurrency(0)).toBe('0');
    });

    it('should handle decimal amounts by truncating', () => {
        expect(formatCurrency(1999.99)).toBe('2.000');
    });
});

describe('formatTransactionCode', () => {
    it('should format long codes with # prefix and last 8 chars', () => {
        expect(formatTransactionCode('TXN1234567890ABC')).toBe('#67890ABC');
    });

    it('should format short codes with # prefix', () => {
        expect(formatTransactionCode('TXN12345')).toBe('#TXN12345');
    });

    it('should handle exactly 12 character codes', () => {
        expect(formatTransactionCode('123456789012')).toBe('#123456789012');
    });

    it('should handle 13+ character codes', () => {
        expect(formatTransactionCode('1234567890123')).toBe('#67890123');
    });
});
