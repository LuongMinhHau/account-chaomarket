import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site.config';

/**
 * Dynamic sitemap for SEO.
 * Account portal has limited public pages — most are behind auth.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/auth/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/auth/sign-up`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/auth/reset-password`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];
}
