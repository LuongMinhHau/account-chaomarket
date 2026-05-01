import { DisclaimerAction } from '@/stores/actions/dislaimer.action';
import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';

interface DisclaimerStore {
    isRead: boolean;
    acceptedDate: Date | null;
    dispatch: (action: DisclaimerAction) => void;
}

export const useDisclaimerStore = create(
    persist<DisclaimerStore>(
        set => ({
            isRead: false,
            acceptedDate: null,
            dispatch: (action: DisclaimerAction) => {
                switch (action.type) {
                    case 'MARK_AS_READ':
                        return set({ isRead: true, acceptedDate: new Date() });
                }
            },
        }),
        { name: 'disclaimer-local-storage' }
    )
);
