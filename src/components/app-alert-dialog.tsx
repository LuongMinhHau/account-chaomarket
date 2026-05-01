import { sanitizeHtml } from '@/lib/sanitize';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import React from 'react';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';

interface AppAlertDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    dialogTrigger?: React.ReactNode;
    content: {
        title: string;
        description?: React.ReactNode;
    };
    cancelled?: {
        title: string;
        onChange: () => void;
    };
    accepted?: {
        title: string;
        onChange: () => void;
        type?: 'button' | 'text';
    };
    onClickCloseIcon?: () => void;
    defaultOpen?: boolean;
    contentClassName?: string;
}

export default function AppAlertDialog({
    open,
    onOpenChange,
    dialogTrigger,
    content,
    cancelled,
    accepted,
    defaultOpen = false,
    onClickCloseIcon,
    contentClassName,
}: AppAlertDialogProps) {
    return (
        <AlertDialog
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
        >
            {dialogTrigger && (
                <AlertDialogTrigger asChild>{dialogTrigger}</AlertDialogTrigger>
            )}
            <AlertDialogContent
                overLayClassName={'backdrop-blur-sm'}
                className={cn(
                    'bg-brand-dialog w-fit min-w-fit max-w-fit',
                    contentClassName
                )}
                onClickActionOverlay={() => onClickCloseIcon?.()}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle
                        className={
                            'text-base lg:text-size-22 font-bold dark:text-[var(--brand-color)] text-brand-text' +
                            ' text-center'
                        }
                    >
                        <p
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.title) }}
                        />
                    </AlertDialogTitle>
                    {content?.description && (
                        <AlertDialogDescription asChild>
                            <div
                                className={
                                    '[&>_*]:text-base [&>_*]:w-fit [&>_*]:min-w-fit'
                                }
                            >
                                {content?.description}
                            </div>
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                <AlertDialogFooter
                    className={
                        accepted?.type === 'button' ||
                            accepted?.type === undefined
                            ? 'sm:justify-center'
                            : 'sm:justify-start'
                    }
                >
                    {cancelled && (
                        <AlertDialogCancel
                            onClick={cancelled.onChange}
                            className="h-10 px-8 min-w-[140px] border border-[var(--brand-grey-foreground)]/30 bg-transparent text-brand-text dark:text-white font-medium text-sm md:text-base hover:bg-[var(--brand-grey)]/50 transition-all duration-300 cursor-pointer"
                        >
                            {cancelled.title}
                        </AlertDialogCancel>
                    )}
                    {onClickCloseIcon && (
                        <AlertDialogCancel
                            onClick={onClickCloseIcon}
                            className={
                                'bg-transparent! border-none! shadow-none! ring-0! outline-none!' +
                                ' hover:bg-transparent! hover:cursor-pointer absolute top-2' +
                                ' right-2 text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition-colors duration-300'
                            }
                        >
                            <XIcon />
                        </AlertDialogCancel>
                    )}
                    {accepted && (
                        <AlertDialogAction
                            onClick={e => {
                                e.preventDefault();
                                accepted.onChange();
                            }}
                            className={cn(
                                accepted.type === 'button' ||
                                    accepted.type === undefined
                                    ? 'h-10 px-8 min-w-[140px] bg-[var(--brand-color)] text-black font-semibold text-sm md:text-base hover:bg-[var(--brand-color)]/90 hover:scale-105 transition-all duration-300 cursor-pointer'
                                    : 'bg-transparent text-brand-text dark:bg-transparent text-base px-0' +
                                    ' dark:text-[var(--brand-color)] font-semibold cursor-pointer'
                            )}
                        >
                            {accepted.title}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
