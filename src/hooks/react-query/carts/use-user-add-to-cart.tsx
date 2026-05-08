import { useAppMutation } from '@/hooks/react-query/use-custom-mutation';
import { BaseResponse } from '@/types/base-response';
import { cartApis } from '@/app/api/carts';
import { queryClient } from '@/lib/query-client';
import { APP_QUERY_KEY } from '@/constant';
import { useCartStore } from '@/stores/cart.store';
import { CART_ACTIONS } from '@/stores/actions/cart.action';

export type AddToCartPayload = {
    productId: string;
    plan?: string;
    durationMonths?: number;
};

async function checkAuthenticated(): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) return false;
        const session = await res.json();
        return !!session?.user;
    } catch {
        return false;
    }
}

export function useUserAddToCart() {
    const dispatch = useCartStore(state => state.dispatch);

    return useAppMutation<BaseResponse<string>, AddToCartPayload | string>({
        mutationFn: async (input: AddToCartPayload | string) => {
            const payload = typeof input === 'string'
                ? { productId: input }
                : input;

            dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: payload.productId });

            const isAuth = await checkAuthenticated();

            if (isAuth) {
                return cartApis.AddProductToCartServerAction([
                    {
                        productId: payload.productId,
                        quantity: 1,
                        durationMonths: payload.durationMonths,
                        plan: payload.plan,
                    },
                ]);
            }

            return {
                success: true,
                message: 'Added to cart',
                data: payload.productId,
            };
        },
        onSuccess: async () => {
            window.dispatchEvent(new CustomEvent('cart-item-added'));

            const isAuth = await checkAuthenticated();
            if (isAuth) {
                queryClient.invalidateQueries({
                    predicate: query => {
                        return query.queryKey.includes(APP_QUERY_KEY.USER_CART);
                    },
                });
            }
        },
        onErrorMessage: 'Failed to add to cart',
    });
}
