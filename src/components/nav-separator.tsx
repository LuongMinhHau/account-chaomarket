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
        <SidebarGroup className="p-0">
            <SidebarMenu>
                <SidebarMenuItem>
                    <Separator
                        className={cn('h-[0.25px] opacity-50', className)}
                        style={{ backgroundColor: 'var(--brand-separator)' }}
                    />
                    {isTrigger && (
                        <SidebarTrigger
                            className={cn(
                                'absolute -right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-21'
                            )}
                        />
                    )}
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};

export default NavSeparator;
