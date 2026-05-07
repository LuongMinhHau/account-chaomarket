import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppFooterServer from '@/components/app-footer-server';
import ContactButtonServer from '@/components/app-contacts-server';
import AppNavbarMobile from '@/components/app-navbar-mobile';

export default function AccountLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex w-full max-w-svw text-sm md:text-[0.9375rem] lg:text-base">
                <AppSidebar />
                <div className="flex flex-col w-full bg-background/90 dark:bg-background gap-2">
                    <div className="flex flex-col w-full relative">
                        <AppNavbarMobile />
                        <div id="main-content" className="min-h-svh px-5 pt-4 pb-3">
                            <main className="w-full mt-4">
                                {children}
                            </main>
                        </div>
                        <ContactButtonServer />
                    </div>
                    <AppFooterServer />
                </div>
            </div>
        </SidebarProvider>
    );
}
