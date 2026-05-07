'use client';
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

/**
 * Mobile/Tablet Menu FAB — Hidden when sidebar open, visible when closed.
 * No X button needed — user taps overlay to dismiss sidebar.
 */
export default function AppNavbarMobile() {
    const { toggleSidebar, openMobile } = useSidebar();

    return (
        <button
            onClick={toggleSidebar}
            aria-label="Open menu"
            className={`
                fixed bottom-5 left-4 z-[180] lg:hidden
                w-10 h-10 rounded-2xl
                flex flex-col items-center justify-center gap-[4px]
                cursor-pointer
                border-[1.5px]

                bg-[var(--brand-color)] border-[var(--brand-color)]
                shadow-[0_2px_8px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.10)]
                dark:shadow-[0_2px_8px_rgba(0,0,0,0.3),0_8px_28px_rgba(0,0,0,0.25),0_0_16px_rgba(255,228,0,0.15)]

                hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_12px_32px_rgba(0,0,0,0.12)]
                dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_12px_36px_rgba(0,0,0,0.3),0_0_24px_rgba(255,228,0,0.25)]
                active:scale-90

                transition-all duration-300 ease-out

                ${openMobile ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}
            `}
        >
            <span className="w-[15px] h-[2px] rounded-full bg-black" />
            <span className="w-[15px] h-[2px] rounded-full bg-black" />
            <span className="w-[15px] h-[2px] rounded-full bg-black" />
        </button>
    );
}
