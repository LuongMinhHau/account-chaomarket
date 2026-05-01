/**
 * Generate public URL for R2-stored objects.
 * Simplified version used by some components.
 */
export const processFinalUrl = (path: string) => {
    return `${process.env.R2_PUBLIC_URL}/${path}`;
};
