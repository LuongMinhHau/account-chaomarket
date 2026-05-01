'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    searchParams: Record<string, string | undefined>;
    onPageChange?: (page: number) => void;
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    searchParams,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const buildPaginationUrl = (newPageIndex: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && key !== 'pageIndex') {
                params.append(key, String(value));
            }
        });
        if (newPageIndex > 0) {
            params.set('pageIndex', newPageIndex.toString());
        }
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    const handlePageClick = (page: number) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <div className="animate-fadeIn flex items-center justify-between bg-transparent px-4 py-3 sm:px-6">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                {currentPage > 1 && (
                    <Link
                        href={buildPaginationUrl(currentPage - 2)}
                        onClick={() => handlePageClick(currentPage - 1)}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-neutral-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all! duration-200 hover:scale-105"
                    >
                        Previous
                    </Link>
                )}
                {currentPage < totalPages && (
                    <Link
                        href={buildPaginationUrl(currentPage)}
                        onClick={() => handlePageClick(currentPage + 1)}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-neutral-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all! duration-200 hover:scale-105"
                    >
                        Next
                    </Link>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end animate-slideUp">
                <div>
                    <nav
                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        {/* Previous Button */}
                        {currentPage > 1 && (
                            <Link
                                href={buildPaginationUrl(currentPage - 2)}
                                onClick={() => handlePageClick(currentPage - 1)}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-black ring-1 ring-inset dark:ring-[var(--brand-color)] dark:hover:bg-[var(--brand-color-foreground)] dark:bg-[var(--brand-color)] bg-[var(--brand-grey-foreground)] focus:z-20 focus:outline-offset-0 transition-transform! duration-200 hover:scale-105"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        )}

                        {/* First Page & Ellipsis */}
                        {startPage > 1 && (
                            <>
                                <Link
                                    href={buildPaginationUrl(0)}
                                    onClick={() => handlePageClick(1)}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold dark:text-[var(--brand-color)] ring-1 ring-inset dark:ring-[var(--brand-color)] dark:hover:bg-[var(--brand-color-foreground)] transition-all! duration-200 hover:scale-105"
                                >
                                    1
                                </Link>
                                {startPage > 2 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold dark:text-[var(--brand-color)] ring-1 ring-inset dark:ring-[var(--brand-color)]">
                                        ...
                                    </span>
                                )}
                            </>
                        )}

                        {/* Page Numbers */}
                        {pages.map(page => (
                            <Link
                                key={page}
                                href={buildPaginationUrl(page - 1)}
                                onClick={() => handlePageClick(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm ring-1 dark:ring-[var(--brand-color)] font-semibold transition-all! duration-200 hover:scale-105 ${page === currentPage
                                        ? 'z-10 dark:bg-[var(--brand-color)] bg-[var(--brand-grey-foreground)] text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:focus-visible:outline-[var(--brand-color)] animate-pulse'
                                        : 'dark:text-[var(--brand-color)] ring-inset dark:ring-[var(--brand-color)] dark:hover:bg-[var(--brand-color-foreground)] dark:hover:text-black focus:z-20 hover:bg-[var(--brand-grey-foreground)] focus:outline-offset-0'
                                    }`}
                            >
                                {page}
                            </Link>
                        ))}

                        {/* Last Page & Ellipsis */}
                        {endPage < totalPages && (
                            <>
                                {endPage < totalPages - 1 && (
                                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold dark:text-[var(--brand-color)] ring-1 ring-inset dark:ring-[var(--brand-color)]">
                                        ...
                                    </span>
                                )}
                                <Link
                                    href={buildPaginationUrl(totalPages - 1)}
                                    onClick={() => handlePageClick(totalPages)}
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold dark:text-[var(--brand-color)] ring-1 ring-inset dark:ring-[var(--brand-color)] dark:hover:bg-[var(--brand-color-foreground)] hover:text-black transition-all! duration-200 hover:scale-105"
                                >
                                    {totalPages}
                                </Link>
                            </>
                        )}

                        {/* Next Button */}
                        {currentPage < totalPages && (
                            <Link
                                href={buildPaginationUrl(currentPage)}
                                onClick={() => handlePageClick(currentPage + 1)}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 dark:bg-[var(--brand-color)] bg-[var(--brand-grey-foreground)] dark:hover:bg-[var(--brand-color-foreground)] text-black focus:z-20 focus:outline-offset-0 transition-transform! duration-200 hover:scale-105"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}
