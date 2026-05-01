'use client';
import React, { useState, useEffect, useRef, useCallback, useContext, createContext, ReactNode } from 'react';
import { WidgetSkeleton } from '@/components/widget-skeleton';

/**
 * LazyMount — Hybrid lazy-mount with delayed unmount for heavy widgets.
 *
 * Behavior:
 * 1. First activation (or `preRender`): renders children.
 * 2. When deactivated: hides via **off-screen positioning** (NOT `display:none`)
 *    so iframes keep their WebSocket connections alive and JS context running.
 *    This ensures tab-switching is truly instant with no reconnection delay.
 * 3. After `unmountDelay` ms of inactivity: fully unmounts children,
 *    destroying iframes/WebSockets to free resources.
 * 4. If re-activated before the delay: cancels the timer → instant show.
 * 5. Shows a shimmer skeleton on first activation while widget initializes.
 *    Skeleton is dismissed when the child widget signals ready (via `useLazyMountReady`)
 *    or after `maxSkeletonMs` as a fallback safety net.
 *
 * Why off-screen instead of `display:none`?
 * Browsers throttle/suspend JS execution in `display:none` iframes,
 * causing WebSocket disconnections. Off-screen positioning keeps the
 * iframe in the render tree and fully active.
 */
const UNMOUNT_DELAY_DESKTOP = 30_000; // 30 seconds
const UNMOUNT_DELAY_MOBILE = 15_000;  // 15 seconds — faster cleanup for constrained devices

/** Detect mobile once at module load (no re-render cost) */
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
const UNMOUNT_DELAY_MS = isMobileDevice ? UNMOUNT_DELAY_MOBILE : UNMOUNT_DELAY_DESKTOP;

/** Maximum skeleton duration (fallback). Widget can dismiss earlier via useLazyMountReady. */
const MAX_SKELETON_MS = 1500;

/** Styles that hide content off-screen while keeping iframes alive */
const HIDDEN_STYLES: React.CSSProperties = {
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    visibility: 'hidden',
    pointerEvents: 'none',
    width: '100%',   // Maintain layout calculation for widgets
    height: 0,
    overflow: 'hidden',
};

// ── Context: allows children to signal "widget is ready" ──
const LazyMountReadyContext = createContext<(() => void) | null>(null);

/**
 * Hook for child widgets to dismiss the skeleton overlay early.
 * Call the returned function when the widget has finished loading.
 * Returns `null` when not inside a LazyMount (safe to use with optional chaining).
 *
 * @example
 * const markReady = useLazyMountReady();
 * // ... after widget loads:
 * markReady?.();
 */
export function useLazyMountReady(): (() => void) | null {
    return useContext(LazyMountReadyContext);
}

export default function LazyMount({
    active,
    children,
    className,
    preRender = false,
    unmountDelay = UNMOUNT_DELAY_MS,
    skeletonVariant = 'chart',
    skeletonHeight = '42rem',
    maxSkeletonMs = MAX_SKELETON_MS,
}: {
    active: boolean;
    children: ReactNode;
    className?: string;
    /** When true, renders children hidden even if never activated.
     *  Used by progressive pre-rendering to warm up widgets during idle time. */
    preRender?: boolean;
    /** Milliseconds to keep children mounted after deactivation. Default: 30s */
    unmountDelay?: number;
    /** Skeleton variant to show during first load. Default: 'chart' */
    skeletonVariant?: 'chart' | 'table' | 'iframe';
    /** Skeleton height. Default: '42rem' */
    skeletonHeight?: string;
    /** Maximum skeleton display time (fallback). Widget can dismiss earlier via useLazyMountReady(). Default: 1500ms */
    maxSkeletonMs?: number;
}) {
    const [hasBeenActive, setHasBeenActive] = useState(active);
    const [shouldRender, setShouldRender] = useState(active);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const skeletonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Track first activation
    useEffect(() => {
        if (active && !hasBeenActive) {
            setHasBeenActive(true);
        }
    }, [active, hasBeenActive]);

    // When preRender becomes true, ensure we start rendering
    useEffect(() => {
        if (preRender && !shouldRender && !hasBeenActive) {
            setShouldRender(true);
        }
    }, [preRender, shouldRender, hasBeenActive]);

    // ── Event-driven skeleton dismiss ──
    // Children call markReady() when they're loaded → skeleton hides immediately.
    // Fallback: skeleton auto-hides after maxSkeletonMs (safety net).
    const markReady = useCallback(() => {
        setShowSkeleton(false);
        if (skeletonTimerRef.current) {
            clearTimeout(skeletonTimerRef.current);
            skeletonTimerRef.current = null;
        }
    }, []);

    // Skeleton logic: show shimmer on first activation if not pre-rendered
    useEffect(() => {
        if (active && !hasBeenActive && !preRender) {
            // First activation without pre-render → show skeleton
            // Will be dismissed by markReady() or maxSkeletonMs fallback
            setShowSkeleton(true);
            skeletonTimerRef.current = setTimeout(() => {
                setShowSkeleton(false);
                skeletonTimerRef.current = null;
            }, maxSkeletonMs);
        } else if (active && preRender) {
            // Pre-rendered → widget already initialized → no skeleton needed
            setShowSkeleton(false);
        }

        return () => {
            if (skeletonTimerRef.current) {
                clearTimeout(skeletonTimerRef.current);
                skeletonTimerRef.current = null;
            }
        };
    }, [active, hasBeenActive, preRender, maxSkeletonMs]);

    // Delayed unmount logic
    useEffect(() => {
        if (active) {
            // Became active → ensure rendered, cancel any pending unmount
            setShouldRender(true);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // Not active: decide whether to start unmount timer

        // Case 1: Pre-rendered but never user-activated → keep alive (no timer)
        // These are warm-up renders; they should stay until user activates or
        // the component is unmounted by React (e.g., route change)
        if (!hasBeenActive && preRender) return;

        // Case 2: Was previously active → start delayed unmount
        // Only start if currently rendered — prevents re-triggering after unmount
        if (hasBeenActive) {
            timerRef.current = setTimeout(() => {
                setShouldRender(false);
                timerRef.current = null;
            }, unmountDelay);
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [active, unmountDelay, preRender, hasBeenActive]);

    // Nothing to render if never activated and not pre-rendering
    if (!shouldRender) return null;

    return (
        <div
            className={className}
            style={active ? undefined : HIDDEN_STYLES}
        >
            {/* Skeleton overlay: shows on first activation, dismissed by markReady() or timeout */}
            {active && showSkeleton && (
                <div className="animate-in fade-in duration-200">
                    <WidgetSkeleton variant={skeletonVariant} height={skeletonHeight} />
                </div>
            )}

            {/* Widget content: hidden behind skeleton during first load, visible otherwise */}
            <div style={active && showSkeleton ? {
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
                width: '100%',
            } : { display: 'contents' }}>
                <LazyMountReadyContext.Provider value={markReady}>
                    {children}
                </LazyMountReadyContext.Provider>
            </div>
        </div>
    );
}
