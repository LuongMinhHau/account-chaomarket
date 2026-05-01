/** @deprecated Use ApiResponse instead for new routes */
export interface BaseResponse<T = null> {
    message?: string;
    data?: T;
    error?: string;
}

/**
 * Standardized API response envelope.
 * All new API routes should use this interface.
 */
export interface ApiResponse<T = null> {
    success: boolean;
    data?: T;
    error?: {
        /** Machine-readable error code (e.g. 'UNAUTHORIZED', 'VALIDATION_ERROR') */
        code: string;
        /** Human-readable error message */
        message: string;
        /** Additional details (e.g. Zod validation issues, field-level errors) */
        details?: unknown;
    };
    meta?: {
        requestId?: string;
        timestamp?: string;
    };
}
