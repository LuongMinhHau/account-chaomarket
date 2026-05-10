import { describe, it, expect } from 'vitest';
import { getEmailLocale } from '@/lib/get-email-locale';

describe('getEmailLocale', () => {
    it('should return "vi" when no request provided', () => {
        expect(getEmailLocale()).toBe('vi');
    });

    it('should return "vi" when accept-language is vi', () => {
        const req = new Request('http://test.com', {
            headers: { 'accept-language': 'vi-VN,vi;q=0.9,en;q=0.8' },
        });
        expect(getEmailLocale(req)).toBe('vi');
    });

    it('should return "en" when accept-language is en', () => {
        const req = new Request('http://test.com', {
            headers: { 'accept-language': 'en-US,en;q=0.9' },
        });
        expect(getEmailLocale(req)).toBe('en');
    });

    it('should return "vi" for unsupported language', () => {
        const req = new Request('http://test.com', {
            headers: { 'accept-language': 'ja-JP,ja;q=0.9' },
        });
        expect(getEmailLocale(req)).toBe('vi');
    });

    it('should return "vi" when accept-language header is empty', () => {
        const req = new Request('http://test.com', {
            headers: { 'accept-language': '' },
        });
        expect(getEmailLocale(req)).toBe('vi');
    });

    it('should handle accept-language with no dash', () => {
        const req = new Request('http://test.com', {
            headers: { 'accept-language': 'en' },
        });
        expect(getEmailLocale(req)).toBe('en');
    });
});
