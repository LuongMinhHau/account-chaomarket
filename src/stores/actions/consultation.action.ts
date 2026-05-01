type ConsultationPayload = string;

export enum CONSULTATION_ACTIONS {
    ADD_NEW_ITEM = 'ADD_NEW_ITEM',
    DELETE_ITEM = 'DELETE_ITEM',
    CLEAR_ITEMS = 'CLEAR_ITEMS',
    UPDATE_ITEM = 'UPDATE_ITEM',
}

interface AddNewItem {
    type: CONSULTATION_ACTIONS.ADD_NEW_ITEM;
    payload: ConsultationPayload;
}

interface DeleteItem {
    type: CONSULTATION_ACTIONS.DELETE_ITEM;
    payload: ConsultationPayload;
}

interface UpdateItem {
    type: CONSULTATION_ACTIONS.UPDATE_ITEM;
    payload: ConsultationPayload;
}

interface ClearItemsAction {
    type: CONSULTATION_ACTIONS.CLEAR_ITEMS;
}

export type ConsultationAction =
    | AddNewItem
    | DeleteItem
    | ClearItemsAction
    | UpdateItem;
