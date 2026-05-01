import { ClassValue } from 'clsx';
import { cn } from '@/lib/utils';
import React from 'react';

const LoadingComponent = ({ className }: { className?: ClassValue }) => {
    return (
        <div
            className={cn('flex justify-center items-center py-10', className)}
        >
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-yellow-400"></div>
        </div>
    );
};

export default LoadingComponent;
