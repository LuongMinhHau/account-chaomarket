'use client';

import { Suspense, useState } from 'react';
import OtpVerificationForm, {
    type OtpVerificationFormProps,
} from '@/app/auth/components/otp-verification-form';
import { SignUpForm } from '@/app/auth/sign-up/components/sign-up-form';

export default function SignUpPageWrapper() {
    return (
        <Suspense fallback={<div className="spinner" style={{ margin: '2rem auto' }} />}>
            <SignUpPage />
        </Suspense>
    );
}

function SignUpPage() {
    const [showOtp, setShowOtp] = useState(false);
    const [user, setUser] = useState<OtpVerificationFormProps | null>(null);

    const handleSignUpSuccess = (user: OtpVerificationFormProps) => {
        setUser(user);
        setShowOtp(true);
    };

    return showOtp && user ? (
        <OtpVerificationForm email={user.email} firstName={user.firstName} />
    ) : (
        <SignUpForm onSignUpSuccess={handleSignUpSuccess} />
    );
}
