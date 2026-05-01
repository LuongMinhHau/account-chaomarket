export enum CART_ACTIONS {
    ADD_ITEM = 'ADD_ITEM',
    REMOVE_ITEM = 'REMOVE_ITEM',
    CLEAR_CART = 'CLEAR_CART',
}

interface AddItem {
    type: CART_ACTIONS.ADD_ITEM;
    payload: string;
}

interface RemoveItem {
    type: CART_ACTIONS.REMOVE_ITEM;
    payload: string;
}

interface ClearCart {
    type: CART_ACTIONS.CLEAR_CART;
}

export type CartAction = AddItem | RemoveItem | ClearCart;
