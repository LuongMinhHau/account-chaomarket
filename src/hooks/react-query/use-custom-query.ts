import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseAppQueryOptions<
    TFnData,
    TData extends TFnData = TFnData,
    TError = Error,
> {
    queryFn: () => Promise<TFnData>;
    queryKey: unknown[];
    options?: Omit<
        UseQueryOptions<TFnData, TError, TData>,
        'queryKey' | 'queryFn'
    >;
}

export function useAppQuery<
    TFnData,
    TData extends TFnData = TFnData,
    TError = Error,
>(props: UseAppQueryOptions<TFnData, TData, TError>) {
    const { queryFn, queryKey, options } = props;
    return useQuery<TFnData, TError, TData>({
        queryKey,
        queryFn,
        ...options,
    });
}
