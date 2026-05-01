export const sendOtpCode = async (email: string) => {
    return await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
    });
};

export const verifiedEmail = async (email: string) => {
    return await fetch(`/api/user/verify?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
};

export const verifiedOtpCode = async ({
    email,
    otp,
}: {
    email: string;
    otp: string;
}) => {
    return await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: otp }),
    });
};
