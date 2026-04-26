import { BaseResponse } from '@/types/base-response';

// Import response types from API routes
type RequestResetPasswordData =
    import('@/app/api/auth/reset-password/request/route').RequestResetPasswordData;
type VerifyResetPasswordData =
    import('@/app/api/auth/reset-password/verify/route').VerifyResetPasswordData;

// Request OTP
export async function requestResetPassword(email: string) {
    const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const responseMessage = await response.json();

    if (!response.ok) {
        throw new Error(
            responseMessage.message || 'Failed to request reset password'
        );
    }

    return responseMessage as Promise<BaseResponse<RequestResetPasswordData>>;
}

// Verify OTP
export async function verifyResetPasswordOTP(email: string, otp: string) {
    const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
    });

    const responseMessage = await response.json();

    if (!response.ok) {
        throw new Error(responseMessage.message || 'Failed to verify OTP');
    }

    return responseMessage as Promise<BaseResponse<VerifyResetPasswordData>>;
}

// Change password
export async function changeResetPassword(
    email: string,
    password: string,
    otp: string
) {
    const response = await fetch('/api/auth/reset-password/change', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, otp }),
    });

    const responseMessage = await response.json();

    if (!response.ok) {
        throw new Error(responseMessage.message || 'Failed to change password');
    }

    return responseMessage as Promise<BaseResponse>;
}
