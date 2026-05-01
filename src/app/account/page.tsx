'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
    User,
    Shield,
    Bell,
    ClipboardList,
    ChevronRight,
    CheckCircle2,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/context/i18n/context';

// ── Quick Action Card ──
function QuickCard({
    href,
    icon,
    title,
    description,
    color,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}) {
    return (
        <Link
            href={href}
            className="stagger-item group flex items-start gap-4 p-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] hover:border-black/[0.18] dark:hover:border-white/[0.18] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
            <div className={cn(
                'flex-shrink-0 size-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg',
                color,
            )}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[15px] text-foreground group-hover:text-[var(--brand-color)] transition-colors">
                    {title}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1">
                    {description}
                </p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-[var(--brand-color)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
        </Link>
    );
}

// ── Security Status Item ──
function SecurityItem({
    label,
    status,
    statusLabel,
}: {
    label: string;
    status: 'good' | 'warning';
    statusLabel: string;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-[14px] text-foreground">{label}</span>
            <span className={cn(
                'inline-flex items-center gap-1.5 text-[13px] font-medium px-2.5 py-1 rounded-full',
                status === 'good'
                    ? 'text-green-600 dark:text-green-400 bg-green-500/10'
                    : 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
            )}>
                {status === 'good'
                    ? <CheckCircle2 className="size-3.5" />
                    : <AlertTriangle className="size-3.5" />
                }
                {statusLabel}
            </span>
        </div>
    );
}

export default function AccountDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = useState(0);
    const [deviceCount, setDeviceCount] = useState(0);
    const [hasPassword, setHasPassword] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account');
            return;
        }
        if (status === 'authenticated') {
            // Track device (fire & forget)
            fetch('/api/account/track-device', { method: 'POST' }).catch(() => {});

            // Fetch unread notification count
            fetch('/api/account/notifications')
                .then(r => r.json())
                .then(data => {
                    const notifications = data.notifications || [];
                    setUnreadCount(notifications.filter((n: { isRead: boolean }) => !n.isRead).length);
                })
                .catch(() => {});

            // Fetch device count
            fetch('/api/account/devices')
                .then(r => r.json())
                .then(data => setDeviceCount((data.devices || []).length))
                .catch(() => {});

            // Fetch security info
            fetch('/api/account/privacy')
                .then(r => r.json())
                .then(data => setHasPassword(data.hasPassword ?? true))
                .catch(() => {});
        }
    }, [status]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    const user = session?.user;
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title={`${t('account.dashboard.greeting')} ${user?.name || 'User'}`}
                description={t('account.dashboard.manageDescription')}
            />

            {/* Welcome Header */}
            <Card className="page-card overflow-hidden">
                <CardContent className="p-0">
                    {/* Gradient banner */}
                    <div className="h-20 bg-gradient-to-r from-[var(--brand-color)]/20 via-[var(--brand-color)]/10 to-transparent dark:from-[var(--brand-color)]/10 dark:via-[var(--brand-color)]/5" />
                    <div className="px-6 pb-6 -mt-8">
                        <div className="flex items-end gap-4">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt="Avatar"
                                    className="size-16 rounded-full object-cover border-3 border-background shadow-lg ring-2 ring-[var(--brand-color)]/30"
                                />
                            ) : (
                                <div className="size-16 rounded-full bg-gradient-to-br from-[var(--brand-color)] to-[var(--brand-color-foreground)] flex items-center justify-center text-black font-bold text-xl border-3 border-background shadow-lg">
                                    {initials}
                                </div>
                            )}
                            <div className="pb-0.5">
                                <h2 className="text-lg font-bold text-foreground">
                                    {user?.name || 'User'}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Overview */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-[var(--brand-color)]" />
                            <h2 className="text-lg font-semibold">{t('account.dashboard.securityOverview')}</h2>
                        </div>
                        <Link
                            href="/account/security"
                            className="text-[13px] font-medium text-[var(--brand-color)] hover:underline"
                        >
                            {t('account.dashboard.viewDetails')}
                        </Link>
                    </div>
                    <div className="divide-y divide-border/30">
                        <SecurityItem
                            label={t('account.dashboard.password')}
                            status={hasPassword ? 'good' : 'warning'}
                            statusLabel={hasPassword ? t('account.dashboard.statusSet') : t('account.dashboard.statusNotSet')}
                        />
                        <SecurityItem
                            label={t('account.dashboard.emailVerification')}
                            status={user?.email ? 'good' : 'warning'}
                            statusLabel={user?.email ? t('account.dashboard.statusVerified') : t('account.dashboard.statusNotVerified')}
                        />
                        <SecurityItem
                            label={t('account.dashboard.twoFactor')}
                            status="warning"
                            statusLabel={t('account.dashboard.statusOff')}
                        />
                        <SecurityItem
                            label={t('account.dashboard.activeDevices')}
                            status={deviceCount > 0 ? 'good' : 'warning'}
                            statusLabel={deviceCount > 0 ? t('account.dashboard.deviceCount').replace('{count}', String(deviceCount)) : t('account.dashboard.noData')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-semibold">{t('account.dashboard.quickAccess')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <QuickCard
                            href="/account/profile"
                            icon={<User className="size-5" />}
                            title={t('account.profile')}
                            description={t('account.dashboard.profileDesc')}
                            color="from-blue-500 to-blue-600"
                        />
                        <QuickCard
                            href="/account/notifications"
                            icon={<Bell className="size-5" />}
                            title={`${t('account.notification')}${unreadCount > 0 ? ` (${unreadCount} ${t('common.new')})` : ''}`}
                            description={t('account.dashboard.notificationDesc')}
                            color="from-amber-500 to-orange-500"
                        />
                        <QuickCard
                            href="/account/security"
                            icon={<Shield className="size-5" />}
                            title={t('account.security')}
                            description={t('account.dashboard.securityDesc')}
                            color="from-emerald-500 to-emerald-600"
                        />
                        <QuickCard
                            href="/account/orders"
                            icon={<ClipboardList className="size-5" />}
                            title={t('account.orderHistory')}
                            description={t('account.dashboard.ordersDesc')}
                            color="from-cyan-500 to-cyan-600"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
