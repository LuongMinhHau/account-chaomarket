'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormData } from '@/schema/auth-schema';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { OtpInput } from '@/components/ui/otp-input';
import LoadingSpinner from '@/components/loading-spinner';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';
import SocialLogin from '@/app/auth/components/social-login';
import { useI18n } from '@/context/i18n/context';
import { useOtpResend } from '@/hooks/use-otp-resend';

export default function LoginPageWrapper() {
    return (
        <Suspense fallback={<div className="spinner" style={{ margin: '2rem auto' }} />}>
            <LoginPage />
        </Suspense>
    );
}

// Email verification step (when user hasn't verified email yet)
function EmailVerificationStep({
    email,
    onVerificationComplete,
}: {
    email: string;
    onVerificationComplete: () => void;
}) {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { countdown, canResend, isLocked, remainingResends, maxResend, onResendSuccess, lockCountdown, formatTime, blockExpired } = useOtpResend();
    const { t } = useI18n();

    // Redirect when block expires (banking standard: restart flow)
    useEffect(() => {
        if (blockExpired) {
            window.location.href = '/auth/login';
        }
    }, [blockExpired]);

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            if (response.ok) {
                onVerificationComplete();
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
            const response = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type: 'email' }),
            });
            if (response.ok) {
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
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className={cn(
                        'w-full text-black h-12 bg-[var(--brand-color)] cursor-pointer rounded-3xl font-bold py-2 px-4',
                        'hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]!',
                        'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30',
                        loading ? 'disabled:bg-transparent disabled:p-0' : ''
                    )}
                >
                    {loading ? <LoadingSpinner /> : t('common.continue')}
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

// Main login component
function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
    const [loginData, setLoginData] = useState<{ email: string; password: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useI18n();

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Clear error when form fields change
    useEffect(() => {
        const subscription = form.watch(() => {
            if (error) setError('');
        });
        return () => subscription.unsubscribe();
    }, [form, error]);

    // Handle credentials login
    const handleCredentialsLogin = async (data: LoginFormData) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/user/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || t('auth.invalidCredentials'));
            }

            const result = await response.json();

            if (result.data?.emailVerified) {
                // Email verified — check if login verification is enabled
                if (result.data?.loginVerification) {
                    // Login verification ON — verify password WITHOUT creating session
                    const pwCheck = await fetch('/api/auth/verify-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: data.email, password: data.password }),
                    });

                    if (!pwCheck.ok) {
                        setError(t('auth.invalidCredentials'));
                    } else {
                        // Password correct — send OTP for login verification
                        setLoginData(data);
                        await fetch('/api/auth/otp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: data.email, type: 'email', purpose: 'loginVerification' }),
                        });
                        setEmailVerified(false);
                    }
                } else {
                    // Login verification OFF — proceed with normal login
                    const signInResult = await signIn('credentials', {
                        email: data.email,
                        password: data.password,
                        redirect: false,
                    });

                    if (!signInResult?.ok) {
                        setError(t('auth.invalidCredentials'));
                    } else {
                        const callbackUrl = searchParams.get('callbackUrl') || '/notifications';
                        if (callbackUrl.startsWith('http')) {
                            window.location.replace(callbackUrl);
                            return;
                        } else {
                            router.push(callbackUrl);
                            return;
                        }
                    }
                }
            } else {
                // Not verified — send OTP
                setLoginData(data);
                await fetch('/api/auth/otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email, type: 'email' }),
                });
                setEmailVerified(false);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : t('auth.loginError');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Handle successful OTP verification
    const handleOtpVerificationComplete = async () => {
        if (!loginData) return;

        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: loginData.email,
                password: loginData.password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('auth.invalidCredentials'));
                setEmailVerified(true);
            } else {
                const cb = searchParams.get('callbackUrl') || '/notifications';
                if (cb.startsWith('http')) {
                    window.location.replace(cb);
                    return;
                } else {
                    router.push(cb);
                    return;
                }
            }
        } catch {
            setError(t('auth.loginError'));
        } finally {
            setLoading(false);
        }
    };

    // Check for OAuth errors
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam) {
            switch (errorParam) {
                case 'OAuthAccountNotLinked':
                    setError(t('auth.oauth.accountNotLinked'));
                    break;
                case 'CredentialsSignin':
                    setError(t('auth.invalidCredentials'));
                    break;
                default:
                    setError(t('auth.oauth.unknownError'));
            }
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="h-full w-full flex flex-col gap-6 justify-center pt-8">
                {error && (
                    <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <TabAuthMode />
                <div className="space-y-2">
                    <h2 className="text-[20px] font-extrabold text-black/90 dark:text-brand-text">
                        {t('auth.welcomeBack')}
                    </h2>
                    {emailVerified === false && loginData && (
                        <p className="text-[var(--brand-grey-foreground)] text-[16px]">
                            {t('auth.otpSentToEmail')}{' '}
                            <span className="font-bold dark:text-[var(--brand-color)] text-black">
                                {loginData.email}
                            </span>.
                        </p>
                    )}
                </div>

                {emailVerified === false && loginData ? (
                    <EmailVerificationStep
                        email={loginData.email}
                        onVerificationComplete={handleOtpVerificationComplete}
                    />
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleCredentialsLogin)}
                            className="h-fit space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FloatingLabelInput
                                                label={t('common.emailAddress')}
                                                {...field}
                                                className="app-text-input"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FloatingLabelInput
                                                type={showPassword ? 'text' : 'password'}
                                                label={
                                                    <span className="inline-flex items-center gap-1">
                                                        {t('common.password')}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="pointer-events-auto cursor-pointer inline-flex items-center"
                                                        >
                                                            {showPassword ? (
                                                                <Eye className="h-4 w-4" />
                                                            ) : (
                                                                <EyeOff className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </span>
                                                }
                                                className="app-text-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormItem>
                                <FormLabel
                                    className="dark:text-white/50 dark:hover:text-white text-black/50 hover:text-black hover:underline transition-all! duration-300 ease-in-out cursor-pointer"
                                    onClick={() => router.push('/auth/reset-password')}
                                >
                                    {t('auth.forgotPassword')}
                                </FormLabel>
                            </FormItem>

                            <Button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    'w-full my-2 bg-[var(--brand-color)] cursor-pointer text-black font-bold py-3',
                                    'px-6 rounded-3xl disabled:p-0 hover:bg-[var(--brand-color-foreground)]',
                                    'transition-colors! duration-300 ease-in-out text-[16px]!',
                                    'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 h-12',
                                    loading ? 'disabled:bg-transparent' : ''
                                )}
                            >
                                {loading ? <LoadingSpinner /> : t('auth.login')}
                            </Button>
                        </form>
                    </Form>
                )}

                <div className="text-center text-brand-text font-medium flex flex-col gap-2 w-full">
                    <SocialLogin />
                    <div className="text-[16px] font-medium flex gap-2 justify-center items-center">
                        {t('auth.noAccountPrompt')}{' '}
                        <Link
                            href={`/auth/sign-up${searchParams.get('callbackUrl') ? `?callbackUrl=${encodeURIComponent(searchParams.get('callbackUrl')!)}` : ''}`}
                            className="dark:text-[var(--brand-color)] text-black font-bold hover:font-extrabold dark:hover:text-[var(--brand-color-foreground)] transition-all! duration-300 ease-in-out"
                        >
                            {t('auth.signup')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

