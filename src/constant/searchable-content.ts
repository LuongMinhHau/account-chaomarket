export interface SearchableItem {
    title: string;
    titleKey?: string; // i18n key for title
    description?: string;
    descriptionKey?: string; // i18n key for description
    url: string;
    category: 'page' | 'feature' | 'info' | 'account';
    keywords?: string[];
}

export const SEARCHABLE_CONTENT: SearchableItem[] = [
    // Thông Báo
    {
        title: 'Notifications',
        titleKey: 'account.notification',
        url: '/notifications',
        category: 'page',
        keywords: ['notification', 'thông báo', 'alerts', 'cảnh báo'],
    },

    // Hồ Sơ
    {
        title: 'Profile',
        titleKey: 'account.profile',
        url: '/profile',
        category: 'page',
        keywords: ['profile', 'hồ sơ', 'personal', 'cá nhân', 'info', 'thông tin', 'avatar', 'ảnh đại diện'],
    },

    // Lịch Sử Giao Dịch
    {
        title: 'Transaction History',
        titleKey: 'account.orderHistory',
        url: '/transaction',
        category: 'page',
        keywords: ['transaction', 'giao dịch', 'order', 'đơn hàng', 'history', 'lịch sử', 'purchase', 'mua'],
    },

    // Bảo Mật
    {
        title: 'Security',
        titleKey: 'account.security',
        url: '/security',
        category: 'page',
        keywords: ['security', 'bảo mật', 'password', 'mật khẩu', 'đổi mật khẩu'],
    },
    {
        title: 'Devices',
        titleKey: 'account.devices',
        url: '/security/devices',
        category: 'feature',
        keywords: ['device', 'thiết bị', 'đăng nhập', 'login', 'session', 'phiên'],
    },
    {
        title: 'Two-Factor Authentication',
        titleKey: 'account.twoFactor',
        url: '/security/two-factor',
        category: 'feature',
        keywords: ['2fa', 'two-factor', 'xác minh', 'otp', 'authenticator', 'bảo mật 2 lớp'],
    },
];

export function searchContent(
    query: string,
    t?: (key: string) => string
): SearchableItem[] {
    if (!query || query.trim().length < 2) return [];

    const normalizedQuery = query.toLowerCase().trim();

    return SEARCHABLE_CONTENT.filter(item => {
        // Get translated title if available
        const translatedTitle =
            t && item.titleKey ? t(item.titleKey) : item.title;
        const translatedDesc =
            t && item.descriptionKey
                ? t(item.descriptionKey)
                : item.description;

        // Check title
        if (translatedTitle.toLowerCase().includes(normalizedQuery))
            return true;
        if (item.title.toLowerCase().includes(normalizedQuery)) return true;

        // Check description
        if (
            translatedDesc &&
            translatedDesc.toLowerCase().includes(normalizedQuery)
        )
            return true;

        // Check URL
        if (item.url.toLowerCase().includes(normalizedQuery)) return true;

        // Check keywords
        if (
            item.keywords?.some(keyword =>
                keyword.toLowerCase().includes(normalizedQuery)
            )
        ) {
            return true;
        }

        return false;
    }).slice(0, 10); // Limit to 10 results
}
