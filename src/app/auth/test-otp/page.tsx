'use client';

import { Suspense } from 'react';
import OtpVerificationForm from '@/app/auth/components/otp-verification-form';

export default function TestOtpPage() {
    return (
        <Suspense fallback={<div className="spinner" style={{ margin: '2rem auto' }} />}>
            <OtpVerificationForm email="test@chaomarket.com" firstName="Minh Hau" />
        </Suspense>
    );
}
