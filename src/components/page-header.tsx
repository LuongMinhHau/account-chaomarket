'use client';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

/**
 * Standardized page header for all account pages.
 * Provides a consistent title + description + optional action layout.
 */
export default function PageHeader({
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('mb-6 animate-in fade-in slide-in-from-top-2 duration-500', className)}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0">
                    <h1 className="text-[20px] md:text-[24px] lg:text-[28px]! text-black dark:text-[var(--brand-color)] font-extrabold leading-[1.25] tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[18px] font-semibold text-black/90 dark:text-white/90 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    );
}
