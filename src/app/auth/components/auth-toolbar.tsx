'use client';

import { useI18n } from '@/context/i18n/context';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { ENLocale, VILocale } from '../../../../public/languages';
import { useState, useEffect } from 'react';

/**
 * Top-right toolbar for auth pages (login, sign-up, reset-password).
 * Replaces the sidebar controls when user is NOT logged in.
 * Shows language switcher + theme toggle.
 */
export default function AuthToolbar() {
    const { locale, setLocale, t } = useI18n();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const currentTheme = theme === 'light' || theme === 'dark' ? theme : 'dark';

    return (
        <div className="fixed top-4 right-4 md:top-6 md:right-8 z-50 flex items-center gap-2">
            {/* Language Toggle */}
            <button
                onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                    bg-white/10 dark:bg-white/5 backdrop-blur-xl
                    border border-white/15 dark:border-white/10
                    text-black/80 dark:text-white/80
                    hover:bg-white/20 dark:hover:bg-white/10
                    hover:text-black dark:hover:text-white
                    transition-all duration-300 ease-in-out cursor-pointer
                    shadow-lg shadow-black/5 dark:shadow-black/20"
                title={locale === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
            >
                <Image
                    src={locale === 'vi' ? VILocale : ENLocale}
                    alt={`locale-flag-${locale}`}
                    width={20}
                    height={14}
                    className="size-4 object-contain rounded-sm"
                />
                <span className="text-xs font-medium">
                    {locale === 'vi' ? 'Tiếng Việt' : 'English'}
                </span>
            </button>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                    bg-white/10 dark:bg-white/5 backdrop-blur-xl
                    border border-white/15 dark:border-white/10
                    text-black/80 dark:text-white/80
                    hover:bg-white/20 dark:hover:bg-white/10
                    hover:text-black dark:hover:text-white
                    transition-all duration-300 ease-in-out cursor-pointer
                    shadow-lg shadow-black/5 dark:shadow-black/20"
                title={currentTheme === 'dark' ? t('common.light') : t('common.dark')}
            >
                {currentTheme === 'dark' ? (
                    <Sun className="size-4" />
                ) : (
                    <Moon className="size-4" />
                )}
            </button>
        </div>
    );
}
