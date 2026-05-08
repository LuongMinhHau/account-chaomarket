'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
    /** Number of OTP digits */
    maxLength?: number;
    /** Current OTP value */
    value: string;
    /** Called when value changes */
    onChange: (value: string) => void;
    /** Additional class for the container */
    className?: string;
    /** Additional class for each slot */
    slotClassName?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
}

/**
 * Enterprise-grade OTP input with individual slot management.
 * Supports: click-to-select, arrow key navigation, paste, backspace, mobile numpad.
 */
export function OtpInput({
    maxLength = 6,
    value,
    onChange,
    className,
    slotClassName,
    disabled = false,
}: OtpInputProps) {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const isPasting = React.useRef(false);
    const digits = value.split('').concat(Array(maxLength).fill('')).slice(0, maxLength);

    const focusSlot = React.useCallback((index: number) => {
        const clamped = Math.max(0, Math.min(index, maxLength - 1));
        const el = inputRefs.current[clamped];
        if (el) {
            el.focus();
            requestAnimationFrame(() => el.select());
        }
    }, [maxLength]);

    const updateValue = React.useCallback((newDigits: string[]) => {
        onChange(newDigits.join('').slice(0, maxLength));
    }, [onChange, maxLength]);

    const handleInput = React.useCallback((index: number, e: React.FormEvent<HTMLInputElement>) => {
        // Skip if paste is handling this
        if (isPasting.current) return;

        const target = e.target as HTMLInputElement;
        const inputVal = target.value.replace(/\D/g, '');

        if (!inputVal) {
            // Reset the display value
            target.value = digits[index] || '';
            return;
        }

        // If multiple digits typed/pasted (fallback for paste)
        if (inputVal.length > 1) {
            const newDigits = Array(maxLength).fill('');
            for (let i = 0; i < Math.min(inputVal.length, maxLength); i++) {
                newDigits[i] = inputVal[i];
            }
            updateValue(newDigits);
            focusSlot(Math.min(inputVal.length, maxLength - 1));
            return;
        }

        // Single digit
        const newDigits = [...digits];
        newDigits[index] = inputVal;
        updateValue(newDigits);

        if (index < maxLength - 1) {
            focusSlot(index + 1);
        }
    }, [digits, maxLength, updateValue, focusSlot]);

    const handleKeyDown = React.useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Backspace': {
                e.preventDefault();
                const newDigits = [...digits];
                if (newDigits[index]) {
                    newDigits[index] = '';
                    updateValue(newDigits);
                } else if (index > 0) {
                    newDigits[index - 1] = '';
                    updateValue(newDigits);
                    focusSlot(index - 1);
                }
                break;
            }
            case 'Delete': {
                e.preventDefault();
                const newDigits = [...digits];
                newDigits[index] = '';
                updateValue(newDigits);
                break;
            }
            case 'ArrowLeft': {
                e.preventDefault();
                if (index > 0) focusSlot(index - 1);
                break;
            }
            case 'ArrowRight': {
                e.preventDefault();
                if (index < maxLength - 1) focusSlot(index + 1);
                break;
            }
            default: {
                // Block non-digit printable characters (allow Tab, Shift, etc.)
                if (e.key.length === 1 && !/^\d$/.test(e.key) && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                }
                break;
            }
        }
    }, [digits, maxLength, updateValue, focusSlot]);

    const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        isPasting.current = true;

        const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, maxLength);
        if (!pasted) {
            isPasting.current = false;
            return;
        }

        const newDigits = Array(maxLength).fill('');
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        updateValue(newDigits);

        // Focus last filled slot
        const lastIndex = Math.min(pasted.length, maxLength) - 1;
        focusSlot(lastIndex);

        // Reset paste flag after React re-render
        requestAnimationFrame(() => {
            isPasting.current = false;
        });
    }, [maxLength, updateValue, focusSlot]);

    const handleFocus = React.useCallback((index: number) => {
        requestAnimationFrame(() => {
            inputRefs.current[index]?.select();
        });
    }, []);

    return (
        <div className={cn('flex items-center gap-3 lg:gap-4', className)}>
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    value={digit}
                    disabled={disabled}
                    onInput={e => handleInput(index, e)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    className={cn(
                        'w-12 h-12 lg:w-14 lg:h-14 text-center text-xl lg:text-2xl font-bold rounded-lg',
                        'border transition-all outline-none cursor-pointer',
                        'text-brand-text bg-transparent',
                        'border-input',
                        'focus:ring-[2px] focus:border-black/60 focus:ring-black/10',
                        'dark:focus:border-white/50 dark:focus:ring-white/10',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        slotClassName
                    )}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}
