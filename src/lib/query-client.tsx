// src/lib/react-query/queryClient.ts
import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Smart cache defaults:
 * - staleTime: 5 min → data considered fresh, no refetch on re-mount
 * - gcTime: 10 min → unused cache is garbage collected after 10 min
 * - refetchOnWindowFocus: true → still refresh when user returns to tab
 *
 * Individual queries can override these where needed
 * (e.g. staleTime: 0 for real-time data)
 */
const FIVE_MINUTES = 1000 * 60 * 5;
const TEN_MINUTES = 1000 * 60 * 10;

const defaultOptions: DefaultOptions = {
    queries: {
        staleTime: FIVE_MINUTES,
        gcTime: TEN_MINUTES,
        refetchOnWindowFocus: true,
        retry: 1,
    },
    mutations: {
        onError: (error: Error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success('Operation completed successfully');
        },
    },
};

export const queryClient = new QueryClient({
    defaultOptions,
});

/**
 * Create a fresh QueryClient for server-side prefetching.
 * Must create a NEW instance per-request to avoid sharing state between users.
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: FIVE_MINUTES,
                gcTime: TEN_MINUTES,
            },
        },
    });
}
