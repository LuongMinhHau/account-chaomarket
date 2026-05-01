'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useState, useEffect, useMemo } from 'react';
import { Speech } from 'lucide-react';
import Image from 'next/image';
import { Messenger, Telegram, Zalo, WhatsApp } from '@image/index';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { useI18n } from '@/context/i18n/context';
import ScrollToTop from '@/components/app-scroll-to-top';

// Default platform images
const PLATFORM_IMAGES: Record<string, typeof Messenger> = {
    messenger: Messenger,
    zalo: Zalo,
    telegram: Telegram,
    whatsapp: WhatsApp,
};

const PLATFORM_COLORS: Record<string, string> = {
    messenger: '#2962ff',
    zalo: '#2962ff',
    telegram: '#2962ff',
    whatsapp: '#25d366',
};

// Default contact methods
const DEFAULT_METHODS = [
    { name: "Messenger", url: "https://m.me/luong.m.hau", platform: "messenger" },
    { name: "Zalo", url: "https://zalo.me/0902466445", platform: "zalo" },
    { name: "Telegram", url: "https://t.me/luong_minh_hau", platform: "telegram" },
];

interface ContactButtonProps {
    settings?: Record<string, string>;
}

export default function ContactButton({ settings = {} }: ContactButtonProps) {
    const { t, locale } = useI18n();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [visibleItems, setVisibleItems] = useState<number[]>([]);

    useEffect(() => setMounted(true), []);

    // Global visibility
    const isGlobalVisible = (settings.quickchat_visible ?? 'active') === 'active';

    // Tooltip settings
    const isTooltipVisible = (settings.quickchat_tooltip_visible ?? 'active') === 'active';
    const tooltipDelay = parseInt(settings.quickchat_tooltip_delay || '200', 10);

    // Build contact methods from settings dynamically
    const contactMethods = useMemo(() => {
        const indices = new Set<number>();
        for (const key of Object.keys(settings)) {
            const m = key.match(/^quickchat_(\d+)_/);
            if (m) indices.add(parseInt(m[1], 10));
        }
        // Ensure defaults 1-4 are always present
        for (let i = 1; i <= 3; i++) indices.add(i);

        return Array.from(indices).sort((a, b) => a - b).map((n) => {
            const fallback = DEFAULT_METHODS[n - 1];
            // Locale-aware name: try _name_{locale} first, fallback to _name, then default
            const localeSuffix = locale === 'vi' ? 'vi' : 'en';
            const name = settings[`quickchat_${n}_name_${localeSuffix}`]
                || settings[`quickchat_${n}_name`]
                || fallback?.name || '';
            const url = settings[`quickchat_${n}_url`] || fallback?.url || '';
            const platform = settings[`quickchat_${n}_platform`] || fallback?.platform || 'messenger';
            const visible = settings[`quickchat_${n}_visible`] ?? 'active';
            const customIcon = settings[`quickchat_${n}_icon`] || '';
            const defaultImg = PLATFORM_IMAGES[platform];
            const color = PLATFORM_COLORS[platform] || '#2962ff';

            return {
                name,
                href: url,
                icon: customIcon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={customIcon}
                        alt={platform}
                        width={32}
                        height={32}
                        className="object-contain size-8 rounded-full"
                    />
                ) : defaultImg ? (
                    <Image
                        src={defaultImg}
                        alt={platform}
                        width={50}
                        height={50}
                        className="object-contain size-8"
                    />
                ) : (
                    <span className="size-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] capitalize">{platform.slice(0, 2)}</span>
                ),
                color,
                visible,
                platform,
            };
        }).filter(item => item.visible === 'active' && item.platform !== 'whatsapp');
    }, [settings, locale]);

    useEffect(() => {
        if (open) {
            const timers = contactMethods.map((_, index) =>
                setTimeout(
                    () => setVisibleItems(prev => [...prev, index]),
                    index * 200
                )
            );
            return () => timers.forEach(clearTimeout);
        } else {
            setVisibleItems([]);
        }
    }, [open, contactMethods]);

    if (!isGlobalVisible) return <ScrollToTop />;

    // Defer Radix Popover/Tooltip rendering to avoid aria-controls hydration mismatch
    if (!mounted) {
        return (
            <div className="fixed flex gap-4 flex-col bottom-2.5 right-2.5 z-50">
                <ScrollToTop />
                <Button
                    size="icon"
                    variant="outline"
                    aria-label={t('contactButton.quickContactTooltip')}
                    className="size-12 rounded-full dark:bg-[var(--brand-color)] dark:text-black dark:hover:bg-[var(--brand-color-foreground)] dark:hover:text-black border-transparent transition-all! duration-300 ease-in-out bg-[var(--brand-color)] text-black hover:bg-[var(--brand-color-foreground)] hover:text-black animate-bounce [animation-duration:2s]"
                >
                    <Speech strokeWidth={2.5} className={'size-5.5'} />
                </Button>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={tooltipDelay}>
            <div className="fixed flex gap-4 flex-col bottom-2.5 right-2.5 z-50">
                <ScrollToTop />
                <Popover open={open} onOpenChange={setOpen}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    aria-label={t('contactButton.quickContactTooltip')}
                                    className="size-12 rounded-full dark:bg-[var(--brand-color)] dark:text-black dark:hover:bg-[var(--brand-color-foreground)] dark:hover:text-black border-transparent transition-all! duration-300 ease-in-out bg-[var(--brand-color)] text-black hover:bg-[var(--brand-color-foreground)] hover:text-black animate-bounce [animation-duration:2s]"
                                >
                                    <Speech
                                        strokeWidth={2.5}
                                        className={'size-5.5'}
                                    />
                                </Button>
                            </PopoverTrigger>
                        </TooltipTrigger>
                        {isTooltipVisible && (
                        <TooltipContent side="left">
                            <p>{t('contactButton.quickContactTooltip')}</p>
                        </TooltipContent>
                        )}
                    </Tooltip>
                    <PopoverContent
                        className="w-fit h-fit border-0 bg-transparent p-1.5 dark:bg-transparent shadow-none relative"
                        align="start"
                        side="top"
                        sideOffset={4}
                        alignOffset={-6}
                    >
                        <div className="flex flex-col gap-3 h-fit bg-white dark:bg-[#2e2e2e] rounded-full p-2 shadow-lg">
                            {contactMethods.map((method, index) => (
                                <div
                                    key={method.href}
                                    className={`transition-all! duration-300 ease-in-out ${visibleItems.includes(index)
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-4'
                                        }`}
                                >
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={method.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block"
                                            >
                                                <span className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200">
                                                    {method.icon}
                                                </span>
                                            </Link>
                                        </TooltipTrigger>
                                        {isTooltipVisible && (
                                        <TooltipContent
                                            side="left"
                                            align={'center'}
                                        >
                                            <p>{method.name}</p>
                                        </TooltipContent>
                                        )}
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </TooltipProvider>
    );
}
