'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div
            data-slot="table-container"
            className="relative w-full overflow-visible"
        >
            <table
                data-slot="table"
                className={cn('w-full caption-bottom text-[15px]', className)}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead data-slot="table-header" className={cn('border-b border-border', className)} {...props} />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'hover:bg-gray-500/20 dark:hover:bg-gray-400/25 data-[state=selected]:bg-muted dark:data-[state=selected]:bg-white/[0.08] transition-colors',
                // table header styling
                ' [&>th]:border-x [&>th]:border-border [&>th:first-child]:border-l-0 [&>th:last-child]:border-r-0 [&>th:first-child]:rounded-tl-md [&>th:first-child]:rounded-bl-md [&>th:last-child]:rounded-tr-md [&>th:last-child]:rounded-br-md',
                // table cell
                '[&>td]:border-x [&>td]:border-border [&>td:first-child]:border-l-0 [&>td:last-child]:border-r-0 [&>td:first-child]:rounded-tl-md [&>td:first-child]:rounded-bl-md [&>td:last-child]:rounded-tr-md [&>td:last-child]:rounded-br-md',
                className
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-10 px-2 text-left text-[14px] lg:text-[16px] align-middle font-medium whitespace-nowrap' +
                ' [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                className
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                'p-2 align-middle whitespace-nowrap text-[13px] lg:text-[15px] [&:has([role=checkbox])]:pr-0' +
                ' [&>[role=checkbox]]:translate-y-[2px]',
                className
            )}
            {...props}
        />
    );
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('text-muted-foreground mt-4 text-sm', className)}
            {...props}
        />
    );
}

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
