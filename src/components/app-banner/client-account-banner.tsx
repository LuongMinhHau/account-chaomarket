'use client';
import { sanitizeHtml } from '@/lib/sanitize';

import Image from 'next/image';
import { HomeBanner } from '@image/index';
import React from 'react';
import { useI18n } from '@/context/i18n/context';

export type ClientAccountDisplayMode = "text_only" | "image_only" | "image_and_text";

interface ClientAccountBannerProps {
    /** Custom banner image URL from Admin. Falls back to static HomeBanner. */
    imageSrc?: string;
    /** Display mode: text_only (default), image_only, image_and_text */
    displayMode?: ClientAccountDisplayMode;
    /** Slogan override (Vietnamese) from Admin settings */
    sloganVi?: string;
    /** Slogan override (English) from Admin settings */
    sloganEn?: string;
}

export default function ClientAccountBanner({ imageSrc, displayMode = "text_only", sloganVi, sloganEn }: ClientAccountBannerProps) {
    const { t, locale } = useI18n();

    const showImage = displayMode === "image_only" || displayMode === "image_and_text";
    const showText = displayMode === "text_only" || displayMode === "image_and_text";

    // Use Admin slogan override if available, otherwise fall back to translation
    const slogan = locale === 'vi'
        ? (sloganVi || t('brandSlogan.clientPromise'))
        : (sloganEn || t('brandSlogan.clientPromise'));

    return (
        <div className="relative w-full h-[140px] overflow-hidden rounded-2xl border border-neutral-300/40 dark:border-neutral-600/30">
            {showImage ? (
                <Image
                    src={imageSrc || HomeBanner}
                    alt={'Client Account Banner'}
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover object-center"
                />
            ) : (
                /* text_only: dark background */
                <div className="w-full h-full dark:bg-[var(--brand-black-bg)] bg-[var(--brand-grey)] flex items-center justify-center">
                    {showText && (
                        <p
                            className="text-center text-3xl italic text-[var(--brand-grey-foreground)]"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(slogan) }}
                        />
                    )}
                </div>
            )}
            {/* Text overlay for image modes */}
            {showImage && showText && (
                <h2
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-full px-4 text-brand-text text-lg lg:text-3xl tracking-wider font-bold text-center"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(slogan) }}
                />
            )}
        </div>
    );
}
