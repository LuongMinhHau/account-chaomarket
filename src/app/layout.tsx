import React from 'react';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import NextAuthSessionProvider from '@/components/provider/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/context/provider/query-client';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';

import '@/app/globals.css';
import { APP_THEME_STATE_NAME } from '@/constant';
import { I18nProvider } from '@/context/i18n/context';

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
        'Chào Account',
        'Chào Market',
        'tài khoản',
        'bảo mật',
        'account',
        'security',
        'authentication',
    ],
    authors: [{ name: 'Chào Enterprise', url: siteConfig.url }],
    creator: 'Chào Enterprise',
    icons: {
        icon: '/favicon.svg',
        apple: '/img/brand-logo.svg',
    },
    openGraph: {
        type: 'website',
        locale: siteConfig.locale,
        url: siteConfig.url,
        siteName: siteConfig.name,
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: siteConfig.description,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.name,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: {
            default: siteConfig.name,
            template: `%s | ${siteConfig.name}`,
        },
        description: siteConfig.description,
        images: [siteConfig.ogImage],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const initialLocale = cookieStore.get('chao_market_locale')?.value || 'vi';

    return (
        <html
            lang={initialLocale}
            className="no-transitions"
            suppressHydrationWarning
        >
            <body
                className={cn('antialiased', 'min-h-svh bg-background')}
                suppressHydrationWarning
            >
                <NextAuthSessionProvider>
                    <ThemeProvider
                        attribute={['class', 'data-theme', 'data-theme-mode']}
                        defaultTheme="dark"
                        storageKey={APP_THEME_STATE_NAME}
                    >
                        <I18nProvider initialLocale={initialLocale}>
                            <Providers>
                                {children}
                            </Providers>
                        </I18nProvider>
                    </ThemeProvider>
                </NextAuthSessionProvider>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `requestAnimationFrame(function(){setTimeout(function(){document.documentElement.classList.remove("no-transitions")},0)})`,
                    }}
                />
            </body>
        </html>
    );
}
