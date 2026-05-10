import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml (server-side)', () => {
    it('should preserve allowed HTML tags', () => {
        const input = '<p>Hello <strong>world</strong></p>';
        const result = sanitizeHtml(input);
        expect(result).toContain('<p>');
        expect(result).toContain('<strong>');
    });

    it('should strip script tags', () => {
        const input = '<p>Hello</p><script>alert("xss")</script>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert');
    });

    it('should strip event handlers', () => {
        const input = '<div onmouseover="alert(1)">test</div>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('onmouseover');
    });

    it('should allow safe link tags', () => {
        const input = '<a href="https://example.com" target="_blank">Link</a>';
        const result = sanitizeHtml(input);
        expect(result).toContain('href');
        expect(result).toContain('https://example.com');
    });

    it('should strip javascript: protocol in links', () => {
        const input = '<a href="javascript:alert(1)">Click</a>';
        const result = sanitizeHtml(input);
        expect(result).not.toContain('javascript:');
    });

    it('should handle empty string', () => {
        expect(sanitizeHtml('')).toBe('');
    });

    it('should handle plain text', () => {
        expect(sanitizeHtml('Hello world')).toBe('Hello world');
    });

    it('should allow img tags with safe attributes', () => {
        const input = '<img src="https://example.com/img.png" alt="test" />';
        const result = sanitizeHtml(input);
        expect(result).toContain('img');
        expect(result).toContain('src');
    });
});
