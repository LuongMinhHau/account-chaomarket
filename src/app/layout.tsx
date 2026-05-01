import React from 'react';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import NextAuthSessionProvider from '@/components/provider/session-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/context/provider/query-client';
import type { Metadata } from 'next';

import '@/app/globals.css';
import { APP_THEME_STATE_NAME } from '@/constant';
import { I18nProvider } from '@/context/i18n/context';

export const metadata: Metadata = {
    title: {
        default: 'Chào Account',
        template: '%s | Chào Account',
    },
    description: 'Chào Account — Quản Lý Tài Khoản',
    icons: {
        icon: '/img/favicon.svg',
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
