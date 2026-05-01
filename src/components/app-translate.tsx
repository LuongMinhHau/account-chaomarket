'use client';

import { TranslationKey } from '@/types/translations';
import { useI18n } from '@/context/i18n/context';

type OptionsType = 'uppercase-first' | 'uppercase-full' | 'lowercase-full';

interface TranslateProps {
    keyName: TranslationKey;
    options?: OptionsType;
}

export function T({ keyName, options }: TranslateProps) {
    const { t } = useI18n();

    let content = t(keyName) as string;

    if (options) {
        switch (options) {
            case 'uppercase-first':
                content = content.charAt(0).toUpperCase() + content.slice(1);
                break;
            case 'uppercase-full':
                content = content.toUpperCase();
                break;
            case 'lowercase-full':
                content = content.toLowerCase();
                break;
        }
    }

    return <>{content}</>;
}
