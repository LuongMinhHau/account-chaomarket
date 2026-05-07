import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Chào Account',
        short_name: 'ChàoAccount',
        description:
            'Chào Account - Quản lý tài khoản Chào Enterprise. Bảo mật, xác thực, và quản lý thông tin cá nhân.',
        start_url: '/profile',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#ffffff',
        theme_color: '#FFE400',
        orientation: 'any',
        categories: ['account', 'security', 'utilities'],
        icons: [
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
            {
                src: '/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
        ],
    };
}
