/**
 * Standardized API Error class for ChaoMarket.
 *
 * Provides structured error responses with machine-readable codes,
 * HTTP status codes, and optional details (e.g. Zod validation errors).
 *
 * @example
 *   throw AppApiError.badRequest('INVALID_EMAIL', 'Email format is invalid');
 *   throw AppApiError.unauthorized();
 *   throw AppApiError.notFound('ORDER_NOT_FOUND', 'Order does not exist');
 */
export class AppApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(statusCode: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = 'AppApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }

    // ── Factory Methods ──

    static badRequest(code = 'BAD_REQUEST', message = 'Bad request', details?: unknown) {
        return new AppApiError(400, code, message, details);
    }

    static unauthorized(message = 'Unauthorized') {
        return new AppApiError(401, 'UNAUTHORIZED', message);
    }

    static forbidden(message = 'Forbidden') {
        return new AppApiError(403, 'FORBIDDEN', message);
    }

    static notFound(code = 'NOT_FOUND', message = 'Resource not found') {
        return new AppApiError(404, code, message);
    }

    static conflict(code = 'CONFLICT', message = 'Resource conflict') {
        return new AppApiError(409, code, message);
    }

    static tooManyRequests(message = 'Too many requests. Please try again later.', retryAfter?: number) {
        return new AppApiError(429, 'RATE_LIMITED', message, retryAfter ? { retryAfter } : undefined);
    }

    static internal(message = 'Internal server error') {
        return new AppApiError(500, 'INTERNAL_ERROR', message);
    }

    static badGateway(message = 'Service unavailable') {
        return new AppApiError(502, 'BAD_GATEWAY', message);
    }
}
