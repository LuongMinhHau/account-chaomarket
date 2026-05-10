import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (class merger)', () => {
    it('should merge simple classes', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
        expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
    });

    it('should handle undefined/null inputs', () => {
        expect(cn('base', undefined, null, 'end')).toBe('base end');
    });

    it('should merge Tailwind classes correctly', () => {
        // twMerge should deduplicate conflicting utility classes
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should handle empty call', () => {
        expect(cn()).toBe('');
    });

    it('should handle array of classes', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar');
    });

    it('should handle object-style conditionals', () => {
        expect(cn({ 'text-red': true, 'text-blue': false })).toBe('text-red');
    });
});
