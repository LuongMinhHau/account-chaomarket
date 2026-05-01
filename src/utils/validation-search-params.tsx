/* eslint-disable @typescript-eslint/no-explicit-any */

export const validationSearchParams = (searchParams: object) => {
    const validSearchParams: Record<string, string> = {};
    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            validSearchParams[key] = String(value);
        }
    });

    return validSearchParams;
};

export const validationSearchParamsWithAllValue = <
    T extends Record<string, any>,
>(
    params: T
): Partial<T> | undefined => {
    const cleaned = Object.entries(params).reduce((acc, [key, value]) => {
        // Condition: ignore 'all', empty strings, null, or undefined
        if (
            value !== 'all' &&
            value !== 'All' &&
            value !== '' &&
            value !== null &&
            value !== undefined
        ) {
            acc[key as keyof T] = value;
        }
        return acc;
    }, {} as Partial<T>);

    // Return the object if it has keys, otherwise return undefined
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};
