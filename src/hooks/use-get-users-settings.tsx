import { getUserSettingsOrCreate } from '@/services/user/get-user-setting';
import { useQuery } from '@tanstack/react-query';

export const useGetUserSettings = (id?: string) =>
    useQuery({
        queryFn: async () => (await getUserSettingsOrCreate(id!)) ?? null,
        queryKey: ['user-settings-query'],
        enabled: !!id,
    });
