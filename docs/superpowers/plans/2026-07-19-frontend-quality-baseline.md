# Frontend Quality Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make lint, typecheck, unit tests, and the production build trustworthy and passing.

**Architecture:** Keep page behavior client-side, but extract payment reconciliation into a pure typed helper. Use Vitest for the behavior regression and existing static tools for TypeScript and ESLint regressions.

**Tech Stack:** Next.js 16.2.9, React 19.2.4, TypeScript 5, ESLint 9, Vitest, React Testing Library.

## Global Constraints

- Do not change backend, routes, persistence, or visual design.
- Do not suppress errors with casts, `any`, `@ts-ignore`, or disabled quality rules.
- Follow Red-Green-Refactor for payment behavior.
- Do not expand the task to warning-only cleanup.

---

### Task 1: Install and configure the test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.mts`

**Interfaces:**
- Produces: `npm test`, `npm run test:watch`, and `npm run typecheck` commands.

- [ ] Install `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, and `vite-tsconfig-paths` as dev dependencies.
- [ ] Add `test: vitest run`, `test:watch: vitest`, and `typecheck: tsc --noEmit` scripts.
- [ ] Configure Vitest with `tsconfigPaths()`, `react()`, and `environment: "jsdom"`.
- [ ] Run `npm test` and confirm the harness exits successfully with no test files before adding behavior tests.

### Task 2: Reconcile finance statuses with TDD

**Files:**
- Create: `src/lib/finance/payment-status.test.ts`
- Create: `src/lib/finance/payment-status.ts`
- Modify: `src/app/(dashboard)/finance/page.tsx`

**Interfaces:**
- Produces: `mergePaymentStatuses<T>(items, payments): T[]`.
- Status mapping: `pending -> pending`, `approved -> paid`, `rejected -> unpaid`.

- [ ] Write tests for every status mapping and the unmatched-item behavior.
- [ ] Run `npm test -- src/lib/finance/payment-status.test.ts` and confirm failure because the implementation does not exist.
- [ ] Implement the minimal pure helper with immutable output.
- [ ] Run the focused test and confirm all cases pass.
- [ ] Replace finance's state/effect synchronization with `useMemo(() => mergePaymentStatuses(...))`.
- [ ] Run the focused test and `npm run lint -- --quiet` to confirm the finance lint error is gone.

### Task 3: Fix static root causes

**Files:**
- Modify: `src/app/(dashboard)/students/page.tsx`
- Modify: `src/app/admin/students/[id]/page.tsx`
- Modify: `src/app/(dashboard)/admission/page.tsx`
- Modify: `src/app/(dashboard)/cpd/page.tsx`
- Modify: `src/app/(dashboard)/requests/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: explicit `RequestItem` type local to the requests page.
- Consumes: canonical `studentDetailData.trainingYear`.

- [ ] Replace both nonexistent `academicYear` reads with `trainingYear` and run `npm run typecheck`.
- [ ] Replace raw JSX quotes around the student-menu label with Thai quotation marks.
- [ ] Remove the two unnecessary CPD `@ts-ignore` directives.
- [ ] Define `RequestItem` from the request record shape and type selected request as `RequestItem | null`.
- [ ] Remove the `typescript.ignoreBuildErrors` block so Next.js uses its safe default.
- [ ] Run `npm run lint -- --quiet` and `npm run typecheck`; both must exit successfully.

### Task 4: Verify and finish the branch

**Files:**
- Review all changed files.

**Interfaces:**
- Consumes: all commands and types produced above.

- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `npm run lint` and confirm zero errors.
- [ ] Run `npm run typecheck` and confirm exit code 0.
- [ ] Run `npm run build` and confirm production type validation and exit code 0.
- [ ] Run `git diff --check` and inspect `git status --short` plus the complete diff.
- [ ] Commit focused changes with descriptive messages, then invoke `superpowers:finishing-a-development-branch`.

