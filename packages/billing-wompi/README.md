# @org/billing-wompi

Server-only Wompi client for the consumer area of `apps/web` (`scope:people`; the `scope:app` app may import it, `scope:business` libraries may not).

- `WompiClient`: `getAcceptanceTokens()` (`GET /merchants/info`, `x-merchant-public-key`), `getTokenizationKey()`, `createPaymentSource()`, `createTransaction()` (signs with the integrity secret, `recurrent: true`, one installment), `getTransaction()`. Errors throw `WompiError` with the HTTP status and body.
- `integritySignature(reference, amountInCents, currency, secret[, expirationTime])`.
- `eventChecksum(event, eventsSecret)` / `verifyEventChecksum(event, eventsSecret, headerChecksum?)` for `transaction.updated` webhooks.

The billing rules themselves (when to charge, what an outcome does to a subscription) live in `@org/domain` (`billing.ts`). The specs import the `lib/` files directly because the package index imports `server-only`.

Run `nx test @org/billing-wompi`.
