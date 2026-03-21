# Wedding Planner

Luxury wedding planning workspace built with Next.js, TypeScript, Prisma, and PostgreSQL.

The application supports day-to-day planning workflows for:

- guests and RSVP
- invitation groups / households
- vendors and vendor CRM
- budget and payment tracking
- tasks and checklists
- timeline and guest-visible schedule
- seating plan
- planner access management

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- NextAuth / Auth.js
- Vitest
- React Testing Library
- Playwright
- Docker / Docker Compose

## Main Features

- protected planner workspace with role-based access
- public RSVP flow with guest token lookup
- invitation groups with shared RSVP
- vendor CRM with owner, follow-up, deposit, and offer links
- budget tracking with due dates, payments, overdue detection, and dashboard alerts
- task management with templates, tags, dependencies, and checklist items
- timeline planning with guest visibility controls
- seating plan with persisted table coordinates
- import from XLSX, XLS, CSV, and TSV
- operational dashboard with watchlists and decision queue

## Requirements

- Node.js 22+
- npm 10+
- Docker and Docker Compose for the container workflow

## Quick Start

### Local dev

1. Install dependencies:

```bash
npm ci
```

2. Start the development server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

### Docker runtime

Start the application and PostgreSQL:

```bash
docker compose up -d --build
```

Or use the helper target:

```bash
make rebuild-app
```

Check status:

```bash
docker compose ps
```

Open:

```text
http://localhost:3000
```

## Environment Variables

The Docker runtime already wires the required defaults for local development.

Key variables:

- `APP_DATA_MODE`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `INVITATION_EMAIL_MODE`

Current Docker defaults are defined in [`docker-compose.yml`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docker-compose.yml).

## Demo Access

Admin demo account:

```text
admin@example.com
Avatar3232!
```

Witness demo account:

```text
witness@example.com
Avatar3232!
```

## Roles

- `ADMIN`: full access, including budget, import, and access management
- `WITNESS`: read-only guests/vendors/timeline/seating, hidden vendor pricing, limited dashboard/task scope
- `READ_ONLY`: read-only planner browsing, no mutations, no budget/import/access

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
npm run prisma:generate
npm run prisma:migrate:deploy
npm run seed
```

## Docker Helpers

The `Makefile` includes shortcuts:

```bash
make app
make db
make appDb
make full
make rebuild-app
make rebuild
make fresh
make doctor
make stop
make down
```

## Database and Migrations

- Prisma schema: [`prisma/schema.prisma`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/prisma/schema.prisma)
- SQL migrations: [`prisma/migrations`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/prisma/migrations)
- Docker runtime applies migrations automatically before app start

## Seed Data

The project supports seeded planning data.

Run:

```bash
npm run seed
```

The runtime guide also documents the Docker seed flow and real-plan seed source in [`docs/runtime-guide.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/runtime-guide.md).

## Testing

Coverage thresholds are enforced in Vitest:

- lines: 95%
- branches: 95%
- functions: 95%
- statements: 95%

Coverage config lives in [`vitest.config.ts`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/vitest.config.ts).

Testing-related docs:

- [`docs/testing.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/testing.md)
- [`docs/runtime-guide.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/runtime-guide.md)

## Public RSVP

- route: `/public`
- guest lookup uses deterministic guest tokens
- public timeline shows only guest-visible events
- no public guest list is exposed

## Import

Supported formats:

- `.xlsx`
- `.xls`
- `.csv`
- `.tsv`

The import wizard supports:

- sheet selection
- row preview
- column remapping
- strict template/header validation

## Project Structure

Key directories:

- [`app`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/app): Next.js app routes and pages
- [`features`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/features): UI modules per domain area
- [`services`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/services): business logic layer
- [`server`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/server): API handlers
- [`db`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/db): repositories and Prisma access
- [`lib`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/lib): shared domain, formatting, and utilities
- [`tests`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/tests): unit, integration, and component tests
- [`e2e`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/e2e): Playwright coverage
- [`docs`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs): architecture and runtime docs

## Additional Documentation

- [`docs/architecture.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/architecture.md)
- [`docs/runtime-guide.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/runtime-guide.md)
- [`docs/testing.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/testing.md)
- [`docs/usprawnienia.md`](/Users/lukaszjezapkowicz/GolandProjects/WeddingPlanner/docs/usprawnienia.md)

## Current Runtime Note

The app is expected to be left in a runnable state on port `3000` after development tasks in this workspace. The container-first workflow is the preferred way to achieve that.
