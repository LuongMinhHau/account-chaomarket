import { useState, useCallback } from 'react';
import { useDebounce } from '@uidotdev/usehooks';

// Define a generic type for filter values (string or date range)
type FilterValue = string | { startDate?: Date; endDate?: Date } | undefined;

// Define the generic interface for filter parameters
export interface BaseFilterParams {
    [key: string]: FilterValue;
}

// Props interface with generic TFilter
interface UseFilterProps<TFilter extends BaseFilterParams> {
    initialFilters?: TFilter;
    initialSearchValue?: string;
    onApply: (value: { searchValue: string } & TFilter) => void;
}

// Generic useFilter hook
export const useFilter = <TFilter extends BaseFilterParams>({
    initialFilters = {} as TFilter,
    initialSearchValue = '',
    onApply,
}: UseFilterProps<TFilter>) => {
    const [filterParams, setFilterParams] = useState<TFilter>(initialFilters);
    const [searchValue, setSearchValue] = useState(initialSearchValue);
    const debouncedSearchValue = useDebounce(searchValue, 300);

    // Handler for search input change
    const handleSearchChange = useCallback(
        (event: { target: { value: string } }) => {
            setSearchValue(event.target.value);
        },
        []
    );

    // Handler for filter changes
    const handleFilterChange = useCallback(
        (key: keyof TFilter, value: FilterValue) => {
            setFilterParams(prev => ({ ...prev, [key]: value }));
        },
        []
    );

    // Handler for Clear All button
    const handleClearAll = useCallback(() => {
        setSearchValue('');
        setFilterParams(initialFilters);
        onApply({ searchValue: '', ...initialFilters });
    }, [initialFilters, onApply]);

    // Handler for Apply button
    const handleApply = useCallback(() => {
        onApply({ searchValue: debouncedSearchValue, ...filterParams });
    }, [debouncedSearchValue, filterParams, onApply]);

    return {
        filterParams,
        searchValue,
        handleSearchChange,
        handleFilterChange,
        handleClearAll,
        handleApply,
        setFilterParams,
        setSearchValue,
    };
};
