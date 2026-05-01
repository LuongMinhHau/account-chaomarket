'use client';

import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useI18n } from '@/context/i18n/context';
import { cn } from '@/lib/utils';
import { formatLastUpdatedDate } from '@/utils/date-time-format';

interface TimeAgoProps {
    dateString: string | number | Date;
    className?: string;
    /** Hours threshold for switching from relative to full format (default: 72 = 3 days) */
    thresholdHours?: number;
    /** Whether to show day of week in the formatted date (default: false) */
    showDayOfWeek?: boolean;
}

export const TimeAgo = ({ dateString, className, thresholdHours = 72 }: TimeAgoProps) => {
    const { locale } = useI18n();
    if (!dateString) {
        return null;
    }

    try {
        const articleDate = new Date(dateString);
        const now = new Date();
        const hoursDifference = differenceInHours(now, articleDate);

        let formattedDate: string;

        if (hoursDifference < thresholdHours) {
            // Relative time: "about 2 hours ago" / "khoảng 2 giờ trước"
            formattedDate = formatDistanceToNow(articleDate, {
                addSuffix: true,
                locale: locale === 'vi' ? vi : enUS,
            });
        } else {
            // Full format with UTC: "7:00 AM (UTC+07:00) Saturday, 28/02/2026"
            formattedDate = formatLastUpdatedDate(articleDate, locale);
        }

        return (
            <span className={cn(className, 'first-letter:uppercase')} suppressHydrationWarning>
                {formattedDate}
            </span>
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        console.error(
            'Invalid date provided to TimeAgo component:',
            dateString
        );
        return <span className={className}>{String(dateString)}</span>;
    }
};
