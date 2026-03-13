# AI Development Rules

## Purpose

This document defines the rules that **AI coding agents must follow** when modifying this repository.

The goal is to ensure that AI-generated code:

* follows the architecture
* maintains high code quality
* preserves strict testing standards
* does not introduce fragile or untested logic

AI agents must follow this file together with **architecture.md**.

If a rule conflicts with implementation convenience, **the rule always wins**.

---

# Absolute Rules

The following rules are mandatory.

## Rule 1 — Never Break Tests

AI must **never leave the repository in a failing state**.

All of the following must pass before completing a task:

* lint
* typecheck
* unit tests
* integration tests
* e2e tests
* coverage checks

If any test fails, the agent must **fix the failure before continuing**.

---

## Rule 2 — Maintain Test Coverage

Coverage must remain **above 95%**.

If new code is added:

* tests must be written
* coverage must remain above threshold

If coverage falls below threshold:

AI must stop feature development and write tests.

---

## Rule 3 — Never Implement Untested Features

Every new feature must include:

* unit tests
* integration tests
* component tests where appropriate

No exceptions.

---

## Rule 4 — Do Not Modify Architecture

AI must **never restructure the project** unless explicitly instructed.

The folder structure defined in `architecture.md` is authoritative.

AI must follow it exactly.

---

## Rule 5 — Use Existing Patterns

Before creating new code:

AI must inspect existing files and follow the same patterns.

Examples:

* naming conventions
* service patterns
* API structure
* validation approach

Avoid introducing alternative patterns.

---

# Development Strategy

When implementing a feature, AI must follow this order.

## Step 1 — Understand the Feature

AI must first analyze:

* affected modules
* database changes
* service layer changes
* UI impact
* testing impact

---

## Step 2 — Update Types

If new data structures are needed:

* create TypeScript types
* create Zod validation schemas

Types must be defined before implementation.

---

## Step 3 — Implement Service Layer

Business logic must be written in **services**.

Services must:

* contain business logic
* be testable in isolation
* not depend on UI components

Example location:

```
/services/guest-service.ts
```

---

## Step 4 — Write Unit Tests

Before wiring UI or API:

Create unit tests for the service.

Tests must cover:

* happy paths
* edge cases
* validation failures

---

## Step 5 — Implement API Route

API routes must:

* validate input using Zod
* call service layer
* return structured responses

Routes must remain thin.

Example:

```
/server/api/guests
```

---

## Step 6 — Implement UI

Only after services and tests exist.

UI must:

* use feature components
* avoid business logic
* call APIs or hooks

---

## Step 7 — Write Component Tests

Component tests must verify:

* rendering
* user interactions
* state changes

---

## Step 8 — Add E2E Coverage

Critical flows must include Playwright tests.

Examples:

* login
* guest creation
* task management
* Excel import

---

# Coding Standards

## Types

Always prefer strict typing.

Avoid:

```
any
unknown (unless necessary)
```

Use explicit interfaces.

---

## Functions

Functions must:

* do one thing
* be small
* have descriptive names

Avoid large functions.

---

## Components

Components must be:

* reusable
* small
* presentation-focused

Business logic belongs in hooks or services.

---

# API Standards

All API responses must follow this structure:

```
{
  success: boolean
  data?: any
  error?: string
}
```

---

# Validation

All input must be validated with **Zod**.

Validation must occur:

* at API boundary
* before database writes

Never trust client input.

---

# Database Rules

Database operations must only occur in:

```
services
```

Never directly in UI components.

Use Prisma client.

---

# State Management

Global state must use **Zustand**.

Avoid unnecessary global state.

Prefer local component state when possible.

---

# Error Handling

All service functions must handle:

* database failures
* validation errors
* missing data

Errors must be returned in structured format.

---

# Logging

Important operations should log:

* imports
* database writes
* authentication events

Logs must not expose sensitive information.

---

# UI Guidelines

UI must follow the visual style defined in `architecture.md`.

Design principles:

* elegant
* minimal
* pastel palette
* smooth animations

Avoid cluttered interfaces.

---

# Performance Guidelines

Avoid:

* unnecessary API calls
* unindexed database queries
* heavy client-side computation

Prefer server components where possible.

---

# Excel Import Rules

Excel import must always include:

1. preview step
2. column mapping
3. validation
4. safe import

Invalid rows must be reported with clear errors.

Import must not corrupt existing data.

---

# Refactoring Rules

Refactoring is allowed only if:

* tests pass
* architecture is preserved
* behavior remains identical

Large refactors require explicit instruction.

---

# Commit Guidelines

AI commits should be:

* small
* atomic
* descriptive

Examples:

```
feat: implement guest service
test: add guest service unit tests
fix: resolve seating planner drag bug
```

---

# When AI Is Unsure

If requirements are ambiguous:

AI must:

1. search the repository
2. follow existing patterns
3. choose the simplest implementation

Never invent complex solutions unnecessarily.

---

# Final Principle

AI should optimize for:

* reliability
* clarity
* maintainability

Never for cleverness.
