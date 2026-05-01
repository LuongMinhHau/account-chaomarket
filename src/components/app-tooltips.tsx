import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const AppTooltips = ({
    contents,
    trigger,
    className,
}: {
    contents: ReactNode;
    trigger: ReactNode;
    className?: string;
}) => {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                <TooltipContent
                    className={cn(
                        'bg-[var(--brand-grey)] [&>span>svg]:bg-[var(--brand-grey)]' +
                            ' [&>span>svg]:fill-[var(--brand-grey)] text-[var(--brand-grey-foreground)]' +
                            ' dark:bg-brand-dialog dark:[&>span>svg]:bg-brand-dialog' +
                            ' dark:[&>span>svg]:fill-brand-dialog [&>_*_p]:font-medium [&>_*_strong]:text-sm',
                        className
                    )}
                >
                    {contents}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default AppTooltips;
