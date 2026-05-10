import LoadingSpinner from '@/components/loading-spinner';

/**
 * Account section loading skeleton — shown during route transitions.
 */
export default function AccountLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
        </div>
    );
}
