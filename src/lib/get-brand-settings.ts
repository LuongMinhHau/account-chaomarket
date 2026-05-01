/**
 * Brand settings — stubbed for Account portal.
 * In the full Web project this fetches from admin DB.
 */
export const getBrandSettings = async (): Promise<Record<string, string>> => ({});

export function buildBrandOverrides(
    settings: Record<string, string>,
): Record<string, Record<string, string>> {
    const overrides: Record<string, Record<string, string>> = {};
    for (const [dbKey, value] of Object.entries(settings)) {
        if (dbKey.startsWith('i18n__') && value) {
            const parts = dbKey.split('__');
            if (parts.length >= 3) {
                const locale = parts[1];
                const path = parts.slice(2).join('__');
                if (!overrides[locale]) overrides[locale] = {};
                overrides[locale][path] = value;
            }
        }
    }
    return overrides;
}
