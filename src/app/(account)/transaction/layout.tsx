import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Lịch Sử Giao Dịch' : 'Transaction History',
        description: locale === 'vi'
            ? 'Xem lại lịch sử giao dịch và trạng thái thanh toán.'
            : 'Review your transaction history and payment status.',
    };
}

export default function OrderHistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
