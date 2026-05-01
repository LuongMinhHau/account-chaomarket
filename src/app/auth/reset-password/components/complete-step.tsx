'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/context/i18n/context';

export default function CompletionStep() {
    const { t } = useI18n();

    return (
        <div className="form-container flex flex-col items-center justify-center gap-4 text-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-16">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-[16px] font-semibold text-[var(--brand-grey-foreground)]">
                {t('auth.resetPassword.completeSubtitle')}
            </p>
            <Button
                className="w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30"
                asChild
            >
                <Link href="/auth/login">{t('auth.resetPassword.goToLogin')}</Link>
            </Button>
        </div>
    );
}
