'use client';
import * as React from 'react';

/**
 * Device type breakpoints (matches TailwindCSS defaults):
 * - mobile:     < 768px
 * - tablet:     768px  – 1023px
 * - desktop:    1024px – 1439px
 * - ultrawide:  ≥ 1440px
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'ultrawide';

const BREAKPOINTS = {
    tablet: 768,
    desktop: 1024,
    ultrawide: 1440,
} as const;

function getDeviceType(width: number): DeviceType {
    if (width >= BREAKPOINTS.ultrawide) return 'ultrawide';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
}

/**
 * Returns the current device category based on viewport width.
 * Updates automatically on window resize via matchMedia listeners.
 *
 * @example
 * const device = useDeviceType();
 * if (device === 'tablet') { ... }
 */
export function useDeviceType(): DeviceType {
    const [deviceType, setDeviceType] = React.useState<DeviceType>('desktop');

    React.useEffect(() => {
        // Initial measurement
        setDeviceType(getDeviceType(window.innerWidth));

        // Create matchMedia queries for each breakpoint
        const tabletMql = window.matchMedia(
            `(min-width: ${BREAKPOINTS.tablet}px)`
        );
        const desktopMql = window.matchMedia(
            `(min-width: ${BREAKPOINTS.desktop}px)`
        );
        const ultrawideMql = window.matchMedia(
            `(min-width: ${BREAKPOINTS.ultrawide}px)`
        );

        const handleChange = () => {
            setDeviceType(getDeviceType(window.innerWidth));
        };

        tabletMql.addEventListener('change', handleChange);
        desktopMql.addEventListener('change', handleChange);
        ultrawideMql.addEventListener('change', handleChange);

        return () => {
            tabletMql.removeEventListener('change', handleChange);
            desktopMql.removeEventListener('change', handleChange);
            ultrawideMql.removeEventListener('change', handleChange);
        };
    }, []);

    return deviceType;
}

/**
 * Convenience helpers derived from useDeviceType.
 */
export function useIsTablet(): boolean {
    return useDeviceType() === 'tablet';
}

export function useIsDesktopOrLarger(): boolean {
    const device = useDeviceType();
    return device === 'desktop' || device === 'ultrawide';
}

export function useIsUltrawide(): boolean {
    return useDeviceType() === 'ultrawide';
}

export { BREAKPOINTS };
