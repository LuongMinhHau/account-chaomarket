export type EmailLocale = 'vi' | 'en';

/**
 * Resolves the user's preferred language for emails.
 * Simplified: Accept-Language header → default 'vi'
 * (No DB lookup — account service doesn't have userSetting table)
 */
export function getEmailLocale(request?: Request): EmailLocale {
    if (request) {
        const acceptLang = request.headers.get('accept-language') || '';
        const primary = acceptLang.split(',')[0]?.split('-')[0]?.trim();
        if (primary === 'en') return 'en';
        if (primary === 'vi') return 'vi';
    }
    return 'vi';
}
