---
name: testing-launch-site
description: Run and test the Rafikipay Next.js site locally (marketing/pricing/auth pages, subscription plans, signup→register API). Use when verifying UI/pricing/auth changes end-to-end.
---

# Testing the Rafikipay launch site

Next.js 14 App Router app living under `src/` (not root `app/`). Pricing is a single
source of truth in `src/config/plans.ts` (free $0 / pro $20 / premium $35 / group $65,
flat 2% tax). Routes of interest: `/`, `/pricing`, `/about`, `/signup`, `/login`,
`/dashboard`, `/merchant`, `/admin`, and API under `src/app/api/v1/*`.

## Local run (fully functional, incl. DB-backed signup/admin)
The hosted Vercel deploy is often red (build-time env not set) — test locally instead.

```bash
# 1. Postgres (signup/register + admin need a DB)
docker run -d --name rafiki-pg -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=rafiki \
  -p 5433:5432 postgres:15
export DATABASE_URL="postgresql://postgres:devpass@localhost:5433/rafiki"
npx prisma db push          # creates tables from prisma/schema.prisma

# 2. Dev server — run in a PERSISTENT shell (see gotcha below)
npm run dev                 # http://localhost:3000
```

Quick smoke test without a browser:
```bash
curl -s -X POST localhost:3000/api/v1/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"probe@test.com","name":"Probe"}'   # -> 201 {"user":{...}}; repeat -> 409
```

## Gotchas
- **Dev server dies if backgrounded in a one-shot exec** (`npm run dev &` / `nohup … &`).
  Start it in a *persistent* shell session and run curl/tests from separate one-shot shells.
- **Browser address-bar typing sometimes doesn't navigate** — clicking on-page links
  (e.g. "Back home", nav links) is more reliable than editing the URL bar. If you must
  use the URL bar, click it, `ctrl+a`, type, `Return`.
- Tailwind styles only render because `tailwind.config.js` + `postcss.config.js` exist;
  if the UI looks unstyled, those configs may be missing.
- Login is a **stub**: submitting the form just routes to `/dashboard` (no auth check).
  Signup, however, really persists via `/api/v1/auth/register`.

## What to assert (golden path)
1. `/pricing` and `/` both show four cards: Free $0, Pro $20 (Most popular), Premium $35,
   Group $65, each with "+ 2% tax". Wrong prices ⇒ config not wired.
2. Signup with a fresh email ⇒ green "Account created. You can now log in.";
   same email again ⇒ red "An account with that email already exists".
3. `/login`, `/merchant`, `/admin` load without 404/crash (these dirs are new).

## Unit tests / build
```bash
npm test              # 70 tests (config/plans, lib/*, services/*)
npm run build         # needs a DATABASE_URL env to be set (prisma generate)
```

## Devin Secrets Needed
None for local testing — Postgres is a throwaway docker container and no external API
keys are required for the pricing/signup/route flows. Live Stripe checkout would need
`STRIPE_SECRET_KEY` (not exercised here).
