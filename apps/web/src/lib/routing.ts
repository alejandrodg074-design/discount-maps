import type { UserRole } from '@org/supabase';

/**
 * Route gating for the single app that serves consumers ("Persona"), merchants
 * ("Empresa") and admins. Pure so `src/proxy.ts` and the unit tests share it.
 *
 * Areas:
 * - consumer area: everything that is not below `/empresa` or `/admin`
 *   (`/mapas`, `/negocios/*`, `/cuenta`, `/contacto`, `/suscripcion/*`, `/inicio`)
 * - business area: `/empresa` and everything below it
 * - admin area: `/admin` and everything below it
 */

export const CONSUMER_HOME = '/mapas';
export const BUSINESS_HOME = '/empresa/inicio';
export const ADMIN_HOME = '/admin';

/** Reachable without a session. */
export const PUBLIC_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/login',
  '/registro',
  '/empresa',
  '/empresa/registro',
  '/sin-conexion',
]);

/** Landing and auth screens a signed-in user should not see again. */
export const SIGNED_OUT_ONLY_PATHS: ReadonlySet<string> = new Set([
  '/',
  '/login',
  '/registro',
  '/empresa',
  '/empresa/registro',
]);

function isUnder(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isBusinessPath(pathname: string): boolean {
  return isUnder(pathname, '/empresa');
}

export function isAdminPath(pathname: string): boolean {
  return isUnder(pathname, '/admin');
}

/** Where a signed-in user lands after login, on `/` and on `/inicio`. */
export function homeForRole(role: UserRole | null): string {
  if (role === 'business') return BUSINESS_HOME;
  if (role === 'admin') return ADMIN_HOME;
  return CONSUMER_HOME;
}

/**
 * Decides whether a request must be redirected. Returns the target path, or
 * null to let the request through. `/auth/*` and `/api/*` are not gated
 * (callbacks, sign-out, webhooks); the proxy skips them before calling this.
 */
export function gateRedirect(
  pathname: string,
  session: { signedIn: boolean; role: UserRole | null },
): string | null {
  if (!session.signedIn) {
    if (PUBLIC_PATHS.has(pathname)) return null;
    return `/login?next=${encodeURIComponent(pathname)}`;
  }

  if (pathname === '/sin-conexion') return null;

  const { role } = session;
  if (SIGNED_OUT_ONLY_PATHS.has(pathname)) return homeForRole(role);

  // Merchants only use the business area.
  if (role === 'business' && !isBusinessPath(pathname)) return BUSINESS_HOME;

  // Consumers never see the business or admin areas.
  if (
    role === 'consumer' &&
    (isBusinessPath(pathname) || isAdminPath(pathname))
  ) {
    return CONSUMER_HOME;
  }

  // Admins may go anywhere (pages decide what they show them).
  return null;
}

/**
 * Validates a post-login `next` value: same-app relative path only, and it must
 * belong to the user's area; anything else falls back to the role's home.
 */
export function safeNextForRole(value: unknown, role: UserRole | null): string {
  const home = homeForRole(role);
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\')
  ) {
    return home;
  }
  const pathname = value.split(/[?#]/)[0];
  return gateRedirect(pathname, { signedIn: true, role }) === null
    ? value
    : home;
}
