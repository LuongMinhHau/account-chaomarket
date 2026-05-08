import { useAppMutation } from '@/hooks/react-query/use-custom-mutation';
import { BaseResponse } from '@/types/base-response';
import { cartApis } from '@/app/api/carts';
import { queryClient } from '@/lib/query-client';
import { APP_QUERY_KEY } from '@/constant';

type CheckoutPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    message?: string;
    cartItemIds: string[];
};

export function useUserCheckout() {
    return useAppMutation<BaseResponse<unknown>, CheckoutPayload>({
        mutationFn: (data: CheckoutPayload) =>
            cartApis.UserCheckoutServerAction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: query => {
                    return query.queryKey.includes(APP_QUERY_KEY.USER_CART);
                },
            });
        },
        onErrorMessage: 'Checkout failed',
    });
}
