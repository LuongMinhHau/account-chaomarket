import { BaseResponse } from '@/types/base-response';
import { ROLE } from '@/types/role';
import { getToken, JWT } from 'next-auth/jwt';
import { ApiError } from 'next/dist/server/api-utils';
import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Next.js RouteContext shape varies across route handlers
type Handler = (req: NextRequest, context?: any) => Promise<Response>;

/**
 * Higher-order function that wraps API route handlers with authentication,
 * role-based authorization, and centralized error handling.
 */
export const withAuth = (
    handler: Handler,
    roles: Array<ROLE> = []
): Handler => {
    return async (req, context) => {
        try {
            const token = await getToken({ req }) as (JWT & { role?: ROLE }) | null;

            // If roles are specified, check authorization
            if (roles.length > 0) {
                if (!token) {
                    const response: BaseResponse = {
                        message: 'Authentication required',
                    };
                    return NextResponse.json(response, { status: 401 });
                }

                const isAuthorized = roles.includes(token.role as ROLE);
                if (!isAuthorized) {
                    const response: BaseResponse = {
                        message: 'Insufficient permissions',
                    };
                    return NextResponse.json(response, { status: 403 });
                }
            }

            return await handler(req, context);
        } catch (error) {
            if (error instanceof ApiError) {
                return NextResponse.json(
                    { message: error.message },
                    { status: error.statusCode }
                );
            }

            // Log full error internally but return sanitized message
            console.error('[withAuth] Unhandled error:', error);
            return NextResponse.json(
                {
                    message:
                        process.env.NODE_ENV === 'production'
                            ? 'Internal Server Error'
                            : error instanceof Error
                              ? error.message
                              : 'Internal Server Error',
                },
                { status: 500 }
            );
        }
    };
};
