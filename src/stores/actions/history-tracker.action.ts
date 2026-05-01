type HistoryPathPayload = string;

export enum HISTORY_ACTIONS {
    PUSH_PATH = 'history/pushPath',
    POP_PATH = 'history/popPath', // For manually removing the last entry if needed
    CLEAR_HISTORY = 'history/clearHistory', // Useful for events like user logout
}

/**
 * Action to add a new path to the end of the history stack.
 */
interface PushPathAction {
    type: HISTORY_ACTIONS.PUSH_PATH;
    payload: HistoryPathPayload;
}

/**
 * Action to remove the most recent path from the history stack.
 * This action does not require a payload.
 */
interface PopPathAction {
    type: HISTORY_ACTIONS.POP_PATH;
}

/**
 * Action to completely clear the entire history stack.
 * This action does not require a payload.
 */
interface ClearHistoryAction {
    type: HISTORY_ACTIONS.CLEAR_HISTORY;
}

export type HistoryAction = PushPathAction | PopPathAction | ClearHistoryAction;
