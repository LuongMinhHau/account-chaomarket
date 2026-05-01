'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import LoadingSpinner from '@/components/loading-spinner';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';
import { otpSchema, type OtpFormData } from '@/schema/auth-schema';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

export interface OtpVerificationFormProps {
    email: string;
    firstName?: string;
}

export default function OtpVerificationForm({
    email,
    firstName,
}: OtpVerificationFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useI18n();

    const form = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema),
        defaultValues: {
            email: email,
            otp: '',
        },
    });

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const onSubmit = async (data: OtpFormData) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, otp: data.otp }),
            });

            if (response.ok) {
                const callbackUrl = searchParams.get('callbackUrl');
                const successUrl = `/auth/sign-up/success?firstName=${firstName || ''}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`;
                router.push(successUrl);
            } else {
                setError(t('auth.otpVerificationFailed'));
            }
        } catch {
            setError(t('auth.failedToVerifyOtp'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'email' }),
            });

            if (response.ok) {
                setSuccess(t('auth.otpResentSuccess'));
                setCountdown(60);
            } else {
                setError(t('auth.failedToResendOtp'));
            }
        } catch {
            setError(t('auth.failedToResendOtp'));
        } finally {
            setLoading(false);
        }
    }, [email]);

    return (
        <div className="flex flex-col w-full h-full items-center justify-center">
            <div className="w-full max-w-md flex flex-col items-center space-y-6">
                <TabAuthMode />

                <h2 className="text-[20px] font-extrabold text-black/90 dark:text-brand-text w-full">
                    {t('auth.verifyEmailTitle')}
                </h2>

                {error && (
                    <div className="w-full flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="w-full flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-green-500/30 dark:border-green-400/20 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        {success}
                    </div>
                )}

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-4"
                    >
                        <p className="text-[14px] lg:text-[16px] text-[var(--brand-grey-foreground)] font-semibold">
                            {t('auth.weHaveSendOtpToYourEmail')}{' '}
                            <span className="font-bold dark:text-[var(--brand-color)] text-black">
                                {email}.
                            </span>
                        </p>
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP maxLength={6} {...field}>
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
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                'w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2',
                                'px-4 rounded-3xl disabled:p-0 mt-4 hover:bg-[var(--brand-color-foreground)]',
                                'transition-colors! duration-300 ease-in-out text-[18px]!',
                                'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30',
                                loading ? 'disabled:bg-transparent' : ''
                            )}
                        >
                            {loading ? <LoadingSpinner /> : t('common.continue')}
                        </Button>
                    </form>
                </Form>

                <div className="text-center">
                    <p className="text-[14px] lg:text-[16px] text-brand-text font-semibold">
                        {t('auth.didNotReceiveCode')}{' '}
                        {countdown > 0 ? (
                            <span className="text-[var(--brand-grey-foreground)]">
                                Gửi lại sau {countdown}s
                            </span>
                        ) : (
                            <button
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="dark:text-[var(--brand-color)] text-black font-bold hover:underline cursor-pointer disabled:opacity-50"
                                type="button"
                            >
                                {t('auth.resendOtp')}
                            </button>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
