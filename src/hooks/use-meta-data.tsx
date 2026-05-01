'use client';

import { getMetaDataConfig, MetaDataConfig } from '@/services/meta_data';
import { useQuery } from '@tanstack/react-query';

/** Query key for metaData — shared between client hooks and server prefetch */
export const META_DATA_QUERY_KEY = ['metaDataConfig'] as const;

const isDev = process.env.NODE_ENV === 'development';

export const useMetaData = () => {
    return useQuery<MetaDataConfig | null>({
        queryKey: META_DATA_QUERY_KEY,
        queryFn: async () => {
            const data = await getMetaDataConfig();
            return data.data ?? null;
        },
        staleTime: isDev ? 0 : 5 * 60 * 1000,     // dev: always fresh | prod: 5 minutes
        gcTime: isDev ? 0 : 10 * 60 * 1000,        // dev: no cache    | prod: 10 minutes
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        retry: 1,
        retryDelay: 1000,
        throwOnError: false,
    });
};
