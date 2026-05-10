'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { useI18n } from '@/context/i18n/context';

interface OtpVerificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    email: string;
    otp: string;
    onOtpChange: (otp: string) => void;
    error: string;
    loading: boolean;
    onVerify: () => void;
    onCancel: () => void;
}

/**
 * Reusable OTP verification dialog used by profile and avatar update flows.
 * Extracted from ProfilePage to reduce component size.
 */
export default function OtpVerificationDialog({
    open,
    onOpenChange,
    title,
    email,
    otp,
    onOtpChange,
    error,
    loading,
    onVerify,
    onCancel,
}: OtpVerificationDialogProps) {
    const { t } = useI18n();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background border-border">
                <DialogHeader>
                    <DialogTitle className="text-[18px] font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-[14px] text-muted-foreground">
                        {t('account.profilePage.otpDescription')} <span className="font-semibold text-foreground">{email}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={onOtpChange}
                        >
                            <InputOTPGroup>
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        className="w-11 h-12 text-lg font-semibold border-input"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                    )}

                    <div className="flex gap-3 justify-end pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="text-muted-foreground"
                        >
                            {t('account.profilePage.cancelButton')}
                        </Button>
                        <Button
                            type="button"
                            disabled={loading}
                            onClick={onVerify}
                            className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90"
                        >
                            {loading && <Loader2 className="size-4 animate-spin mr-2" />}
                            {t('account.profilePage.confirmButton')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
