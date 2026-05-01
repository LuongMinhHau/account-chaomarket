import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppFooterServer from '@/components/app-footer-server';
import ContactButtonServer from '@/components/app-contacts-server';

export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex w-full max-w-svw text-sm md:text-[0.9375rem] lg:text-base">
                <AppSidebar />
                <div className="flex flex-col w-full bg-background/90 dark:bg-background">
                    <div className="flex flex-col w-full relative">
                        <div id="main-content" className="min-h-svh px-4 pt-6 pb-4 md:px-[30px] md:pt-8 md:pb-6">
                            <main className="w-full">
                                {children}
                            </main>
                        </div>
                        <AppFooterServer />
                    </div>
                    <ContactButtonServer />
                </div>
            </div>
        </SidebarProvider>
    );
}
