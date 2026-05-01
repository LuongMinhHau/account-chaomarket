'use client';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS_EN = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface AppDateRangePickerProps {
    onChange: (range: { startDate?: Date; endDate?: Date }) => void;
    label?: string;
    value?: {
        startDate?: Date;
        endDate?: Date;
    };
    highlightOnActive?: boolean;
    shouldLabelVisible?: boolean;
    vertical?: boolean;
}

// ── Reusable inline calendar (matches BirthDatePicker style) ──
function InlineCalendar({
    selected,
    onSelect,
    disabledDate,
}: {
    selected?: Date;
    onSelect: (date: Date) => void;
    disabledDate?: (date: Date) => boolean;
}) {
    const [viewDate, setViewDate] = useState(selected || new Date());
    const [showMonthSelect, setShowMonthSelect] = useState(false);
    const [showYearSelect, setShowYearSelect] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const monthListRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const yearListRef = useRef<HTMLDivElement>(null);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (monthRef.current && !monthRef.current.contains(e.target as Node)) {
                setShowMonthSelect(false);
            }
            if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
                setShowYearSelect(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto scroll to current year
    useEffect(() => {
        if (showYearSelect && yearListRef.current) {
            const el = yearListRef.current.querySelector('[data-current="true"]');
            if (el) el.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
    }, [showYearSelect]);

    // Allow wheel scrolling inside month/year dropdowns when inside a Radix Dialog
    // react-remove-scroll blocks wheel events at the document level; stopPropagation prevents that
    useEffect(() => {
        const el = monthListRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => e.stopPropagation();
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [showMonthSelect]);

    useEffect(() => {
        const el = yearListRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => e.stopPropagation();
        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [showYearSelect]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];
        for (let i = 0; i < startDay; i++) {
            days.push(new Date(currentYear, currentMonth, -startDay + i + 1));
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(currentYear, currentMonth, i));
        }
        const totalCells = days.length <= 35 ? 35 : 42;
        const remaining = totalCells - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(currentYear, currentMonth + 1, i));
        }
        return days;
    }, [currentYear, currentMonth]);

    const years = useMemo(() => {
        const endYear = new Date().getFullYear() + 5;
        const startYear = 1970;
        return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
    }, []);

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date: Date) => {
        return selected &&
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();
    };

    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;

    const isPrevMonth = (date: Date) =>
        date.getMonth() < currentMonth || (date.getMonth() === 11 && currentMonth === 0);

    return (
        <div className="p-2 sm:p-3">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <button
                    type="button"
                    onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
                    className="p-2 text-brand-text dark:text-white hover:text-[var(--brand-color)] dark:hover:text-white active:scale-95 transition-all rounded-full hover:bg-[var(--brand-grey)] dark:hover:bg-zinc-700"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2">
                    {/* Month Selector */}
                    <div className="relative" ref={monthRef}>
                        <button
                            type="button"
                            onClick={() => { setShowMonthSelect(!showMonthSelect); setShowYearSelect(false); }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:underline decoration-2 dark:hover:no-underline dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border dark:hover:bg-zinc-700"
                        >
                            {MONTHS_EN[currentMonth]}
                            <ChevronDown className={cn('w-3 h-3 transition-transform', showMonthSelect && 'rotate-180')} />
                        </button>
                        {showMonthSelect && (
                            <div ref={monthListRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-52 overflow-y-auto w-28">
                                {MONTHS_EN.map((month, i) => (
                                    <button
                                        type="button"
                                        key={month}
                                        onClick={() => { setViewDate(new Date(currentYear, i, 1)); setShowMonthSelect(false); }}
                                        className={cn(
                                            'block w-full px-3 py-2.5 text-center text-sm hover:underline decoration-2 dark:hover:no-underline dark:hover:bg-[var(--brand-grey)] transition-colors',
                                            i === currentMonth && 'text-black dark:text-white bg-stone-300 dark:bg-zinc-700 font-semibold'
                                        )}
                                    >
                                        {month}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Year Selector */}
                    <div className="relative" ref={yearRef}>
                        <button
                            type="button"
                            onClick={() => { setShowYearSelect(!showYearSelect); setShowMonthSelect(false); }}
                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:underline decoration-2 dark:hover:no-underline dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border dark:hover:bg-zinc-700"
                        >
                            {currentYear}
                            <ChevronDown className={cn('w-3 h-3 transition-transform', showYearSelect && 'rotate-180')} />
                        </button>
                        {showYearSelect && (
                            <div ref={yearListRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-64 overflow-y-auto w-24">
                                {years.map(year => (
                                    <button
                                        type="button"
                                        key={year}
                                        data-current={year === currentYear}
                                        onClick={() => { setViewDate(new Date(year, currentMonth, 1)); setShowYearSelect(false); }}
                                        className={cn(
                                            'block w-full px-3 py-3 text-center text-sm font-medium transition-colors',
                                            'hover:underline decoration-2 dark:hover:no-underline dark:hover:bg-zinc-700 dark:hover:text-white',
                                            year === currentYear
                                                ? 'text-black dark:text-white bg-stone-300 dark:bg-zinc-700 font-bold border-l-2 border-black dark:border-white'
                                                : 'text-brand-text dark:text-white'
                                        )}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
                    className="p-2 text-brand-text dark:text-white hover:text-[var(--brand-color)] dark:hover:text-white active:scale-95 transition-all rounded-full hover:bg-[var(--brand-grey)] dark:hover:bg-zinc-700"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-1">
                {DAYS_EN.map(day => (
                    <div key={day} className="w-8 h-7 flex items-center justify-center text-xs font-medium text-[var(--brand-grey-foreground)]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((date, i) => {
                    const disabled = !date || !isCurrentMonth(date) || (disabledDate && disabledDate(date));
                    return (
                        <button
                            type="button"
                            key={i}
                            onClick={() => date && !disabled && onSelect(date)}
                            disabled={!!disabled}
                            className={cn(
                                'w-8 h-8 flex items-center justify-center text-sm transition-all duration-150 rounded-sm',
                                'focus:outline-none active:scale-95',
                                date && !isCurrentMonth(date) && isPrevMonth(date) && 'invisible',
                                date && !isCurrentMonth(date) && !isPrevMonth(date) && 'text-[var(--brand-grey-foreground)]/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white rounded-sm',
                                date && isCurrentMonth(date) && !isSelected(date) && !isToday(date) && !disabled &&
                                'text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-white rounded-sm',
                                date && isToday(date) && !isSelected(date) && 'bg-[var(--brand-text)] text-white dark:bg-white dark:text-black font-bold rounded-sm',
                                date && isSelected(date) && 'underline decoration-2 underline-offset-4 text-brand-text dark:text-white font-bold rounded-sm',
                                disabled && isCurrentMonth(date!) && 'opacity-30 cursor-not-allowed'
                            )}
                        >
                            {date?.getDate()}
                        </button>
                    );
                })}
            </div>

            {/* Today button */}
            <div className="-mx-2 sm:-mx-3 -mb-2 sm:-mb-3 border-t border-black/20 dark:border-border mt-2">
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date();
                        setViewDate(today);
                        if (!disabledDate || !disabledDate(today)) {
                            onSelect(today);
                        }
                    }}
                    className="w-full py-1.5 text-sm text-black dark:text-white hover:underline decoration-2 dark:hover:no-underline dark:hover:opacity-80 transition-colors font-semibold"
                >
                    Today
                </button>
            </div>
        </div>
    );
}

// ── Main Component ──
const AppDateRangePicker = ({
    onChange,
    value,
    label = 'Date Range',
    highlightOnActive = false,
    shouldLabelVisible = true,
    vertical = false,
}: AppDateRangePickerProps) => {
    const [open, setOpen] = useState<{ start: boolean; end: boolean }>({
        start: false,
        end: false,
    });
    const [manualInput, setManualInput] = useState<{ start: boolean; end: boolean }>({
        start: false,
        end: false,
    });
    const [inputValue, setInputValue] = useState<{ start: string; end: string }>({
        start: '',
        end: '',
    });
    const startInputRef = useRef<HTMLInputElement>(null);
    const endInputRef = useRef<HTMLInputElement>(null);
    const { t } = useI18n();

    const handleOpenPopover = useCallback(
        (key: keyof typeof open, value: boolean) => {
            setOpen(prev => ({
                ...prev,
                [key]: value,
            }));
        },
        []
    );

    // Parse dd/MM/yyyy, dd.MM.yyyy, or dd-MM-yyyy string to Date
    const parseManualDate = (str: string): Date | null => {
        const match = str.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
        if (!match) return null;
        const [, dd, mm, yyyy] = match;
        const day = parseInt(dd, 10);
        const month = parseInt(mm, 10) - 1;
        const year = parseInt(yyyy, 10);
        const date = new Date(year, month, day);
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
        return date;
    };

    const handleDoubleClick = (key: 'start' | 'end') => {
        const currentDate = key === 'start' ? value?.startDate : value?.endDate;
        setInputValue(prev => ({
            ...prev,
            [key]: currentDate ? format(currentDate, 'dd/MM/yyyy') : '',
        }));
        setManualInput(prev => ({ ...prev, [key]: true }));
        // Focus the input after render
        setTimeout(() => {
            if (key === 'start') startInputRef.current?.focus();
            else endInputRef.current?.focus();
        }, 50);
    };

    const handleManualSubmit = (key: 'start' | 'end') => {
        const parsed = parseManualDate(inputValue[key]);
        if (parsed) {
            if (key === 'start') {
                // Validate: start <= end
                if (value?.endDate && parsed > value.endDate) {
                    // Invalid, revert
                } else {
                    onChange({ startDate: parsed, endDate: value?.endDate });
                }
            } else {
                // Validate: end >= start
                if (value?.startDate && parsed < value.startDate) {
                    // Invalid, revert
                } else {
                    onChange({ startDate: value?.startDate, endDate: parsed });
                }
            }
        }
        setManualInput(prev => ({ ...prev, [key]: false }));
    };

    const handleManualKeyDown = (key: 'start' | 'end', e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleManualSubmit(key);
        } else if (e.key === 'Escape') {
            setManualInput(prev => ({ ...prev, [key]: false }));
        }
    };

    const isHighLightVisible = (date: Date | undefined) => {
        if (!date) return '';
        if (highlightOnActive)
            return 'dark:text-white text-brand-text';
        return 'text-brand-text';
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            {shouldLabelVisible && (
                <Label className="px-1 font-semibold">{label}</Label>
            )}
            <div className={cn('flex items-center', vertical ? 'flex-col gap-1' : 'gap-[1rem]')}>
                {/* Start Date */}
                {manualInput.start ? (
                    <div className={cn('flex items-center gap-1 border border-zinc-400 dark:border-zinc-500 rounded-md bg-transparent focus-within:bg-black/5 dark:focus-within:bg-white/5 transition-colors duration-200', vertical ? 'w-full px-2 py-1 text-xs' : 'w-[calc(50%-1.5rem)] px-3 py-2')}>
                        <CalendarIcon className="h-4 w-4 text-[var(--brand-grey-foreground)]" />
                        <input
                            ref={startInputRef}
                            type="text"
                            value={inputValue.start}
                            onChange={e => setInputValue(prev => ({ ...prev, start: e.target.value }))}
                            onBlur={() => handleManualSubmit('start')}
                            onKeyDown={e => handleManualKeyDown('start', e)}
                            placeholder="dd/mm/yyyy"
                            className="bg-transparent outline-none text-sm w-full text-brand-text dark:text-white placeholder:text-[var(--brand-grey-foreground)]"
                        />
                    </div>
                ) : (
                    <Popover
                        open={open.start}
                        onOpenChange={value => handleOpenPopover('start', value)}
                    >
                        <PopoverTrigger
                            className={cn(
                                'text-[var(--brand-grey-foreground)] dark:hover:text-white transition-all!' +
                                ' duration-300 ease-in-out',
                                `${isHighLightVisible(value?.startDate)}`
                            )}
                            asChild
                        >
                            <Button
                                variant="outline"
                                id="start-date"
                                className={cn('justify-between font-medium', vertical ? 'w-full h-6 px-2 text-[12px]!' : 'w-[calc(50%-1.5rem)]')}
                                onDoubleClick={(e) => {
                                    e.preventDefault();
                                    handleOpenPopover('start', false);
                                    handleDoubleClick('start');
                                }}
                            >
                                <div className="flex gap-1 items-center">
                                    <CalendarIcon className={cn(vertical ? 'h-3 w-3' : 'h-4 w-4')} />
                                    {value?.startDate
                                        ? format(value.startDate, 'dd/MM/yyyy')
                                        : t('common.selectStartDate')}
                                </div>
                                <ChevronDown className={cn('transition-transform duration-200', vertical ? 'h-3 w-3' : 'h-4 w-4', open.start && 'rotate-180')} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 bg-stone-200 dark:bg-brand-dialog border border-black/20 dark:border-border"
                            align="start"
                            sideOffset={8}
                        >
                            <InlineCalendar
                                selected={value?.startDate}
                                onSelect={date => {
                                    onChange({ startDate: date, endDate: value?.endDate });
                                    handleOpenPopover('start', false);
                                }}
                                disabledDate={date => value?.endDate ? date > value.endDate : false}
                            />
                        </PopoverContent>
                    </Popover>
                )}
                {!vertical && <Separator className="w-full bg-[var(--brand-grey-foreground)] max-w-[1rem]" />}
                {/* End Date */}
                {manualInput.end ? (
                    <div className={cn('flex items-center gap-1 border border-zinc-400 dark:border-zinc-500 rounded-md bg-transparent focus-within:bg-black/5 dark:focus-within:bg-white/5 transition-colors duration-200', vertical ? 'w-full px-2 py-1 text-xs' : 'w-[calc(50%-1.5rem)] px-3 py-2')}>
                        <CalendarIcon className="h-4 w-4 text-[var(--brand-grey-foreground)]" />
                        <input
                            ref={endInputRef}
                            type="text"
                            value={inputValue.end}
                            onChange={e => setInputValue(prev => ({ ...prev, end: e.target.value }))}
                            onBlur={() => handleManualSubmit('end')}
                            onKeyDown={e => handleManualKeyDown('end', e)}
                            placeholder="dd/mm/yyyy"
                            className="bg-transparent outline-none text-sm w-full text-brand-text dark:text-white placeholder:text-[var(--brand-grey-foreground)]"
                        />
                    </div>
                ) : (
                    <Popover
                        open={open.end}
                        onOpenChange={value => handleOpenPopover('end', value)}
                    >
                        <PopoverTrigger
                            className="text-[var(--brand-grey-foreground)] dark:hover:text-white transition-all! duration-300 ease-in-out"
                            asChild
                        >
                            <Button
                                variant="outline"
                                id="end-date"
                                className={cn(
                                    'justify-between font-medium',
                                    vertical ? 'w-full h-6 px-2 text-[12px]!' : 'w-[calc(50%-1.5rem)]',
                                    `${isHighLightVisible(value?.endDate)}`
                                )}
                                onDoubleClick={(e) => {
                                    e.preventDefault();
                                    handleOpenPopover('end', false);
                                    handleDoubleClick('end');
                                }}
                            >
                                <div className="flex gap-1 items-center">
                                    <CalendarIcon className={cn(vertical ? 'h-3 w-3' : 'h-4 w-4')} />
                                    {value?.endDate
                                        ? format(value.endDate, 'dd/MM/yyyy')
                                        : t('common.selectEndDate')}
                                </div>
                                <ChevronDown className={cn('transition-transform duration-200', vertical ? 'h-3 w-3' : 'h-4 w-4', open.end && 'rotate-180')} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 bg-stone-200 dark:bg-brand-dialog border border-black/20 dark:border-border"
                            align="start"
                            sideOffset={8}
                        >
                            <InlineCalendar
                                selected={value?.endDate}
                                onSelect={date => {
                                    onChange({ startDate: value?.startDate, endDate: date });
                                    handleOpenPopover('end', false);
                                }}
                                disabledDate={date => value?.startDate ? date < value.startDate : false}
                            />
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    );
};

export default AppDateRangePicker;
