import { useState, useEffect, useCallback } from 'react';

/**
 * Banking-grade OTP resend policy:
 *
 * - Cooldown between resends: 60s
 * - Max resend: 3 times (total 4 OTPs: 1 original + 3 resends)
 * - After max resend: blocked for 30 minutes
 * - After block expires: redirect user to restart flow (not auto-reset)
 *
 * Server-side rate limit provides additional protection layer.
 */

const COOLDOWN_SECONDS = 60;
const MAX_RESEND = 3;
const LOCK_DURATION_SECONDS = 1800; // 30 minutes

export function useOtpResend() {
    const [countdown, setCountdown] = useState(COOLDOWN_SECONDS);
    const [resendCount, setResendCount] = useState(0);
    const [lockExpiry, setLockExpiry] = useState<number | null>(null);
    const [lockCountdown, setLockCountdown] = useState(0);
    const [blockExpired, setBlockExpired] = useState(false);

    const isLocked = lockExpiry !== null && Date.now() < lockExpiry;

    // Cooldown timer (for resend delay)
    useEffect(() => {
        if (countdown <= 0 || isLocked) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, isLocked]);

    // Lock countdown timer
    useEffect(() => {
        if (!lockExpiry) return;

        const tick = () => {
            const remaining = Math.ceil((lockExpiry - Date.now()) / 1000);
            if (remaining <= 0) {
                // Block expired — signal parent to redirect
                setLockExpiry(null);
                setLockCountdown(0);
                setBlockExpired(true);
            } else {
                setLockCountdown(remaining);
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [lockExpiry]);

    const canResend = countdown <= 0 && !isLocked && !blockExpired;

    const onResendSuccess = useCallback(() => {
        const nextCount = resendCount + 1;
        setResendCount(nextCount);

        if (nextCount >= MAX_RESEND) {
            setLockExpiry(Date.now() + LOCK_DURATION_SECONDS * 1000);
            setCountdown(0);
        } else {
            setCountdown(COOLDOWN_SECONDS);
        }
    }, [resendCount]);

    // Format seconds as m:ss
    const formatTime = useCallback((seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }, []);

    return {
        countdown,
        resendCount,
        maxResend: MAX_RESEND,
        isLocked,
        canResend,
        onResendSuccess,
        remainingResends: MAX_RESEND - resendCount,
        lockCountdown,
        formatTime,
        blockExpired,
    };
}
