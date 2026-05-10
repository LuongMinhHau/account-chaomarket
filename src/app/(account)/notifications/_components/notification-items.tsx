import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationItem, useTypeConfig } from './notification-types';

// ── Notification Row (Desktop) ──
export function NotificationRow({
    notification,
    unread,
    onClickRow,
    onToggleStar,
    typeConfig,
    timeAgo,
}: {
    notification: NotificationItem;
    unread: boolean;
    onClickRow: () => void;
    onToggleStar: (e: React.MouseEvent) => void;
    typeConfig: ReturnType<typeof useTypeConfig>;
    timeAgo: (dateStr: string) => string;
}) {
    const cfg = typeConfig[notification.type] || typeConfig.system;

    return (
        <div
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                unread
                    ? 'bg-white dark:bg-white/[0.03]'
                    : 'bg-transparent',
            )}
        >
            <button
                onClick={onToggleStar}
                className={cn(
                    'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                    notification.isStarred
                        ? 'text-amber-400 hover:text-amber-500'
                        : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                )}
                aria-label={notification.isStarred ? 'Unstar' : 'Star'}
            >
                <Star
                    className="size-[16px]"
                    fill={notification.isStarred ? 'currentColor' : 'none'}
                    strokeWidth={2}
                />
            </button>

            <div
                onClick={onClickRow}
                className="grid flex-1 min-w-0 cursor-pointer items-center"
                style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 4fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0 16px' }}
            >
                <span className={cn(
                    'text-[14px] min-w-0 truncate font-semibold',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {notification.title}
                </span>
                <span className={cn(
                    'text-[14px] min-w-0 truncate font-normal',
                    unread ? 'text-black/60 dark:text-white/60' : 'text-black/40 dark:text-white/40'
                )}>
                    {notification.message}
                </span>
                <span className={cn(
                    'text-[14px] font-medium whitespace-nowrap',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {cfg.label}
                </span>
                <span className={cn(
                    'text-[14px] whitespace-nowrap font-normal',
                    unread ? 'text-black/50 dark:text-white/50' : 'text-black/40 dark:text-white/40'
                )}>
                    {timeAgo(notification.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ── Notification Card (Mobile) ──
export function NotificationCard({
    notification,
    unread,
    onClickRow,
    onToggleStar,
    typeConfig,
    timeAgo,
}: {
    notification: NotificationItem;
    unread: boolean;
    onClickRow: () => void;
    onToggleStar: (e: React.MouseEvent) => void;
    typeConfig: ReturnType<typeof useTypeConfig>;
    timeAgo: (dateStr: string) => string;
}) {
    const cfg = typeConfig[notification.type] || typeConfig.system;

    return (
        <div
            onClick={onClickRow}
            className={cn(
                'px-3 py-3 cursor-pointer',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                unread
                    ? 'bg-white dark:bg-white/[0.03]'
                    : 'bg-transparent',
            )}
        >
            <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                        onClick={onToggleStar}
                        className={cn(
                            'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                            notification.isStarred
                                ? 'text-amber-400 hover:text-amber-500'
                                : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                        )}
                        aria-label={notification.isStarred ? 'Unstar' : 'Star'}
                    >
                        <Star
                            className="size-[14px]"
                            fill={notification.isStarred ? 'currentColor' : 'none'}
                            strokeWidth={2}
                        />
                    </button>
                    <span className={cn(
                        'text-[14px] font-semibold truncate',
                        unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                    )}>
                        {notification.title}
                    </span>
                </div>
                <span className={cn(
                    'text-[12px] font-medium whitespace-nowrap ml-2 flex-shrink-0',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {cfg.label}
                </span>
            </div>
            <p className={cn(
                'text-[13px] line-clamp-2 mb-1.5',
                unread ? 'text-black/60 dark:text-white/60' : 'text-black/40 dark:text-white/40'
            )}>
                {notification.message}
            </p>
            <span className={cn(
                'text-[12px]',
                unread ? 'text-black/40 dark:text-white/40' : 'text-black/30 dark:text-white/30'
            )}>
                {timeAgo(notification.createdAt)}
            </span>
        </div>
    );
}
