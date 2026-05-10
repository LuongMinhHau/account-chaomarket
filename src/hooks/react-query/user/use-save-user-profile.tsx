import { APP_QUERY_KEY } from '@/constant';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { userApis } from '@/app/api/user';
import { useAppMutation } from '@/hooks/react-query/use-custom-mutation';

export const useSaveUserProfile = () => {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();

    const mutation = useAppMutation({
        mutationFn: async (
            payload: Parameters<
                typeof userApis.SaveUserProfileServerAction
            >[0]
        ) => {
            if (!session?.user?.name) {
                throw new Error('User not authenticated');
            }
            return await userApis.SaveUserProfileServerAction(payload);
        },
        onSuccessMessage: 'Save user profile successfully',
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: query => {
                    return query.queryKey.includes(APP_QUERY_KEY.USER_PROFILE);
                },
            });
        },
        onError: () => {
            // Error exposed via saveError property
        },
    });

    return {
        saveProfile: mutation.mutate,
        saveProfileAsync: mutation.mutateAsync,
        isSaving: mutation.isPending,
        saveError: mutation.error,
        saveSuccess: mutation.isSuccess,
        sessionStatus: status,
    };
};
