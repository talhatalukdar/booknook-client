# BookNook deployment guide

Three things get deployed: **MongoDB Atlas** (data), **Render** (Express API) and **Vercel**
(Next.js app with BetterAuth). Two repositories, two services, three submission links.
Nothing below has been run for you: deploy in this order and tick the checklist at the end.

## 0. Push both repositories to GitHub

```bash
# server (history is preserved)
cd booknook-server
git remote add origin https://github.com/<you>/booknook-server.git
git push -u origin main

# client
cd ../booknook-client
git remote add origin https://github.com/<you>/booknook-client.git
git push -u origin main
```

Check `git status` shows no `.env` / `.env.local` before pushing (both are git-ignored).

## 1. MongoDB Atlas

1. Create a free cluster, then **Database Access** > add a user with a strong password.
2. **Network Access** > allow `0.0.0.0/0` (Vercel and Render use changing IPs).
3. **Connect > Drivers**, copy the connection string. Use the same cluster and the same
   `DB_NAME` (for example `booknook`) for both services.

## 2. Pick your final URLs first

BetterAuth signs JWTs with the **client's public URL** as issuer and audience, and the server
checks that exact value. Decide the Vercel URL up front (for example
`https://booknook-yourname.vercel.app`; create the Vercel project first to reserve the name)
and use it verbatim, without a trailing slash, in steps 3 to 5.

## 3. Render (booknook-server)

New **Web Service** from the server repo (`render.yaml` is included):

| Setting | Value |
| --- | --- |
| Build command | `npm install --include=dev && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

The build command uses `--include=dev` because Render sets `NODE_ENV=production`, which would otherwise skip TypeScript, needed by `npm run build`.

Environment variables:

| Name | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `DB_NAME` | `booknook` |
| `CLIENT_URL` | your Vercel URL (CORS allowlist) |
| `BETTER_AUTH_URL` | your Vercel URL (same value) |

Open `https://<service>.onrender.com/health`: it must return `{"success":true,...}`.
The free plan sleeps when idle, so the first request after a pause can take about a minute.

## 4. Vercel (booknook-client)

Import the client repo (framework: Next.js). Environment variables, all set for Production:

| Name | Value |
| --- | --- |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` (new value, never reuse a dev secret) |
| `BETTER_AUTH_URL` | your Vercel URL |
| `MONGODB_URI` / `DB_NAME` | same as the server |
| `NEXT_PUBLIC_API_URL` | `https://<service>.onrender.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | from step 5 |
| `IMGBB_API_KEY` | your imgbb key (server-side only) |

Do **not** set `IMGBB_API_URL` in production: it exists only to point tests at a stub.
`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them.

## 5. Google OAuth

Google Cloud Console > APIs & Services > Credentials > **OAuth client ID** (Web application):

- Authorized JavaScript origin: `https://<your-app>.vercel.app`
- Authorized redirect URI: `https://<your-app>.vercel.app/api/auth/callback/google`
- (local) `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google`

If the consent screen is in "Testing", add your Google account under **Test users**.

## 6. Verify the live site (do all of these before submitting)

- [ ] `/health` on Render returns success.
- [ ] Home shows six New Arrivals from the database (or the empty state on a fresh database).
- [ ] Register, get sent to Login, log in; reload any private route and stay logged in.
- [ ] Log out, open a private route, get sent to Login, and land back on it afterwards.
- [ ] Google sign-in works.
- [ ] Add a book with a real cover: the image shows in All Books, Book Details, My Books and My Borrows.
- [ ] A second account can borrow it; available copies drop by one everywhere.
- [ ] Borrowing the same book again shows an error toast; a 0-copy book shows "Not Available".
- [ ] Return restores exactly one copy; the record stays in My Borrows as Returned.
- [ ] The second account cannot edit or delete the first account's book.
- [ ] Open `/books`, `/books/<id>` and `/my-books` directly and refresh: no errors.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Every protected call returns 401 "Invalid token" | `BETTER_AUTH_URL` differs between Vercel and Render (issuer/audience mismatch) or has a trailing slash |
| Browser shows a CORS error | `CLIENT_URL` on Render does not equal the exact Vercel origin |
| Home says "Cannot reach the library server" | wrong `NEXT_PUBLIC_API_URL`, or Render is waking up; redeploy Vercel after fixing |
| Google says `redirect_uri_mismatch` | redirect URI in Google Console does not match step 5 exactly |
| Uploads say "not configured" | `IMGBB_API_KEY` missing on Vercel (redeploy after adding) |
| Login fails with a database error | Atlas Network Access or `MONGODB_URI` is wrong |

## Secrets hygiene

Keys that were ever pasted into a chat, screenshot or commit must be rotated: regenerate the
imgbb key, the Google client secret, the Atlas password and `BETTER_AUTH_SECRET`.