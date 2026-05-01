'use client';

import { ENLocale, VILocale } from '../../public/languages';
import Image from 'next/image';
import { Check } from 'lucide-react';
import LoadingComponent from '@/components/loading-spiner';
import { useI18n } from '@/context/i18n/context';

export const languages = [
    {
        name: 'English',
        code: 'en',
        flag: ENLocale,
    },
    {
        name: 'Tiếng Việt',
        code: 'vi',
        flag: VILocale,
    },
];

export type LanguageOptions = {
    en: string;
    vi: string;
};

export function LanguageToggle() {
    const { locale, setLocale } = useI18n();

    if (!locale) {
        return <LoadingComponent />;
    }

    return (
        <div className={'space-y-4'}>
            {languages.map(lang => (
                <div
                    key={lang.code}
                    state-checked={
                        locale === lang.code ? 'checked' : 'unchecked'
                    }
                    className={
                        'relative px-2' +
                        ' py-4 rounded-lg' +
                        ' [&[state-checked="checked"]]:pointer-events-none cursor-pointer' +
                        ' [&[state-checked="unchecked"]]:hover:font-semibold' +
                        ' [&[state-checked="checked"]>.check-icon]:visible' +
                        ' transition-all! duration-75 ease-in-out' +
                        // Light mode styles
                        ' [&[state-checked="unchecked"]]:text-[var(--brand-grey-foreground)]' +
                        ' [&[state-checked="unchecked"]]:hover:text-black' +
                        ' [&[state-checked="checked"]]:text-[rgba(0,0,0,0.9)]' +
                        ' [&[state-checked="checked"]]:hover:text-[rgba(0,0,0,0.9)]' +
                        // Dark mode styles
                        ' dark:[&[state-checked="unchecked"]]:text-[var(--brand-grey-foreground)]' +
                        ' dark:[&[state-checked="unchecked"]]:hover:text-[rgba(255,255,255,0.9)]' +
                        ' dark:[&[state-checked="checked"]]:text-[rgba(255,255,255,0.9)]'
                    }
                    onClick={() => setLocale(lang.code)}
                >
                    <div className={'w-2/3 flex gap-4 items-center'}>
                        <Image
                            src={lang.flag}
                            alt={`locale-flag-${lang.code}`}
                            width={1920}
                            height={1080}
                            className={'h-full' + ' w-auto object-contain'}
                        />
                        <p>{lang.name}</p>
                    </div>
                    <Check
                        className={
                            'size-6 absolute right-2 invisible check-icon top-1/2 transform -translate-y-1/2'
                        }
                    />
                </div>
            ))}
        </div>
    );
}
