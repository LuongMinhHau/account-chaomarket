'use client';

import '@/styles/_loading-bouncing.scss';
import { useI18n } from '@/context/i18n/context';

export default function AppLoader() {
    const { t } = useI18n();

    // Read preloader settings from Admin DB via i18n overrides
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logoUrl = t('preloader.logo' as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandName = t('preloader.brandName' as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slogan = t('preloader.slogan' as any);

    // Validate: if the key returns itself, it means no override was set — use defaults
    const isValidLogo =
        logoUrl &&
        logoUrl !== 'preloader.logo' &&
        (logoUrl.startsWith('/') || logoUrl.startsWith('http') || logoUrl.startsWith('data:'));

    const displayLogo = isValidLogo ? logoUrl : '/img/brand-logo.svg';
    const displayName =
        brandName && brandName !== 'preloader.brandName' ? brandName : 'Chào Market';
    const displaySlogan =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slogan && slogan !== 'preloader.slogan' ? slogan : t('sidebar.brandGoal' as any);

    return (
        <div
            className={
                'w-fit mx-auto h-full max-h-[calc(100%-8rem)] lg:max-h-full lg:min-h-svh flex justify-center' +
                ' items-center' +
                ' animate-pulse gap-4' +
                ' pulse-scale'
            }
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={displayLogo}
                className="w-full uppercase h-auto max-w-[3rem] lg:max-w-[24rem]"
                alt={'Brand-logo'}
            />
            <div className={'w-fit'}>
                <p
                    className={
                        'text-lg lg:text-2xl text-brand-text dark:text-[var(--brand-color)] font-semibold' +
                        ' whitespace-nowrap'
                    }
                >
                    {displayName}
                </p>
                <span className={'text-sm lg:text-base whitespace-nowrap'}>
                    {displaySlogan}
                </span>
            </div>
        </div>
    );
}
