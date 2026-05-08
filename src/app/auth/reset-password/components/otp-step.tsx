'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';
import { useOtpResend } from '@/hooks/use-otp-resend';

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
    const { countdown, canResend, isLocked, remainingResends, maxResend, onResendSuccess, lockCountdown, formatTime, blockExpired } = useOtpResend();
    const { t } = useI18n();

    // Redirect when block expires (banking standard: restart flow)
    useEffect(() => {
        if (blockExpired) {
            window.location.href = '/auth/reset-password';
        }
    }, [blockExpired]);

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

    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/reset-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                onResendSuccess();
                setOtp('');
            } else {
                setError(t('auth.failedToResendOtp'));
            }
        } catch {
            setError(t('auth.failedToResendOtp'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <p className="text-[var(--brand-grey-foreground)] text-[16px]">
                {t('auth.otpSentToEmail')}{' '}
                <span className="font-bold dark:text-[var(--brand-color)] text-black">{email}</span>
            </p>

            <div className="space-y-4">
                <div className="flex justify-center w-full">
                    <OtpInput value={otp} onChange={setOtp} />
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleVerify}
                    disabled={loading || otp.length !== 6}
                    className={cn(
                        'w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl',
                        'hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]!',
                        'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 h-12',
                        loading ? 'disabled:bg-transparent disabled:p-0' : ''
                    )}
                >
                    {loading ? <LoadingSpinner /> : t('common.verify')}
                </Button>
            </div>

            <div className="flex flex-col items-center gap-1 -mt-2">
                {isLocked ? (
                    <p className="text-red-500 dark:text-red-400 text-sm text-center">
                        {t('auth.resendLocked').replace('{time}', formatTime(lockCountdown))}
                    </p>
                ) : (
                    <button
                        onClick={handleResendOtp}
                        disabled={loading || countdown > 0}
                        className={cn(
                            'text-[14px] font-semibold transition-colors cursor-pointer',
                            countdown > 0
                                ? 'text-[var(--brand-grey-foreground)]/50 cursor-default'
                                : 'dark:text-[var(--brand-color)] text-black hover:underline',
                            'disabled:opacity-50 disabled:cursor-default'
                        )}
                        type="button"
                    >
                        {countdown > 0
                            ? `${t('auth.resendOtp')} (${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')})`
                            : t('auth.resendOtp')
                        }
                    </button>
                )}
                {!isLocked && remainingResends < maxResend && (
                    <span className="text-xs text-[var(--brand-grey-foreground)]">
                        {t('auth.resendRemaining').replace('{remaining}', String(remainingResends)).replace('{max}', String(maxResend))}
                    </span>
                )}
            </div>
        </div>
    );
}
