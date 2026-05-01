'use client';

import Script from 'next/script';

/**
 * Google Analytics 4 component.
 * Add NEXT_PUBLIC_GA_MEASUREMENT_ID to your .env to enable.
 * If the env var is missing, nothing renders.
 */
export default function GoogleAnalytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!gaId) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}
