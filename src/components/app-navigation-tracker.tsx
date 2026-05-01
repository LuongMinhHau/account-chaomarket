'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useHistoryStore } from '@/stores/history-tracker.store';
import { HISTORY_ACTIONS } from '@/stores/actions/history-tracker.action';

export function NavigationTracker() {
    const pathname = usePathname();
    const dispatch = useHistoryStore(state => state.dispatch);

    useEffect(() => {
        dispatch({ type: HISTORY_ACTIONS.PUSH_PATH, payload: pathname });
    }, [pathname, dispatch]);

    return null;
}
