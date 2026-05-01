import { useState } from 'react';
import Cookies from 'js-cookie';

export default function useCookie<T = string>(
    name: string,
    initialValue?: T | null
) {
    const [value, setValue] = useState<T | null>(() => {
        const cookieValue = Cookies.get(name);
        if (cookieValue !== undefined && cookieValue !== null) {
            try {
                return JSON.parse(cookieValue) as T;
            } catch {
                return cookieValue as unknown as T;
            }
        }
        return initialValue ?? null;
    });

    const setCookie = (newValue: T, options?: Cookies.CookieAttributes) => {
        const serializedValue =
            typeof newValue === 'object'
                ? JSON.stringify(newValue)
                : String(newValue);

        Cookies.set(name, serializedValue, options);
        setValue(newValue);
    };

    const removeCookie = (options?: Cookies.CookieAttributes) => {
        Cookies.remove(name, options);
        setValue(null);
    };

    return { value, setCookie, removeCookie };
}
