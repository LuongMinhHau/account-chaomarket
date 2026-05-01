'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { T } from '@/components/app-translate';

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(window.scrollY > 400);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                        className={`
                            flex items-center justify-center
                            w-10 h-10 rounded-full
                            bg-[var(--brand-color)] hover:bg-[var(--brand-color)]
                            text-black
                            shadow-lg
                            cursor-pointer
                            transition-all duration-300 ease-in-out
                            hover:scale-105 active:scale-95
                            ${isVisible
                                ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 translate-y-2 pointer-events-none'
                            }
                        `}
                    >
                        <ChevronUp className="size-5 stroke-[2.5]" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side={'left'}>
                    <T keyName={'common.scrollToTop'} />
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
