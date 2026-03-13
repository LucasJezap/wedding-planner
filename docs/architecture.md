# Wedding Planner Application Architecture

## Purpose

This document defines the **full architecture, development rules, testing standards, and implementation process** for the Wedding Planner web application.

The goal is to ensure that all code produced for this project is:

* production-quality
* clean and maintainable
* well-tested
* modular
* scalable

All development must strictly follow the rules in this document.

---

# Project Vision

This application is a **luxury wedding planning platform** designed to help couples manage every aspect of their wedding.

Key principles:

* beautiful UI
* elegant UX
* high reliability
* modular architecture
* strict testing discipline

The system should initially support **one wedding planner couple** but be designed so that it can easily evolve into a **multi-tenant SaaS platform**.

---

# Critical Engineering Rules

These rules are mandatory.

## Test Coverage

The project must maintain:

**Minimum 95% test coverage**

Measured across:

* lines
* branches
* functions
* statements

No new feature may be merged if coverage drops below 95%.

If coverage drops:

1. implementation must stop
2. tests must be added
3. coverage restored

before any new work continues.

---

## Build Integrity

At all times the project must pass:

* type checking
* linting
* unit tests
* integration tests
* end-to-end tests

No broken builds.

---

## Code Quality

All code must follow:

* SOLID principles
* modular design
* separation of concerns
* dependency injection where needed
* strict typing

Avoid:

* large monolithic files
* deeply nested logic
* duplicated code
* hidden side effects

---

## Clean Code Rules

Code must be:

* readable
* predictable
* well named
* documented where necessary

Naming rules:

* variables: camelCase
* types: PascalCase
* files: kebab-case
* constants: UPPER_CASE

---

# Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

---

## Backend

Backend is implemented using **Next.js API routes**.

Business logic must be separated into service layers.

---

## Database

PostgreSQL

ORM:

Prisma

---

## Authentication

Auth.js (NextAuth)

Authentication supports:

* email login
* password hashing
* sessions

---

## State Management

Zustand

---

## Forms

React Hook Form

Validation:

Zod

---

## Data Tables

TanStack Table

---

## Drag and Drop

dnd-kit

---

## Charts

Recharts

---

## Excel Import

SheetJS (xlsx)

---

## Testing

Unit Testing:

Vitest

Component Testing:

React Testing Library

End-to-End Testing:

Playwright

---

## Deployment

Docker

Docker Compose

---

# Project Structure

The project must follow this structure.

```
/app
/components
/features
/hooks
/lib
/services
/server
/db
/prisma
/tests
/e2e
/scripts
```

---

# Detailed Folder Structure

## app

Next.js routes.

Examples:

```
/app/dashboard
/app/guests
/app/vendors
/app/budget
/app/tasks
/app/timeline
/app/seating
/app/import
/app/public
```

---

## components

Reusable UI components.

Examples:

```
button
card
modal
table
form
chart
timeline
guest-card
vendor-card
```

Components must remain **presentation-only**.

No business logic.

---

## features

Feature modules.

Examples:

```
guests
vendors
tasks
budget
timeline
seating
import
```

Each feature must contain:

```
components
hooks
services
types
tests
```

---

## services

Business logic layer.

Examples:

```
guest-service.ts
vendor-service.ts
budget-service.ts
import-service.ts
```

Services interact with:

* database
* validation
* transformations

Services must never depend on UI components.

---

## server

API routes.

Each route must:

* validate input
* call service layer
* return structured responses

---

## db

Database connection utilities.

---

## prisma

Database schema and migrations.

---

## tests

Unit and integration tests.

---

## e2e

Playwright tests.

---

## scripts

Utility scripts.

Examples:

* seed database
* test data generators
* Excel import debugging

---

# Database Architecture

Tables:

```
users
weddings
guests
tables
seats
vendors
vendor_categories
budget_categories
expenses
tasks
timeline_events
contacts
rsvps
notes
```

Each table must include:

* id
* created_at
* updated_at

---

# Feature Modules

## Dashboard

Displays:

* wedding countdown
* guest statistics
* task completion
* budget overview

---

## Guest Manager

Fields:

* name
* side
* RSVP
* dietary restrictions
* table assignment
* contact info
* notes

Features:

* search
* filtering
* inline editing

---

## Seating Planner

Drag and drop seating assignments.

Uses:

dnd-kit

---

## Budget Manager

Track:

* categories
* planned amounts
* actual expenses

Include charts.

---

## Task Manager

Checklist with:

* priority
* due date
* status

---

## Vendor Manager

Track:

* vendor category
* contact info
* cost
* notes

---

## Wedding Timeline

Visual timeline for the wedding day.

---

## Excel Import

Supports XLSX upload.

Workflow:

1 upload file
2 parse workbook
3 select sheet
4 preview rows
5 map columns
6 validate data
7 import to database

---

# Excel Import Architecture

Import process must include:

* schema validation
* column mapping
* preview stage
* error reporting
* partial failure recovery

Import logic should live in:

```
/services/import-service.ts
```

---

# UI Design Guidelines

Visual design must feel:

* romantic
* elegant
* minimal
* luxurious

Design elements:

* pastel colors
* rounded cards
* soft shadows
* subtle animations

Color palette example:

* rose pink
* lavender
* peach
* butter yellow
* sage green
* ivory

---

# Development Workflow

All development must follow this order.

---

## Phase 1: Project Setup

Initialize:

* Next.js project
* TypeScript
* Tailwind
* Prisma
* Auth.js
* testing frameworks

Create Docker environment.

---

## Phase 2: Core Infrastructure

Implement:

* database schema
* authentication
* base layout
* navigation
* user management

---

## Phase 3: Core Modules

Implement:

1 guests
2 vendors
3 tasks
4 budget
5 timeline

Each module must include tests.

---

## Phase 4: Visual Tools

Implement:

* seating planner
* dashboard charts
* drag and drop interactions

---

## Phase 5: Excel Import

Implement file upload and parsing.

---

## Phase 6: Guest Website

Public wedding page.

Includes:

* RSVP
* schedule
* directions
* event details

---

# Testing Strategy

Testing must follow **test pyramid principles**.

---

## Unit Tests

Test:

* services
* utilities
* validation

Coverage target:

100%

---

## Component Tests

Test:

* rendering
* interactions
* forms
* UI state

---

## Integration Tests

Test:

* API routes
* database interactions
* service logic

---

## End-to-End Tests

Use Playwright.

Test:

* login
* guest management
* task workflow
* seating planner
* Excel import

---

# Continuous Quality Enforcement

Every commit must run:

```
lint
typecheck
unit tests
integration tests
coverage check
```

CI must reject commits if:

* coverage < 95%
* build fails
* lint errors exist

---

# Performance Guidelines

Avoid:

* unnecessary re-renders
* heavy client state
* unindexed queries

Use:

* server components where possible
* memoization
* efficient queries

---

# Security Rules

All API routes must:

* validate input
* sanitize data
* enforce authentication

Passwords must be hashed.

---

# Documentation

Major modules must include:

* usage documentation
* architecture comments
* API contracts

---

# Future Extensions

The architecture should allow:

* multiple weddings
* multi-tenant SaaS
* AI assistants
* vendor marketplaces
* guest mobile apps

---

# Final Rule

Quality always comes before speed.

If something is:

* unclear
* fragile
* untested

it must be improved before continuing.
