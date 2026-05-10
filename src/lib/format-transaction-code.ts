/**
 * Format a numeric transaction code for display.
 * Returns: #TDDMMYYDDD (no dashes, matches PayOS display)
 *
 * This is a pure function safe for both client and server components.
 */
export function formatTransactionCode(code: number | string): string {
    return `#${String(code)}`;
}
