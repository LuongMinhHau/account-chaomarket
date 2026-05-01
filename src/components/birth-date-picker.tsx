'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ClassValue } from 'clsx';
import { format } from 'date-fns';

const DAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS_EN = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

interface BirthDatePickerProps {
    containerClass?: ClassValue;
    buttonClass?: ClassValue;
    onDateChange?: (date: Date | undefined) => void;
    isFloatingLabel?: boolean;
    label?: string | React.ReactNode;
    highlightOnActive?: boolean;
    isMarginVisible?: boolean;
    defaultValue?: Date;
    value?: Date | string;
}

export function BirthDatePicker({
    containerClass = '',
    buttonClass = '',
    onDateChange,
    isFloatingLabel = false,
    label = 'Birthday (optional)',
    isMarginVisible = true,
    defaultValue,
    value,
    ...props
}: BirthDatePickerProps) {
    // Normalize value to Date if string was passed
    const normalizedValue = typeof value === 'string' ? (value ? new Date(value) : undefined) : value;
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        normalizedValue || defaultValue
    );
    const [viewDate, setViewDate] = useState(normalizedValue || defaultValue || new Date());
    const [showMonthSelect, setShowMonthSelect] = useState(false);
    const [showYearSelect, setShowYearSelect] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const yearListRef = useRef<HTMLDivElement>(null);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    // Update internal state when value prop changes (including reset to undefined)
    useEffect(() => {
        const v = typeof value === 'string' ? (value ? new Date(value) : undefined) : value;
        setSelectedDate(v);
        setViewDate(v || new Date());
    }, [value]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                monthRef.current &&
                !monthRef.current.contains(e.target as Node)
            ) {
                setShowMonthSelect(false);
            }
            if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
                setShowYearSelect(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto scroll to current year when opening year dropdown
    useEffect(() => {
        if (showYearSelect && yearListRef.current) {
            const currentYearElement = yearListRef.current.querySelector(
                '[data-current="true"]'
            );
            if (currentYearElement) {
                currentYearElement.scrollIntoView({
                    block: 'center',
                    behavior: 'instant',
                });
            }
        }
    }, [showYearSelect]);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startDay; i++) {
            const prevDate = new Date(
                currentYear,
                currentMonth,
                -startDay + i + 1
            );
            days.push(prevDate);
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

    // Generate years
    const years = useMemo(() => {
        const startYear = 1920;
        const endYear = new Date().getFullYear();
        return Array.from(
            { length: endYear - startYear + 1 },
            (_, i) => endYear - i
        );
    }, []);

    const handlePrevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        onDateChange?.(date);
        setOpen(false);
    };


    const handleSelectMonth = (month: number) => {
        setViewDate(new Date(currentYear, month, 1));
        setShowMonthSelect(false);
    };

    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, currentMonth, 1));
        setShowYearSelect(false);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        return (
            selectedDate &&
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth;
    };

    const isPrevMonth = (date: Date) => {
        return date.getMonth() < currentMonth ||
            (date.getMonth() === 11 && currentMonth === 0);
    };


    if (isFloatingLabel) {
        const shouldFloat = selectedDate || normalizedValue || open;

        return (
            <div
                className={cn(
                    containerClass,
                    'flex flex-col gap-2 relative',
                    `${isMarginVisible ? 'mb-4' : ''}`
                )}
            >
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={undefined}
                            id="date"
                            className={cn(
                                'inline-flex items-center justify-between gap-2 h-12' +
                                ' p-3 font-medium text-[14px] lg:text-[16px] rounded-md' +
                                ' border border-input' +
                                ' bg-transparent shadow-none' +
                                ' hover:bg-transparent' +
                                ' dark:hover:text-foreground' +
                                ' transition-all! duration-300 ease-in-out' +
                                ' outline-none cursor-pointer' +
                                ' focus-visible:border-input focus-visible:ring-0 dark:focus-visible:border-input',
                                `${open
                                    ? 'border-ring text-foreground'
                                    : 'text-foreground'
                                }`,
                                `dark:aria-invalid:ring-destructive aria-invalid:border-transparent dark:aria-invalid:border-transparent aria-invalid:ring-destructive/20 ring-2 ring-transparent`,
                                buttonClass
                            )
                            }
                            {...props}
                        >
                            <div
                                className={cn(
                                    'flex gap-1 items-center h-full w-full font-medium',
                                    selectedDate || normalizedValue
                                        ? 'text-foreground'
                                        : ''
                                )}
                            >
                                {(normalizedValue || selectedDate) && (
                                    <CalendarIcon className="h-4 w-4" />
                                )}
                                {normalizedValue ? (
                                    format(normalizedValue, 'dd/MM/yyyy')
                                ) : selectedDate ? (
                                    format(selectedDate, 'dd/MM/yyyy')
                                ) : (
                                    <></>
                                )}

                                {!normalizedValue && !selectedDate && (
                                    <span className={shouldFloat ? "text-[14px] text-[var(--brand-grey-foreground)]/50" : "opacity-0"}>dd/mm/yyyy</span>
                                )}

                                {shouldFloat && (
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 ml-2 transition-transform duration-200 -rotate-90',
                                            open && 'rotate-0'
                                        )}
                                    />
                                )}

                            </div>
                            <Label
                                htmlFor="date"
                                className={cn(
                                    'absolute start-2 flex items-center gap-1' +
                                    ' transition-all! duration-300 ease-in-out pointer-events-none',
                                    shouldFloat
                                        ? `top-0 -translate-y-1/2 bg-background dark:bg-background w-fit px-2 text-[14px] scale-75 origin-[0] text-muted-foreground ${selectedDate || normalizedValue ? 'font-semibold' : 'font-normal'}`
                                        : 'top-1/2 -translate-y-1/2 text-[14px] opacity-75 font-normal text-muted-foreground'
                                )}
                            >
                                {!shouldFloat && <CalendarIcon className="h-4 w-4 shrink-0" />}
                                {label}
                                {!shouldFloat && (
                                    <ChevronDown
                                        className={cn(
                                            'h-4 w-4 shrink-0 transition-transform duration-200 -rotate-90',
                                            open && 'rotate-0'
                                        )}
                                    />
                                )}
                            </Label>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-0 bg-stone-200 dark:bg-brand-dialog border border-black/20 dark:border-border"
                        align="start"
                        sideOffset={8}
                    >
                        <div className="p-2 sm:p-3">
                            {/* Navigation Header */}
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-2 text-brand-text dark:text-white hover:text-white active:scale-95 transition-all rounded-full hover:bg-[var(--brand-grey)] dark:hover:bg-zinc-700"
                                    aria-label="Previous month"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Month Selector */}
                                    <div className="relative" ref={monthRef}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMonthSelect(
                                                    !showMonthSelect
                                                );
                                                setShowYearSelect(false);
                                            }}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border"
                                        >
                                            {MONTHS_EN[currentMonth]}
                                            <ChevronDown
                                                className={cn(
                                                    'w-3 h-3 transition-transform',
                                                    showMonthSelect &&
                                                    'rotate-180'
                                                )}
                                            />
                                        </button>
                                        {showMonthSelect && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-52 overflow-y-auto w-28">
                                                {MONTHS_EN.map((month, i) => (
                                                    <button
                                                        type="button"
                                                        key={month}
                                                        onClick={() =>
                                                            handleSelectMonth(i)
                                                        }
                                                        className={cn(
                                                            'block w-full px-3 py-2.5 text-center text-sm hover:bg-zinc-100 decoration-2 dark:hover:bg-[var(--brand-grey)] transition-colors',
                                                            i === currentMonth &&
                                                            'text-black dark:text-white bg-stone-300 dark:bg-zinc-700 font-semibold'
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
                                            onClick={() => {
                                                setShowYearSelect(
                                                    !showYearSelect
                                                );
                                                setShowMonthSelect(false);
                                            }}
                                            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border"
                                        >
                                            {currentYear}
                                            <ChevronDown
                                                className={cn(
                                                    'w-3 h-3 transition-transform',
                                                    showYearSelect &&
                                                    'rotate-180'
                                                )}
                                            />
                                        </button>
                                        {showYearSelect && (
                                            <div
                                                ref={yearListRef}
                                                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-64 overflow-y-auto w-24"
                                            >
                                                {years.map(year => (
                                                    <button
                                                        type="button"
                                                        key={year}
                                                        data-current={
                                                            year === currentYear
                                                        }
                                                        onClick={() =>
                                                            handleSelectYear(
                                                                year
                                                            )
                                                        }
                                                        className={cn(
                                                            'block w-full px-3 py-3 text-center text-sm font-medium transition-colors',
                                                            'hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white',
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
                                    onClick={handleNextMonth}
                                    className="p-2 text-brand-text dark:text-white hover:text-white active:scale-95 transition-all rounded-full hover:bg-[var(--brand-grey)] dark:hover:bg-zinc-700"
                                    aria-label="Next month"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-0 mb-1">
                                {DAYS_EN.map(day => (
                                    <div
                                        key={day}
                                        className="w-8 h-7 flex items-center justify-center text-xs font-medium text-[var(--brand-grey-foreground)]"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7 gap-0">
                                {calendarDays.map((date, i) => (
                                    <button
                                        type="button"
                                        key={i}
                                        onClick={() =>
                                            date && isCurrentMonth(date) && handleSelectDate(date)
                                        }
                                        disabled={!date || !isCurrentMonth(date)}
                                        className={cn(
                                            'w-8 h-8 flex items-center justify-center text-sm transition-all duration-150 rounded-sm',
                                            'focus:outline-none active:scale-95 dark:hover:text-white',
                                            date &&
                                            !isCurrentMonth(date) &&
                                            isPrevMonth(date) &&
                                            'invisible',
                                            date &&
                                            !isCurrentMonth(date) &&
                                            !isPrevMonth(date) &&
                                            'text-[var(--brand-grey-foreground)]/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white rounded-sm',
                                            date &&
                                            isCurrentMonth(date) &&
                                            !isSelected(date) &&
                                            !isToday(date) &&
                                            'text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white rounded-sm',
                                            date &&
                                            isToday(date) &&
                                            !isSelected(date) &&
                                            'bg-[var(--brand-text)] text-white dark:bg-white dark:text-black font-bold rounded-sm',
                                            date &&
                                            isSelected(date) &&
                                            'underline decoration-2 underline-offset-4 text-brand-text dark:text-white font-bold rounded-sm'
                                        )}
                                    >
                                        {date?.getDate()}
                                    </button>
                                ))}
                            </div>

                            {/* Today button */}
                            <div className="-mx-2 sm:-mx-3 -mb-2 sm:-mb-3 border-t border-black/20 dark:border-border flex">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDate(undefined);
                                        setViewDate(new Date());
                                        onDateChange?.(undefined);
                                        setOpen(false);
                                    }}
                                    className="w-1/2 py-1.5 text-sm text-black/60 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:opacity-80 transition-colors font-medium rounded-sm border-r border-black/20 dark:border-border"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const today = new Date();
                                        setViewDate(today);
                                        setSelectedDate(today);
                                        onDateChange?.(today);
                                        setOpen(false);
                                    }}
                                    className="w-1/2 py-1.5 text-sm text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:opacity-80 transition-colors font-semibold rounded-sm"
                                >
                                    Today
                                </button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div >
        );
    }

    // Default implementation (non-floating label)
    return (
        <div className={cn(containerClass, 'flex flex-col gap-2 mb-4')}>
            <Label htmlFor="date" className="px-1">
                {label}
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className={cn(
                            'w-48 justify-between font-normal',
                            buttonClass
                        )}
                    >
                        <div
                            className={cn(
                                'flex gap-1 items-center',
                                selectedDate || normalizedValue ? 'text-brand-text' : ''
                            )}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            {normalizedValue
                                ? format(normalizedValue, 'dd/MM/yyyy')
                                : selectedDate
                                    ? format(selectedDate, 'dd/MM/yyyy')
                                    : 'DD/MM/YYYY'}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 bg-brand-dialog border-2 border-border"
                    align="start"
                    sideOffset={8}
                >
                    {/* Same calendar content as floating label version */}
                    <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-2 text-brand-text dark:text-white hover:text-[var(--brand-color)] transition-all rounded-full hover:bg-[var(--brand-grey)]"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-2">
                                <div className="relative" ref={monthRef}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowMonthSelect(!showMonthSelect);
                                            setShowYearSelect(false);
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-brand-text dark:text-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors rounded hover:bg-[var(--brand-grey)]"
                                    >
                                        {MONTHS_EN[currentMonth]}
                                        <ChevronDown
                                            className={cn(
                                                'w-3 h-3 transition-transform',
                                                showMonthSelect && 'rotate-180'
                                            )}
                                        />
                                    </button>
                                    {showMonthSelect && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-52 overflow-y-auto w-28">
                                            {MONTHS_EN.map((month, i) => (
                                                <button
                                                    type="button"
                                                    key={month}
                                                    onClick={() =>
                                                        handleSelectMonth(i)
                                                    }
                                                    className={cn(
                                                        'block w-full px-3 py-2.5 text-center text-sm hover:bg-[var(--brand-grey)] transition-colors',
                                                        i === currentMonth &&
                                                        'text-[var(--brand-color)] bg-[var(--brand-grey)] font-semibold'
                                                    )}
                                                >
                                                    {month}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative" ref={yearRef}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowYearSelect(!showYearSelect);
                                            setShowMonthSelect(false);
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-brand-text dark:text-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors rounded hover:bg-[var(--brand-grey)]"
                                    >
                                        {currentYear}
                                        <ChevronDown
                                            className={cn(
                                                'w-3 h-3 transition-transform',
                                                showYearSelect && 'rotate-180'
                                            )}
                                        />
                                    </button>
                                    {showYearSelect && (
                                        <div
                                            ref={yearListRef}
                                            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-brand-dialog border-2 border-border rounded-lg shadow-2xl max-h-64 overflow-y-auto w-24"
                                        >
                                            {years.map(year => (
                                                <button
                                                    type="button"
                                                    key={year}
                                                    data-current={
                                                        year === currentYear
                                                    }
                                                    onClick={() =>
                                                        handleSelectYear(year)
                                                    }
                                                    className={cn(
                                                        'block w-full px-3 py-3 text-center text-sm font-medium transition-colors',
                                                        'hover:bg-[var(--brand-grey)] hover:text-[var(--brand-color)]',
                                                        year === currentYear
                                                            ? 'text-[var(--brand-color)] bg-[var(--brand-grey)] font-bold border-l-2 border-[var(--brand-color)]'
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
                                onClick={handleNextMonth}
                                className="p-2 text-brand-text dark:text-white hover:text-[var(--brand-color)] transition-all rounded-full hover:bg-[var(--brand-grey)]"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0 mb-1">
                            {DAYS_EN.map(day => (
                                <div
                                    key={day}
                                    className="w-9 h-8 flex items-center justify-center text-xs font-medium text-[var(--brand-grey-foreground)]"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-0">
                            {calendarDays.map((date, i) => (
                                <button
                                    type="button"
                                    key={i}
                                    onClick={() =>
                                        date && handleSelectDate(date)
                                    }
                                    disabled={!date}
                                    className={cn(
                                        'w-9 h-9 flex items-center justify-center text-sm transition-all duration-150 rounded-sm',
                                        'hover:text-[var(--brand-color)] focus:outline-none active:scale-95',
                                        date &&
                                        !isCurrentMonth(date) &&
                                        'text-[var(--brand-grey-foreground)]/30',
                                        date &&
                                        isCurrentMonth(date) &&
                                        !isSelected(date) &&
                                        !isToday(date) &&
                                        'text-brand-text dark:text-white hover:bg-[var(--brand-grey)]',
                                        date &&
                                        isToday(date) &&
                                        !isSelected(date) &&
                                        'border border-[var(--brand-color)] text-[var(--brand-color)] font-medium',
                                        date &&
                                        isSelected(date) &&
                                        'bg-[var(--brand-color)] text-black font-medium'
                                    )}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-border flex">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDate(undefined);
                                    setViewDate(new Date());
                                    onDateChange?.(undefined);
                                    setOpen(false);
                                }}
                                className="w-1/2 py-2 text-sm text-[var(--brand-grey-foreground)] hover:text-white transition-colors border-r border-border"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    setViewDate(today);
                                    setSelectedDate(today);
                                    onDateChange?.(today);
                                    setOpen(false);
                                }}
                                className="w-1/2 py-2 text-sm text-[var(--brand-grey-foreground)] hover:text-white transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
