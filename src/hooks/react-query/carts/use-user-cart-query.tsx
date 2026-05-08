import { useAppQuery } from '@/hooks/react-query/use-custom-query';
import { APP_QUERY_KEY } from '@/constant';
import { cartApis } from '@/app/api/carts';
import { useSession } from 'next-auth/react';

export const useUserCartQuery = () => {
    const { data: session, status } = useSession();

    const { data, isLoading } = useAppQuery({
        queryKey: [APP_QUERY_KEY.USER_CART, session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.name) {
                throw new Error('User not authenticated');
            }
            return await cartApis.GetUserCartServerAction();
        },
        options: {
            enabled: status === 'authenticated' && !!session?.user,
        },
    });

    return {
        data,
        isLoading,
        SessionStatus: status,
    };
};
