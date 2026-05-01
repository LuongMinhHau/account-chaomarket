import { NextResponse } from 'next/server';
import { AppApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types/base-response';

/**
 * Standardized API response helpers for ChaoMarket.
 *
 * @example
 *   // Success
 *   return apiSuccess({ order }, 201);
 *
 *   // Error (auto-handles AppApiError, ZodError, unknown)
 *   return apiError(error);
 *
 *   // In a catch block
 *   catch (error) {
 *       return apiError(error, { route: '/api/checkout', userId });
 *   }
 */

/** Build a successful JSON response */
export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
            },
        },
        { status },
    );
}

/** Build an error JSON response from any error type */
export function apiError(
    error: unknown,
    context?: Record<string, unknown>,
): NextResponse<ApiResponse<null>> {
    // ── AppApiError (our structured error) ──
    if (error instanceof AppApiError) {
        if (error.statusCode >= 500) {
            logger.error({ err: error, ...context }, error.message);
        }
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    ...(error.details ? { details: error.details } : {}),
                },
                meta: { timestamp: new Date().toISOString() },
            },
            { status: error.statusCode },
        );
    }

    // ── Zod v4 validation error ──
    if (isZodError(error)) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: error.issues,
                },
                meta: { timestamp: new Date().toISOString() },
            },
            { status: 400 },
        );
    }

    // ── Next.js ApiError ──
    if (isNextApiError(error)) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: mapStatusToCode(error.statusCode),
                    message: error.message,
                },
                meta: { timestamp: new Date().toISOString() },
            },
            { status: error.statusCode },
        );
    }

    // ── Unknown error (unexpected crash) ──
    logger.error({ err: error, ...context }, 'Unhandled API error');
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong',
            },
            meta: { timestamp: new Date().toISOString() },
        },
        { status: 500 },
    );
}

// ── Type guards ──

function isZodError(error: unknown): error is { issues: unknown[] } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'issues' in error &&
        Array.isArray((error as { issues: unknown[] }).issues)
    );
}

function isNextApiError(error: unknown): error is { statusCode: number; message: string } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as { statusCode: unknown }).statusCode === 'number'
    );
}

function mapStatusToCode(status: number): string {
    switch (status) {
        case 400: return 'BAD_REQUEST';
        case 401: return 'UNAUTHORIZED';
        case 403: return 'FORBIDDEN';
        case 404: return 'NOT_FOUND';
        case 409: return 'CONFLICT';
        case 429: return 'RATE_LIMITED';
        default: return status >= 500 ? 'INTERNAL_ERROR' : 'CLIENT_ERROR';
    }
}
