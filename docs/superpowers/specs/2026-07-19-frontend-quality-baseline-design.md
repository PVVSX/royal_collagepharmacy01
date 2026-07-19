# Frontend Quality Baseline Design

**Goal:** Restore trustworthy frontend quality gates without changing backend behavior, routes, or visual design.

## Scope

- Fix the two TypeScript failures and six ESLint errors reproduced on 2026-07-19.
- Restore Next.js production type validation by removing `ignoreBuildErrors`.
- Add a focused Vitest regression test for payment status reconciliation.
- Add stable `test`, `test:watch`, and `typecheck` scripts.

## Root Causes

- The July UI update reads `academicYear`, while the shared student record exposes `trainingYear`.
- Finance stores data derived from `adminPayments` in component state and casts review statuses directly to student statuses. The cast can produce the unsupported values `approved` and `rejected` in the student UI.
- Admission contains raw double quotes in JSX text, CPD retains unnecessary `@ts-ignore` directives, and requests use `any` for the selected record.
- `next.config.ts` suppresses production type validation, allowing a build with known type errors.

## Design

Create a small pure finance helper that validates base payment statuses, maps review statuses to student-facing statuses, and merges them into the original fee records. The finance page derives its displayed list with `useMemo` instead of synchronously setting state in an effect. Static failures are fixed at their source: consumers use the canonical `trainingYear`, request state receives an explicit record type, and obsolete suppressions are removed.

Vitest follows the Next.js 16 bundled guide and tests the pure finance helper without rendering the full page. Existing lint and TypeScript commands remain the regression checks for static failures. No warning-only cleanup is included unless it disappears as a direct consequence of these fixes.

## Acceptance Criteria

- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` exit successfully.
- The build performs TypeScript validation.
- Payment statuses map as `pending -> pending`, `approved -> paid`, and `rejected -> unpaid`; unmatched fee records retain a valid original status, while unsupported base statuses fail explicitly.
- No backend, route, data persistence, or visible UI behavior changes beyond correcting payment status display.
