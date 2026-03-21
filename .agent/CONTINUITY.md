[PLANS]

- 2026-03-21T00:00:00Z [USER] User requested that future work also read `~/.codex/AGENTS.md`, implement next improvements from `docs/usprawnienia.md`, always test code, and leave the app ready on port 3000.
- 2026-03-21T00:00:00Z [CODE] Current implementation target is dashboard responsibility filtering, because it is explicitly listed as a remaining improvement in `docs/usprawnienia.md` and is small enough to complete end-to-end in one turn.

[DECISIONS]

- 2026-03-21T00:00:00Z [CODE] Follow both repo-local `AGENTS.md` and global `~/.codex/AGENTS.md` for this workspace.
- 2026-03-21T00:00:00Z [CODE] Verification must include lint, typecheck, relevant tests, and restarting the application on port 3000.

[PROGRESS]

- 2026-03-21T00:00:00Z [TOOL] Read `~/.codex/AGENTS.md`, `docs/usprawnienia.md`, dashboard service/component/tests, `Makefile`, and `docker-compose.yml` to identify a tractable improvement and runtime workflow.
- 2026-03-21T13:57:15+0100 [CODE] Implemented dashboard responsibility filtering across task lists, vendor follow-ups, today focus, and activity feed; updated roadmap status in `docs/usprawnienia.md`.
- 2026-03-21T14:19:34+0100 [CODE] Implemented a dashboard watchlist for vendors missing contact data and wired it into the existing owner filter.
- 2026-03-21T14:31:33+0100 [CODE] Implemented a dashboard decision queue with action links for overdue tasks, RSVP follow-up, seating, missing vendor contact, and payment decisions.
- 2026-03-21T14:41:45+0100 [CODE] Implemented a dedicated upcoming payments section in the dashboard budget area.
- 2026-03-21T14:51:01+0100 [CODE] Implemented a dedicated overdue tasks section in the dashboard task area.
- 2026-03-21T15:07:36+0100 [CODE] Replaced the default README with project-specific documentation and marked the README roadmap item as completed.
- 2026-03-21T15:17:07+0100 [CODE] Added targeted `guest-service` tests for invitation group summaries, group reuse, empty-group cleanup, bulk updates, and bulk deletes.

[DISCOVERIES]

- 2026-03-21T00:00:00Z [TOOL] `.agent/CONTINUITY.md` did not exist before this turn.
- 2026-03-21T00:00:00Z [TOOL] Existing container workflow uses `docker compose` with `postgres` and `app`; app starts with `npx prisma migrate deploy && npm run start` and maps to port 3000.
- 2026-03-21T13:57:15+0100 [TOOL] `npm run lint` still reports six pre-existing warnings outside this change set, including unused vars and React Compiler warnings in task/timeline forms; no lint errors were introduced by this task.
- 2026-03-21T14:19:34+0100 [TOOL] `npm run typecheck` depends on `.next/types`, so it must be run after a successful build; running it in parallel with `npm run build` can produce false negatives.
- 2026-03-21T15:07:36+0100 [TOOL] Full `npm run test:coverage` now completes test execution but still fails global thresholds: lines 93.89%, statements 93.83%, functions 91.04%, branches 79.47%. Biggest current gaps are in `services/guest-service.ts` and selected service branches.
- 2026-03-21T15:07:36+0100 [TOOL] `features/guests/tests/guest-manager.test.tsx` needed a 10s timeout under coverage to avoid a false-negative timeout during full coverage runs.
- 2026-03-21T15:17:07+0100 [TOOL] After the new tests, full coverage now meets thresholds for lines (97.32%), statements (97.27%), and functions (95.89%), but still fails branches at 80.64%.
- 2026-03-21T15:17:07+0100 [TOOL] `features/dashboard/tests/dashboard-overview.test.tsx`, `features/budget/tests/budget-manager.test.tsx`, and `features/tasks/tests/task-manager.test.tsx` also needed 10s per-test timeouts to remain stable under coverage instrumentation.

[OUTCOMES]

- 2026-03-21T13:57:15+0100 [TOOL] Verification completed: targeted dashboard tests passed, `npm run typecheck` passed, `npm run build` passed, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T14:19:34+0100 [TOOL] Verification completed for vendor contact watchlist: targeted dashboard tests passed, `npm run build` passed, `npm run typecheck` passed after build, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T14:31:33+0100 [TOOL] Verification completed for dashboard decision queue: targeted dashboard tests passed, `npm run build` passed, `npm run typecheck` passed, `npm run lint` still reported the same six pre-existing warnings, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T14:41:45+0100 [TOOL] Verification completed for upcoming payments: targeted dashboard tests passed, `npm run build` passed, `npm run typecheck` passed, `npm run lint` still reported the same six pre-existing warnings, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T14:51:01+0100 [TOOL] Verification completed for overdue tasks: targeted dashboard tests passed, `npm run build` passed, `npm run typecheck` passed, `npm run lint` still reported the same six pre-existing warnings, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T15:07:36+0100 [TOOL] Verification completed for README completion: `npm run lint` still reported the same six pre-existing warnings, `npm run build` passed, `npm run typecheck` passed after build, full `npm run test:coverage` ran but failed global thresholds already unmet in the repo, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
- 2026-03-21T15:17:07+0100 [TOOL] Verification completed for added tests: `tests/services/guest-service.test.ts` passed, full `npm run test:coverage` passed all 97 tests and now meets global thresholds for lines/statements/functions but still fails branches at 80.64%, Docker app was rebuilt with `make rebuild-app`, and `curl -I http://localhost:3000` returned `HTTP/1.1 200 OK`.
