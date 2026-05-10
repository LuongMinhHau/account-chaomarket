import { env } from '@/lib/env';

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
    name: 'Chào Account',
    url: env.NEXTAUTH_URL,
    /** Centralized auth service URL. Production → account.chaomarket.com; Dev → local */
    accountsUrl: env.NODE_ENV === 'production'
        ? 'https://account.chaomarket.com'
        : '',
    description:
        'Chào Account - Quản lý tài khoản Chào Enterprise. Bảo mật, xác thực, và quản lý thông tin cá nhân.',
    descriptionEn:
        'Chào Account - Chào Enterprise account management. Security, authentication, and personal information management.',
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
