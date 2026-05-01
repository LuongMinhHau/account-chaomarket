// src/app/providers.tsx
'use client';
import { QueryClientProvider, HydrationBoundary, DehydratedState } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';

export function Providers({
    children,
    dehydratedState,
}: {
    children: React.ReactNode;
    dehydratedState?: DehydratedState;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={dehydratedState}>
                {children}
            </HydrationBoundary>
            {/* <Toaster /> */}
        </QueryClientProvider>
    );
}
