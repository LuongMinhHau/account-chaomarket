'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Shield,
    Download,
    Trash2,
    Link2,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';

import { useI18n } from '@/context/i18n/context';

interface PrivacyData {
    linkedProviders: string[];
    hasPassword: boolean;
    dataSummary: {
        email: string;
        name: string | null;
        phone: string | null;
        memberSince: string;
        emailVerified: boolean;
    };
}

const providerLabels: Record<string, { name: string; icon: string; color: string }> = {
    google: { name: 'Google', icon: '/img/google.svg', color: 'border-blue-500/30 bg-blue-500/5' },
    credentials: { name: 'Email & Password', icon: '', color: 'border-emerald-500/30 bg-emerald-500/5' },
};

export default function PrivacyPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t, locale } = useI18n();
    const [data, setData] = useState<PrivacyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [_deleteError, setDeleteError] = useState('');

    const handleDeleteAccount = async () => {
        setDeleting(true);
        setDeleteError('');
        try {
            const res = await fetch('/api/account/delete', { method: 'DELETE' });
            if (res.ok) {
                setShowDeleteDialog(false);
                await signOut({ callbackUrl: '/auth/login' });
            } else {
                const data = await res.json();
                setDeleteError(data.message || t('privacyPage.deleteAccount.error'));
            }
        } catch {
            setDeleteError(t('privacyPage.deleteAccount.error'));
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/privacy');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/privacy')
                .then(r => r.json())
                .then(setData)
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const handleExportData = async () => {
        setDownloading(true);
        try {
            const res = await fetch('/api/account/privacy');
            const json = await res.json();
            const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chao-account-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // silent
        } finally {
            setDownloading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    const providers = data?.linkedProviders || [];
    const hasCredentials = data?.hasPassword;

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title={t('privacyPage.title')}
                description={t('privacyPage.description')}
            />

            {/* Connected Sign-in Methods */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Link2 className="w-5 h-5 text-[var(--brand-color)]" />
                        <h3 className="text-lg font-semibold">{t('privacyPage.signInMethods.title')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('privacyPage.signInMethods.description')}
                    </p>

                    <div className="space-y-3">
                        {/* Credentials */}
                        <div className={cn(
                            'flex items-center justify-between p-4 rounded-xl border',
                            hasCredentials
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-neutral-300 dark:border-neutral-700 bg-transparent',
                        )}>
                            <div className="flex items-center gap-3">
                                <Shield className="size-8 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="font-semibold text-[15px]">{t('privacyPage.signInMethods.emailPassword')}</p>
                                    <p className="text-[13px] text-muted-foreground">
                                        {data?.dataSummary?.email}
                                    </p>
                                </div>
                            </div>
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[13px] font-medium',
                                hasCredentials ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                            )}>
                                {hasCredentials
                                    ? <><CheckCircle2 className="size-3.5" /> {t('privacyPage.signInMethods.setup')}</>
                                    : t('privacyPage.signInMethods.notSetup')
                                }
                            </span>
                        </div>

                        {/* OAuth Providers */}
                        {providers.filter(p => p !== 'credentials').map(provider => {
                            const cfg = providerLabels[provider] || { name: provider, icon: '', color: '' };
                            return (
                                <div
                                    key={provider}
                                    className={cn(
                                        'flex items-center justify-between p-4 rounded-xl border',
                                        cfg.color || 'border-border',
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {cfg.icon ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={cfg.icon} alt={cfg.name} className="size-8" />
                                        ) : (
                                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                {cfg.name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-[15px]">{cfg.name}</p>
                                            <p className="text-[13px] text-muted-foreground">{t('privacyPage.signInMethods.loginWith')} {cfg.name}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 dark:text-blue-400">
                                        <CheckCircle2 className="size-3.5" /> {t('privacyPage.signInMethods.linked')}
                                    </span>
                                </div>
                            );
                        })}

                        {providers.length === 0 && !hasCredentials && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                {t('privacyPage.signInMethods.noMethods')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Summary */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-[var(--brand-color)]" />
                        <h3 className="text-lg font-semibold">{t('privacyPage.yourData.title')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('privacyPage.yourData.description')}
                    </p>

                    <div className="divide-y divide-border/50 mb-5">
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">{t('privacyPage.yourData.fullName')}</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">{t('privacyPage.yourData.email')}</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">{t('privacyPage.yourData.phone')}</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">{t('privacyPage.yourData.memberSince')}</span>
                            <span className="text-[14px] font-medium">
                                {data?.dataSummary?.memberSince
                                    ? new Date(data.dataSummary.memberSince).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">{t('privacyPage.yourData.emailVerified')}</span>
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[14px] font-medium',
                                data?.dataSummary?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600',
                            )}>
                                {data?.dataSummary?.emailVerified
                                    ? <><CheckCircle2 className="size-3.5" /> {t('privacyPage.yourData.verified')}</>
                                    : <><AlertTriangle className="size-3.5" /> {t('privacyPage.yourData.notVerified')}</>
                                }
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleExportData}
                        disabled={downloading}
                        className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                    >
                        {downloading
                            ? <><Loader2 className="size-4 animate-spin mr-2" /> {t('privacyPage.exportData.downloading')}</>
                            : <><Download className="size-4 mr-2" /> {t('privacyPage.exportData.button')}</>
                        }
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="page-card border-red-500/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{t('privacyPage.deleteAccount.title')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('privacyPage.deleteAccount.description')}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    >
                        <Trash2 className="size-4 mr-2" />
                        {t('privacyPage.deleteAccount.button')}
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            {t('privacyPage.deleteAccount.dialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[15px] mt-2">
                            {t('privacyPage.deleteAccount.dialogDescription')} <a href="mailto:support@chaomarket.com" className="text-[var(--brand-color)] font-semibold hover:underline">support@chaomarket.com</a> {t('privacyPage.deleteAccount.dialogContact')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end pt-1">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={deleting}
                            className="bg-transparent text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        >
                            {t('privacyPage.deleteAccount.dialogCancel')}
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="bg-red-600 text-white hover:bg-red-700 border-0"
                        >
                            {deleting && <Loader2 className="size-4 animate-spin mr-2" />}
                            {t('privacyPage.deleteAccount.dialogConfirm')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
