import { useAppQuery } from '@/hooks/react-query/use-custom-query';
import { APP_QUERY_KEY } from '@/constant';
import { useSession } from 'next-auth/react';
import { userApis } from '@/app/api/user';

export const useUserProfileQuery = () => {
    const { data: session, status } = useSession();

    const { data, isLoading, isError, error, refetch } = useAppQuery({
        queryKey: [APP_QUERY_KEY.USER_PROFILE, session?.user?.email],
        queryFn: async () => {
            if (!session?.user?.name) {
                throw new Error('User not authenticated');
            }
            return await userApis.GetUserProfileServerAction();
        },
        options: {
            enabled: status === 'authenticated' && !!session?.user,
            retry: 1,
        },
    });

    return {
        data,
        isLoading,
        isError,
        error,
        refetch,
        sessionStatus: status,
    };
};
