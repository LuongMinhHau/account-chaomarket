'use client';
import { useI18n } from '@/context/i18n/context';
import { Localized } from '@/types/localized';

export default function AppLocalizeRender({
    contents,
}: {
    contents: Localized;
}) {
    const { locale } = useI18n();

    return contents[locale as 'en' | 'vi'];
}
