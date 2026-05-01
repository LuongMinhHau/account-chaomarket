export const buildURLSearchParams = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Record<string, any>
): URLSearchParams => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value instanceof Date ? value.toISOString() : String(value));
        }
    });
    return searchParams;
};
