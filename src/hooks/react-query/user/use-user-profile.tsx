import { useUserProfileQuery } from '@/hooks/react-query/user/use-user-profile-query';
import { useSaveUserProfile } from '@/hooks/react-query/user/use-save-user-profile';

export const useUserProfile = () => {
    const profileQuery = useUserProfileQuery();
    const saveProfileMutation = useSaveUserProfile();

    return {
        // Profile data
        profile: profileQuery.data?.data,
        isProfileLoading: profileQuery.isLoading,
        isProfileError: profileQuery.isError,
        profileError: profileQuery.error,
        refetchProfile: profileQuery.refetch,

        // Save profile
        saveProfile: saveProfileMutation.saveProfile,
        saveProfileAsync: saveProfileMutation.saveProfileAsync,
        isSaving: saveProfileMutation.isSaving,
        saveError: saveProfileMutation.saveError,
        saveSuccess: saveProfileMutation.saveSuccess,

        // Session
        sessionStatus: profileQuery.sessionStatus,
        isAuthenticated:
            profileQuery.sessionStatus === 'authenticated' &&
            !!profileQuery.data,
    };
};
