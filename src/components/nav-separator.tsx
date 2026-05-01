import React from 'react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarTrigger,
} from './ui/sidebar';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

const NavSeparator = ({
    isTrigger = true,
    className,
}: { isTrigger?: boolean } & React.ComponentProps<'button'>) => {
    return (
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Separator className={cn('my-2 h-[0.25px] opacity-50', className)} style={{ backgroundColor: 'var(--brand-separator)' }} />
                    {isTrigger && (
                        <SidebarTrigger
                            className={cn(
                                'absolute dark:bg-[var(--brand-grey)] -right-0 top-1/2 transform' +
                                ' -translate-y-1/2 translate-x-9/10 cursor-pointer z-21 text-white'
                            )}
                        />
                    )}
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};

export default NavSeparator;
