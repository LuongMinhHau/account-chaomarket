export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Chào Market',
    url: process.env.NEXTAUTH_URL || 'https://account.chaomarket.com',
    /** Centralized auth service URL. Production → account.chaomarket.com; Dev → local */
    accountsUrl: process.env.NODE_ENV === 'production'
        ? 'https://account.chaomarket.com'
        : '',
    description:
        'Chào Market - Nền tảng tài chính & đầu tư thông minh. Công cụ giao dịch, phân tích thị trường, dữ liệu tài chính và giải pháp đầu tư toàn diện.',
    descriptionEn:
        'Chào Market - Smart financial platform with trading tools, market analysis, financial data, and comprehensive investment solutions.',
    ogImage: '/img/og-image.png',
    locale: 'vi_VN',
    mainNav: [
        {
            title: 'Home',
            href: '/',
        },
    ],
    links: {
        facebook: 'https://facebook.com/chaomarket',
    },
};
