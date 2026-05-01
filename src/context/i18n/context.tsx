

'use client';

import { createContext, useContext, useMemo } from 'react';
import { useLocale } from '@/hooks/use-locale';
import { TranslationKey } from '@/types/translations';
import { en } from '@locales/en';
import { vi } from '@locales/vi';

const translations = {
    en,
    vi,
};

/** Per-locale overrides from admin DB, keyed by dotted i18n path */
export type BrandOverrides = Record<string, Record<string, string>>;

const I18nContext = createContext<{
    locale: string;
    setLocale: (locale: string) => void;
    forceLocale: (locale: string) => void;
    getPreferredLocale: () => string | undefined;
    t: (key: TranslationKey) => string;
}>({
    locale: 'en',
    setLocale: () => { },
    forceLocale: () => { },
    getPreferredLocale: () => undefined,
    t: key => key as string,
});

export function I18nProvider({
    children,
    initialLocale,
    brandOverrides,
}: {
    children: React.ReactNode;
    initialLocale?: string;
    brandOverrides?: BrandOverrides;
}) {
    const { locale, setLocale, forceLocale, getPreferredLocale } = useLocale(initialLocale);

    const t = useMemo(() => {
        return (key: TranslationKey): string => {
            if (!locale) return key as string;

            // Check admin DB overrides first
            const keyStr = key.trim();
            const override = brandOverrides?.[locale]?.[keyStr];
            if (override !== undefined) return override;

            // Fallback to static locale files
            const keys = keyStr.split('.');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic i18n key traversal requires untyped indexing
            let result: any =
                translations[locale as keyof typeof translations] ||
                translations.en;

            for (const k of keys) {
                result = result?.[k];
            }

            return result || (key as string);
        };
    }, [locale, brandOverrides]);

    const contextValue = useMemo(
        () => ({
            locale: locale || 'en',
            setLocale,
            forceLocale,
            getPreferredLocale,
            t,
        }),
        [locale, setLocale, forceLocale, getPreferredLocale, t]
    );

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
