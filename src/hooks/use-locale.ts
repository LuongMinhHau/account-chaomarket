'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { COOKIE } from '@/constant/cookie';

const PREFERRED_LOCALE_KEY = 'chao_market_preferred_locale';

/**
 * Cookie domain for cross-subdomain locale sharing.
 * Production: `.chaomarket.com` — shared across account, chaonews, chaomarket web.
 * Development: undefined — stays on localhost only.
 * Note: thuexe.chaomarket.com is NOT linked and uses its own locale system.
 */
const COOKIE_DOMAIN =
    typeof window !== 'undefined' && window.location.hostname.endsWith('.chaomarket.com')
        ? '.chaomarket.com'
        : undefined;

/** Common cookie options for locale persistence */
const localeCookieOptions = {
    expires: 365,
    sameSite: 'lax' as const,
    path: '/',
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
};

export function useLocale(initialLocale?: string) {
    const [locale, setLocaleState] = useState<string>(initialLocale || 'en');
    const router = useRouter();

    useEffect(() => {
        const storedLocale = Cookies.get(COOKIE.LOCALE_KEY_NAME);
        const storedPreferred = Cookies.get(PREFERRED_LOCALE_KEY);

        if (storedLocale) {
            // Existing user — use stored locale (may come from another subdomain)
            setLocaleState(storedLocale);
        } else if (!initialLocale) {
            // First-time user — detect from browser language
            const browserLocale = navigator.language ?? 'en';
            const detected = browserLocale.startsWith('vi') ? 'vi' : 'en';
            setLocaleState(detected);
            // Also save as preferred
            if (!storedPreferred) {
                Cookies.set(PREFERRED_LOCALE_KEY, detected, localeCookieOptions);
            }
        }
    }, [initialLocale]);

    // User explicitly chooses a locale (saves both active + preferred)
    const setLocale = useCallback((newLocale: string) => {
        setLocaleState(newLocale);
        Cookies.set(COOKIE.LOCALE_KEY_NAME, newLocale, localeCookieOptions);
        Cookies.set(PREFERRED_LOCALE_KEY, newLocale, localeCookieOptions);
        // Re-run server components so generateMetadata picks up the new locale cookie
        router.refresh();
    }, [router]);

    // Admin forces a locale (saves active only, keeps preferred intact)
    const forceLocale = useCallback((newLocale: string) => {
        setLocaleState(newLocale);
        Cookies.set(COOKIE.LOCALE_KEY_NAME, newLocale, localeCookieOptions);
        // Do NOT overwrite preferred_locale
    }, []);

    // Get user's saved preferred locale
    const getPreferredLocale = useCallback((): string | undefined => {
        return Cookies.get(PREFERRED_LOCALE_KEY);
    }, []);

    return { locale, setLocale, forceLocale, getPreferredLocale };
}
