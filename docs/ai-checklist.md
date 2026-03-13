# AI Development Checklist

## Purpose

This checklist ensures that every feature implemented by AI agents meets:

* architecture requirements
* testing requirements
* code quality standards

AI must run through this checklist before completing any task.

---

# Pre-Implementation Checklist

Before writing code verify:

* feature aligns with architecture.md
* existing patterns are understood
* necessary database changes identified
* necessary service layer changes identified
* necessary UI components identified
* required tests identified

---

# Implementation Checklist

During development verify:

* types are defined
* Zod validation schemas exist
* business logic placed in services
* UI components contain no business logic
* APIs validate input
* database queries occur only in services

---

# Testing Checklist

Before finishing a feature verify:

Unit Tests

* service functions tested
* validation logic tested
* edge cases tested

Component Tests

* components render correctly
* user interactions tested
* forms tested

Integration Tests

* API routes tested
* database operations tested

E2E Tests

* critical user flow tested

---

# Coverage Checklist

Verify:

* test coverage ≥ 95%
* new code has corresponding tests
* edge cases covered

If coverage drops:

Stop development and add tests.

---

# Code Quality Checklist

Verify:

* no duplicated logic
* functions remain small
* clear variable names used
* TypeScript types exist
* no usage of "any"

---

# Architecture Compliance

Verify:

* folder structure preserved
* services contain business logic
* UI contains presentation only
* APIs remain thin

---

# Security Checklist

Verify:

* API inputs validated
* user authentication enforced
* sensitive data protected
* no credentials logged

---

# Performance Checklist

Verify:

* no unnecessary API calls
* queries are indexed
* components avoid unnecessary re-renders

---

# Feature Completion Criteria

A feature is considered complete only if:

* all tests pass
* coverage ≥ 95%
* lint passes
* typecheck passes
* architecture rules respected

---

# Commit Checklist

Before committing verify:

* commit is atomic
* commit message is descriptive
* tests added where necessary

---

# AI Final Verification

Before completing any task AI must confirm:

```
tests pass
coverage ≥ 95%
architecture respected
no lint errors
build succeeds
```

If any condition fails, the task is incomplete.
