'use client';

import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CalendarIcon,
    Clock,
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
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface DateTimePickerProps {
    containerClass?: ClassValue;
    buttonClass?: ClassValue;
    onDateTimeChange?: (dateTime: Date | undefined) => void;
    label?: string | React.ReactNode;
    defaultValue?: Date;
    value?: Date;
}

export function DateTimePicker({
    containerClass = '',
    buttonClass = '',
    onDateTimeChange,
    label = 'Select Date & Time',
    defaultValue,
    value,
    ...props
}: DateTimePickerProps) {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value || defaultValue
    );
    const [viewDate, setViewDate] = useState(value || defaultValue || new Date());
    const [showMonthSelect, setShowMonthSelect] = useState(false);
    const [showYearSelect, setShowYearSelect] = useState(false);
    const [selectedHour, setSelectedHour] = useState<number>(
        value ? value.getHours() : 9
    );
    const [selectedMinute, setSelectedMinute] = useState<number>(
        value ? value.getMinutes() : 0
    );
    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const yearListRef = useRef<HTMLDivElement>(null);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update internal state when value prop changes
    useEffect(() => {
        setSelectedDate(value);
        if (value) {
            setViewDate(value);
            setSelectedHour(value.getHours());
            setSelectedMinute(value.getMinutes());
        }
    }, [value]);

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

    // Scroll to current year
    useEffect(() => {
        if (showYearSelect && yearListRef.current) {
            const currentBtn = yearListRef.current.querySelector(
                '[data-current="true"]'
            );
            if (currentBtn) {
                currentBtn.scrollIntoView({ block: 'center' });
            }
        }
    }, [showYearSelect]);

    // Years: current year + next 5 years
    const years = useMemo(() => {
        const now = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => now + i);
    }, []);

    // Calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0, Sunday = 6
        const daysInMonth = lastDay.getDate();

        const days: (Date | null)[] = [];

        for (let i = 0; i < startDay; i++) {
            const prevDate = new Date(currentYear, currentMonth, -startDay + i + 1);
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

    const isCurrentMonth = (date: Date) =>
        date.getMonth() === currentMonth;

    const isPrevMonth = (date: Date) =>
        date.getMonth() < currentMonth ||
        (date.getMonth() === 11 && currentMonth === 0);

    const isPastDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d < today;
    };

    const isToday = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };

    const isSelected = (date: Date) =>
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

    const handleSelectDate = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(selectedHour, selectedMinute, 0, 0);
        setSelectedDate(newDate);
        onDateTimeChange?.(newDate);
    };


    const handleTimeChange = (hour: number, minute: number) => {
        setSelectedHour(hour);
        setSelectedMinute(minute);
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(hour, minute, 0, 0);
            setSelectedDate(newDate);
            onDateTimeChange?.(newDate);
        }
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
        setShowMonthSelect(false);
        setShowYearSelect(false);
    };

    const handleNextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
        setShowMonthSelect(false);
        setShowYearSelect(false);
    };

    const handleSelectMonth = (month: number) => {
        setViewDate(new Date(currentYear, month, 1));
        setShowMonthSelect(false);
    };

    const handleSelectYear = (year: number) => {
        setViewDate(new Date(year, currentMonth, 1));
        setShowYearSelect(false);
    };

    const shouldFloat = selectedDate || value || open;

    return (
        <div
            className={cn(
                containerClass,
                'flex flex-col gap-2 relative'
            )}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={undefined}
                        id="preferred-contact-date"
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
                                selectedDate || value
                                    ? 'text-foreground'
                                    : ''
                            )}
                        >
                            {(value || selectedDate) && (
                                <CalendarIcon className="h-4 w-4" />
                            )}
                            {value ? (
                                format(value, "hh:mm a '(UTC'xxx')' MMMM dd, yyyy")
                            ) : selectedDate ? (
                                format(selectedDate, "hh:mm a '(UTC'xxx')' MMMM dd, yyyy")
                            ) : (
                                <></>
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
                            htmlFor="preferred-contact-date"
                            className={cn(
                                'absolute start-2 flex items-center gap-1' +
                                ' transition-all! duration-300 ease-in-out pointer-events-none',
                                shouldFloat
                                    ? `top-0 -translate-y-1/2 bg-background dark:bg-background w-fit px-2 text-[14px] scale-75 origin-[0] text-muted-foreground ${selectedDate || value ? 'font-semibold' : 'font-normal'}`
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
                                            setShowMonthSelect(!showMonthSelect);
                                            setShowYearSelect(false);
                                        }}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border"
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
                                                    onClick={() => handleSelectMonth(i)}
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
                                            setShowYearSelect(!showYearSelect);
                                            setShowMonthSelect(false);
                                        }}
                                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-sm font-medium text-brand-text dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700 decoration-2 dark:hover:text-white transition-colors rounded border border-black/20 dark:border-border"
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
                                                    data-current={year === currentYear}
                                                    onClick={() => handleSelectYear(year)}
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
                                        date && isCurrentMonth(date) && !isPastDate(date) && handleSelectDate(date)
                                    }
                                    disabled={!date || !isCurrentMonth(date) || isPastDate(date)}
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
                                        isPastDate(date) &&
                                        'text-[var(--brand-grey-foreground)]/30 cursor-default',
                                        date &&
                                        isCurrentMonth(date) &&
                                        !isPastDate(date) &&
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

                        {/* Time Selector */}
                        <div className="-mx-2 sm:-mx-3 mt-3 pt-2.5 pb-2.5 border-t border-black/10 dark:border-white/10 flex items-center justify-center gap-3 px-4">
                            <Clock className="w-4 h-4 text-[var(--brand-grey-foreground)] shrink-0" />
                            <select
                                value={selectedHour}
                                onChange={e => handleTimeChange(Number(e.target.value), selectedMinute)}
                                className="bg-transparent border border-black/20 dark:border-border rounded-md px-3 py-1.5 text-sm font-semibold text-brand-text dark:text-white cursor-pointer focus:outline-none focus:border-[var(--brand-color)] text-center w-16 appearance-none"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {String(i).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                            <span className="text-brand-text dark:text-white font-bold text-base">:</span>
                            <select
                                value={selectedMinute}
                                onChange={e => handleTimeChange(selectedHour, Number(e.target.value))}
                                className="bg-transparent border border-black/20 dark:border-border rounded-md px-3 py-1.5 text-sm font-semibold text-brand-text dark:text-white cursor-pointer focus:outline-none focus:border-[var(--brand-color)] text-center w-16 appearance-none"
                            >
                                {[0, 15, 30, 45].map(m => (
                                    <option key={m} value={m}>
                                        {String(m).padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Today button */}
                        <div className="-mx-2 sm:-mx-3 -mb-2 sm:-mb-3 border-t border-black/20 dark:border-border flex">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDate(undefined);
                                    setViewDate(new Date());
                                    setSelectedHour(9);
                                    setSelectedMinute(0);
                                    onDateTimeChange?.(undefined);
                                    setOpen(false);
                                }}
                                className="w-1/2 py-1.5 text-sm text-black/60 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:opacity-80 transition-colors font-medium rounded-sm border-r border-black/20 dark:border-border"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const now = new Date();
                                    now.setHours(selectedHour, selectedMinute, 0, 0);
                                    setViewDate(now);
                                    setSelectedDate(now);
                                    onDateTimeChange?.(now);
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
        </div>
    );
}
