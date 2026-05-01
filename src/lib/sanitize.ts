/**
 * Sanitize HTML content to prevent XSS attacks.
 *
 * On the client, uses DOMPurify with the browser's native DOM.
 * On the server (SSR), uses sanitize-html (no DOM dependency).
 *
 * Usage:
 *   import { sanitizeHtml } from '@/lib/sanitize';
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlString) }} />
 */

const PURIFY_OPTIONS = {
    ADD_TAGS: ['mark', 'span', 'iframe'],
    ADD_ATTR: ['style', 'id', 'class', 'target', 'rel', 'allowfullscreen', 'frameborder', 'allow', 'src'],
    ALLOW_DATA_ATTR: true,
};

export function sanitizeHtml(dirty: string): string {
    if (typeof window === 'undefined') {
        // SSR: use sanitize-html (Node.js-only, no DOM needed)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sanitize = require('sanitize-html') as typeof import('sanitize-html');
        const sanitizeFn = typeof sanitize === 'function' ? sanitize : (sanitize as { default: typeof sanitize }).default;
        return sanitizeFn(dirty, {
            allowedTags: sanitize.defaults?.allowedTags
                ? [...sanitize.defaults.allowedTags, 'mark', 'span', 'iframe', 'img']
                : ['mark', 'span', 'iframe', 'img', 'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
            allowedAttributes: {
                '*': ['style', 'id', 'class'],
                'a': ['href', 'target', 'rel'],
                'img': ['src', 'alt', 'width', 'height'],
                'iframe': ['src', 'allowfullscreen', 'frameborder', 'allow', 'width', 'height'],
            },
            allowedSchemes: ['http', 'https', 'mailto'],
        });
    }

    // Client: use DOMPurify with browser's native DOM
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require('dompurify') as typeof import('dompurify');
    return DOMPurify.default
        ? DOMPurify.default.sanitize(dirty, PURIFY_OPTIONS)
        : (DOMPurify as unknown as { sanitize: (d: string, o: object) => string }).sanitize(dirty, PURIFY_OPTIONS);
}
