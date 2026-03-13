# Project Bootstrap Guide

## Purpose

This document defines the **exact steps required to initialize the project infrastructure** before feature development begins.

AI agents must follow this process strictly.

No feature work should start until bootstrap is complete.

---

# Step 1 — Initialize Next.js Project

Create a Next.js application with TypeScript and App Router.

Command:

```
npx create-next-app@latest wedding-planner \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false
```

---

# Step 2 — Install Core Dependencies

Install required dependencies.

```
npm install prisma @prisma/client
npm install zod
npm install react-hook-form
npm install zustand
npm install xlsx
npm install framer-motion
npm install @tanstack/react-table
npm install recharts
npm install @dnd-kit/core
npm install @dnd-kit/sortable
npm install next-auth
```

---

# Step 3 — Install UI Dependencies

Install shadcn UI.

```
npx shadcn-ui@latest init
```

Add core components:

```
button
card
dialog
table
input
form
dropdown-menu
```

---

# Step 4 — Install Testing Stack

```
npm install -D vitest
npm install -D @testing-library/react
npm install -D @testing-library/jest-dom
npm install -D playwright
npm install -D c8
```

Initialize Playwright:

```
npx playwright install
```

---

# Step 5 — Install Development Tools

```
npm install -D prettier
npm install -D husky
npm install -D lint-staged
```

---

# Step 6 — Initialize Prisma

```
npx prisma init
```

Configure PostgreSQL connection.

Create initial migration.

---

# Step 7 — Configure Docker

Create:

```
Dockerfile
docker-compose.yml
```

docker-compose should include:

```
app
postgres
```

Postgres version:

```
postgres:15
```

---

# Step 8 — Configure Scripts

Add scripts to package.json:

```
dev
build
test
test:coverage
lint
typecheck
```

---

# Step 9 — Configure Coverage Enforcement

Coverage must fail below 95%.

Example:

```
vitest --coverage
```

Coverage thresholds:

```
lines: 95
functions: 95
branches: 95
statements: 95
```

---

# Step 10 — Verify Bootstrap

Before development begins ensure:

```
npm run build
npm run test
npm run test:coverage
```

All must pass.

---

# Bootstrap Completion

Bootstrap is complete when:

* project builds
* database connects
* tests run
* coverage enforcement works
* docker environment starts successfully
