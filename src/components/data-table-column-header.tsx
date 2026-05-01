'use client';

import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReactNode } from 'react';
import { useI18n } from '@/context/i18n/context';

interface DataTableColumnHeaderProps<TData, TValue>
    extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    tableTitle: string | ReactNode;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    tableTitle,
    className,
}: Readonly<DataTableColumnHeaderProps<TData, TValue>>) {
    const { t } = useI18n();

    if (!column.getCanSort()) {
        return <div className={cn(className)}>{tableTitle}</div>;
    }

    return (
        <div
            className={cn('flex items-center justify-center gap-1', className)}
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-semibold h-8 !text-[17px] lg:!text-[18px] text-black dark:!text-white hover:!bg-transparent hover:underline hover:!text-inherit decoration-current decoration-auto underline-offset-auto !bg-transparent"
                    >
                        <span>{tableTitle}</span>
                        {column.getIsSorted() === 'desc' ? (
                            <ArrowDown />
                        ) : column.getIsSorted() === 'asc' ? (
                            <ArrowUp />
                        ) : (
                            <ChevronsUpDown />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-brand-dialog">
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(false)}
                    >
                        <ArrowUp />
                        {t('common.ascending')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(true)}
                    >
                        <ArrowDown />
                        {t('common.descending')}
                    </DropdownMenuItem>
                    {column.getIsSorted() && (
                        <DropdownMenuItem
                            onClick={() => column.clearSorting()}
                        >
                            <X />
                            {t('common.clearSorting')}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => column.toggleVisibility(false)}
                    >
                        <EyeOff />
                        {t('common.hideColumn')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
