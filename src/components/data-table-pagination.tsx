import { Table } from '@tanstack/react-table';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';
import AppDropdown from '@/components/app-dropdown';

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    className?: string;
}

export function DataTablePagination<TData>({
    table,
    className,
}: Readonly<DataTablePaginationProps<TData>>) {
    const { t } = useI18n();

    const currentPageSize = table.getState().pagination.pageSize;
    const isAll = currentPageSize === table.getRowCount();

    const options = [
        { value: '10', label: `10 ${t('common.perPage')}` },
        { value: '20', label: `20 ${t('common.perPage')}` },
        { value: '50', label: `50 ${t('common.perPage')}` },
        { value: 'all', label: t('common.showAll') },
    ];

    return (
        <div className={cn('flex items-center justify-end', className)}>
            <div className="flex items-center gap-2.5 text-[14px] font-medium dark:text-white/80">
                <div className="flex items-center">
                    <span>{table.getRowCount().toLocaleString('en-US')} {t('common.results')}</span>
                </div>
                <span className="text-[var(--brand-grey-foreground)]/40 text-[11px] select-none">|</span>
                <div className="flex items-center gap-1">
                    <div className="flex items-center justify-center rounded-md px-1.5 h-6 bg-transparent">
                        <span>{table.getState().pagination.pageIndex + 1}/{table.getPageCount()}</span>
                    </div>
                    <AppDropdown
                        options={options}
                        value={isAll ? 'all' : String(currentPageSize)}
                        onValueChange={(val) => {
                            table.setPageSize(val === 'all' ? table.getRowCount() : Number(val));
                        }}
                        labelVisible={false}
                        buttonClassName="h-6 font-medium text-[14px]! rounded-md px-1.5 bg-transparent dark:text-white/80"
                        contentClassName="w-28"
                        shouldDisplayGroupLabel={false}
                    />
                </div>
                <span className="text-[var(--brand-grey-foreground)]/40 text-[11px] select-none">|</span>
                <div className="flex items-center space-x-0 dark:text-white/80">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="size-3.5" strokeWidth={2.5} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="size-3.5" strokeWidth={2.5} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="size-3.5" strokeWidth={2.5} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="size-3.5" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
