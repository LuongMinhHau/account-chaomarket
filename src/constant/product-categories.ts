/**
 * Product category ↔ type mappings.
 * Used across API, product pages, and cart to maintain consistency.
 *
 * DB `type` values → UI category tabs:
 *   Trading Tools & Data: tool, signal, indicator, data
 *   AI & Software:        software, app
 *   Courses:              course
 *   Custom Solutions:     Holistic (handled separately via Book-a-Consultation)
 */

export const PRODUCT_CATEGORIES = {
    'trading-tools': ['tool', 'signal', 'indicator', 'data'],
    'ai-software': ['software', 'app'],
    'courses': ['course'],
} as const;

export type ProductCategory = keyof typeof PRODUCT_CATEGORIES;

/** All modular (non-Holistic) types */
export const ALL_MODULAR_TYPES = [
    ...PRODUCT_CATEGORIES['trading-tools'],
    ...PRODUCT_CATEGORIES['ai-software'],
    ...PRODUCT_CATEGORIES['courses'],
];

/**
 * Given a product type, return the category URL path.
 * Falls back to '/products/trading-tools' for unknown types.
 */
export function getCategoryUrl(type?: string): string {
    if (!type) return '/products/trading-tools';
    const lower = type.toLowerCase();

    for (const [category, types] of Object.entries(PRODUCT_CATEGORIES)) {
        if ((types as readonly string[]).includes(lower)) {
            return `/products/${category}`;
        }
    }

    return '/products/trading-tools';
}

/**
 * Type display labels (English ↔ Vietnamese).
 * Includes all modular + holistic types.
 */
export const TYPE_LABELS: Record<string, Record<string, string>> = {
    course: { en: 'Course', vi: 'Khóa Học' },
    tool: { en: 'Tool', vi: 'Công Cụ' },
    signal: { en: 'Signal', vi: 'Tín Hiệu' },
    indicator: { en: 'Indicator', vi: 'Chỉ Báo' },
    data: { en: 'Data', vi: 'Dữ Liệu' },
    software: { en: 'Software', vi: 'Phần Mềm' },
    app: { en: 'App', vi: 'Ứng Dụng' },
    holistic: { en: 'Holistic', vi: 'Toàn Diện' },
};
