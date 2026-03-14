# Runtime Guide

## Default UX

The application now defaults to **Polish (`pl`)** for all end-user screens.

Protected-shell branding is fixed to:

- `Kasia i Łukasz`

Available languages:

- `pl` (default)
- `en`

Language is stored in the `wedding-planner-locale` cookie and can be changed with the switcher visible at the top of:

- landing page
- login page
- protected planner shell
- public guest website

---

## Authentication UX

The protected planner shell includes a dedicated account section with:

- signed-in user label
- top-level logout button

Destructive actions use a confirmation prompt before deletion.

Double click opens edit mode in the planner lists/cards for:

- guests
- vendors
- tasks
- timeline

Logout redirects back to `/login`.

Demo credentials:

```
lucasjezap@gmail.com
Avatar3232!
```

Witness demo account:

```
swiadek@gmail.com
Avatar3232!
```

Witness restrictions:

- cannot access `/budget`
- cannot access `/import`
- cannot access `/access`
- sees only witness-assigned tasks on `/dashboard`
- can create tasks only for `Świadkowie`
- guests, vendors, timeline and seating are rendered read-only
- can open `/vendors`, but pricing is hidden

Read-only role restrictions:

- cannot access `/budget`
- cannot access `/import`
- cannot access `/access`
- cannot create or edit tasks
- guests, vendors, timeline and seating stay read-only

Admin access panel:

- route: `/access`
- admin sends invitations by email instead of creating passwords directly
- can assign `ADMIN`, `WITNESS`, `READ_ONLY`
- latest invitation link is shown in the admin UI for demo/testing environments
- invited users finish activation at `/activate?token=...`

---

## Docker Runtime

`docker-compose.yml` is configured for a persistent PostgreSQL runtime.

Persistent storage:

- Docker volume: `postgres-data`

App runtime mode inside Docker:

- `APP_DATA_MODE=prisma`

On container start the app runs Prisma deploy migrations before `next start`.

Latest migrations required for current runtime:

- [0003_access_roles_tasks_timeline](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/prisma/migrations/0003_access_roles_tasks_timeline/migration.sql)
- [0005_table_positions](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/prisma/migrations/0005_table_positions/migration.sql)
- [0006_budget_payments_and_user_invitations](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/prisma/migrations/0006_budget_payments_and_user_invitations/migration.sql)

---

## Start With Docker

Build and start:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

Open:

```text
http://localhost:3000
```

---

## Seed Real Wedding Data

The Prisma seed now uses data prepared from [real-plan.md](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/real-plan.md).

Seed source:

- [real-plan-seed.ts](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/lib/real-plan-seed.ts)

Run seed:

```bash
docker compose exec app npm run seed
```

This seed rebuilds PostgreSQL strictly from the current contents of `docs/real-plan.md`, including:

- wedding metadata
- the admin account `lucasjezap@gmail.com`
- real vendors and contacts
- the current task checklist
- full budget categories with paid amounts
- guest households and seating assignments
- public RSVP data and timeline draft

No demo wedding rows are inserted into Docker during this seed.

Data remains in the Docker volume between container restarts. It is removed only if the volume is explicitly deleted, for example with:

```bash
docker compose down -v
```

## Guest Import

Import now supports:

- `.xlsx`
- `.xls`
- `.csv`
- `.tsv`

The first row must use the exact template headers:

- `FirstName`
- `LastName`
- `Side`
- `Email`
- `Phone`
- `DietaryRestrictions`
- `Notes`
- `InvitationReceived`
- `PaymentCoverage`
- `TransportToVenue`
- `TransportFromVenue`

If the header structure is invalid, the UI returns:

- `Struktura pliku jest nieprawidłowa`

Template download buttons are available directly in the import module for:

- CSV
- TSV

- one row should represent one guest/person

After upload you can:

- choose the sheet
- preview rows
- remap columns before final import

Imported defaults if advanced columns are missing:

- RSVP: `PENDING`
- invitation received: `false`
- payment coverage: `FULL`
- transport to venue: `false`
- transport from venue: `false`

## Public RSVP

`/public` stays open without authentication.

Guest RSVP is now personalized:

- no guest list is exposed publicly
- each guest record has a deterministic 4-letter `rsvpToken`
- a guest enters the token first
- only after successful lookup can they submit their own RSVP
- the screen shows a success confirmation after saving

Admins can still jump back from the public site to `/dashboard`.

The public timeline only renders events marked as visible for guests.

The planner keeps RSVP/public access open for guests at `/public`, while admin pages under the protected planner shell still require an authenticated account.

## Guests

The admin guest list now shows:

- notes
- guest code / RSVP token
- payment coverage
- invitation received
- transport flags

The first 4 guest records are locked against editing.

When guest editing is hidden for restricted roles, the table expands to the full available width.

The top table action button for adding a guest was removed. Editing still opens from the list/form area.

Diet is normalized to:

- `Brak`
- `Wege`
- `Wegan`

## Dashboard

Dashboard countdown now points to the first event in the timeline and renders:

- days
- hours

The main dashboard also includes a `Więcej` anchor that jumps to a quick list of planner sections.

## Seating

The seating planner now supports:

- dragging guests between seats
- dragging tables around the visual floor plan
- assigning a guest to an empty seat through an autocomplete input
- persisting table coordinates in the database so the floor plan survives app and Docker restarts

## Budget

The budget module now uses a 3-step financial model:

- category-level plan amounts
- expense-level estimate ranges (`estimateMin` / `estimateMax`)
- expense-level final cost plus payment history entries

Expense cards expose:

- plan / paid / remaining values
- estimate range
- expandable payment history via `Zobacz więcej`

## Verification

Recommended verification sequence after changes:

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

Role-focused smoke check:

```bash
1. Login as admin and open /access
2. Verify admin can see /budget and /import
3. Login as witness and verify /budget, /import and /access are hidden/blocked
4. Verify witness sees hidden vendor pricing and no edit controls in guests/vendors/timeline/seating
5. Verify witness can still create a task and that it is assigned to witnesses
```
