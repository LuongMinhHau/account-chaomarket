import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Chính Sách Cookie' : 'Cookie Policy',
        description: locale === 'vi'
            ? 'Chính sách cookie của Chào Market.'
            : 'Chào Market cookie policy.',
    };
}

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
