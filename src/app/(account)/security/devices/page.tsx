'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Globe, Clock, CheckCircle2, LogOut, Loader2 } from 'lucide-react';
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
import EmptyState from '@/components/empty-state';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';

interface DeviceItem {
    id: string;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    location: string | null;
    lastActiveAt: string;
    isCurrent: boolean;
}

export default function DevicesPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t, locale } = useI18n();
    usePageTitle('devices.title');
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(false);
    const [revokeTarget, setRevokeTarget] = useState<DeviceItem | null>(null);

    const deviceIcons: Record<string, React.ReactNode> = {
        desktop: <Monitor className="size-5" />,
        mobile: <Smartphone className="size-5" />,
        tablet: <Tablet className="size-5" />,
    };

    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        const isVi = locale === 'vi';

        if (seconds < 60) return isVi ? `${seconds} giây trước` : `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return isVi ? `${minutes} phút trước` : `${minutes}m ago`;
        const hours = Math.floor(seconds / 3600);
        if (hours < 24) return isVi ? `${hours} giờ trước` : `${hours}h ago`;
        const days = Math.floor(seconds / 86400);
        if (days < 7) return isVi ? `${days} ngày trước` : `${days}d ago`;

        return new Date(dateStr).toLocaleDateString(isVi ? 'vi-VN' : 'en-US');
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/security/devices');
            return;
        }
        if (status === 'authenticated') {
            fetchDevices();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/account/devices');
            if (res.ok) {
                const data = await res.json();
                setDevices(data.devices || []);
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async () => {
        if (!revokeTarget) return;
        setRevoking(true);
        try {
            const res = await fetch(`/api/account/devices/${revokeTarget.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setDevices(prev => prev.filter(d => d.id !== revokeTarget.id));
                setRevokeTarget(null);
            }
        } catch {
            // silent
        } finally {
            setRevoking(false);
        }
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
                ← {t('devices.back')}
            </button>
            <PageHeader
                title={t('devices.title')}
                description={t('devices.description')}
            />

            <Card className="page-card overflow-hidden">
                <CardContent className="p-0">
                    {devices.length === 0 ? (
                        <EmptyState
                            icon={<Globe className="size-8" />}
                            title={t('devices.empty.title')}
                            description={t('devices.empty.description')}
                        />
                    ) : (
                        <div>
                            {devices.map(device => (
                                <div
                                    key={device.id}
                                    className={cn(
                                        'flex items-center gap-4 px-5 py-4',
                                        'border-b border-border/30 dark:border-white/[0.06] last:border-0',
                                        'transition-colors duration-100',
                                        'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                                    )}
                                >
                                    <div className="size-10 rounded-lg flex items-center justify-center bg-black/[0.05] dark:bg-white/[0.06] text-black/60 dark:text-white/60 flex-shrink-0">
                                        {deviceIcons[device.deviceType || 'desktop'] || <Globe className="size-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[15px] truncate text-black/90 dark:text-white/90">
                                                {device.deviceName || device.browser || t('devices.unknown')}
                                            </p>
                                            {device.isCurrent && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-black/[0.06] dark:bg-white/[0.08] text-black/70 dark:text-white/70">
                                                    <CheckCircle2 className="size-3" />
                                                    {t('devices.current')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-black/40 dark:text-white/40 mt-0.5">
                                            {[device.os, device.browser, device.location].filter(Boolean).join(' · ') || t('devices.unknown')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-[13px] text-black/40 dark:text-white/40">
                                            <Clock className="size-3.5" />
                                            {timeAgo(device.lastActiveAt)}
                                        </div>

                                        {!device.isCurrent && (
                                            <button
                                                onClick={() => setRevokeTarget(device)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-black/50 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 border border-black/10 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                                            >
                                                <LogOut className="size-3" />
                                                {t('devices.revoke')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Revoke Confirmation Dialog ── */}
            <Dialog open={!!revokeTarget} onOpenChange={(open) => {
                if (!open) setRevokeTarget(null);
            }}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {t('devices.revokeDialog.title')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            {t('devices.revokeDialog.description')} <span className="font-semibold text-foreground">{revokeTarget?.deviceName || revokeTarget?.browser || t('devices.unknown')}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-3 justify-end pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setRevokeTarget(null)}
                            className="border border-black/15 dark:border-white/15 bg-transparent"
                        >
                            {t('devices.revokeDialog.cancel')}
                        </Button>
                        <Button
                            type="button"
                            disabled={revoking}
                            onClick={handleRevoke}
                            className="font-semibold bg-red-600 text-white border border-red-600 hover:bg-red-700"
                        >
                            {revoking && <Loader2 className="size-4 animate-spin mr-2" />}
                            {t('devices.revokeDialog.confirm')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
