'use client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ChevronsUpDown, Info, LucideIcon } from 'lucide-react';
import AppTooltips from '@/components/app-tooltips';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

// 1. Interface updated to make 'group' optional
export interface DropdownOption {
    value: string;
    label: string;
    icon?: LucideIcon;
    iconColor?: string;
    group?: string;
    tooltip?: string;
}

interface AppDropdownProps {
    options: DropdownOption[];
    defaultValue?: string;
    value?: string; // Added to support controlled component behavior
    buttonClassName?: string;
    contentClassName?: string;
    onValueChange?: (value: string) => void;
    labelVisible?: boolean;
    shouldSelectedValueHighlight?: boolean;
    formatDisplayLabel?: (value: string) => string;
    shouldDisplayGroupLabel?: boolean;
}

// Helper type for grouping
interface GroupedOptions {
    groupName: string;
    items: DropdownOption[];
}

// A unique key to identify items that don't have a group.
const UNGROUPED_KEY = '$$__NO_GROUP__$$';

const AppDropdown = ({
    options,
    defaultValue,
    value, // Use 'value' prop for controlled state
    buttonClassName = 'max-h-[20px] font-semibold text-lg',
    contentClassName = 'w-44',
    onValueChange,
    labelVisible = true,
    shouldSelectedValueHighlight = false,
    formatDisplayLabel,
    shouldDisplayGroupLabel = true,
}: AppDropdownProps) => {
    // Determine the initial value: controlled 'value' > 'defaultValue' > first option
    const initialValue = value ?? defaultValue ?? options[0]?.value ?? '';
    const [internalValue, setInternalValue] = useState(initialValue);
    const { t } = useI18n();

    // If 'value' prop is provided, it's a controlled component.
    // Otherwise, it's an uncontrolled component using its internal state.
    const selectedValue = value !== undefined ? value : internalValue;

    const handleValueChange = (newValue: string) => {
        // Update internal state only if it's an uncontrolled component
        if (value === undefined) {
            setInternalValue(newValue);
        }
        // Always call the external handler if it exists
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    const selectedLabel =
        options.find(option => option.value === selectedValue)?.label ??
        selectedValue;

    // 2. Updated Grouping Logic
    const groupedOptions = options.reduce<GroupedOptions[]>((acc, option) => {
        // Use the UNGROUPED_KEY if option.group is undefined or null
        const groupName = option.group ?? UNGROUPED_KEY;

        const existingGroup = acc.find(g => g.groupName === groupName);

        if (existingGroup) {
            existingGroup.items.push(option);
        } else {
            acc.push({ groupName, items: [option] });
        }
        return acc;
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        'group gap-1 hover:bg-transparent! hover:font-semibold',
                        'lg:text-[16px] text-[13px]',
                        buttonClassName
                    )}
                >
                    {labelVisible && `${t('common.sortBy.label')}: `}
                    <p
                        className={cn(
                            'font-semibold group-hover:font-bold',
                            `${shouldSelectedValueHighlight && 'dark:text-white text-black'}`
                        )}
                    >
                        {formatDisplayLabel
                            ? formatDisplayLabel(selectedLabel)
                            : selectedLabel}
                    </p>
                    <ChevronsUpDown strokeWidth={2.5} className={cn(
                        'size-3.5 text-current',
                        shouldSelectedValueHighlight && 'dark:text-white text-black'
                    )} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(contentClassName, 'bg-white dark:bg-brand-dropdown')}
            >
                <DropdownMenuRadioGroup
                    value={selectedValue}
                    onValueChange={handleValueChange}
                >
                    {groupedOptions.map(group => (
                        <div key={group.groupName}>
                            {/* 3. Conditionally render the group label */}
                            {shouldDisplayGroupLabel &&
                                group.groupName !== UNGROUPED_KEY && (
                                    <DropdownMenuLabel className="text-[14px] font-semibold">
                                        {group.groupName}
                                    </DropdownMenuLabel>
                                )}

                            {/* Render group items (this part remains the same) */}
                            {group.items.map(option => (
                                <DropdownMenuRadioItem
                                    key={option.value}
                                    value={option.value}
                                    className='text-sm text-[var(--brand-grey-foreground)] font-normal dark:hover:text-foreground hover:text-foreground dark:hover:bg-white/5 hover:bg-black/5 cursor-pointer transition-colors! duration-200 ease-in-out dark:[&[aria-checked="true"]]:text-foreground [&[aria-checked="true"]]:text-foreground [&[aria-checked="true"]]:font-medium [&[aria-checked="true"]]:bg-black/5 dark:[&[aria-checked="true"]]:bg-white/10'
                                >
                                    {option.icon && (
                                        <option.icon
                                            className={`mr-2 h-4 w-4 ${option.iconColor || ''}`}
                                        />
                                    )}
                                    {formatDisplayLabel
                                        ? formatDisplayLabel(option.label)
                                        : option.label}
                                    {option.tooltip && (
                                        <AppTooltips
                                            className="px-4! py-3! rounded-xl! shadow-xl border! border-neutral-200/50! dark:border-white/10!"
                                            trigger={
                                                <button type="button" className="ml-1 cursor-help opacity-60 hover:opacity-100 transition-opacity" aria-label="Info">
                                                    <Info size={11} className="text-current transition-colors" />
                                                </button>
                                            }
                                            contents={
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-3.5 shrink-0 text-black dark:text-white">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                                                        </svg>
                                                        <strong className="text-[12px]! font-bold capitalize tracking-wide text-black dark:text-white">
                                                            {option.label}
                                                        </strong>
                                                    </div>
                                                    <p className="text-[12px] leading-[17px] opacity-90">
                                                        {option.tooltip}
                                                    </p>
                                                </div>
                                            }
                                        />
                                    )}
                                </DropdownMenuRadioItem>
                            ))}
                        </div>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AppDropdown;
