import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores/cart.store';
import { CART_ACTIONS } from '@/stores/actions/cart.action';
import { cartApis } from '@/app/api/carts';
import { queryClient } from '@/lib/query-client';
import { APP_QUERY_KEY } from '@/constant';

/**
 * Hook that automatically merges guest cart (localStorage) into server cart
 * when a user logs in. Should be placed in a high-level layout component.
 */
export function useMergeGuestCart() {
    const { status } = useSession();
    const itemIds = useCartStore(state => state.itemIds);
    const dispatch = useCartStore(state => state.dispatch);
    const hasMerged = useRef(false);

    useEffect(() => {
        if (!status || status !== 'authenticated' || hasMerged.current || itemIds.length === 0) {
            return;
        }

        const mergeCart = async () => {
            try {
                hasMerged.current = true;

                const payload = itemIds.map(productId => ({
                    productId,
                    quantity: 1,
                }));

                await cartApis.AddProductToCartServerAction(payload);

                dispatch({ type: CART_ACTIONS.CLEAR_CART });

                await queryClient.invalidateQueries({
                    predicate: query => {
                        return query.queryKey.includes(APP_QUERY_KEY.USER_CART);
                    },
                });
            } catch (error) {
                hasMerged.current = false;
                console.error('[MergeGuestCart] Failed to merge guest cart:', error);
            }
        };

        mergeCart();
    }, [status, itemIds, dispatch]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            hasMerged.current = false;
        }
    }, [status]);
}
