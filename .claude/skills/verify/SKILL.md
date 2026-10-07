---
name: verify
description: Re-check that Discount Maps still works - static gate, cloud pgTAP + advisors, and the live browser recipes relevant to the areas that changed (or the full smoke tour). Reports in plain language; fixes nothing unless asked.
argument-hint: '[area: maps | coupons | qr | billing | push | account | pwa | all]'
---

Scope: `$ARGUMENTS` (default `all`). Recipes live in `docs/verification-playbook.md`; fixtures and passwords in `docs/database.md`.

1. **Static**: stop dev servers, restore `apps/web/next-env.d.ts`, run `NX_DAEMON=false CI=true pnpm nx run-many -t lint typecheck test build`.
2. **Database**: `SUPABASE_PROJECT_REF=rurjvcrmgtrznezvwkih node scripts/pgtap-remote.mjs` and `pnpm supabase db advisors --linked --project-ref rurjvcrmgtrznezvwkih --output-format json`; compare the warning list with the accepted residuals in `docs/database.md`.
3. **Live** (in-app browser, `preview_start` with `web` on port 3000; sign out or clear `sb-*` cookies at `/api/x` before switching users):
   - `all`: landing → consumer sign-in as `qa-consumer@` → `/mapas` (map pins, list) → business profile → coupon QR (`[data-token]`) → `/cuenta`; then merchant sign-in as `qa-owner@` (same `/login`) → `/empresa/cupones` → `/empresa/verificar` paste flow with the token → `/empresa/cuenta`; `/contacto` and `/empresa/contacto`; role bounce (consumer on `/empresa/inicio` → `/mapas`, merchant on `/mapas` → `/empresa/inicio`).
   - a single area: only its recipe(s).
4. **Report**: one line per check with ✅ / ❌ and what was seen; for ❌ include the exact message shown and the likely cause in plain words. Do not fix anything unless the owner asked to; propose the fix instead.
