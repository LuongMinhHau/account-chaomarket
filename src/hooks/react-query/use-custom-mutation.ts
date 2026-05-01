import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseAppMutationOptions<
    TData,
    TVariables = unknown,
    TContext = unknown,
> {
    mutationFn: (variables: TVariables) => Promise<TData>;
    mutationKey?: unknown[];
    onSuccess?: (data: TData) => void | Promise<void>;
    onSuccessVariables?: (variables: TVariables) => void | Promise<void>;
    onError?: (error: Error) => void | Promise<void>;
    onSuccessMessage?: string;
    onErrorMessage?: string;
    options?: Omit<
        UseMutationOptions<TData, Error, TVariables, TContext>,
        'mutationFn' | 'mutationKey'
    >;
}

export function useAppMutation<TData, TVariables = unknown, TContext = unknown>(
    props: UseAppMutationOptions<TData, TVariables, TContext>
) {
    const {
        mutationFn,
        mutationKey,
        options,
        onSuccess,
        onSuccessVariables,
        onSuccessMessage,
        onError,
        onErrorMessage,
    } = props;

    return useMutation<TData, Error, TVariables, TContext>({
        mutationFn,
        mutationKey,
        onSuccess: async (data, variables) => {
            await onSuccess?.(data);
            await onSuccessVariables?.(variables);
            if (onSuccessMessage) {
                toast.success(onSuccessMessage);
            }
        },
        onError: async error => {
            await onError?.(error);
            if (onErrorMessage) {
                toast.error(onErrorMessage);
            }
        },
        ...options,
    });
}
