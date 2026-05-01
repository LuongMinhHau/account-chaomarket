import {
    CONSULTATION_ACTIONS,
    ConsultationAction,
} from '@/stores/actions/consultation.action';
import { create } from 'zustand/react';
import { persist } from 'zustand/middleware';

interface ConsultationStore {
    selectedItems: string[];
    dispatch: (action: ConsultationAction) => void;
}

export const useConsultationStore = create(
    persist<ConsultationStore>(
        set => ({
            selectedItems: [],
            dispatch: (action: ConsultationAction) => {
                switch (action.type) {
                    case CONSULTATION_ACTIONS.ADD_NEW_ITEM:
                        return set(state => {
                            const updatedItems = new Set([
                                ...state.selectedItems,
                                action.payload,
                            ]);
                            return { selectedItems: Array.from(updatedItems) };
                        });
                    case CONSULTATION_ACTIONS.DELETE_ITEM:
                        return set(state => ({
                            selectedItems: state.selectedItems.filter(
                                id => id !== action.payload
                            ),
                        }));
                    case CONSULTATION_ACTIONS.CLEAR_ITEMS:
                        return set({ selectedItems: [] });
                    case CONSULTATION_ACTIONS.UPDATE_ITEM:
                        return set(state => {
                            const isExisted = state.selectedItems.includes(
                                action.payload
                            );
                            if (isExisted)
                                return {
                                    selectedItems: state.selectedItems.filter(
                                        id => id !== action.payload
                                    ),
                                };
                            return {
                                selectedItems: [
                                    ...state.selectedItems,
                                    action.payload,
                                ],
                            };
                        });
                    default:
                        break;
                }
            },
        }),
        { name: 'consultation-local-storage' }
    )
);
