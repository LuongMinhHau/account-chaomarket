import * as React from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <Input
                placeholder=" "
                className={cn(
                    'peer h-12 !text-[16px] text-foreground [&::-webkit-outer-spin-button]:appearance-none' +
                    ' [&::-webkit-inner-spin-button]:appearance-none font-medium' +
                    ' [-moz-appearance:textfield] placeholder:text-[14px]',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
FloatingInput.displayName = 'FloatingInput';

const FloatingLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
    return (
        <Label
            className={cn(
                'peer-focus:text-muted-foreground peer-focus:dark:text-muted-foreground absolute start-2 top-0 z-10 origin-[0]' +
                ' -translate-y-1/2 scale-75 transform bg-transparent px-2 text-[14px]' +
                ' text-muted-foreground font-semibold' +
                ' duration-300' +
                ' peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal' +
                ' peer-placeholder-shown:scale-100 peer-placeholder-shown:opacity-75 peer-focus:top-2 peer-focus:-translate-y-4' +
                ' peer-focus:scale-75 peer-focus:opacity-100' +
                ' peer-focus:px-2 peer-focus:bg-background dark:peer-focus:bg-background dark:peer-focus:w-fit' +
                ' peer-focus:w-fit' +
                ' peer-placeholder-shown:bg-transparent' +
                ' peer-[:not(:placeholder-shown)]:bg-background dark:peer-[:not(:placeholder-shown)]:bg-background' +
                ' dark:peer-placeholder-shown:w-[calc(100%-10px)] peer-placeholder-shown:w-[calc(100%-10px)]' +
                ' rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4' +
                ' cursor-text transition-all! pointer-events-none',
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
FloatingLabel.displayName = 'FloatingLabel';

type FloatingLabelInputProps = InputProps & {
    label?: string | React.ReactNode;
    children?: React.ReactNode;
};

const FloatingLabelInput = React.forwardRef<
    React.ElementRef<typeof FloatingInput>,
    FloatingLabelInputProps
>(({ id, label, children, ...props }, ref) => {
    return (
        <div className="relative">
            <FloatingInput ref={ref} id={id} {...props} />
            <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
            {children}
        </div>
    );
});
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingInput, FloatingLabel, FloatingLabelInput };
