import { useAppMutation } from '@/hooks/react-query/use-custom-mutation';
import { BaseResponse } from '@/types/base-response';
import { cartApis } from '@/app/api/carts';
import { queryClient } from '@/lib/query-client';
import { APP_QUERY_KEY } from '@/constant';

export function useUserRemoveCartItem() {
    return useAppMutation<BaseResponse<null>, string[]>({
        mutationFn: (cartIds: string[]) =>
            cartApis.UserRemoveItemsFromCart(cartIds),
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: query => {
                    return query.queryKey.includes(APP_QUERY_KEY.USER_CART);
                },
            });
        },
        onErrorMessage: 'Remove items from cart failed',
    });
}
