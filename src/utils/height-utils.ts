'use client';

import { useState, useEffect } from 'react';

export const calculateAdjustedHeight = (subtractRem: number = 18): number => {
    if (typeof window === 'undefined') {
        return 600;
    }
    const screenHeight = window.innerHeight;
    const remToPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    const subtractPx = subtractRem * remToPx;
    return screenHeight - subtractPx;
};

export const processHeight = (numberOfSubTabs?: number) => {
    return numberOfSubTabs
        ? calculateAdjustedHeight() + 52 * numberOfSubTabs
        : calculateAdjustedHeight();
};

/**
 * useProcessHeight — a hydration-safe hook that defers
 * window-dependent height calculation to after mount.
 * Uses a deterministic SSR-safe default (600 + 52 * numberOfSubTabs)
 * for the initial render, then updates to the real value after hydration.
 */
export const useProcessHeight = (numberOfSubTabs?: number): number => {
    // SSR fallback: calculateAdjustedHeight returns 600 on the server
    const ssrDefault = 600 + (numberOfSubTabs ? 52 * numberOfSubTabs : 0);
    const [height, setHeight] = useState<number>(ssrDefault);

    useEffect(() => {
        const update = () => setHeight(processHeight(numberOfSubTabs));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [numberOfSubTabs]);

    return height;
};

export const calculateAdjustedWidth = (subtractRem: number = 60): number => {
    const screenWidth = window.innerWidth;
    const remToPx = parseFloat(
        getComputedStyle(document.documentElement).fontSize
    );
    const subtractPx = subtractRem * remToPx;
    return screenWidth - subtractPx;
};

