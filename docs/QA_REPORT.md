# EduPulse — End-to-End QA Report

Date: 2026-10-19
Scope: verify the existing end-to-end flows and fix real bugs. No new features.

## How this was tested

- **Backend / database (truly executed).** A harness created 7 throwaway
  `auth.users` (learner 18+, mentor 18+, under-18, not-set, third party,
  moderator, unverified mentor) inside a single **rolled-back transaction**, and
  replayed every request as `SET LOCAL ROLE authenticated` + a simulated JWT
  (`request.jwt.claims`, with `app_metadata.role` for the moderator). 72
  assertions cover cross-user read/write denial, RLS, RPCs, enums and the
  direct-PostgREST bypass paths. Result: **72/72 PASS** after fixes.
- **HTTP (truly executed).** Unauthenticated requests to protected routes return
  307 (redirect to `/login`); public routes return 200.
- **Authenticated HTTP page render (truly executed).** Signup is rate-limited, so
  the agent instead created **temp confirmed users directly in `auth.users`**
  (mirroring GoTrue's own row shape, including the empty-string token columns and
  an `auth.identities` row), then obtained a real session via the password grant
  and replayed the app's own `@supabase/ssr` session cookie
  (`sb-<ref>-auth-token`, `base64-` + base64url JSON, chunked at 3180). Every
  protected page was then fetched with that cookie. Two learners (one onboarded,
  one not) **plus a moderator** (`app_metadata.role = moderator`) were used. All
  temp users/rows were deleted afterward (verified 0 remaining).
- Harnesses: `qa.mjs`, `httpauth.mjs`, `httpauth2.mjs`, `rsltest.mjs`,
  `cleanup.mjs` in the OS temp dir (not committed).

### Not executed (needs a real browser engine) — reported as BLOCKED, not PASS

- **Interactive browser testing**: no `chrome`/`msedge`/`chromium` binary and no
  Playwright/Puppeteer in this environment, so client-side JS, clicks, form
  submissions, console errors and visual layout were not exercised.
  Server-rendered output + route guards were verified over HTTP instead.

## Results by flow

| Flow | Result | Notes |
|------|--------|-------|
| Auth redirect / route protection | PASS (HTTP) | public 200, protected 307 |
| Onboarding save (profile + safety) | PASS (DB) | own-row upsert works; cross-user write denied |
| Goals + matching visibility | PASS (DB) | matchable visible to peers, private hidden, cross-user update denied |
| Partner requests | PASS (DB) | self/spoof blocked, recipient-only accept, third party denied |
| Groups | PASS (DB) | own-create only, invite-only hidden, owner-only manage |
| Sessions (create/read/join) | PASS (DB) after fix | non-member create/self-join now denied |
| Notes / checklist | PASS (DB) | participants only; private notes author-only |
| Mentor booking (free) | PASS (DB) | RPC reserves slot, booking created |
| Booking guards: under-18 / not-set | PASS (DB) | rejected, no booking, slot untouched |
| Booking guards: paid | PASS (DB) after fix | rejected at RPC **and** at DB (insert revoked) |
| Booking guards: unverified mentor / double-book / cross-mentor slot | PASS (DB) | rejected |
| Booking transitions + slot release | PASS (DB) | role/party enforced; cancel releases slot |
| Mentor feedback | PASS (DB) | only learner, only after completion |
| Goal progress update | PASS (DB) | owner only, RLS-enforced |
| Session summaries | PASS (DB) | booking parties only |
| Safety: block / report | PASS (DB) | report internal columns hidden from reporter |
| Moderator: verification review | PASS (DB) | non-moderator denied; approve/reject works |
| Internal column secrecy | PASS (DB) | booking_payments / user_reports hidden |
| Authenticated render of all app routes | PASS (HTTP) | `/dashboard`,`/onboarding`,`/goals`,`/discover`,`/requests`,`/groups`,`/mentor`,`/bookings`,`/profile`,`/moderator` → 200 with correct titles |
| Authenticated `/sessions/[id]` (organizer) | PASS (HTTP) | 200 |
| Route protection while authed | PASS (HTTP) | authed `/login` → 307 `/dashboard` |
| Moderator gate (non-moderator vs moderator) | PASS (HTTP) | non-mod sees "Akses terbatas" and **no** report/verification data; mod sees both queues with the seeded pending mentor + open report |
| Cross-user session/notes/checklist | PASS (RSL) | U2 (non-member) → 0 rows on all four tables |
| Cross-user matchable goal | PASS (RSL) | visible to peers by design (`visibility='matchable'` + discoverable profile); private goals hidden |
| Non-member session detail page | PASS (no leak) | `getSessionDetail` → `null` → `notFound()`; HTTP 200 is Next's streaming status, body contains no session data |
| Onboarding completeness gate | PASS (HTTP) | not-onboarded user can still reach `/onboarding` (200); no hard redirect in proxy (by design) |
| `/sessions` bare path | EXPECTED 404 | no index route exists and no link points to it (only `/sessions/[sessionId]`) |

## Bugs found and fixed

Six genuine database-level gaps were found (reachable via direct PostgREST calls
that bypass the UI/server actions). Fixed by migration **011_rls_hardening**.

| # | Bug | Root cause | Fix |
|---|-----|-----------|-----|
| 1 | Paid booking creatable by direct insert | `mentor_bookings_insert` policy ignored price | Revoke client INSERT (RPC only) |
| 2 | Booking on an occupied slot (double-book) | no slot check in policy | same |
| 3 | Booking referencing another mentor's slot | slot not validated vs mentor | same |
| 4 | Learner self-verifying a payment | `booking_payments_insert` unrestricted | Revoke client INSERT |
| 5 | Non-member creating a session in any group | policy only checked `created_by` | Require active group membership |
| 6 | Any user self-joining any session by id | policy allowed `user_id = auth.uid()` | Require membership of the session's group |

After the fix, all four booking/payment attempts fail with
`permission denied` (42501) and the two session attempts fail RLS, while the
legitimate flows (RPC booking, organiser/member session create/join) still pass.

## Files changed

- `supabase/migrations/20261019130000_011_rls_hardening.sql` (new)
- `supabase/reference/011_rls_hardening.sql` (new, mirror)
- `supabase/migrations_bundle.sql` (appended section)
- No application (TypeScript) code changed.

## Applied to remote

Migration 011 (and idempotently re-ran 010) applied to project
`oogqboodhrvjfkfaumza`. `npm run lint` and `npx tsc --noEmit` pass.

## Remaining blockers needing manual action

1. **Interactive browser testing** — no browser binary and no Playwright/Puppeteer
   in this environment, so client-side JS, clicks, form submits, console errors and
   visuals were **not** exercised. Server-rendered pages and route guards were
   verified over HTTP instead. Short manual checklist below.
2. **Reverse-block detection** — `user_blocks` RLS hides "someone blocked me", so
   the app cannot warn a blocked user. Closing it needs a DB function/trigger
   (schema change) — left unchanged pending your decision (documented limitation).
3. **Moderator account** — a temporary moderator (JWT `app_metadata.role=moderator`)
   was created and deleted to verify the gate over HTTP; a permanent one is still
   needed for ongoing manual browser QA.
4. **Signup** — password grant works; `/auth/v1/signup` with a throwaway domain
   returns **400 `email_address_invalid`** (GoTrue rejects `@example.com`), and a
   valid domain hits the shared-SMTP rate limit (**429**, seen earlier). Confirm
   SMTP / raise the auth rate limit before live signup testing or launch. No Auth
   production config was changed.

### Manual browser checklist (for a human, ~10 min, 2 accounts)

1. Sign up + confirm email (or use a seeded account) → completes `/onboarding`,
   then `/dashboard` shows the profile.
2. Create a goal on `/goals`; check `/discover/partners` lists a peer and
   `/discover/mentors` lists a mentor.
3. Create a group on `/groups`; a second account submits a join request; owner
   accepts; open the group → create a session; only members see
   `/sessions/[id]` notes/checklist; a non-member gets a not-found.
4. Mentor room: submit verification as mentor (→ `pending`); moderator approves at
   `/moderator`; book a **free** service (slot reserved, booking `pending`);
   confirm → complete → leave feedback.
5. Try to book a **paid** service and (as under-18) any mentoring → both must be
   refused with no booking/slot created.
6. Block/report another user; open `/moderator` as a non-moderator → must show
   "Akses terbatas" with no report data.
