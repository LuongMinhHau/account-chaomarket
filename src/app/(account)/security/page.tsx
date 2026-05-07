'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';
import DevicesPanel from './_components/devices-panel';
import TwoFactorPanel from './_components/two-factor-panel';

type PasswordFormData = {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
};

interface AuditLog {
    action: string;
    ipAddress: string | null;
    createdAt: string;
}

type SecurityTab = 'password' | 'devices';

export default function SecurityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, locale } = useI18n();
    usePageTitle('security.title');

    const [activeTab, setActiveTab] = useState<SecurityTab>('devices');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    // ── OTP state ──
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSending, setOtpSending] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [pendingPasswordData, setPendingPasswordData] = useState<PasswordFormData | null>(null);

    const passwordSchema = z
        .object({
            currentPassword: z.string().min(1, t('security.validation.currentRequired')),
            newPassword: z.string()
                .min(8, t('security.validation.newMinLength'))
                .regex(/[A-Z]/, t('security.validation.newUppercase'))
                .regex(/[a-z]/, t('security.validation.newLowercase'))
                .regex(/[0-9]/, t('security.validation.newNumber'))
                .regex(/[^A-Za-z0-9]/, t('security.validation.newSpecial')),
            confirmNewPassword: z.string().min(1, t('security.validation.confirmRequired')),
        })
        .refine(data => data.newPassword === data.confirmNewPassword, {
            message: t('security.validation.confirmMismatch'),
            path: ['confirmNewPassword'],
        });

    const getActionLabel = (action: string): string => {
        const actionKey = `security.auditLog.actions.${action}`;
        const translated = t(actionKey);
        return translated === actionKey ? action : translated;
    };

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
    });

    useFormState({ control: form.control });
    const watchedFields = form.watch();
    const allFieldsFilled = Boolean(watchedFields.currentPassword && watchedFields.newPassword && watchedFields.confirmNewPassword);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/auth/login?callbackUrl=/security'); return; }
        if (status === 'authenticated') { fetchAuditLogs(); }
    }, [status]);

    const fetchAuditLogs = async () => {
        try {
            const res = await fetch('/api/account/security/audit-logs');
            if (res.ok) { const data = await res.json(); setAuditLogs(data.logs || []); }
        } catch {}
    };

    const onSubmit = async (data: PasswordFormData) => {
        setPendingPasswordData(data);
        setOtpSending(true); setOtpError('');
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, type: 'email', purpose: 'changePassword' }),
            });
            if (res.ok) { setOtpDialogOpen(true); setOtp(''); }
            else { form.setError('currentPassword', { message: t('security.otp.sendError') }); }
        } catch { form.setError('currentPassword', { message: t('security.changePassword.connectionError') }); }
        finally { setOtpSending(false); }
    };

    const handleOtpVerify = async () => {
        if (otp.length !== 6) { setOtpError(t('security.otp.lengthError')); return; }
        if (!pendingPasswordData) return;
        setSaving(true); setOtpError('');
        try {
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session?.user?.email, otp }),
            });
            if (!otpRes.ok) { const d = await otpRes.json(); setOtpError(d.error || t('security.otp.invalidCode')); return; }
            const res = await fetch('/api/account/security/change-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pendingPasswordData.currentPassword, newPassword: pendingPasswordData.newPassword }),
            });
            if (res.ok) {
                setOtpDialogOpen(false); setSuccessMessage(t('security.changePassword.success'));
                form.reset(); setPendingPasswordData(null); fetchAuditLogs();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else { const err = await res.json(); setOtpError(err.message || t('security.changePassword.error')); }
        } catch { setOtpError(t('security.changePassword.connectionError')); }
        finally { setSaving(false); }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>;
    }

    const tabs: { key: SecurityTab; label: string }[] = [
        { key: 'devices', label: t('security.tabs.devices') },
        { key: 'password', label: t('security.tabs.password') },
    ];

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader title={t('security.title')} description={t('security.description')} />

            {/* ── Tab Navigation ── */}
            <div className="flex border-b border-[var(--tab-separator)]">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'group/tab relative px-1 mr-12 pt-2 pb-0 text-[16px] cursor-pointer transition-colors duration-300',
                            activeTab === tab.key
                                ? 'text-[var(--tab-active-text)] font-[var(--tab-font-weight-active)]'
                                : 'text-[var(--tab-inactive-text)] font-[var(--tab-font-weight-inactive)] hover:text-[var(--tab-hover-text)]',
                        )}
                    >
                        <span className="relative inline-block pb-1">
                            {tab.label}
                            <span
                                className={cn(
                                    'absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-full rounded-full',
                                    'transition-opacity duration-300 ease-in-out',
                                    activeTab === tab.key ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100',
                                )}
                                style={{ backgroundColor: 'var(--tab-active-underline)' }}
                            />
                        </span>
                    </button>
                ))}
            </div>

            {/* ── Tab Content ── */}
            <div className="space-y-6">
                {activeTab === 'password' && (
                    <Card className="page-card">
                        <CardContent className="p-6">
                            {/* ── Change Password ── */}
                            <div className="space-y-5">
                                <div>
                                    <h3 className="text-[16px] font-semibold">{t('security.changePassword.title')}</h3>
                                    <p className="text-[13px] text-black/50 dark:text-white/50 mt-0.5">{t('security.changePassword.description')}</p>
                                </div>

                                {successMessage && (
                                    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 bg-muted/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <CheckCircle2 className="size-5 text-black/70 dark:text-white/70 flex-shrink-0" />
                                        <p className="text-sm font-medium text-brand-text dark:text-white">{successMessage}</p>
                                    </div>
                                )}

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="space-y-4 max-w-md">
                                        <FormField control={form.control} name="currentPassword" render={({ field }) => (
                                            <FormItem><FormControl>
                                                <FloatingLabelInput label={<span className="inline-flex items-center gap-1">{t('security.changePassword.currentPassword')}<button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="pointer-events-auto cursor-pointer inline-flex items-center">{showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></span>} className="app-text-input" type={showCurrentPassword ? 'text' : 'password'} {...field} />
                                            </FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="newPassword" render={({ field }) => (
                                            <FormItem><FormControl>
                                                <FloatingLabelInput label={<span className="inline-flex items-center gap-1">{t('security.changePassword.newPassword')}<button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="pointer-events-auto cursor-pointer inline-flex items-center">{showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></span>} className="app-text-input" type={showNewPassword ? 'text' : 'password'} {...field} />
                                            </FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="confirmNewPassword" render={({ field }) => (
                                            <FormItem><FormControl>
                                                <FloatingLabelInput label={<span className="inline-flex items-center gap-1">{t('security.changePassword.confirmPassword')}<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="pointer-events-auto cursor-pointer inline-flex items-center">{showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button></span>} className="app-text-input" type={showConfirmPassword ? 'text' : 'password'} {...field} />
                                            </FormControl><FormMessage /></FormItem>
                                        )} />
                                        </div>
                                        <div className="flex justify-center pt-5 gap-3">
                                            <Button type="button" variant="ghost" onClick={() => form.reset()} className="bg-transparent text-[14px] text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">{t('security.changePassword.cancel')}</Button>
                                            <Button type="submit" disabled={!allFieldsFilled || saving || otpSending} className={cn('font-semibold h-10 px-5 text-[14px] border transition-all duration-300', allFieldsFilled && !saving && !otpSending ? 'bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white border-neutral-400 dark:border-neutral-600 cursor-not-allowed opacity-100')}>
                                                {(saving || otpSending) && <Loader2 className="size-4 animate-spin mr-2" />}
                                                {t('security.changePassword.submit')}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>

                            {/* ── Divider ── */}
                            <div className="border-t border-border/30 dark:border-white/[0.06] my-6" />

                            {/* ── 2FA Section (inline) ── */}
                            <TwoFactorPanel />
                        </CardContent>
                    </Card>
                )}

                {/* Devices Tab */}
                {activeTab === 'devices' && <DevicesPanel auditLogs={auditLogs} getActionLabel={getActionLabel} formatDate={formatDate} />}
            </div>

            {/* ── OTP Dialog ── */}
            <Dialog open={otpDialogOpen} onOpenChange={(open) => { setOtpDialogOpen(open); if (!open) { setOtp(''); setOtpError(''); } }}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">{t('security.otp.title')}</DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            {t('security.otp.description')} <span className="font-semibold text-foreground">{session?.user?.email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="flex justify-center">
                            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                <InputOTPGroup>
                                    {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="w-11 h-12 text-lg font-semibold border-input" />)}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        {otpError && <p className="text-sm text-red-500 font-medium text-center">{otpError}</p>}
                        <div className="flex gap-3 justify-end pt-1">
                            <Button type="button" variant="ghost" onClick={() => { setOtpDialogOpen(false); setOtp(''); setOtpError(''); }} className="border border-black/15 dark:border-white/15 bg-transparent">{t('security.otp.cancel')}</Button>
                            <Button type="button" disabled={saving} onClick={handleOtpVerify} className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90">
                                {saving && <Loader2 className="size-4 animate-spin mr-2" />} {t('security.otp.confirm')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
