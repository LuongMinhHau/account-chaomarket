'use client';

import { use } from 'react';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useI18n } from '@/context/i18n/context';

interface PageProps {
    searchParams: Promise<{
        firstName: string;
        callbackUrl?: string;
    }>;
}

export default function SuccessPage({ searchParams }: PageProps) {
    const { firstName, callbackUrl } = use(searchParams);
    const { t } = useI18n();

    const loginHref = callbackUrl
        ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/auth/login';

    return (
        <div className="auth-layout">
            {/* Left: Brand Panel */}
            <div className="auth-brand-panel">
                <div className="brand-visual">
                    <div className="brand-visual-logo">C</div>
                    <h2>Chào Market</h2>
                    <p>{t('common.welcomeToChaoMarket')}</p>
                </div>
            </div>

            {/* Right: Success */}
            <div className="auth-form-panel">
                <div className="h-full w-full max-h-svh flex text-brand-text flex-col">
                    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-4">
                        <TabAuthMode />
                        <div className="text-center flex flex-col gap-1">
                            <h2 className="text-[20px] font-extrabold text-black/90 dark:text-brand-text flex items-center justify-center gap-1.5">
                                {t('common.welcomeToChaoMarket').split(',')[0]},{' '}
                                <span className="text-black dark:text-[var(--brand-color)]">
                                    {firstName}
                                </span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[1.2em] h-[1.2em] inline-block">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </h2>
                            <p className="text-[16px] font-semibold text-[var(--brand-grey-foreground)]">
                                {t('common.yourAccountHasBeenCreated')}
                            </p>
                        </div>
                        <Button
                            className="w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30"
                            asChild
                        >
                            <Link href={loginHref}>{t('auth.login')}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
