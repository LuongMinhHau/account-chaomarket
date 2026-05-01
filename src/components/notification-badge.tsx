'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadCount } from '@/hooks/react-query/notifications/use-notifications';
import { useNotificationStream } from '@/hooks/react-query/notifications/use-notification-stream';
import { useSession } from 'next-auth/react';

interface NotificationBadgeProps {
    /** Size of the bell icon in pixels. Default: 18 */
    size?: number;
    /** Additional CSS class for the container */
    className?: string;
    /** Called when the badge is clicked */
    onClick?: () => void;
}

/**
 * Notification bell icon with unread count badge.
 * Polls for unread count every 30s (via useUnreadCount hook).
 * Only shows for authenticated users.
 */
export function NotificationBadge({
    size = 18,
    className,
    onClick,
}: NotificationBadgeProps) {
    const { data: session } = useSession();
    const { data: unreadCount } = useUnreadCount();

    // Subscribe to SSE for real-time updates (updates React Query cache directly)
    useNotificationStream();

    // Only show for authenticated users
    if (!session?.user) return null;

    const count = typeof unreadCount === 'number' ? unreadCount : 0;
    const displayCount = count > 99 ? '99+' : String(count);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative inline-flex items-center justify-center',
                'p-2 rounded-md transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'dark:hover:bg-white/5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
            aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        >
            <Bell
                size={size}
                className="text-brand-text dark:text-sidebar-foreground"
            />

            {/* Animated unread badge */}
            {count > 0 && (
                <span
                    className={cn(
                        'absolute -top-0.5 -right-0.5',
                        'flex items-center justify-center',
                        'min-w-[1.125rem] h-[1.125rem] px-1',
                        'text-[0.625rem] font-bold leading-none',
                        'bg-[var(--brand-red)] text-white',
                        'rounded-full',
                        'ring-2 ring-sidebar dark:ring-sidebar',
                        'animate-[cart-bounce_0.3s_ease-out]'
                    )}
                >
                    {displayCount}
                </span>
            )}
        </button>
    );
}
