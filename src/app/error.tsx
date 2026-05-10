'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

/**
 * Route-level error boundary for the App Router.
 * Catches runtime errors in page/layout components and shows a recovery UI.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-6">
                <AlertCircle
                    className="w-16 h-16 mx-auto text-red-500/80"
                    strokeWidth={1.5}
                />
            </div>

            <h2 className="text-xl font-bold text-brand-text dark:text-[var(--brand-color)] mb-2">
                Đã xảy ra lỗi
            </h2>
            <p className="text-black/60 dark:text-white/60 text-[15px] max-w-md mb-6 leading-relaxed">
                Hệ thống gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang chủ.
            </p>

            {error.digest && (
                <p className="text-[12px] font-mono text-black/30 dark:text-white/30 mb-6">
                    Error ID: {error.digest}
                </p>
            )}

            <div className="flex gap-3">
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold bg-[var(--brand-color)] text-black border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 transition-all duration-300 cursor-pointer"
                >
                    <RotateCcw className="size-4" />
                    Thử lại
                </button>
                <a
                    href="/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                    <Home className="size-4" />
                    Trang chủ
                </a>
            </div>
        </div>
    );
}
