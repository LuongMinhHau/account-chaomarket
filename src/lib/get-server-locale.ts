import { cookies } from 'next/headers';

/**
 * Read user locale from cookie on the server (for generateMetadata, layouts, etc.)
 * Falls back to 'en' if no cookie is set.
 */
export async function getServerLocale(): Promise<'vi' | 'en'> {
    try {
        const cookieStore = await cookies();
        const locale = cookieStore.get('chao_market_locale')?.value;
        return locale === 'vi' ? 'vi' : 'en';
    } catch {
        return 'en';
    }
}

/**
 * Page title helper — returns Vietnamese or English title based on server locale.
 */
export function localizedTitle(vi: string, en: string, locale: string): string {
    return locale === 'vi' ? vi : en;
}
