'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

export default function ResetPasswordOtpStep({
    email,
    onNext,
}: {
    email: string;
    onNext: (otp: string) => void;
}) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useI18n();

    const handleVerify = async () => {
        if (otp.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            if (res.ok) {
                onNext(otp);
            } else {
                setError(t('auth.otpVerificationFailed'));
            }
        } catch {
            setError(t('auth.failedToVerifyOtp'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            {error && (
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}
            <p className="text-sm text-[var(--brand-grey-foreground)] font-semibold mb-4">
                {t('auth.otpSentToEmail')}{' '}
                <span className="font-bold dark:text-[var(--brand-color)] text-black">{email}</span>
            </p>
            <div className="flex flex-col items-center w-full mb-4">
                <InputOTP maxLength={6} value={otp} onChange={value => setOtp(value)}>
                    <InputOTPGroup className={cn(
                        'flex gap-3 lg:gap-4 mx-auto text-brand-text',
                        '[&>div[data-slot=input-otp-slot]]:rounded-lg',
                        '[&>div[data-slot=input-otp-slot]]:outline-0',
                        '[&>div[data-slot=input-otp-slot]]:size-12 lg:[&>div[data-slot=input-otp-slot]]:size-14',
                        '[&>div[data-slot=input-otp-slot]]:text-xl lg:[&>div[data-slot=input-otp-slot]]:text-2xl',
                        '[&>div[data-slot=input-otp-slot]]:font-bold',
                        '[&>div[data-slot=input-otp-slot]]:border',
                        '[&>div[data-slot=input-otp-slot]]:border-border dark:[&>div[data-slot=input-otp-slot]]:border-[var(--brand-grey-foreground)]/30',
                        'dark:[&>div[data-slot=input-otp-slot]]:ring-[var(--brand-color)]',
                    )}>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
            </div>
            <Button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className={cn(
                    'w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl',
                    'hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]!',
                    'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30',
                    loading ? 'disabled:bg-transparent disabled:p-0' : ''
                )}
            >
                {loading ? <LoadingSpinner /> : t('common.verify')}
            </Button>
        </div>
    );
}
