'use client';
import { sanitizeHtml } from '@/lib/sanitize';
import Image from 'next/image';
import { HomeBanner } from '@image/index';
import React from 'react';
import { useI18n } from '@/context/i18n/context';

export type BannerDisplayMode = "text_only" | "image_only" | "image_and_text";

interface GeneralBannerProps {
    /** Custom banner image URL from Admin. Falls back to static HomeBanner. */
    imageSrc?: string;
    /** Display mode: text_only, image_only, image_and_text (default) */
    displayMode?: BannerDisplayMode;
    /** Custom slogan for Vietnamese (from Admin). Falls back to i18n. */
    sloganVi?: string;
    /** Custom slogan for English (from Admin). Falls back to i18n. */
    sloganEn?: string;
}

export default function GeneralBanner({ imageSrc, displayMode = "image_and_text", sloganVi, sloganEn }: GeneralBannerProps) {
    const { t, locale } = useI18n();

    // Use Admin slogan for current locale if available, otherwise fall back to i18n
    const adminSlogan = locale === 'vi' ? sloganVi : sloganEn;
    const slogan = adminSlogan || t('brandSlogan.general');

    const showImage = displayMode === "image_only" || displayMode === "image_and_text";
    const showText = displayMode === "text_only" || displayMode === "image_and_text";

    return (
        <div className="relative w-full h-[140px] overflow-hidden rounded-lg">
            {showImage ? (
                <Image
                    src={imageSrc || HomeBanner}
                    alt={'Home banner'}
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover object-center"
                />
            ) : (
                /* text_only: uses brand design system for theme consistency */
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-common-grey)' }}>
                    {showText && (
                        <h2
                            className="px-4 text-lg lg:text-3xl tracking-wider font-bold text-center"
                            style={{ color: 'var(--brand-text)' }}
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
