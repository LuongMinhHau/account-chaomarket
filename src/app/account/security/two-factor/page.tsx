'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Copy,
    Download,
    KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';

type Step = 'status' | 'qr' | 'verify' | 'backup' | 'done';

export default function TwoFactorPage() {
    const { status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [enabled, setEnabled] = useState(false);
    const [step, setStep] = useState<Step>('status');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [disabling, setDisabling] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/security/two-factor');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/two-factor')
                .then(r => r.json())
                .then(data => {
                    setEnabled(data.enabled);
                    setStep(data.enabled ? 'done' : 'status');
                })
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [status]);

    const startSetup = async () => {
        setStep('qr');
        setError('');
        try {
            const res = await fetch('/api/account/two-factor', { method: 'POST' });
            const data = await res.json();
            setQrCode(data.qrCode);
            setSecret(data.secret);
        } catch {
            setError('Không thể tạo mã QR');
        }
    };

    const verifyAndEnable = async () => {
        if (verifyCode.length !== 6) {
            setError('Mã phải có 6 chữ số');
            return;
        }
        setVerifying(true);
        setError('');
        try {
            const res = await fetch('/api/account/two-factor', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: verifyCode }),
            });
            const data = await res.json();
            if (res.ok) {
                setBackupCodes(data.backupCodes);
                setEnabled(true);
                setStep('backup');
            } else {
                setError(data.message || 'Mã không hợp lệ');
            }
        } catch {
            setError('Lỗi xác thực');
        } finally {
            setVerifying(false);
        }
    };

    const disable2FA = async () => {
        setDisabling(true);
        try {
            await fetch('/api/account/two-factor', { method: 'DELETE' });
            setEnabled(false);
            setStep('status');
            setShowDisableDialog(false);
        } catch {
            // silent
        } finally {
            setDisabling(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
    };

    const downloadBackupCodes = () => {
        const text = `Chào Market — Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nLưu ý: Mỗi mã chỉ sử dụng được 1 lần.`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chao-market-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <Card className="bg-transparent">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="size-5 text-[var(--brand-color)]" />
                            <h3 className="text-lg font-semibold">Xác Thực 2 Bước (2FA)</h3>
                        </div>
                        <a
                            href="/account/security"
                            className="text-[13px] font-medium text-[var(--brand-color)] hover:underline"
                        >
                            ← Bảo mật
                        </a>
                    </div>

                    {/* Status */}
                    {step === 'status' && !enabled && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
                                <AlertTriangle className="size-6 text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px]">2FA chưa được bật</p>
                                    <p className="text-[13px] text-muted-foreground">
                                        Bật xác thực 2 bước để bảo vệ tài khoản bằng ứng dụng xác thực (Google Authenticator, Authy).
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={startSetup}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                            >
                                <Shield className="size-4 mr-2" />
                                Bật Xác Thực 2 Bước
                            </Button>
                        </div>
                    )}

                    {/* QR Code Step */}
                    {step === 'qr' && (
                        <div className="space-y-5">
                            <p className="text-sm text-muted-foreground">
                                Quét mã QR bên dưới bằng ứng dụng xác thực (Google Authenticator, Authy, etc.)
                            </p>

                            {qrCode ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-4 rounded-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                    </div>

                                    <div className="w-full max-w-sm">
                                        <p className="text-[13px] text-muted-foreground mb-1.5">
                                            Hoặc nhập mã thủ công:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono truncate">
                                                {secret}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copySecret}
                                                className="flex-shrink-0"
                                            >
                                                <Copy className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            )}

                            <Button
                                onClick={() => { setStep('verify'); setError(''); }}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg"
                            >
                                Tiếp tục →
                            </Button>
                        </div>
                    )}

                    {/* Verify Code Step */}
                    {step === 'verify' && (
                        <div className="space-y-5">
                            <p className="text-sm text-muted-foreground">
                                Nhập mã 6 chữ số từ ứng dụng xác thực để xác nhận.
                            </p>

                            <div className="max-w-xs mx-auto space-y-3">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={verifyCode}
                                    onChange={e => {
                                        setVerifyCode(e.target.value.replace(/\D/g, ''));
                                        setError('');
                                    }}
                                    placeholder="000000"
                                    className={cn(
                                        'w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-3',
                                        'bg-transparent border rounded-xl outline-none transition-all',
                                        error
                                            ? 'border-red-500 text-red-500'
                                            : 'border-border focus:border-[var(--brand-color)]',
                                    )}
                                    autoFocus
                                />

                                {error && (
                                    <p className="text-sm text-red-500 text-center">{error}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setStep('qr'); setError(''); setVerifyCode(''); }}
                                    className="flex-1 border border-border"
                                >
                                    ← Quay lại
                                </Button>
                                <Button
                                    onClick={verifyAndEnable}
                                    disabled={verifyCode.length !== 6 || verifying}
                                    className={cn(
                                        'flex-1 font-semibold rounded-lg transition-all',
                                        verifyCode.length === 6 && !verifying
                                            ? 'bg-[var(--brand-color)] text-black hover:bg-[var(--brand-color)]/90'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed',
                                    )}
                                >
                                    {verifying ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                    Xác nhận
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Backup Codes Step */}
                    {step === 'backup' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                                <CheckCircle2 className="size-6 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px] text-green-600 dark:text-green-400">
                                        2FA đã được bật thành công!
                                    </p>
                                    <p className="text-[13px] text-muted-foreground">
                                        Lưu lại các mã dự phòng bên dưới. Mỗi mã chỉ dùng được 1 lần.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-muted/50 border border-border/50">
                                {backupCodes.map((code, i) => (
                                    <div
                                        key={i}
                                        className="font-mono text-sm px-3 py-2 rounded-lg bg-background border text-center"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
                                    className="flex-1"
                                >
                                    <Copy className="size-4 mr-2" />
                                    Sao chép
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={downloadBackupCodes}
                                    className="flex-1"
                                >
                                    <Download className="size-4 mr-2" />
                                    Tải xuống
                                </Button>
                            </div>

                            <Button
                                onClick={() => setStep('done')}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg"
                            >
                                Hoàn tất
                            </Button>
                        </div>
                    )}

                    {/* Done / Enabled State */}
                    {step === 'done' && enabled && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                                <CheckCircle2 className="size-6 text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px] text-green-600 dark:text-green-400">
                                        Xác thực 2 bước đã bật
                                    </p>
                                    <p className="text-[13px] text-muted-foreground">
                                        Tài khoản của bạn được bảo vệ bằng ứng dụng xác thực.
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setShowDisableDialog(true)}
                                className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            >
                                Tắt Xác Thực 2 Bước
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Disable Dialog */}
            <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            Tắt Xác Thực 2 Bước
                        </DialogTitle>
                        <DialogDescription className="text-[15px] mt-2">
                            Bạn có chắc chắn muốn tắt 2FA? Tài khoản sẽ kém an toàn hơn.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDisableDialog(false)}
                            className="border border-neutral-300 dark:border-neutral-600"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={disable2FA}
                            disabled={disabling}
                            className="bg-red-600 text-white hover:bg-red-700 border-0"
                        >
                            {disabling && <Loader2 className="size-4 animate-spin mr-2" />}
                            Xác nhận tắt
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
