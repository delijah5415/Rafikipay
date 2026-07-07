import { NextResponse } from 'next/server'

/**
 * Shared JSON response helpers for API route handlers.
 *
 * Centralizes the success/error response shapes that were previously
 * duplicated across route handlers (webhooks, cron, etc.).
 */

/**
 * Standard success response: `{ status: 'success', message, ...data }`.
 */
export function successResponse(
  message: string,
  data: Record<string, unknown> = {},
  status = 200
): NextResponse {
  return NextResponse.json({ status: 'success', message, ...data }, { status })
}

/**
 * Standard error response: `{ error }`.
 */
export function errorResponse(error: string, status = 500): NextResponse {
  return NextResponse.json({ error }, { status })
}
