import CarouselLogin from '@/app/auth/components/carousel-login';
import AppFooterServer from '@/components/app-footer-server';
import ContactButtonServer from '@/components/app-contacts-server';
import AuthToolbar from '@/app/auth/components/auth-toolbar';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col w-full max-w-svw text-sm md:text-[0.9375rem] lg:text-base bg-background/90 dark:bg-background">
            <div className="flex flex-col w-full relative">
                <div id="main-content" className="min-h-svh px-4 md:px-[30px]">
                    <div className="w-full">
                        <div className="flex h-fit lg:h-svh w-full text-white items-center">
                            {/* Left Column: Branding */}
                            <div className="hidden lg:flex flex-col justify-center items-center h-svh py-10 px-4 w-1/2 relative">
                                <CarouselLogin />
                            </div>

                            {/* Right Column: Form Content */}
                            <main className="w-full lg:w-1/2 flex items-center justify-center h-fit py-10 px-6 md:px-16 lg:px-16 overflow-y-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
                <AppFooterServer />
            </div>
            <ContactButtonServer />
            {/* Floating language/theme controls for unauthenticated users */}
            <AuthToolbar />
        </div>
    );
}
