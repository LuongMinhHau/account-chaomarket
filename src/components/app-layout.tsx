import React from 'react';
import { cookies } from 'next/headers';
import { cn } from '@/lib/utils';
import NextAuthSessionProvider from '@/components/provider/session-provider';
import { ThemeProvider } from '@/components/theme-provider';

import '@/app/globals.css';
import { APP_THEME_STATE_NAME } from '@/constant';
import { Providers } from '@/context/provider/query-client';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow/700.css';
import '@fontsource/barlow/vietnamese-400.css';
import '@fontsource/barlow/vietnamese-500.css';
import '@fontsource/barlow/vietnamese-600.css';
import '@fontsource/barlow/vietnamese-700.css';
import { I18nProvider } from '@/context/i18n/context';
import { NavigationTracker } from '@/components/app-navigation-tracker';
import GoogleAnalytics from '@/components/google-analytics';
import { WebVitalsReporter } from '@/lib/web-vitals';
import {
    getBrandSettings,
    buildBrandOverrides,
} from '@/lib/get-brand-settings';
import { makeQueryClient } from '@/lib/query-client';
import { dehydrate } from '@tanstack/react-query';
import { getMetaDataConfig } from '@/services/meta_data';

export async function AppLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const initialLocale = cookieStore.get('chao_market_locale')?.value || 'en';

    // Fetch brand settings from admin DB (cached 60s)
    const settings = await getBrandSettings();
    const brandOverrides = buildBrandOverrides(settings);

    // ── Server-side prefetch: metaData config ──
    // This data is used on almost every page. Prefetching it here
    // eliminates the loading spinner/skeleton on first visit.
    const serverQueryClient = makeQueryClient();
    await serverQueryClient.prefetchQuery({
        queryKey: ['metaDataConfig'],
        queryFn: async () => {
            const data = await getMetaDataConfig();
            return data.data ?? null;
        },
    });
    const dehydratedState = dehydrate(serverQueryClient);

    return (
        <html
            lang={initialLocale}
            className="no-transitions"
            suppressHydrationWarning
        >
            {/* eslint-disable-next-line @next/next/no-head-element */}
            <head>
                {/* JSON-LD: Organization schema — for Google Knowledge Panel */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'Chào Market',
                            url: 'https://trading.chaomarket.com',
                            logo: 'https://trading.chaomarket.com/img/og-image.png',
                            description:
                                'Chào Market - Nền tảng tài chính & đầu tư thông minh. Công cụ giao dịch, phân tích thị trường và giải pháp đầu tư toàn diện.',
                            sameAs: ['https://facebook.com/chaomarket'],
                            contactPoint: {
                                '@type': 'ContactPoint',
                                contactType: 'customer service',
                                availableLanguage: ['Vietnamese', 'English'],
                            },
                        }),
                    }}
                />
                {/* JSON-LD: WebSite schema — for sitelinks searchbox */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebSite',
                            name: 'Chào Market',
                            url: 'https://trading.chaomarket.com',
                            potentialAction: {
                                '@type': 'SearchAction',
                                target: 'https://trading.chaomarket.com/search?q={search_term_string}',
                                'query-input':
                                    'required name=search_term_string',
                            },
                        }),
                    }}
                />

                {/* Preconnect to external iframe/widget domains for faster loading */}
                <link
                    rel="preconnect"
                    href="https://wise.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preconnect"
                    href="https://ssltools.investing.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preconnect"
                    href="https://s3.tradingview.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preconnect"
                    href="https://sslecal2.investing.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preconnect"
                    href="https://widget.dnse.com.vn"
                    crossOrigin="anonymous"
                />
                <link rel="dns-prefetch" href="https://wise.com" />
                <link
                    rel="dns-prefetch"
                    href="https://ssltools.investing.com"
                />
                <link rel="dns-prefetch" href="https://s3.tradingview.com" />
                <link
                    rel="dns-prefetch"
                    href="https://sslecal2.investing.com"
                />
                <link rel="dns-prefetch" href="https://widget.dnse.com.vn" />

                {/* Prefetch key TradingView widget scripts during idle time (Disclaimer/Home) */}
                {/* These will be cached by the browser before user navigates to Market Data */}
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
                />
                <link
                    rel="prefetch"
                    href="https://s3.tradingview.com/external-embedding/embed-widget-screener.js"
                />

                {/* Economic Map: TradingView Web Component widget (different domain) */}
                <link
                    rel="preconnect"
                    href="https://widgets.tradingview-widget.com"
                    crossOrigin="anonymous"
                />
                <link
                    rel="dns-prefetch"
                    href="https://widgets.tradingview-widget.com"
                />
                <link
                    rel="modulepreload"
                    href="https://widgets.tradingview-widget.com/w/en/tv-economic-map.js"
                />
                <link
                    rel="modulepreload"
                    href="https://widgets.tradingview-widget.com/w/vi_VN/tv-economic-map.js"
                />

                {/* Service Worker: cache TradingView/Investing.com widget scripts for instant loads */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                            navigator.serviceWorker.register('/sw-widget-cache.js').catch(function() {});
                        });
                    }
                `,
                    }}
                />
            </head>
            <body
                className={cn(`antialiased`, 'min-h-svh bg-background')}
                suppressHydrationWarning
            >
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:text-sm"
                >
                    Skip to main content
                </a>
                <NextAuthSessionProvider>
                    <ThemeProvider
                        attribute={['class', 'data-theme', 'data-theme-mode']}
                        defaultTheme="dark"
                        storageKey={APP_THEME_STATE_NAME}
                    >
                        <Providers dehydratedState={dehydratedState}>
                            <I18nProvider
                                initialLocale={initialLocale}
                                brandOverrides={brandOverrides}
                            >
                                {children}
                                <NavigationTracker />
                                <GoogleAnalytics />
                                <WebVitalsReporter />
                            </I18nProvider>
                        </Providers>
                    </ThemeProvider>
                </NextAuthSessionProvider>
                {/* Remove no-transitions class after first paint to re-enable CSS transitions */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `requestAnimationFrame(function(){setTimeout(function(){document.documentElement.classList.remove("no-transitions")},0)})`,
                    }}
                />
            </body>
        </html>
    );
}
