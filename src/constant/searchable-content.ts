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
    // Auth Pages
    {
        title: 'Home',
        titleKey: 'sidebar.home',
        url: '/account',
        category: 'page',
        keywords: ['home', 'trang chủ', 'dashboard', 'tổng quan'],
    },
    {
        title: 'Sign Up',
        titleKey: 'auth.signup',
        url: '/auth/sign-up',
        category: 'page',
        keywords: ['sign up', 'đăng ký', 'register', 'tạo tài khoản', 'create account'],
    },
    {
        title: 'Reset Password',
        url: '/auth/reset-password',
        category: 'page',
        keywords: ['reset', 'password', 'mật khẩu', 'quên', 'forgot', 'đổi'],
    },

    // Account Management
    {
        title: 'Notifications',
        titleKey: 'account.notification',
        url: '/account/notifications',
        category: 'account',
        keywords: ['notification', 'thông báo', 'alerts', 'cảnh báo'],
    },
    {
        title: 'Order History',
        titleKey: 'account.orderHistory',
        url: '/account/orders',
        category: 'account',
        keywords: ['order', 'đơn hàng', 'history', 'lịch sử', 'purchase', 'mua'],
    },
    {
        title: 'Profile',
        titleKey: 'account.profile',
        url: '/account/profile',
        category: 'account',
        keywords: ['profile', 'hồ sơ', 'personal', 'cá nhân', 'info', 'thông tin'],
    },
    {
        title: 'Security',
        titleKey: 'account.security',
        url: '/account/security',
        category: 'account',
        keywords: ['security', 'bảo mật', 'password', 'mật khẩu', '2fa', 'two-factor', 'xác minh'],
    },
    {
        title: 'Terms',
        titleKey: 'account.legalCompliance',
        url: '/account/legal',
        category: 'account',
        keywords: ['terms', 'điều khoản', 'legal', 'pháp lý', 'compliance'],
    },
    {
        title: 'Privacy',
        titleKey: 'account.privacy',
        url: '/account/privacy',
        category: 'account',
        keywords: ['privacy', 'quyền riêng tư', 'data', 'dữ liệu', 'xóa tài khoản', 'delete', 'export', 'tải xuống', 'oauth', 'google'],
    },

    // Information
    {
        title: 'Contact',
        url: 'https://chaomarket.com/contact',
        category: 'info',
        keywords: ['contact', 'liên hệ', 'support', 'hỗ trợ'],
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
