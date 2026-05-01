'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals thresholds based on Google's recommendations
 * @see https://web.dev/vitals/
 */
const THRESHOLDS = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    FCP: { good: 1800, needsImprovement: 3000 },
    TTFB: { good: 800, needsImprovement: 1800 },
};

type MetricName = keyof typeof THRESHOLDS;

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
}

interface WebVitalPayload {
    name: string;
    value: number;
    rating: string;
    delta: number;
    id: string;
    navigationType: string;
    url: string;
    timestamp: number;
}

async function sendToAnalytics(metric: Metric) {
    const payload: WebVitalPayload = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name as MetricName, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType || 'unknown',
        url: window.location.href,
        timestamp: Date.now(),
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Web Vital]', payload.name, payload.value.toFixed(2), `(${payload.rating})`);
    }

    // Send to Sentry if available
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { metrics?: { distribution: (name: string, value: number, options: unknown) => void } } }).Sentry?.metrics) {
        try {
            (window as unknown as { Sentry: { metrics: { distribution: (name: string, value: number, options: unknown) => void } } }).Sentry.metrics.distribution(
                `web_vital.${metric.name.toLowerCase()}`,
                metric.value,
                {
                    tags: {
                        rating: payload.rating,
                        page: window.location.pathname,
                    },
                }
            );
        } catch {
            // Ignore Sentry errors
        }
    }

    // Send to custom analytics endpoint (if enabled)
    if (process.env.NEXT_PUBLIC_ENABLE_VITALS_REPORTING === 'true') {
        try {
            await fetch('/api/performance/vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true, // Ensure request completes even if page unloads
            });
        } catch {
            // Silently fail - analytics shouldn't break the app
        }
    }

    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            non_interaction: true,
        });
    }
}

/**
 * Initialize Web Vitals reporting
 * Call this once in your app, typically in a client component at the root
 */
export function useWebVitals() {
    useEffect(() => {
        // Core Web Vitals
        onCLS(sendToAnalytics);
        onINP(sendToAnalytics);
        onLCP(sendToAnalytics);

        // Additional metrics
        onFCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
    }, []);
}

/**
 * WebVitals component to include in your layout
 */
export function WebVitalsReporter() {
    useWebVitals();
    return null;
}
