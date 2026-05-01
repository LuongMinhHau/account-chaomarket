'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { TextAlignJustify } from 'lucide-react';
import Image from 'next/image';
import { LogoBrand } from '@image/index';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';
import Link from 'next/link';

// Define the threshold for how far the user must scroll
// before the behavior starts (e.g., to hide it initially)
const HIDE_THRESHOLD = 100;

export default function AppNavbarMobile() {
    // State to control the visibility/CSS class for hiding/showing
    // We start by assuming the header is visible
    const [isVisible, setIsVisible] = useState(true);
    const { toggleSidebar } = useSidebar();
    const { t } = useI18n();
    // Ref to store the last known scroll position
    const lastScrollY = useRef(0);

    // Function to handle the scroll event
    const handleScroll = () => {
        const currentScrollY = window.scrollY;

        // --- 1. Determine Direction ---
        // If scrolling down AND we are past the initial threshold
        if (
            currentScrollY > lastScrollY.current &&
            currentScrollY > HIDE_THRESHOLD
        ) {
            // Hide the navbar
            setIsVisible(false);
        }
        // If scrolling up OR we are near the very top of the page
        else if (
            currentScrollY < lastScrollY.current ||
            currentScrollY < HIDE_THRESHOLD
        ) {
            // Show the navbar
            setIsVisible(true);
        }

        // --- 2. Update Position ---
        // Always update the lastScrollY for the next event
        lastScrollY.current = currentScrollY;
    };

    // --- 3. Setup Effect ---
    useEffect(() => {
        // Attach the scroll listener when the component mounts
        window.addEventListener('scroll', handleScroll);

        // Cleanup: Remove the scroll listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array ensures this runs only on mount/unmount

    // CSS Class for transition and position
    // We use translate-y-0 (visible) and -translate-y-full (hidden)
    const transitionClass = isVisible
        ? 'translate-y-0 opacity-100'
        : '-translate-y-full opacity-0';

    return (
        <div
            className={`
                w-full bg-sidebar flex items-center justify-between
                sticky top-0 left-0 
                h-[8svh] min-h-[3rem] md:h-[7svh] py-2 lg:hidden z-50 
                transition-all! duration-300 ease-in-out 
                shadow-sm px-4 md:px-6
                ${transitionClass}
            `}
        >
            <div className={'flex gap-2 items-center h-full'}>
                <Button
                    variant={'ghost'}
                    onClick={toggleSidebar}
                    className={'h-full w-8'}
                >
                    <TextAlignJustify className={'size-5'} />
                </Button>
                <div className={'h-full flex items-center gap-2'}>
                    <Image
                        src={LogoBrand}
                        alt="Logo Brand"
                        width={100}
                        height={100}
                        className={cn(
                            'dark:bg-sidebar bg-sidebar h-[70%] w-auto border border-border rounded-lg'
                        )}
                    />
                    <Link href={'/home'} className={'flex flex-col'}>
                        <p
                            className={
                                'dark:text-[var(--brand-color)] text-brand-text font-bold'
                            }
                        >
                            Chào Market
                        </p>
                        <p className={'text-xs'}>{t('sidebar.brandGoal')}</p>
                    </Link>
                </div>
            </div>
            <Link
                className={
                    'bg-[var(--brand-color)] font-bold text-sm p-4 rounded-sm text-black'
                }
                href={'/products'}
            >
                {t('sidebar.ourSolutions')}
            </Link>
        </div>
    );
}
