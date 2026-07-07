import { NextRequest } from 'next/server';
import { updateSession } from './src/lib/supabase/middleware';

/**
 * Refreshes the Supabase auth session and guards protected routes.
 * See src/lib/supabase/middleware.ts for the access rules.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/merchant/:path*',
    '/admin/:path*',
  ],
};
