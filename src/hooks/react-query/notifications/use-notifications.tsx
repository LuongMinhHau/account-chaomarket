'use client';

import { useAppQuery } from '@/hooks/react-query/use-custom-query';
import { APP_QUERY_KEY } from '@/constant';
import {
    notificationApis,
    NotificationFilterParams,
} from '@/app/api/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Fetch paginated notifications for the current user.
 */
export function useNotifications(filterParams?: NotificationFilterParams) {
    return useAppQuery({
        queryKey: [APP_QUERY_KEY.NOTIFICATIONS, filterParams],
        queryFn: async () => {
            return await notificationApis.getAll(filterParams);
        },
    });
}

/**
 * Lightweight unread count (polls every 30s for badge).
 */
export function useUnreadCount() {
    return useAppQuery({
        queryKey: [APP_QUERY_KEY.NOTIFICATIONS_UNREAD_COUNT],
        queryFn: async () => {
            return await notificationApis.getUnreadCount();
        },
        options: {
            refetchInterval: 30_000, // poll every 30s
        },
    });
}

/**
 * Mark notifications as read — single, bulk, or all.
 */
export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            ids,
            markAll,
            isRead = true,
        }: {
            ids?: string[];
            markAll?: boolean;
            isRead?: boolean;
        }) => notificationApis.markAsRead(ids, markAll, isRead),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [APP_QUERY_KEY.NOTIFICATIONS],
            });
            queryClient.invalidateQueries({
                queryKey: [APP_QUERY_KEY.NOTIFICATIONS_UNREAD_COUNT],
            });
        },
    });
}

/**
 * Toggle star on a single notification.
 */
export function useToggleStar() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationApis.toggleStar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [APP_QUERY_KEY.NOTIFICATIONS],
            });
        },
    });
}
