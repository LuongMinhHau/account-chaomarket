import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

/**
 * robots.txt — controls search engine crawling.
 * Disallow API routes, auth internals, and account-specific pages.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/auth/login', '/auth/sign-up'],
                disallow: [
                    '/api/',
                    '/profile',
                    '/security',
                    '/privacy',
                    '/notifications',
                    '/transaction',
                    '/checkout/',
                    '/consultation',
                    '/purchase/',
                ],
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
    };
}
