'use client';

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    VisibilityState,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from './data-table-pagination';
import React from 'react';
import { EyeOff, ChevronDown } from 'lucide-react';
import { useI18n } from '@/context/i18n/context';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    headerClassName?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    headerClassName,
}: Readonly<DataTableProps<TData, TValue>>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const headerRowRef = React.useRef<HTMLTableRowElement>(null);
    const [colWidths, setColWidths] = React.useState<number[]>([]);
    const { t } = useI18n();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
        state: {
            sorting,
            columnVisibility,
        },
    });

    // Capture column widths after render
    React.useEffect(() => {
        if (headerRowRef.current && colWidths.length === 0) {
            const ths = headerRowRef.current.querySelectorAll('th');
            const widths = Array.from(ths).map(th => th.offsetWidth);
            setColWidths(widths);
        }
    }, [colWidths.length]);

    // Reset cached widths when column visibility changes
    React.useEffect(() => {
        setColWidths([]);
    }, [columnVisibility]);

    // Check if any columns are hidden
    const hiddenColumns = table.getAllColumns().filter(col => !col.getIsVisible());
    const hasHiddenColumns = hiddenColumns.length > 0;

    return (
        <div className="rounded-md overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div>
                    {hasHiddenColumns && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md
                                        bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200
                                        hover:bg-neutral-300 dark:hover:bg-neutral-600
                                        border border-neutral-300 dark:border-neutral-600
                                        transition-colors"
                                >
                                    <EyeOff className="size-4" />
                                    {hiddenColumns.length} {hiddenColumns.length > 1 ? t('common.columnsHidden') : t('common.columnHidden')}
                                    <ChevronDown className="size-3.5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-brand-dialog min-w-[180px]">
                                {hiddenColumns.map(col => (
                                    <DropdownMenuItem
                                        key={col.id}
                                        onClick={() => col.toggleVisibility(true)}
                                        className="hover:underline hover:!bg-transparent focus:!bg-transparent decoration-current decoration-auto underline-offset-auto cursor-pointer"
                                    >
                                        {t('common.showColumn')} “{col.id.charAt(0).toUpperCase() + col.id.slice(1)}”
                                    </DropdownMenuItem>
                                ))}
                                {hiddenColumns.length > 1 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setColumnVisibility({})}
                                            className="hover:underline hover:!bg-transparent focus:!bg-transparent decoration-current decoration-auto underline-offset-auto cursor-pointer"
                                        >
                                            {t('common.showAllColumns')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                <DataTablePagination table={table} className="" />
            </div>

            {/* Single Table with sticky header — scrollbar starts below header */}
            {table.getVisibleLeafColumns().length > 0 && (
                <div className="overflow-x-auto">
                    <Table className="mb-6 border-t border-x border-border">
                        <TableHeader className={`${headerClassName || "border-b border-border bg-white dark:bg-black font-medium text-black dark:text-white text-[16px] uppercase tracking-wider"} sticky top-0 z-10`}>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id} ref={headerRowRef}>
                                    {headerGroup.headers.map((header, idx) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className={headerClassName || "border-b border-border bg-white dark:bg-black font-medium text-black dark:text-white text-[16px] uppercase tracking-wider"}
                                                style={colWidths[idx] ? { minWidth: colWidths[idx] } : undefined}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map(row => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && 'selected'}
                                        className="cursor-pointer"
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell
                                                key={cell.id}
                                                className="text-start lg:text-center text-[var(--brand-grey-foreground)] !text-[16px]"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        {t('common.noResults')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
