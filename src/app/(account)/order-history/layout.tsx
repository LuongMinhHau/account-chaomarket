import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Lịch Sử Đơn Hàng' : 'Order History',
        description: locale === 'vi'
            ? 'Xem lại lịch sử đơn hàng và trạng thái thanh toán.'
            : 'Review your order history and payment status.',
    };
}

export default function OrderHistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
