import { useEffect } from 'react';
import { en } from '@locales/en';
import { vi } from '@locales/vi';
import { siteConfig } from '@/config/site.config';

/**
 * Sets the browser tab title with bilingual format.
 * Format: "Bảo Mật - Security | Chào Account"
 * If both translations are the same, shows only once.
 */
export function usePageTitle(i18nKey: string) {
    useEffect(() => {
        if (!i18nKey) return;

        const resolve = (obj: Record<string, unknown>, key: string): string => {
            const keys = key.split('.');
            let result: unknown = obj;
            for (const k of keys) {
                result = (result as Record<string, unknown>)?.[k];
            }
            return (typeof result === 'string' ? result : key);
        };

        const viTitle = resolve(vi as unknown as Record<string, unknown>, i18nKey);
        const enTitle = resolve(en as unknown as Record<string, unknown>, i18nKey);

        const title = viTitle !== enTitle
            ? `${viTitle} - ${enTitle}`
            : viTitle;

        document.title = `${title} | ${siteConfig.name}`;

        return () => {
            document.title = siteConfig.name;
        };
    }, [i18nKey]);
}

