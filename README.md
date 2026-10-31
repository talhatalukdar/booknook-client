# BookNook Client

**BookNook – A Small Online Library.** Browse the shelf, add books, borrow for a few days and return them.

- Live site: _add the Vercel URL here after deployment_
- API: `booknook-server` (Express + MongoDB), a separate repository

## Features

- Swiper hero slider with three slides and a prominent **Browse Books** call to action
- **New Arrivals**: the latest six books loaded live from MongoDB, shown in two desktop columns
- Email/password and Google sign-in with BetterAuth; sessions persist across reloads
- Private routes redirect to Login and return you to the page you wanted
- Real availability (`availableCopies` / `totalCopies`) from the database, never hardcoded
- Responsive layout, skeleton and error states, Sonner toasts, custom 404, per-page titles

> Status: homepage, navbar/footer, design system, Login, Register, All Books (search, category
> filter, sort, pagination), Book Details, the Borrow modal, 404 and route protection are
> implemented and tested. Add Book, My Books, My Borrows and Profile are the next phase.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style components on Radix · Lucide ·
Swiper · Framer Motion · Sonner · React Hook Form + Zod · BetterAuth (MongoDB adapter, JWT plugin).

## Authentication

BetterAuth runs inside this Next.js app (`/api/auth/*`) with the MongoDB adapter. The JWT plugin
signs short-lived (15 min) EdDSA tokens and publishes keys at `/api/auth/jwks`. `src/lib/api.ts`
gets a token with `authClient.token()`, keeps it in memory only, and sends it as
`Authorization: Bearer <token>`. The Express server verifies signature, expiry, issuer and
audience against that JWKS; identity is never taken from the request body.

## Environment variables

Copy `.env.example` to `.env.local`; every variable is documented there
(`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `MONGODB_URI`, `DB_NAME`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_IMGBB_API_KEY`).
`BETTER_AUTH_URL` here must equal the server's `BETTER_AUTH_URL`.

## Development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

## Deployment (Vercel)

Import the repo, set all variables above (production URLs, no trailing slashes), add
`https://<app>.vercel.app/api/auth/callback/google` to the Google OAuth redirect URIs, then set the
same app URL as `CLIENT_URL` and `BETTER_AUTH_URL` on the Render server.

## End-to-end test

`scripts/e2e/booknook_e2e.py` (Python + Playwright) drives the real stack: BetterAuth signup and
login, seeding through `POST /books` with a real JWT, search/filter/pagination, logged-out
redirect, borrow, duplicate and out-of-stock rejection, and responsive overflow checks. Start
MongoDB, the Express server (`BETTER_AUTH_URL=http://localhost:3000`) and this app
(`npm run build && npm start`), then run `python3 scripts/e2e/booknook_e2e.py`.

## Screenshots

_Add screenshots here after deployment._
