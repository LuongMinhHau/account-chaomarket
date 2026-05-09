import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Điều Khoản Sử Dụng' : 'Terms of Use',
        description: locale === 'vi'
            ? 'Điều khoản sử dụng dịch vụ Chào Market.'
            : 'Chào Market terms of use.',
    };
}

export default function TermsOfUseLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
