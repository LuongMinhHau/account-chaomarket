import { create } from 'zustand';
import {
    HISTORY_ACTIONS,
    HistoryAction,
} from '@/stores/actions/history-tracker.action';

interface HistoryState {
    history: string[];
}

const initialState: HistoryState = {
    history: [],
};

export const useHistoryStore = create<
    HistoryState & { dispatch: (action: HistoryAction) => void }
>(set => ({
    ...initialState,

    dispatch: action => {
        set(state => {
            switch (action.type) {
                case HISTORY_ACTIONS.PUSH_PATH: {
                    const newPath = action.payload;
                    if (state.history[state.history.length - 1] === newPath) {
                        return state;
                    }
                    return { history: [...state.history, newPath] };
                }

                case HISTORY_ACTIONS.POP_PATH: {
                    if (state.history.length === 0) {
                        return state;
                    }
                    return { history: state.history.slice(0, -1) };
                }

                case HISTORY_ACTIONS.CLEAR_HISTORY: {
                    return { history: [] };
                }

                default:
                    return state;
            }
        });
    },
}));
