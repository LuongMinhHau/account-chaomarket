'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Copy, Download, Loader2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/context/i18n/context';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type Step = 'status' | 'qr' | 'verify' | 'backup' | 'done';

export default function TwoFactorPanel() {
    const { t } = useI18n();
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

    // Login verification state
    const [loginVerification, setLoginVerification] = useState(false);
    const [lvToggling, setLvToggling] = useState(false);
    const [lvOtpDialog, setLvOtpDialog] = useState(false);
    const [lvOtp, setLvOtp] = useState('');
    const [lvOtpError, setLvOtpError] = useState('');
    const [lvOtpSending, setLvOtpSending] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        Promise.all([
            fetch('/api/account/two-factor').then(r => r.json()),
            fetch('/api/account/security/login-verification').then(r => r.json()),
        ])
            .then(([tfData, lvData]) => {
                setEnabled(tfData.enabled); setStep(tfData.enabled ? 'done' : 'status');
                setLoginVerification(lvData.enabled);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Start OTP flow for login verification toggle
    const startLvToggle = async () => {
        setLvOtpSending(true); setLvOtpError('');
        try {
            await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, type: 'email', purpose: 'loginVerification' }),
            });
            setLvOtp(''); setLvOtpDialog(true);
        } catch { setLvOtpError(t('security.otp.sendError')); }
        finally { setLvOtpSending(false); }
    };

    // Verify OTP then toggle
    const confirmLvToggle = async () => {
        if (lvOtp.length !== 6) { setLvOtpError(t('security.otp.lengthError')); return; }
        setLvToggling(true); setLvOtpError('');
        try {
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, otp: lvOtp }),
            });
            if (!otpRes.ok) { const d = await otpRes.json(); setLvOtpError(d.error || t('security.otp.invalidCode')); return; }

            const res = await fetch('/api/account/security/login-verification', { method: 'PUT' });
            const data = await res.json();
            setLoginVerification(data.enabled);
            setLvOtpDialog(false);
        } catch { setLvOtpError(t('security.changePassword.connectionError')); }
        finally { setLvToggling(false); }
    };

    const startSetup = async () => {
        setStep('qr'); setError('');
        try {
            const res = await fetch('/api/account/two-factor', { method: 'POST' });
            const data = await res.json();
            setQrCode(data.qrCode); setSecret(data.secret);
        } catch { setError(t('twoFactor.setup.qrError')); }
    };

    const verifyAndEnable = async () => {
        if (verifyCode.length !== 6) { setError(t('twoFactor.setup.codeLength')); return; }
        setVerifying(true); setError('');
        try {
            const res = await fetch('/api/account/two-factor', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: verifyCode }),
            });
            const data = await res.json();
            if (res.ok) { setBackupCodes(data.backupCodes); setEnabled(true); setStep('backup'); }
            else { setError(data.message || t('twoFactor.setup.invalidCode')); }
        } catch { setError(t('twoFactor.setup.verifyError')); }
        finally { setVerifying(false); }
    };

    const disable2FA = async () => {
        setDisabling(true);
        try { await fetch('/api/account/two-factor', { method: 'DELETE' }); setEnabled(false); setStep('status'); setShowDisableDialog(false); }
        catch {} finally { setDisabling(false); }
    };

    const downloadBackupCodes = () => {
        const text = `Chào Account — Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n${t('twoFactor.backup.saveNote')}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'chao-account-backup-codes.txt'; a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex justify-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <>
            {/* ── Login Verification Row (Email) ── */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="size-10 rounded-lg flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] text-black/60 dark:text-white/60 flex-shrink-0">
                    <Mail className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">{t('loginVerification.title')}</p>
                    <p className="text-[13px] text-black/50 dark:text-white/50">
                        {loginVerification ? t('loginVerification.enabledDescription') : t('loginVerification.disabledDescription')}
                    </p>
                </div>
                <button
                    onClick={startLvToggle}
                    disabled={lvOtpSending}
                    className={cn(
                        'flex-shrink-0 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer disabled:opacity-50',
                        loginVerification
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85'
                            : 'border border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white'
                    )}
                >
                    {lvOtpSending ? <Loader2 className="size-4 animate-spin" /> : loginVerification ? t('loginVerification.disabled') : t('loginVerification.enabled')}
                </button>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-border/30 dark:border-white/[0.06] my-4" />

            {/* ── 2FA (Authenticator App) ── */}
            <div>
                    {step === 'status' && !enabled && (
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                            <div className="size-10 rounded-lg flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] text-black/60 dark:text-white/60 flex-shrink-0">
                                <ShieldCheck className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">{t('twoFactor.status.disabled')}</p>
                                <p className="text-[13px] text-black/50 dark:text-white/50">{t('twoFactor.status.disabledDescription')}</p>
                            </div>
                            <button onClick={startSetup} className="flex-shrink-0 px-4 py-1.5 rounded-lg text-[13px] font-medium border border-black/15 dark:border-white/15 text-black/50 dark:text-white/50 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white transition-all cursor-pointer">
                                {t('twoFactor.setup.enable')}
                            </button>
                        </div>
                    )}

                    {step === 'qr' && (
                        <div className="space-y-5">
                            <p className="text-[14px] text-black/60 dark:text-white/60">{t('twoFactor.setup.scanQr')}</p>
                            {qrCode ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-4 rounded-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="w-full max-w-sm">
                                        <p className="text-[13px] text-black/40 dark:text-white/40 mb-1.5">{t('twoFactor.setup.manualEntry')}</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-lg text-[13px] font-mono truncate text-black/80 dark:text-white/80">{secret}</code>
                                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(secret)} className="flex-shrink-0 border-black/15 dark:border-white/15">
                                                <Copy className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center py-8"><Loader2 className="size-8 animate-spin text-black/30 dark:text-white/30" /></div>
                            )}
                            <div className="flex justify-center gap-3">
                                <Button variant="ghost" onClick={() => setStep('status')} className="border border-black/15 dark:border-white/15 bg-transparent">
                                    {t('twoFactor.setup.back')}
                                </Button>
                                <Button onClick={() => { setStep('verify'); setError(''); }} className="px-8 font-semibold rounded-lg transition-all duration-300 bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105">
                                    {t('twoFactor.setup.continue')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="space-y-5">
                            <p className="text-[14px] text-black/60 dark:text-white/60">{t('twoFactor.setup.enterCode')}</p>
                            <div className="max-w-xs mx-auto space-y-3">
                                <input type="text" inputMode="numeric" maxLength={6} value={verifyCode}
                                    onChange={e => { setVerifyCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                                    placeholder="000000"
                                    className={cn(
                                        'w-full text-center text-3xl font-mono tracking-[0.5em] py-4 px-3',
                                        'bg-transparent border rounded-xl outline-none transition-all',
                                        error ? 'border-red-500 text-red-500' : 'border-black/15 dark:border-white/15 focus:border-black/40 dark:focus:border-white/40',
                                    )}
                                    autoFocus
                                />
                                {error && <p className="text-[13px] text-red-500 text-center">{error}</p>}
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button variant="ghost" onClick={() => { setStep('qr'); setError(''); setVerifyCode(''); }} className="border border-black/15 dark:border-white/15 bg-transparent">
                                    {t('twoFactor.setup.back')}
                                </Button>
                                <Button onClick={verifyAndEnable} disabled={verifyCode.length !== 6 || verifying}
                                    className={cn('font-semibold rounded-lg px-8 transition-all duration-300',
                                        verifyCode.length === 6 && !verifying
                                            ? 'bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105'
                                            : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white cursor-not-allowed',
                                    )}>
                                    {verifying ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                                    {t('twoFactor.setup.confirm')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'backup' && (
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/50">
                                <CheckCircle2 className="size-5 text-black/70 dark:text-white/70 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">{t('twoFactor.backup.success')}</p>
                                    <p className="text-[13px] text-black/50 dark:text-white/50">{t('twoFactor.backup.saveNote')}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10">
                                {backupCodes.map((code, i) => (
                                    <div key={i} className="font-mono text-[13px] px-3 py-2 rounded-lg bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-center text-black/80 dark:text-white/80">{code}</div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => navigator.clipboard.writeText(backupCodes.join('\n'))} className="flex-1 border-black/15 dark:border-white/15">
                                    <Copy className="size-4 mr-2" /> {t('twoFactor.backup.copy')}
                                </Button>
                                <Button variant="outline" onClick={downloadBackupCodes} className="flex-1 border-black/15 dark:border-white/15">
                                    <Download className="size-4 mr-2" /> {t('twoFactor.backup.download')}
                                </Button>
                            </div>
                            <div className="flex justify-center">
                                <Button onClick={() => setStep('done')} className="px-8 font-semibold rounded-lg transition-all duration-300 bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105">{t('twoFactor.backup.done')}</Button>
                            </div>
                        </div>
                    )}

                    {step === 'done' && enabled && (
                        <div className="flex items-center gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                            <div className="size-10 rounded-lg flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] text-black/60 dark:text-white/60 flex-shrink-0">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-[15px] text-black/90 dark:text-white/90">{t('twoFactor.status.enabled')}</p>
                                <p className="text-[13px] text-black/50 dark:text-white/50">{t('twoFactor.status.enabledDescription')}</p>
                            </div>
                            <button onClick={() => setShowDisableDialog(true)} className="flex-shrink-0 px-4 py-1.5 rounded-lg text-[13px] font-medium bg-black dark:bg-white text-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 transition-all cursor-pointer">
                                {t('twoFactor.disable.button')}
                            </button>
                        </div>
                    )}
            </div>

            <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold flex items-center gap-2">
                            <AlertTriangle className="size-5 text-black/60 dark:text-white/60" /> {t('twoFactor.disable.title')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] mt-2 text-black/60 dark:text-white/60">{t('twoFactor.disable.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end pt-1">
                        <Button variant="ghost" onClick={() => setShowDisableDialog(false)} className="border border-black/15 dark:border-white/15 bg-transparent">{t('twoFactor.disable.cancel')}</Button>
                        <Button onClick={disable2FA} disabled={disabling} className="bg-black dark:bg-white text-white dark:text-black font-semibold hover:bg-black/90 dark:hover:bg-white/90 border-0">
                            {disabling && <Loader2 className="size-4 animate-spin mr-2" />} {t('twoFactor.disable.confirm')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Login Verification OTP Dialog ── */}
            <Dialog open={lvOtpDialog} onOpenChange={(v) => { if (!v) { setLvOtpDialog(false); setLvOtp(''); setLvOtpError(''); } }}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {loginVerification ? t('loginVerification.otp.disableTitle') : t('loginVerification.otp.enableTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            {loginVerification ? t('loginVerification.otp.disableDescription') : t('loginVerification.otp.enableDescription')}{' '}
                            <span className="font-semibold text-foreground">{session?.user?.email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={lvOtp} onChange={value => { setLvOtp(value); setLvOtpError(''); }}>
                                <InputOTPGroup>
                                    {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="w-11 h-12 text-lg font-semibold border-input" />)}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {lvOtpError && <p className="text-sm text-red-500 font-medium text-center">{lvOtpError}</p>}
                        <div className="flex gap-3 justify-end pt-1">
                            <Button type="button" variant="ghost" onClick={() => { setLvOtpDialog(false); setLvOtp(''); setLvOtpError(''); }} className="border border-black/15 dark:border-white/15 bg-transparent">{t('loginVerification.otp.cancel')}</Button>
                            <Button type="button" disabled={lvOtp.length !== 6 || lvToggling} onClick={confirmLvToggle} className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90">
                                {lvToggling && <Loader2 className="size-4 animate-spin mr-2" />} {t('loginVerification.otp.confirm')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
