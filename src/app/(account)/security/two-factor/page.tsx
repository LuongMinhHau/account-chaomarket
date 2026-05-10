'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Copy,
    Download,
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
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';

import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';

type Step = 'status' | 'qr' | 'verify' | 'backup' | 'done';

export default function TwoFactorPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useI18n();
    usePageTitle('twoFactor.title');

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
            router.push('/auth/login?callbackUrl=/security/two-factor');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setError(t('twoFactor.setup.qrError'));
        }
    };

    const verifyAndEnable = async () => {
        if (verifyCode.length !== 6) {
            setError(t('twoFactor.setup.codeLength'));
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
                setError(data.message || t('twoFactor.setup.invalidCode'));
            }
        } catch {
            setError(t('twoFactor.setup.verifyError'));
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
        const text = `Chào Account — Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n${t('twoFactor.backup.saveNote')}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chao-account-backup-codes.txt';
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
        <div className="w-full h-full mx-auto space-y-4">
            <button
                onClick={() => router.back()}
                className="text-[13px] font-medium text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer"
            >
                ← {t('twoFactor.back')}
            </button>
            <PageHeader
                title={t('twoFactor.title')}
            />

            <Card className="page-card">
                <CardContent className="p-6">

                    {/* Status: Not enabled */}
                    {step === 'status' && !enabled && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                                <div className="size-10 rounded-lg flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] text-black/60 dark:text-white/60 flex-shrink-0">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">{t('twoFactor.status.disabled')}</p>
                                    <p className="text-[13px] text-black/50 dark:text-white/50">
                                        {t('twoFactor.status.disabledDescription')}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={startSetup}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                            >
                                <ShieldCheck className="size-4 mr-2" />
                                {t('twoFactor.setup.enable')}
                            </Button>
                        </div>
                    )}

                    {/* QR Code Step */}
                    {step === 'qr' && (
                        <div className="space-y-5">
                            <p className="text-[14px] text-black/60 dark:text-white/60">
                                {t('twoFactor.setup.scanQr')}
                            </p>

                            {qrCode ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-4 rounded-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                    </div>

                                    <div className="w-full max-w-sm">
                                        <p className="text-[13px] text-black/40 dark:text-white/40 mb-1.5">
                                            {t('twoFactor.setup.manualEntry')}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-lg text-[13px] font-mono truncate text-black/80 dark:text-white/80">
                                                {secret}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={copySecret}
                                                className="flex-shrink-0 border-black/15 dark:border-white/15"
                                            >
                                                <Copy className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="size-8 animate-spin text-black/30 dark:text-white/30" />
                                </div>
                            )}

                            <Button
                                onClick={() => { setStep('verify'); setError(''); }}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg"
                            >
                                {t('twoFactor.setup.continue')}
                            </Button>
                        </div>
                    )}

                    {/* Verify Code Step */}
                    {step === 'verify' && (
                        <div className="space-y-5">
                            <p className="text-[14px] text-black/60 dark:text-white/60">
                                {t('twoFactor.setup.enterCode')}
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
                                            : 'border-black/15 dark:border-white/15 focus:border-black/40 dark:focus:border-white/40',
                                    )}
                                    autoFocus
                                />

                                {error && (
                                    <p className="text-[13px] text-red-500 text-center">{error}</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setStep('qr'); setError(''); setVerifyCode(''); }}
                                    className="flex-1 border border-black/15 dark:border-white/15 bg-transparent"
                                >
                                    {t('twoFactor.setup.back')}
                                </Button>
                                <Button
                                    onClick={verifyAndEnable}
                                    disabled={verifyCode.length !== 6 || verifying}
                                    className={cn(
                                        'flex-1 font-semibold rounded-lg transition-all duration-300',
                                        verifyCode.length === 6 && !verifying
                                            ? 'bg-[var(--brand-color)] text-black hover:bg-[var(--brand-color)]/90'
                                            : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white cursor-not-allowed',
                                    )}
                                >
                                    {verifying ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                    {t('twoFactor.setup.confirm')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Backup Codes Step */}
                    {step === 'backup' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
                                <CheckCircle2 className="size-5 text-black dark:text-[var(--brand-color)] flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">
                                        {t('twoFactor.backup.success')}
                                    </p>
                                    <p className="text-[13px] text-black/50 dark:text-white/50">
                                        {t('twoFactor.backup.saveNote')}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                                {backupCodes.map((code, i) => (
                                    <div
                                        key={i}
                                        className="font-mono text-[13px] px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-center text-black/80 dark:text-white/80"
                                    >
                                        {code}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))}
                                    className="flex-1 border-black/15 dark:border-white/15"
                                >
                                    <Copy className="size-4 mr-2" />
                                    {t('twoFactor.backup.copy')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={downloadBackupCodes}
                                    className="flex-1 border-black/15 dark:border-white/15"
                                >
                                    <Download className="size-4 mr-2" />
                                    {t('twoFactor.backup.download')}
                                </Button>
                            </div>

                            <Button
                                onClick={() => setStep('done')}
                                className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg"
                            >
                                {t('twoFactor.backup.done')}
                            </Button>
                        </div>
                    )}

                    {/* Done / Enabled State */}
                    {step === 'done' && enabled && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
                                <CheckCircle2 className="size-5 text-black dark:text-[var(--brand-color)] flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">
                                        {t('twoFactor.status.enabled')}
                                    </p>
                                    <p className="text-[13px] text-black/50 dark:text-white/50">
                                        {t('twoFactor.status.enabledDescription')}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setShowDisableDialog(true)}
                                className="border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                            >
                                {t('twoFactor.disable.button')}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Disable Dialog */}
            <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold flex items-center gap-2">
                            <AlertTriangle className="size-5 text-black/60 dark:text-white/60" />
                            {t('twoFactor.disable.title')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] mt-2 text-black/60 dark:text-white/60">
                            {t('twoFactor.disable.description')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDisableDialog(false)}
                            className="border border-black/15 dark:border-white/15 bg-transparent"
                        >
                            {t('twoFactor.disable.cancel')}
                        </Button>
                        <Button
                            onClick={disable2FA}
                            disabled={disabling}
                            className="bg-[var(--brand-color)] text-black font-semibold hover:bg-[var(--brand-color)]/90 border-0"
                        >
                            {disabling && <Loader2 className="size-4 animate-spin mr-2" />}
                            {t('twoFactor.disable.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
