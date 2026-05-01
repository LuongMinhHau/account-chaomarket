'use client';

import { createContext, useContext } from 'react';

/** Map of sidebar_vis__* keys → "active" | "inactive" */
type SidebarVisibility = Record<string, string>;

const SidebarVisibilityContext = createContext<SidebarVisibility>({});

export function SidebarVisibilityProvider({
    children,
    visibility,
}: {
    children: React.ReactNode;
    visibility: SidebarVisibility;
}) {
    return (
        <SidebarVisibilityContext.Provider value={visibility}>
            {children}
        </SidebarVisibilityContext.Provider>
    );
}

export function useSidebarVisibility() {
    return useContext(SidebarVisibilityContext);
}

/** Check if a given sidebar_vis key is active (defaults to true) */
export function useIsMenuVisible(key: string): boolean {
    const vis = useSidebarVisibility();
    return vis[key] !== 'inactive';
}
