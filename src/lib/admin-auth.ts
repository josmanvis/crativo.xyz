import { NextRequest } from 'next/server';

/**
 * Shared admin gate. Accepts the key via the x-admin-key header or a ?key=
 * query param, matching the existing Carbon Ads admin routes.
 */
export function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_KEY || 'crativo-admin';
  const providedKey =
    request.headers.get('x-admin-key') || request.nextUrl.searchParams.get('key');
  return providedKey === adminKey;
}
