'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { APP_QUERY_KEY } from '@/constant';
import { useSession } from 'next-auth/react';

/**
 * Hook that subscribes to the SSE notification stream.
 * When the server sends a new unread count, it updates React Query cache
 * directly — no extra API call needed.
 *
 * Falls back gracefully: if SSE fails, the existing 30s polling still works.
 */
export function useNotificationStream() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        // Only connect for authenticated users
        if (!session?.user) return;

        const connect = () => {
            const es = new EventSource('/api/notifications/stream');
            eventSourceRef.current = es;

            es.onmessage = event => {
                try {
                    const { unreadCount } = JSON.parse(event.data);
                    // Update the cache directly — instant UI update, no extra fetch
                    queryClient.setQueryData(
                        [APP_QUERY_KEY.NOTIFICATIONS_UNREAD_COUNT],
                        unreadCount
                    );
                } catch {
                    // Ignore parse errors (e.g. keep-alive pings)
                }
            };

            es.onerror = () => {
                es.close();
                // Reconnect after 10s on error
                setTimeout(connect, 10000);
            };
        };

        connect();

        return () => {
            eventSourceRef.current?.close();
            eventSourceRef.current = null;
        };
    }, [session?.user, queryClient]);
}
