'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';
import ResetPasswordEmailStep from '@/app/auth/reset-password/components/email-step';
import ResetPasswordOtpStep from '@/app/auth/reset-password/components/otp-step';
import ResetPasswordNewPasswordStep from '@/app/auth/reset-password/components/new-password';
import CompletionStep from '@/app/auth/reset-password/components/complete-step';
import { useI18n } from '@/context/i18n/context';

export default function ResetPasswordPageWrapper() {
    return (
        <Suspense fallback={<div className="spinner" style={{ margin: '2rem auto' }} />}>
            <ResetPasswordPage />
        </Suspense>
    );
}

function ResetPasswordPage() {
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'complete'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const { t } = useI18n();

    return (
        <div className="flex flex-col w-full h-full [&_*_h2]:text-[20px] [&_*_h2]:font-extrabold [&_*_h2]:text-black/90 dark:[&_*_h2]:text-brand-text">
            <div className="h-full w-full flex flex-col gap-6 justify-center pt-8">
                <TabAuthMode />

                <div className="space-y-6">
                    <div className="w-full">
                        <h2>
                            {step === 'email' && t('auth.resetPassword.title')}
                            {step === 'otp' && t('auth.verifyEmailTitle')}
                            {step === 'password' && t('auth.resetPassword.setNewPasswordTitle')}
                            {step === 'complete' && t('auth.resetPassword.completeTitle')}
                        </h2>
                        <p className="text-[var(--brand-grey-foreground)] text-[16px] mt-2">
                            {step === 'email' && t('auth.resetPassword.emailSubtitle')}
                            {step === 'otp' && t('auth.resetPassword.otpSubtitle')}
                            {step === 'password' && t('auth.resetPassword.newPasswordSubtitle')}
                            {step === 'complete' && t('auth.resetPassword.completeSubtitle')}
                        </p>
                    </div>

                    {step === 'email' && (
                        <ResetPasswordEmailStep
                            onNext={email => {
                                setEmail(email);
                                setStep('otp');
                            }}
                        />
                    )}

                    {step === 'otp' && (
                        <ResetPasswordOtpStep
                            email={email}
                            onNext={otp => {
                                setOtp(otp);
                                setStep('password');
                            }}
                        />
                    )}

                    {step === 'password' && (
                        <ResetPasswordNewPasswordStep
                            email={email}
                            otp={otp}
                            onBack={() => setStep('otp')}
                            onComplete={() => setStep('complete')}
                        />
                    )}

                    {step === 'complete' && (
                        <CompletionStep />
                    )}
                </div>

                {step !== 'complete' && (
                    <div className="text-center">
                        <p className="text-[16px] text-[var(--brand-grey-foreground)] font-semibold">
                            {t('auth.resetPassword.rememberPassword')}{' '}
                            <Link href="/auth/login" className="dark:text-[var(--brand-color)] text-black hover:underline">
                                {t('auth.login')}
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
