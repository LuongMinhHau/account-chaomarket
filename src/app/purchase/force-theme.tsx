'use client';

import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

function ForceThemeInner() {
    const { setTheme } = useTheme();
    const searchParams = useSearchParams();
    const theme = searchParams.get('theme');

    useEffect(() => {
        if (theme === 'light' || theme === 'dark') {
            setTheme(theme);
        }
    }, [theme, setTheme]);

    return null;
}

export default function ForceTheme() {
    return (
        <Suspense fallback={null}>
            <ForceThemeInner />
        </Suspense>
    );
}
