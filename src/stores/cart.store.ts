import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CART_ACTIONS, CartAction } from './actions/cart.action';

interface CartStore {
    itemIds: string[];
    dispatch: (action: CartAction) => void;
}

export const useCartStore = create(
    persist<CartStore>(
        set => ({
            itemIds: [],
            dispatch: (action: CartAction) => {
                switch (action.type) {
                    case CART_ACTIONS.ADD_ITEM:
                        return set(state => {
                            if (state.itemIds.includes(action.payload))
                                return state;
                            return {
                                itemIds: [...state.itemIds, action.payload],
                            };
                        });

                    case CART_ACTIONS.REMOVE_ITEM:
                        return set(state => ({
                            itemIds: state.itemIds.filter(
                                id => id !== action.payload
                            ),
                        }));

                    case CART_ACTIONS.CLEAR_CART:
                        return set({ itemIds: [] });

                    default:
                        return;
                }
            },
        }),
        { name: 'service-cart-storage' }
    )
);
