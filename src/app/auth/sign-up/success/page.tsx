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
        <div className="flex flex-col w-full h-full">
            <div className="h-full w-full flex flex-col gap-6 justify-center pt-8">
                <TabAuthMode />
                <div className="space-y-2">
                    <h2 className="text-[20px] font-extrabold text-black/90 dark:text-brand-text">
                        {t('common.welcomeToChaoMarket').split(',')[0]},{' '}
                        <span className="text-black dark:text-[var(--brand-color)]">
                            {firstName}
                        </span>
                    </h2>
                    <p className="text-[var(--brand-grey-foreground)] text-[16px]">
                        {t('common.yourAccountHasBeenCreated')}
                    </p>
                </div>
                <Button
                    className="w-full h-12 bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30"
                    asChild
                >
                    <Link href={loginHref}>{t('auth.login')}</Link>
                </Button>
            </div>
        </div>
    );
}
