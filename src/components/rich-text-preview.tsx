'use client';
import '@/components/tiptap-templates/simple/rich-text-content.scss';
import { useI18n } from '@/context/i18n/context';
import { Localized } from '@/types/localized';
import { useEffect, useState, useMemo } from 'react';

function sanitizeHTML(html: string): string {
    if (typeof window === 'undefined') return html;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const DOMPurify = require('dompurify');
    const purify = DOMPurify.default ?? DOMPurify;
    return purify.sanitize(html, {
        ADD_TAGS: ['mark', 'span'],
        ADD_ATTR: ['style', 'id'],
    });
}

export default function RichTextPreview({ contents }: { contents: Localized }) {
    const { locale } = useI18n();
    const [localizedContents, setLocalizedContents] = useState<string>(
        contents[locale as 'en' | 'vi'] as string
    );

    const contentWithIds = useMemo(() => {
        let index = 0;
        return localizedContents.replace(
            /<h1[^>]*>(.*?)<\/h1>/g,
            (_match, inner) => {
                const id = `title-${index}`;
                index++;
                return `<h1><span id="${id}"></span>${inner}</h1>`;
            }
        );
    }, [localizedContents]);

    useEffect(() => {
        setLocalizedContents(contents[locale as 'en' | 'vi'] as string);
    }, [locale, contents]);

    return (
        <div
            dangerouslySetInnerHTML={{
                __html: sanitizeHTML(contentWithIds),
            }}
            className="rich-text-content"
        />
    );
}
