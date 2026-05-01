'use client';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
    trigger?: ReactNode;
    headerContent?: ReactNode;
    mainContent?: ReactNode;
    footerContent?: ReactNode;
    triggerClassName?: string;
    contentContainerClassName?: string;
    floatingCloseButton?: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const AppDialog = ({
    trigger = <Button variant="outline">Show Dialog</Button>,
    headerContent = null,
    mainContent = null,
    footerContent = null,
    triggerClassName = '',
    contentContainerClassName = '',
    floatingCloseButton,
    onOpenChange,
    open,
}: DialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger
                className={
                    'dark:data-[state=open]:text-[var(--brand-color)] data-[state=open]:text-brand-text'
                }
                asChild
            >
                {trigger && (
                    <div
                        className={cn(
                            'dark:[&>button]:hover:text-[var(--brand-color)] transition-colors! duration-300 ease-in-out',
                            triggerClassName
                        )}
                    >
                        {trigger}
                    </div>
                )}
            </DialogTrigger>
            <DialogContent
                className={cn(
                    'bg-brand-dialog max-h-[90svh] overflow-y-auto [&>.dialog-header]:pt-0 [&>.dialog-footer]:p-0' +
                    ' [&>.dialog-content]:p-0' +
                    ' [&_.dialog-footer]:m-0 [&_[data-slot="dialog-close"]]:cursor-pointer lg:w-fit' +
                    ' lg:min-w-xl',
                    contentContainerClassName
                )}
                onOpenAutoFocus={e => e.preventDefault()}
            >
                {headerContent && (
                    <DialogTitle className="sr-only p-0!">
                        {typeof headerContent === 'string'
                            ? headerContent
                            : 'Dialog Header'}
                    </DialogTitle>
                )}
                {headerContent && (
                    <div className="dialog-header w-full">{headerContent}</div>
                )}
                {mainContent && (
                    <div className="dialog-content w-full max-w-full">
                        {mainContent}
                    </div>
                )}
                {footerContent && (
                    <div className="dialog-footer w-full max-w-full mt-4 dark:[&>_*_button:hover]:font-semibold">
                        {footerContent}
                    </div>
                )}
                {floatingCloseButton && (
                    <DialogClose>{floatingCloseButton}</DialogClose>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AppDialog;
