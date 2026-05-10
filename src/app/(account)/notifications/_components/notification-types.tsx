import { Shield, Settings, ShoppingBag, Info } from 'lucide-react';
import { useI18n } from '@/context/i18n/context';

// ── Types ──
export interface NotificationItem {
    id: string;
    type: 'security' | 'system' | 'account' | 'order';
    title: string;
    message: string;
    isRead: boolean;
    isStarred: boolean;
    createdAt: string;
}

export type NotificationFilter = 'all' | 'unread' | 'read' | 'starred' | 'security' | 'system' | 'account' | 'order';

export const ITEMS_PER_PAGE = 15;

// ── Hooks ──
export function useTypeConfig() {
    const { t } = useI18n();
    return {
        security: { label: t('notifications.type.security'), icon: <Shield className="w-4 h-4" /> },
        system: { label: t('notifications.type.system'), icon: <Settings className="w-4 h-4" /> },
        account: { label: t('notifications.type.account'), icon: <Info className="w-4 h-4" /> },
        order: { label: t('notifications.type.order'), icon: <ShoppingBag className="w-4 h-4" /> },
    } as const;
}

export function useTimeAgo() {
    return (dateStr: string): string => {
        const d = new Date(dateStr);
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${MM}/${yyyy}`;
    };
}
