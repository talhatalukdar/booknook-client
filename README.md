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

> Status: homepage, design system, Login/Register, All Books, Book Details, Borrow modal,
> **Add Book (imgbb upload), My Books (edit/delete), My Borrows (return and history)** and route
> protection, the **Profile page** and a deployment guide are implemented and tested. Dark mode and the actual deployment are still open.

## Design

Editorial "Reading Room" look built from six reference designs: cream paper, deep forest green and
gold, arch-shaped cover panels, a light serif with italic accents and pill buttons. Typefaces are
**Instrument Serif** (headings, book titles) and **Instrument Sans** (interface), self-hosted from
`@fontsource`. Every book card is one shared component. Books with no copies left show a disabled
"Not Available" control instead of Borrow, and the Express API still rejects borrows without stock.
Extra features: search strip with category filter, real per-category counts and covers, library
stats computed from the database, recently viewed books (stored in your browser only), related
books on the details page, and profile picture upload.

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
`GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`, `IMGBB_API_KEY`).
`BETTER_AUTH_URL` here must equal the server's `BETTER_AUTH_URL`.

## Development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
npm run lint && npx tsc --noEmit && npm run build
```

## Deployment

Full step-by-step guide with a verification checklist: see [DEPLOYMENT.md](DEPLOYMENT.md).

### Vercel summary

Import the repo, set all variables above (production URLs, no trailing slashes), add
`https://<app>.vercel.app/api/auth/callback/google` to the Google OAuth redirect URIs, then set the
same app URL as `CLIENT_URL` and `BETTER_AUTH_URL` on the Render server.

## Image uploads

Covers are uploaded to imgbb through this app's own `/api/upload` route. The imgbb key
(`IMGBB_API_KEY`) is server-side only, so it never appears in browser code. The route requires a
session, accepts JPG/PNG/WebP/GIF up to 4 MB, checks the file signature and rate-limits uploads.

### Trying real imgbb locally

1. In `booknook-client/.env.local` add `IMGBB_API_KEY=<your key>` and make sure `IMGBB_API_URL`
   is **not** set (it only exists for the test stub).
2. Restart `npm run dev` (env files are read at startup).
3. Log in, open **Add Book**, choose a real cover and wait for "Cover uploaded".
4. Submit, then check the cover on All Books, Book Details, My Books and My Borrows.

## End-to-end test

`scripts/e2e/booknook_e2e.py` (browse, borrow) and `scripts/e2e/booknook_phase6_e2e.py` (add, edit, delete, return, isolation), both Python + Playwright, drives the real stack: BetterAuth signup and
login, seeding through `POST /books` with a real JWT, search/filter/pagination, logged-out
redirect, borrow, duplicate and out-of-stock rejection, and responsive overflow checks. Start
MongoDB, the Express server (`BETTER_AUTH_URL=http://localhost:3000`) and this app
(`npm run build && npm start`), start `node scripts/e2e/imgbb-stub.js` and set `IMGBB_API_KEY=TESTKEY-SECRET-123 IMGBB_API_URL=http://localhost:9999/1/upload` (a test-only stand-in for imgbb), then run the scripts.

## Screenshots

_Add screenshots here after deployment._
