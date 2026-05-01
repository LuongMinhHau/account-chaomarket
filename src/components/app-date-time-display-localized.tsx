'use client';
import { useI18n } from '@/context/i18n/context';
import { formatLastUpdatedDate } from '@/utils/date-time-format';

const AppDateTimeDisplayLocalized = ({ date }: { date: Date }) => {
    const { locale } = useI18n();
    return formatLastUpdatedDate(date, locale);
};

export default AppDateTimeDisplayLocalized;
