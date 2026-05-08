import { useI18n } from '@/context/i18n/context';
import { TranslationKey } from '@/types/translations';

export const TranslatedFormMessage = ({ message }: { message?: string }) => {
    const { t } = useI18n();
    if (!message) return null;

    return (
        <p className="text-[13px] font-medium text-red-600 dark:text-red-400 mt-1">
            {t(message as TranslationKey)}
        </p>
    );
};
