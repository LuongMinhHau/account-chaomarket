'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useI18n } from '@/context/i18n/context';

export default function SocialLogin() {
    const searchParams = useSearchParams();
    const { t } = useI18n();

    const handleSocialLogin = (provider: string) => {
        const callbackUrl = searchParams.get('callbackUrl') || '/account';
        signIn(provider, { callbackUrl });
    };

    return (
        <>
            <div className="mb-4 mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-black/20 dark:border-[var(--brand-grey-foreground)]/30" />
                </div>
                <div className="relative flex w-fit mx-auto px-2 justify-center dark:bg-background bg-background font-semibold">
                    <span className="px-2 text-brand-text text-[18px]">
                        {t('common.orContinueWith')}
                    </span>
                </div>
            </div>
            <div className="mx-auto w-fit">
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="cursor-pointer"
                    type="button"
                >
                    <Image
                        width={1920}
                        height={1080}
                        className="size-12"
                        src="/img/google.svg"
                        alt="google-icon"
                    />
                </button>
            </div>
        </>
    );
}
