export enum PERFORMANCE_STATISTIC_DIALOG_ACTIONS {
    OPEN_DIALOG = 'OPEN_DIALOG',
    CLOSE_DIALOG = 'CLOSE_DIALOG',
    SET_DIALOG = 'SET_DIALOG',
    MARK_AS_ACCEPTED = 'MARK_AS_ACCEPTED',
}

interface OpenDialogAction {
    type: PERFORMANCE_STATISTIC_DIALOG_ACTIONS.OPEN_DIALOG;
    payload?: null;
}

interface CloseDialogAction {
    type: PERFORMANCE_STATISTIC_DIALOG_ACTIONS.CLOSE_DIALOG;
    payload?: null;
}

interface SetDialogAction {
    type: PERFORMANCE_STATISTIC_DIALOG_ACTIONS.SET_DIALOG;
    payload: boolean;
}

interface MarkAsAcceptedAction {
    type: PERFORMANCE_STATISTIC_DIALOG_ACTIONS.MARK_AS_ACCEPTED;
    payload?: null;
}

export type PerformanceStatisticAction =
    | OpenDialogAction
    | CloseDialogAction
    | SetDialogAction
    | MarkAsAcceptedAction;
