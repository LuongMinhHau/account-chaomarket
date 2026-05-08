/**
 * Format a numeric order code for display.
 * Returns: #TDDMMYYDDD (no dashes, matches PayOS display)
 *
 * This is a pure function safe for both client and server components.
 */
export function formatOrderCode(code: number | string): string {
    return `#${String(code)}`;
}
