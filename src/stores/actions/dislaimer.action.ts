export enum DISCLAIMER_ACTIONS {
    MARK_AS_READ = 'MARK_AS_READ',
}

interface MarkAsReadAction {
    type: DISCLAIMER_ACTIONS.MARK_AS_READ;
    payload?: null;
}

export type DisclaimerAction = MarkAsReadAction;
