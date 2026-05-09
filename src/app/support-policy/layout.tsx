import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Chính Sách Hỗ Trợ' : 'Support Policy',
        description: locale === 'vi'
            ? 'Chính sách hỗ trợ khách hàng của Chào Market.'
            : 'Chào Market customer support policy.',
    };
}

export default function SupportPolicyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
