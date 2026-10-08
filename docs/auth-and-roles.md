# Auth, roles and route gating

## Model

- Supabase Auth with `@supabase/ssr` cookies. One app (`apps/web`), one login (`/login`) for every role. Email/password everywhere; Google OAuth button on `/login` (Google sign-ups become consumers; provider must be configured in the Supabase dashboard). Apple deferred post-launch.
- Roles: `consumer` | `business` | `admin`, stored in `public.profiles.role` **and** mirrored into the JWT `app_metadata.role` by database triggers. `business` is requested by passing `options.data.role = 'business'` to `signUp` (`businessSignupAction`, from `/empresa/registro` only); everything else becomes `consumer`; `admin` only via SQL.
- Read the role with `roleFromClaims(claims)` from `@org/supabase`.

## Clients (`@org/supabase`)

| Import                                     | Use in                                             | Notes                                                                                                    |
| ------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `createBrowserSupabase()` from `./browser` | Client Components                                  | one per tab is fine                                                                                      |
| `createServerSupabase()` from `./server`   | Server Components, Server Actions, Route Handlers  | user session, RLS applies; calls `cookies()` **before** reading env so prerendering bails out to dynamic |
| `createAdminSupabase()` from `./server`    | trusted server code only (billing, webhooks, push) | service role, bypasses RLS, needs `SUPABASE_SECRET_KEY`                                                  |
| `updateSession(request)` from `./proxy`    | `apps/web/src/proxy.ts`                            | refreshes cookies, returns `{ userId, role, response, redirectTo }`                                      |

Per-request helpers: `getSession()` in `src/lib/session.ts` (re-exported by `src/lib/business.ts`) and `getOwnBusiness()` in `src/lib/business.ts` are wrapped in React `cache()`; call them freely inside one render.

## Gates

`src/proxy.ts` (Next 16 replaced `middleware.ts`; the exported function is `proxy`, matcher is a string literal, must be statically analyzable) skips `/auth/*` and `/api/*` (callback, sign-out, webhooks, and a handy place to load a page without redirects) and otherwise calls `gateRedirect` from `src/lib/routing.ts`. That module is pure and unit-tested (`routing.spec.ts`); change the rules there, not in the proxy. Areas: `/empresa/*` = merchants, `/admin/*` = admin, everything else = consumers.

- signed out: `PUBLIC_PATHS` (`/`, `/login`, `/registro`, `/empresa`, `/empresa/registro`, `/sin-conexion`) pass; anything else → `/login?next=<path>`
- signed in on a landing / auth page (`SIGNED_OUT_ONLY_PATHS`) → the role's home (`homeForRole`: consumer → `/mapas`, business → `/empresa/inicio`, admin → `/admin`)
- `role === 'business'` outside `/empresa/*` → `/empresa/inicio`
- `role === 'consumer'` on `/empresa/*` or `/admin/*` → `/mapas`
- admins may go anywhere; a null role (missing metadata) is not blocked from either area
- `/sin-conexion` is always allowed so the service worker can pre-cache it

Merchant routes under `src/app/empresa/`:

- `(public)/page.tsx` = `/empresa` (signed-out merchant landing) and `(public)/registro/` = `/empresa/registro` (merchant sign-up).
- `(app)/layout.tsx`: session required, consumers → `/mapas` (defense in depth).
- `(app)/onboarding/`: merchant without a business. Admin → `/admin`; existing business → `/empresa/pendiente`.
- `(app)/pendiente/`: pending or rejected business copy; verified → `/empresa/inicio`.
- `(app)/(verified)/layout.tsx`: admin → `/admin`; no business → `/empresa/onboarding`; not verified → `/empresa/pendiente`. Everything a merchant does day to day (`inicio`, `cupones`, `verificar`, `contacto`, `cuenta` → `/empresa/...`) lives here. `cuenta/` edits the business (owner RLS + `protect_business_verification`), branches (`add_branch`, delete guarded by `branches_min_one`), the profile and the password.

`src/app/admin/` = `/admin`: `layout.tsx` requires a session; the page calls `notFound()` unless role is admin.

Consumer route groups under `src/app/(app)/`:

- `layout.tsx`: session required (defense in depth).
- `(tabs)/`: the shell with `BottomNav` — `mapas/`, `contacto/` (`ContactLinks`), `cuenta/` (subscription card with cancel, profile, password, sign-out). Pages use `pb-20`.
- `negocios/[id]/`, `negocios/[id]/cupones/[couponId]/` and `cuenta/tarjeta/` (update / reactivate card): full-screen pages with a back link, outside the tab shell. `cuenta/tarjeta` needs an existing `subscriptions` row (otherwise → `/suscripcion/tarjeta`).
- `inicio/`: neutral entry point (auth callbacks, Google sign-in, the PWA `start_url`); redirects by role with `homeForRole` (consumer → `/mapas`, admin → `/admin`; merchants are already sent to `/empresa/inicio` by the proxy).

- `(subscribe)/suscripcion/tarjeta/`: session required, **no** `subscriptions` row (otherwise → `/mapas`). This is the trial gate's destination.

Trial gate: `(app)/layout.tsx` looks up the consumer's `subscriptions` row (`getOwnSubscription`, cached per render) and redirects to `/suscripcion/tarjeta` when there is none; admins are exempt. An existing but lapsed subscription still enters the app — the coupon detail shows "Tu suscripción no está activa" when `issue_coupon_token` raises `SUBSCRIPTION_INACTIVE`, and `/cuenta` offers "Reactivar suscripción" (→ `/cuenta/tarjeta`).

Password change (`changePasswordAction` in the consumer and merchant `cuenta/actions.ts`) calls `supabase.auth.updateUser({ password })` on the user-session client; Supabase rejects reusing the current password ("debe ser diferente"). Email changes are not self-service in the MVP.

## Auth flows

- Server actions in `src/app/auth/actions.ts`: `loginAction`, `signupAction` (consumer, `/registro`), `businessSignupAction` (merchant, `/empresa/registro`; lands on `/empresa/onboarding`), `googleAction` (callback `next=/inicio`), `signOutAction`. They validate with zod from `@org/domain`, return `AuthActionState` (`{ error, fieldErrors, values }`) and `redirect()` on success.
- `next` query param → hidden input → `safeNextForRole(next, role)`: a same-app relative path the role may open, else the role's home. `/login` and `/registro` link to `/empresa/registro`; the landing `/` offers "Soy persona" (→ `/login`) and "Soy empresa" (→ `/empresa`).
- `auth/callback/route.ts` exchanges the OAuth / email-confirmation code and redirects to `safeNextForRole(next, role)` (same rule as `loginAction`: same-origin path inside the user's area, else the role home; control characters and backslashes are rejected).
- Sign-up without a session (email confirmation on) redirects to `/login?mensaje=confirma`.

## Gotchas

- One app serves every role, and a server action can be invoked from any page (the proxy only gates page URLs). Actions that only make sense for one role must check it themselves: `startTrialAction` and `updateCardAction` refuse `business` accounts; merchant actions go through `getOwnBusiness()` / role checks.

- `getClaims()` is local verification: deleted users keep a valid token until expiry.
- Server Components that call `createServerSupabase()` become dynamic automatically; add `export const dynamic = 'force-dynamic'` on pages that must never be cached (admin, coupon list).
