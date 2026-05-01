'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useProgressivePreRender — Staggered pre-rendering for heavy widgets.
 *
 * Uses chained `requestIdleCallback` + `setTimeout` scheduling to
 * progressively warm up inactive tabs during browser idle time.
 *
 * Strategy (based on deep research):
 * - Desktop (>768px): pre-render ALL inactive tabs
 * - Mobile/Tablet (≤768px): pre-render max 2 tabs (avoid memory crash on low-RAM devices)
 * - Stagger: 2s between tabs (sweet spot: widget completes ~80-90% init before next starts)
 * - Initial delay: 1s (let active tab stabilize first)
 *
 * @param totalTabs     Total number of tabs to manage
 * @param activeIndex   Index of the currently active tab
 * @param initialDelay  Milliseconds to wait before starting pre-render (default: 1000ms)
 * @returns             Array of booleans — `true` = tab should be pre-rendered
 *
 * @example
 * const preRenderFlags = useProgressivePreRender(5, activeTabIndex);
 *
 * {tabs.map((tab, i) => (
 *   <LazyMount active={i === activeIndex} preRender={preRenderFlags[i]}>
 *     <Widget />
 *   </LazyMount>
 * ))}
 */

/** Stagger delay between pre-rendering each tab (ms) */
const STAGGER_MS = 0;

/** Max tabs to pre-render on mobile/tablet (memory safety — iOS 300-450MB heap limit) */
const MOBILE_MAX_PRERENDER = 2;

/** Max tabs to pre-render on desktop (future-proofing for pages with many tabs) */
const DESKTOP_MAX_PRERENDER = 8;

export function useProgressivePreRender(
    totalTabs: number,
    activeIndex: number,
    initialDelay: number = 1000,
    /** When true, pre-render ALL tabs including the active one (used for background warmup) */
    preRenderAll: boolean = false,
): boolean[] {
    const [preRendered, setPreRendered] = useState<boolean[]>(
        () => new Array(totalTabs).fill(false)
    );
    const isScheduledRef = useRef(false);

    // Reset state array when totalTabs changes (e.g., metaData loads: 0 → 5)
    useEffect(() => {
        setPreRendered(prev => {
            if (prev.length === totalTabs) return prev; // No change needed
            return new Array(totalTabs).fill(false);
        });
    }, [totalTabs]);

    /**
     * Determine how many tabs we can pre-render based on device capability.
     * - Desktop: unlimited (all remaining tabs)
     * - Mobile/Tablet: max 2 (avoid crashing on iOS 300-450MB heap limit)
     * - Low RAM (<4GB, Chromium API): max 2
     */
    const getMaxPreRender = useCallback((): number => {
        if (typeof window === 'undefined') return 0;

        const isMobile = window.innerWidth <= 768;

        // Low memory device check (Chromium-only API, Safari returns undefined)
        const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        const isLowMemory = deviceMemory !== undefined && deviceMemory < 4;

        if (isMobile || isLowMemory) return MOBILE_MAX_PRERENDER;

        // Desktop with sufficient memory → capped for future-proofing
        return DESKTOP_MAX_PRERENDER;
    }, []);

    useEffect(() => {
        // Don't schedule twice
        if (isScheduledRef.current) return;

        const maxPreRender = getMaxPreRender();
        if (maxPreRender === 0) return;

        isScheduledRef.current = true;

        // Cancellation flag — prevents state updates after unmount
        let cancelled = false;

        // Cross-browser requestIdleCallback (Safari fallback)
        const rIC = (cb: (deadline: IdleDeadline) => void) => {
            if (typeof requestIdleCallback !== 'undefined') {
                return requestIdleCallback(cb);
            }
            return setTimeout(() => cb({ timeRemaining: () => 50, didTimeout: false } as IdleDeadline), 1);
        };

        // Build queue ordered by proximity to active tab (adjacent tabs first).
        // e.g., active=2, total=5 → queue=[1,3,0,4]
        // On mobile (capped at MOBILE_MAX_PRERENDER), this ensures the tabs most
        // likely to be clicked next are warmed up first.
        const queue: number[] = [];
        for (let dist = 1; dist < totalTabs && queue.length < maxPreRender; dist++) {
            const before = activeIndex - dist;
            const after = activeIndex + dist;
            if (before >= 0 && (preRenderAll || before !== activeIndex)) {
                queue.push(before);
                if (queue.length >= maxPreRender) break;
            }
            if (after < totalTabs && (preRenderAll || after !== activeIndex)) {
                queue.push(after);
            }
        }

        let currentQueueIndex = 0;
        let staggerTimer: ReturnType<typeof setTimeout> | null = null;

        // When stagger is 0, batch-render all tabs in a single rIC callback
        // When stagger > 0, chain rIC callbacks with setTimeout delays
        const scheduleNext = () => {
            if (cancelled || currentQueueIndex >= queue.length) return;

            rIC(() => {
                if (cancelled) return;

                if (STAGGER_MS === 0) {
                    // Batch: set all remaining tabs at once
                    setPreRendered(prev => {
                        const next = [...prev];
                        for (const idx of queue) next[idx] = true;
                        return next;
                    });
                } else {
                    // Staggered: set one tab, then schedule next
                    const tabIndex = queue[currentQueueIndex];
                    currentQueueIndex++;

                    setPreRendered(prev => {
                        const next = [...prev];
                        next[tabIndex] = true;
                        return next;
                    });

                    if (currentQueueIndex < queue.length) {
                        staggerTimer = setTimeout(scheduleNext, STAGGER_MS);
                    }
                }
            });
        };

        // Start pre-rendering after initial delay (let active tab stabilize)
        const initialTimer = setTimeout(scheduleNext, initialDelay);

        return () => {
            cancelled = true;
            clearTimeout(initialTimer);
            if (staggerTimer) clearTimeout(staggerTimer);
            isScheduledRef.current = false;
        };
        // Only run once on mount — activeIndex at mount time determines the queue order
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [totalTabs]);

    return preRendered;
}
