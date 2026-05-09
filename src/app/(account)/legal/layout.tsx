import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Pháp Lý' : 'Legal',
        description: locale === 'vi'
            ? 'Thông tin pháp lý và quy định của Chào Market.'
            : 'Chào Market legal information and regulations.',
    };
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
