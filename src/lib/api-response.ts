import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';

/**
 * Standard API response envelope for consistency across all routes.
 */
export interface ApiSuccessResponse<T = unknown> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export type ApiEnvelope<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a standardized success response.
 */
export function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json<ApiSuccessResponse<T>>(
        { success: true, data },
        { status }
    );
}

/**
 * Create a standardized error response.
 */
export function apiError(code: string, message: string, status = 400, details?: unknown) {
    return NextResponse.json<ApiErrorResponse>(
        { success: false, error: { code, message, details } },
        { status }
    );
}

/** 401 Unauthorized */
export function apiUnauthorized(message = 'Unauthorized') {
    return apiError('UNAUTHORIZED', message, 401);
}

/** 429 Rate Limited */
export function apiRateLimited(message = 'Too many requests') {
    return apiError('RATE_LIMITED', message, 429);
}

/** 500 Internal Server Error */
export function apiInternalError(message = 'Internal server error') {
    return apiError('INTERNAL_ERROR', message, 500);
}

/**
 * Parse and validate request body against a Zod schema.
 * Returns parsed data or a standardized error response.
 */
export async function parseBody<T>(
    request: Request,
    schema: ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse<ApiErrorResponse> }> {
    try {
        const raw = await request.json();
        const data = schema.parse(raw);
        return { data };
    } catch (err) {
        if (err instanceof ZodError) {
            return {
                error: apiError(
                    'VALIDATION_ERROR',
                    'Invalid request body',
                    400,
                    err.issues.map(e => ({ path: e.path.map(String).join('.'), message: e.message }))
                ),
            };
        }
        return {
            error: apiError('PARSE_ERROR', 'Invalid JSON body', 400),
        };
    }
}
