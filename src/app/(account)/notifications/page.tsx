'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Shield, Settings, ShoppingBag, Info, Star, Filter, ChevronDown, MailOpen, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';

import { type NotificationItem, type NotificationFilter, ITEMS_PER_PAGE, useTypeConfig, useTimeAgo } from './_components/notification-types';
import { NotificationRow, NotificationCard } from './_components/notification-items';


export default function NotificationsPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useI18n();
    usePageTitle('account.notification');
    const typeConfig = useTypeConfig();
    const timeAgo = useTimeAgo();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null);
    const [filter, setFilter] = useState<NotificationFilter>('all');
    const originalReadState = useRef<Record<string, boolean>>({});
    const [showUnread, setShowUnread] = useState(ITEMS_PER_PAGE);
    const [showRead, setShowRead] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/notifications');
            return;
        }
        if (status === 'authenticated') {
            fetchNotifications();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/account/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch {
            // Network error — show empty state
        } finally {
            setLoading(false);
        }
    };

    const isVisuallyUnread = (n: NotificationItem) =>
        n.id in originalReadState.current
            ? !originalReadState.current[n.id]
            : !n.isRead;

    const handleClick = useCallback((n: NotificationItem) => {
        originalReadState.current[n.id] = true;
        // Optimistic UI update — mark as read immediately
        setNotifications(prev =>
            prev.map(item =>
                item.id === n.id ? { ...item, isRead: true } : item
            )
        );
        if (!n.isRead) {
            fetch('/api/account/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [n.id] }),
            });
        }
        setViewingNotification(n);
    }, []);

    const handleToggleStar = useCallback((n: NotificationItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStarred = !n.isStarred;

        // Optimistic update
        setNotifications(prev =>
            prev.map(item =>
                item.id === n.id ? { ...item, isStarred: newStarred } : item
            )
        );

        // API call
        fetch('/api/account/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toggleStar: true,
                notificationId: n.id,
                isStarred: newStarred,
            }),
        });
    }, []);

    // Apply filter
    const filtered = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => isVisuallyUnread(n))
            : filter === 'read'
                ? notifications.filter(n => !isVisuallyUnread(n))
                : filter === 'starred'
                    ? notifications.filter(n => n.isStarred)
                    : notifications.filter(n => n.type === filter);

    const unreadList = filtered.filter(n => isVisuallyUnread(n));
    const readList = filtered.filter(n => !isVisuallyUnread(n));

    type FilterKey = typeof filter;
    const filterOptions: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: t('notifications.filter.all'), icon: <Filter className="size-3.5 text-current" /> },
        { key: 'unread', label: t('notifications.unread'), icon: <MailOpen className="size-3.5 text-current" /> },
        { key: 'read', label: t('notifications.read'), icon: <MailCheck className="size-3.5 text-current" /> },
        { key: 'starred', label: t('notifications.filter.starred'), icon: <Star className="size-3.5 text-current" /> },
        { key: 'security', label: t('notifications.type.security'), icon: <Shield className="size-3.5 text-current" /> },
        { key: 'system', label: t('notifications.type.system'), icon: <Settings className="size-3.5 text-current" /> },
        { key: 'account', label: t('notifications.type.account'), icon: <Info className="size-3.5 text-current" /> },
        { key: 'order', label: t('notifications.type.order'), icon: <ShoppingBag className="size-3.5 text-current" /> },
    ];

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-4">
            <PageHeader
                title={t('account.notification')}
                description={t('account.dashboard.notificationDesc')}
            />

            <div className="flex items-center justify-between">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-semibold cursor-pointer',
                                'border border-black/15 dark:border-white/15',
                                'bg-transparent',
                                'focus:outline-none',
                                'transition-all duration-300 ease-in-out',
                                filter === 'all'
                                    ? 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
                                    : 'text-black dark:text-white',
                            )}
                        >
                            {filterOptions.find(o => o.key === filter)?.label}
                            <ChevronDown className={cn(
                                'size-3 transition-transform duration-200 text-current',
                                'group-data-[state=open]:rotate-180',
                            )} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="min-w-[160px] bg-brand-dropdown border-black/10 dark:border-white/10"
                    >
                        {filterOptions.map(opt => (
                            <DropdownMenuItem
                                key={opt.key}
                                onClick={() => { setFilter(opt.key); setShowUnread(ITEMS_PER_PAGE); setShowRead(ITEMS_PER_PAGE); }}
                                className={cn(
                                    'text-[13px] cursor-pointer gap-2',
                                    'hover:bg-transparent! focus:bg-transparent!',
                                    'transition-colors! duration-200 ease-in-out',
                                    filter === opt.key
                                        ? 'font-semibold text-black dark:text-white'
                                        : 'font-normal text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white',
                                )}
                            >
                                {opt.icon}
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[14px] text-black/80 dark:text-white/80">
                    {filtered.length} {t('account.notification').toLowerCase()}
                </span>
            </div>

            <Card className="page-card overflow-hidden">
                <CardContent className="p-0">
                    {/* Table Header (Desktop only) */}
                    <div className="hidden md:flex items-center gap-3 px-3 py-2.5 border-b border-border/40 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
                        <div className="flex-shrink-0" style={{ width: '20px' }} />
                        <div
                            className="grid flex-1 min-w-0 items-center"
                            style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 4fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0 16px' }}
                        >
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.title')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.content')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.type')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.time')}</span>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={<Bell className="size-8" />}
                            title={t('notifications.empty.title')}
                            description={t('notifications.empty.description')}
                        />
                    ) : (
                        <div>
                            {/* Unread section */}
                            {unreadList.length > 0 && (
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 border-b border-border/40 dark:border-white/[0.08] cursor-pointer group">
                                        <span className="text-[15px] font-bold text-black dark:text-white tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-200">
                                            {t('notifications.unread')} ({unreadList.length})
                                        </span>
                                        <ChevronDown className="size-4 text-black dark:text-white group-hover:text-black/70 dark:group-hover:text-white/70 transition-all duration-200 group-data-[state=closed]:-rotate-90" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                        <div className="hidden md:block">
                                            {unreadList.slice(0, showUnread).map(n => (
                                                <NotificationRow
                                                    key={n.id}
                                                    notification={n}
                                                    unread
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        <div className="md:hidden">
                                            {unreadList.slice(0, showUnread).map(n => (
                                                <NotificationCard
                                                    key={n.id}
                                                    notification={n}
                                                    unread
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        {showUnread < unreadList.length && (
                                            <button
                                                onClick={() => setShowUnread(prev => prev + ITEMS_PER_PAGE)}
                                                className="w-full py-3 text-[14px] font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer border-b border-border/20 dark:border-white/[0.04]"
                                            >
                                                {t('common.loadMore')} ({unreadList.length - showUnread})
                                            </button>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}

                            {/* Read section */}
                            {readList.length > 0 && (
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 border-b border-border/40 dark:border-white/[0.08] cursor-pointer group">
                                        <span className="text-[15px] font-bold text-black/40 dark:text-white/40 tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-200">
                                            {t('notifications.read')} ({readList.length})
                                        </span>
                                        <ChevronDown className="size-4 text-black/40 dark:text-white/40 group-hover:text-black/70 dark:group-hover:text-white/70 transition-all duration-200 group-data-[state=closed]:-rotate-90" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                        <div className="hidden md:block">
                                            {readList.slice(0, showRead).map(n => (
                                                <NotificationRow
                                                    key={n.id}
                                                    notification={n}
                                                    unread={false}
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        <div className="md:hidden">
                                            {readList.slice(0, showRead).map(n => (
                                                <NotificationCard
                                                    key={n.id}
                                                    notification={n}
                                                    unread={false}
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        {showRead < readList.length && (
                                            <button
                                                onClick={() => setShowRead(prev => prev + ITEMS_PER_PAGE)}
                                                className="w-full py-3 text-[14px] font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer border-b border-border/20 dark:border-white/[0.04]"
                                            >
                                                {t('common.loadMore')} ({readList.length - showRead})
                                            </button>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Detail Dialog */}
            <Dialog open={!!viewingNotification} onOpenChange={(open) => !open && setViewingNotification(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader className="gap-0 space-y-0">
                        <DialogTitle className="text-[18px] font-semibold leading-normal break-words">
                            {viewingNotification?.title}
                        </DialogTitle>
                        <div className="text-[14px] text-muted-foreground">
                            {viewingNotification && timeAgo(viewingNotification.createdAt)}
                        </div>
                    </DialogHeader>
                    <div className="py-3 text-[16px] whitespace-pre-wrap text-foreground/90 leading-relaxed min-h-[15vh] max-h-[60vh] overflow-y-auto">
                        {viewingNotification?.message}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setViewingNotification(null)}
                            className="font-semibold h-10 px-6 border transition-all duration-300 bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105"
                        >
                            {t('common.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
