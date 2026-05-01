/**
 * Generate a URL-safe slug from a product name.
 * E.g. "Chào News" → "chao-news"
 */
export function generateSlug(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // non-alphanum → dash
        .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}
