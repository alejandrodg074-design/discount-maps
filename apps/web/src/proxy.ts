import type { NextRequest } from 'next/server';
import { updateSession } from '@org/supabase/proxy';
import { gateRedirect } from './lib/routing';

/**
 * Session refresh + role gates for the single app. The rules live in
 * `lib/routing.ts` (unit-tested): consumers stay out of `/empresa` and `/admin`,
 * merchants stay inside `/empresa`, admins go anywhere.
 */
export async function proxy(request: NextRequest) {
  const { response, userId, role, redirectTo } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Auth callback / sign-out and API routes manage their own session handling.
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return response;
  }

  const target = gateRedirect(pathname, { signedIn: Boolean(userId), role });
  return target ? redirectTo(target) : response;
}

export const config = {
  // Everything except Next internals, static assets and PWA files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
