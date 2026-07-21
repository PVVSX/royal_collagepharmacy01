# Member Dashboard Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove gradient/glassmorphism styling and normalize spacing/radius/hover patterns across the member dashboard (`src/app/(dashboard)/`) and its shared layout components, while keeping the brand color (`#737300`), Kanit font, and existing sidebar navigation structure unchanged.

**Architecture:** This is a pure visual/CSS refactor — no data flow, routing, or component logic changes. Work proceeds bottom-up: shared primitives first (base `Card` component, `Sidebar`/`TopNav`/layout), then a mechanical class-rename sweep across all affected pages, then page-specific fixes (gradient bands, hover states, one metric-card recolor, spacing outliers). Verification for every task is grep-based (confirm banned patterns are gone) plus a manual visual check in the dev server — there is no CSS assertion test framework in this repo, so "test" in this plan means grep + `npm run dev` visual check in both light and dark mode.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, `class-variance-authority`/`tailwind-merge` via `cn()` in `src/lib/utils.ts`.

## Global Constraints

- Do not change `--primary` (`#737300`), `--sidebar` tokens, or any other color token values in `src/app/globals.css` `:root`/`.dark` blocks.
- Do not change the Kanit font wiring (`--font-kanit`).
- Do not change `src/components/layout/Sidebar.tsx`'s nav item list, grouping, active-state logic, or the profile/logout section — only its outer container styling and the main-content offset.
- Do not touch anything under `src/app/admin/` or `src/components/layout/AdminSidebar.tsx` — out of scope. The one exception is `src/components/ui/card.tsx`, which is shared with admin; the user has explicitly approved that change and accepted its side effect on admin pages.
- Do not remove the `.glass-panel` / `.glass-panel-primary` CSS class **definitions** from `src/app/globals.css` — `AdminSidebar.tsx` still uses `.glass-panel-primary` directly and must keep working. Only stop *using* these classes in the in-scope files.
- Do not change the dashboard event banner (`src/app/(dashboard)/dashboard/page.tsx`, the `<Card>` with the meeting image and black gradient overlay) — explicitly excluded by the user.
- Do not reduce or reorder the 4-card metric row's *item count/position* beyond what Task 6 specifies (color/icon only, plus the one documented grid-column fix).
- Every step in this plan is a shell command (`sed`, `grep`) or an exact code block — apply edits in the order the tasks are numbered, since later tasks' "old" code assumes earlier tasks already ran.

---

### Task 1: Fix the shared `Card` component (remove baked-in glassmorphism)

**Files:**
- Modify: `src/components/ui/card.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<Card>` now renders with `rounded-lg border border-border bg-card` instead of `rounded-[min(var(--radius-4xl),24px)] glass-panel`. Every other task that touches a `<Card className="...">` in `(dashboard)/` assumes this new base.

- [ ] **Step 1: Confirm current baseline**

Run: `grep -n "glass-panel\|rounded-\[min" src/components/ui/card.tsx`
Expected output (3 lines, exact):
```
15:        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-[min(var(--radius-4xl),24px)] glass-panel py-(--card-spacing) text-sm text-card-foreground shadow-sm ring-0 [--card-spacing:--spacing(5)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:ring-foreground/10 *:[img:first-child]:rounded-t-[min(var(--radius-4xl),24px)] *:[img:last-child]:rounded-b-[min(var(--radius-4xl),24px)]",
28:        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-[min(var(--radius-4xl),24px)] px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
84:        "flex items-center rounded-b-[min(var(--radius-4xl),24px)] px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
```

- [ ] **Step 2: Replace the `Card` base className (line 15)**

Old:
```
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-[min(var(--radius-4xl),24px)] glass-panel py-(--card-spacing) text-sm text-card-foreground shadow-sm ring-0 [--card-spacing:--spacing(5)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:ring-foreground/10 *:[img:first-child]:rounded-t-[min(var(--radius-4xl),24px)] *:[img:last-child]:rounded-b-[min(var(--radius-4xl),24px)]",
```
New:
```
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-lg border border-border bg-card py-(--card-spacing) text-sm text-card-foreground shadow-sm ring-0 [--card-spacing:--spacing(5)] has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(4)] dark:ring-foreground/10 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
```

- [ ] **Step 3: Replace `CardHeader` radius (line 28)**

Old:
```
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-[min(var(--radius-4xl),24px)] px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
```
New:
```
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-lg px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
```

- [ ] **Step 4: Replace `CardFooter` radius (line 84)**

Old:
```
        "flex items-center rounded-b-[min(var(--radius-4xl),24px)] px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
```
New:
```
        "flex items-center rounded-b-lg px-(--card-spacing) [.border-t]:pt-(--card-spacing)",
```

- [ ] **Step 5: Verify no glassmorphism/large-radius remains in this file**

Run: `grep -n "glass-panel\|rounded-\[min" src/components/ui/card.tsx`
Expected: no output (empty).

- [ ] **Step 6: Visual check**

Run: `npm run dev` (if not already running), open `http://localhost:3000/dashboard`.
Expected: all cards show an opaque `bg-card` background with a visible `border-border` outline and `rounded-lg` corners — no blur/translucency, no 24px-rounded corners.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "$(cat <<'EOF'
Remove baked-in glassmorphism from shared Card component

The base Card primitive hardcoded .glass-panel (translucent + blurred
background) and a ~24px radius that no per-page className could ever
override. Replace with an opaque bg-card/border/rounded-lg default so
the dashboard redesign's "no glassmorphism" direction actually takes
effect everywhere the Card component is used.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Flush Sidebar + TopNav (remove floating glass panels)

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/TopNav.tsx`
- Modify: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: sidebar is `w-60` (240px), flush to the left/top/bottom of the viewport, opaque `bg-sidebar`. `TopNav` is a sticky, opaque, flush bar (no more `fixed`/floating/rounded/blur). The dashboard layout's main content column uses `md:pl-60` (not `md:pl-[280px]`) to match the new sidebar width exactly.

- [ ] **Step 1: Update the desktop `<aside>` in `Sidebar.tsx`**

Old (`src/components/layout/Sidebar.tsx`):
```
      <aside className="fixed left-4 top-4 bottom-4 z-40 hidden w-60 flex-col overflow-hidden rounded-2xl glass-panel-primary md:flex">
```
New:
```
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden w-60 flex-col overflow-hidden bg-sidebar border-r border-sidebar-border md:flex">
```

- [ ] **Step 2: Rewrite the `TopNav` header element**

Old (`src/components/layout/TopNav.tsx` line 66):
```
    <header className="fixed top-4 right-2 left-2 z-50 flex h-14 items-center justify-between rounded-2xl glass-panel px-4 md:left-[280px] md:right-4 border-none shadow-sm">
```
New:
```
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between bg-card border-b border-border px-4 md:px-6">
```

- [ ] **Step 3: Update the dashboard layout wrapper**

Old (`src/app/(dashboard)/layout.tsx`):
```
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-[280px]">
        <TopNav />
        <main className="flex-1 pt-20 px-2 md:pr-4">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
```
New:
```
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-60">
        <TopNav />
        <main className="flex-1 px-2 pt-2 md:pr-4">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
```

- [ ] **Step 4: Verify no floating/glass artifacts remain in these three files**

Run: `grep -n "glass-panel\|left-\[280px\]\|fixed top-4" src/components/layout/Sidebar.tsx src/components/layout/TopNav.tsx "src/app/(dashboard)/layout.tsx"`
Expected: no output (empty). (`AdminSidebar.tsx` is intentionally not part of this grep — it keeps its own glass styling.)

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `http://localhost:3000/dashboard` at desktop width.
Expected: sidebar spans the full left edge of the screen with no rounded corners/margin/blur; the top bar spans the remaining width flush against the sidebar and the top of the viewport, no rounded corners/blur; page content starts directly below the top bar with no large empty gap. Resize to mobile width and confirm the sidebar hides and the mobile hamburger trigger (top-left, from `Sidebar.tsx`) still opens the `Sheet` drawer correctly.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/components/layout/TopNav.tsx "src/app/(dashboard)/layout.tsx"
git commit -m "$(cat <<'EOF'
Replace floating glass sidebar/topnav with flush, opaque layout

Matches the approved direction to remove glassmorphism: sidebar and
top bar are now flush against the viewport edges with solid
backgrounds instead of floating rounded glass panels. Nav structure,
items, and active-state logic are unchanged.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Radius normalization sweep (`rounded-xl`/`rounded-2xl` → `rounded-lg`)

**Files:**
- Modify (mechanical sed): every `*.tsx` file under `src/app/(dashboard)/`
- Modify (mechanical sed): `src/components/layout/PageHeader.tsx`
- Modify (mechanical sed): `src/components/layout/TopNav.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: no hardcoded `rounded-xl`/`rounded-2xl` remain in the in-scope files; everything uses `rounded-lg`, matching the `--radius: 0.5rem` token. Task 4 and Task 5's "old" code blocks assume this has already run.

- [ ] **Step 1: Record the before-count**

Run: `grep -rc "rounded-xl\|rounded-2xl" "src/app/(dashboard)" --include="*.tsx" | grep -v ':0' | awk -F: '{sum+=$2} END {print sum}'`
Expected: `61` (8 admission + 4 cpd + 2 dashboard + 1 news + 7 passport + 4 pathway + 8 research + 14 students + 13 more spread across other files already counted above — the exact number isn't important, just note it so Step 3 can compare against zero).

- [ ] **Step 2: Run the sweep**

```bash
find "src/app/(dashboard)" -name "*.tsx" -print0 | xargs -0 sed -i '' -e 's/rounded-2xl/rounded-lg/g' -e 's/rounded-xl/rounded-lg/g'
sed -i '' -e 's/rounded-2xl/rounded-lg/g' -e 's/rounded-xl/rounded-lg/g' src/components/layout/PageHeader.tsx src/components/layout/TopNav.tsx
```

- [ ] **Step 3: Verify none remain**

Run: `grep -rn "rounded-xl\|rounded-2xl" "src/app/(dashboard)" src/components/layout/PageHeader.tsx src/components/layout/TopNav.tsx --include="*.tsx"`
Expected: no output (empty).

- [ ] **Step 4: Sanity-check the codebase still builds**

Run: `npx tsc --noEmit`
Expected: no new type errors (this sweep only touches string literals inside `className`, so this should be a no-op check — if it fails, something outside the intended scope was matched; investigate before proceeding).

- [ ] **Step 5: Visual check**

Run: `npm run dev`, spot-check `http://localhost:3000/passport`, `http://localhost:3000/students`, `http://localhost:3000/research` in both light and dark mode (toggle via browser/OS dark mode or existing theme toggle if present).
Expected: all card/box corners are subtly rounded (8px), no large 16–24px rounded corners anywhere.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)" src/components/layout/PageHeader.tsx src/components/layout/TopNav.tsx
git commit -m "$(cat <<'EOF'
Normalize border-radius to rounded-lg across member dashboard

Mechanical sweep replacing hardcoded rounded-xl/rounded-2xl with
rounded-lg so every page matches the --radius design token, per the
approved "more formal, less rounded" direction.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Remove gradient header bands

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/admission/page.tsx`
- Modify: `src/app/(dashboard)/passport/page.tsx`
- Modify: `src/components/layout/PageHeader.tsx`

**Interfaces:**
- Consumes: `rounded-lg` from Task 3 (these files already had their radius normalized).
- Produces: the "header card" pattern (title band with a colored top border) is now a flat `bg-card` strip with no gradient, in all four places it's duplicated.

- [ ] **Step 1: Dashboard header band**

Old (`src/app/(dashboard)/dashboard/page.tsx`):
```
      <header className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4 md:px-6">
```
New:
```
      <header className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-card px-5 py-4 md:px-6">
```

- [ ] **Step 2: Admission header band**

Old (`src/app/(dashboard)/admission/page.tsx`):
```
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden mb-8">
            <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-6 py-5">
```
New:
```
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden mb-8">
            <div className="border-b-2 border-primary bg-card px-6 py-5">
```

- [ ] **Step 3: Passport header band**

Old (`src/app/(dashboard)/passport/page.tsx`):
```
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-6 py-4">
```
New:
```
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b-2 border-primary bg-card px-6 py-4">
```

- [ ] **Step 4: `PageHeader.tsx` (shared, currently unused but part of the same design system)**

Old (`src/components/layout/PageHeader.tsx`):
```
    <header className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b-2 border-primary bg-gradient-to-r from-primary/[0.07] to-transparent px-5 py-4 md:px-6">
```
New:
```
    <header className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b-2 border-primary bg-card px-5 py-4 md:px-6">
```

Also update the stale comment above it:

Old:
```
// โครงเดียวกับหน้า Professional Passport / Dashboard: กรอบ rounded-xl + border
// + แถบเส้นบนสีหลัก + ไอคอนในกล่องเขียวอ่อน — โทนทางการ ไม่ฉูดฉาด
```
New:
```
// โครงเดียวกับหน้า Professional Passport / Dashboard: กรอบ rounded-lg + border
// + แถบเส้นบนสีหลัก + ไอคอนในกล่องเขียวอ่อน — โทนทางการ ไม่ฉูดฉาด, ไม่มี gradient
```

- [ ] **Step 5: Verify the gradient band pattern is gone from these four files**

Run: `grep -n "from-primary/\[0.07\]" "src/app/(dashboard)/dashboard/page.tsx" "src/app/(dashboard)/admission/page.tsx" "src/app/(dashboard)/passport/page.tsx" src/components/layout/PageHeader.tsx`
Expected: no output (empty).

- [ ] **Step 6: Confirm the event banner gradient is untouched**

Run: `grep -n "from-black/80" "src/app/(dashboard)/dashboard/page.tsx"`
Expected: 1 match (the event banner overlay — must still be present, unchanged).

- [ ] **Step 7: Visual check**

Run: `npm run dev`, open `/dashboard`, `/admission`, `/passport`.
Expected: header bands show a flat card-colored strip with a solid primary-colored top/bottom border accent, no left-to-right color fade. Event banner on `/dashboard` still shows its photo + dark gradient overlay unchanged.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(dashboard)/dashboard/page.tsx" "src/app/(dashboard)/admission/page.tsx" "src/app/(dashboard)/passport/page.tsx" src/components/layout/PageHeader.tsx
git commit -m "$(cat <<'EOF'
Flatten gradient header bands to solid backgrounds

Removes the from-primary/[0.07] to-transparent gradient duplicated
across the dashboard, admission, and passport page headers (and the
shared PageHeader component), per the approved "no gradients" rule.
The dashboard event banner's photo overlay is intentionally untouched.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Remove card hover-lift/shadow effects

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`
- Modify: `src/app/(dashboard)/news/page.tsx`
- Modify: `src/app/(dashboard)/cpd/page.tsx`
- Modify: `src/app/(dashboard)/pathway/page.tsx`
- Modify: `src/app/(dashboard)/research/page.tsx`
- Modify: `src/app/(dashboard)/students/page.tsx`

**Interfaces:**
- Consumes: `rounded-lg` from Task 3.
- Produces: no card in scope uses `hover:-translate-y-1` or `hover:shadow-md`/`hover:shadow-xl` as its hover affordance; cards instead brighten their border on hover (`hover:border-primary/40`). Buttons/CTAs with brand-color hover glows (e.g. the pathway "expand" button) and the excluded event banner are left alone.

- [ ] **Step 1: Dashboard — CPD Progress card (line 75)**

Old (`src/app/(dashboard)/dashboard/page.tsx`):
```
        <Card className="lg:col-span-2 card-shadow hover:-translate-y-1 hover:shadow-md transition-all">
```
New:
```
        <Card className="lg:col-span-2 card-shadow hover:border-primary/40 transition-colors">
```

Apply via line-targeted sed (this exact string also appears, commented out, at lines 149 and 179 inside `{/* ... */}` blocks — those must NOT be touched):

```bash
sed -i '' '75s/.*/        <Card className="lg:col-span-2 card-shadow hover:border-primary\/40 transition-colors">/' "src/app/(dashboard)/dashboard/page.tsx"
```

- [ ] **Step 2: Dashboard — Credits Donut card (line 119)**

```bash
sed -i '' '119s/.*/        <Card className="card-shadow hover:border-primary\/40 transition-colors">/' "src/app/(dashboard)/dashboard/page.tsx"
```

- [ ] **Step 3: Verify the commented-out dead code at lines 149/179 was not touched**

Run: `sed -n '149p;179p' "src/app/(dashboard)/dashboard/page.tsx"`
Expected: both lines still contain `{/* <Card className="card-shadow hover:-translate-y-1 hover:shadow-md transition-all">` (unchanged, still commented out).

- [ ] **Step 4: News page card (line 34)**

Old (`src/app/(dashboard)/news/page.tsx`):
```
          <Card key={item.id} className={`card-shadow border-t-4 border-l-0 ${c.border.replace('border-l', 'border-t')} hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden flex flex-col`}>
```
New:
```
          <Card key={item.id} className={`card-shadow border-t-4 border-l-0 ${c.border.replace('border-l', 'border-t')} hover:border-primary/40 transition-colors overflow-hidden flex flex-col`}>
```

- [ ] **Step 5: CPD page — timeline entry card (line 133)**

Old (`src/app/(dashboard)/cpd/page.tsx`):
```
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card/50 shadow-sm transition-all hover:shadow-md hover:bg-muted/10">
```
New:
```
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card/50 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/10">
```

- [ ] **Step 6: CPD page — clickable summary card (line 166)**

Old (`src/app/(dashboard)/cpd/page.tsx`):
```
                      <Card className="group overflow-hidden border-muted-foreground/20 hover:border-primary/50 hover:shadow-md transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer text-left">
```
New:
```
                      <Card className="group overflow-hidden border-muted-foreground/20 hover:border-primary/50 transition-all duration-300 ease-out active:scale-[0.97] cursor-pointer text-left">
```

- [ ] **Step 7: Pathway page — main node card (line 93)**

Old (`src/app/(dashboard)/pathway/page.tsx`):
```
        "relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group",
```
New:
```
        "relative bg-card rounded-lg border shadow-sm hover:border-primary/40 transition-colors duration-300 cursor-pointer group",
```

- [ ] **Step 8: Pathway page — the two "แสดงน้อยลง" toggle surfaces (lines 408 and 481, identical string)**

```bash
sed -i '' 's/"bg-card border shadow-sm hover:shadow-md",/"bg-card border shadow-sm hover:border-primary\/40 transition-colors",/g' "src/app/(dashboard)/pathway/page.tsx"
```

Verify it changed both occurrences and did not touch the unrelated CTA button at line 383 (`hover:shadow-xl hover:shadow-[#5a5a28]/30` — different string, not matched by the command above, left as-is intentionally since it's a brand-colored primary action button, not a card).

- [ ] **Step 9: Research page — result card (line 470)**

Old (`src/app/(dashboard)/research/page.tsx`):
```
                      className="bg-white dark:bg-card rounded-lg shadow-sm border border-border/60 hover:shadow-md hover:border-[#4D5A2D]/20 transition-all duration-200 overflow-hidden"
```
New:
```
                      className="bg-white dark:bg-card rounded-lg shadow-sm border border-border/60 hover:border-[#4D5A2D]/20 transition-all duration-200 overflow-hidden"
```

- [ ] **Step 10: Students page — quick-download tile (line 527)**

Old (`src/app/(dashboard)/students/page.tsx`):
```
                      <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/50 hover:shadow-md transition-all text-center cursor-pointer group" onClick={() => toast.info(`กำลังดาวน์โหลด: ${doc.name}`)}>
```
New:
```
                      <div key={i} className="flex flex-col items-center justify-center p-6 rounded-lg border bg-card hover:bg-primary/5 hover:border-primary/50 transition-all text-center cursor-pointer group" onClick={() => toast.info(`กำลังดาวน์โหลด: ${doc.name}`)}>
```

- [ ] **Step 11: Programs page — course card (line 80)**

Old (`src/app/(dashboard)/programs/page.tsx`):
```
              <Card key={p.id} className="card-shadow hover:shadow-md transition-shadow">
```
New:
```
              <Card key={p.id} className="card-shadow hover:border-primary/40 transition-colors">
```

- [ ] **Step 12: Verify no banned hover patterns remain (excluding the untouched dashboard banner and commented-out code)**

Run: `grep -rn "hover:-translate-y-1\|hover:shadow-md\|hover:shadow-xl\b" "src/app/(dashboard)" --include="*.tsx" | grep -v "^.*dashboard/page.tsx:6[13]:" | grep -v "{/\*"`
Expected: no output (empty). (The two excluded grep patterns are the dashboard event banner's `hover:shadow-md transition-shadow` on its own `<Card>`, and the commented-out dead code blocks — both must remain untouched.)

- [ ] **Step 13: Visual check**

Run: `npm run dev`, hover over cards on `/dashboard`, `/news`, `/cpd`, `/pathway`, `/research`, `/students`, `/programs` in both light and dark mode.
Expected: cards no longer lift or gain a heavier shadow on hover — instead their border becomes a visible primary-tinted outline. The dashboard event banner card still gets a subtle shadow-only hover.

- [ ] **Step 14: Commit**

```bash
git add "src/app/(dashboard)"
git commit -m "$(cat <<'EOF'
Replace card hover-lift/shadow effects with border-color hover

The translate-and-shadow "lift" pattern read as consumer-app/marketing
styling rather than a formal professional portal. Cards now signal
interactivity with a border-color change only. The one explicitly
preserved exception is the dashboard event banner.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Dashboard metric cards — recolor/re-icon, fix mismatched grid

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: the metric row renders exactly 3 cards (matching the 3 real data entries — the 4th "balance due" entry has been commented out since before this plan) with distinct status colors, and the grid no longer reserves a 4th empty column on desktop.

- [ ] **Step 1: Confirm current state**

Run: `sed -n '38,58p' "src/app/(dashboard)/dashboard/page.tsx"`
Expected: shows the `grid-cols-2 lg:grid-cols-4` wrapper and the 3-entry array (workspace_premium/CPD, credit_score/training credits, how_to_reg/training status), with the 4th "ยอดค้างชำระ" entry commented out.

- [ ] **Step 2: Replace the metric grid + array**

Old (`src/app/(dashboard)/dashboard/page.tsx`):
```
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { icon: "workspace_premium", label: "หน่วยกิต CPD", value: `${cpdData.currentCredits}/${cpdData.targetCredits}`, color: "text-primary", bg: "bg-primary/10", border: false, borderDestructive: false },
          { icon: "credit_score", label: "หน่วยกิตฝึกอบรม", value: `${d.creditsEarned}/${d.creditsTotal}`, color: "text-chart-3", bg: "bg-chart-3/10", border: true, borderDestructive: false },
          { icon: "how_to_reg", label: "สถานะการฝึกอบรม", value: d.trainingStatus, color: "text-secondary-foreground", bg: "bg-secondary/20", border: false, borderDestructive: false },
          // { icon: "warning", label: "ยอดค้างชำระ", value: `฿${d.balanceDue.toLocaleString()}`, color: "text-destructive", bg: "bg-destructive/10", border: false, borderDestructive: true },
        ].map((m) => (
          <Card key={m.label} className={`card-shadow ${m.border ? "border-l-4 border-l-chart-3" : ""} ${m.borderDestructive ? "border-l-4 border-l-destructive" : ""}`}>
```
New:
```
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { icon: "workspace_premium", label: "หน่วยกิต CPD", value: `${cpdData.currentCredits}/${cpdData.targetCredits}`, color: "text-primary", bg: "bg-primary/10", borderColor: "border-l-primary" },
          { icon: "credit_score", label: "หน่วยกิตฝึกอบรม", value: `${d.creditsEarned}/${d.creditsTotal}`, color: "text-chart-3", bg: "bg-chart-3/10", borderColor: "border-l-chart-3" },
          { icon: "how_to_reg", label: "สถานะการฝึกอบรม", value: d.trainingStatus, color: "text-chart-4", bg: "bg-chart-4/10", borderColor: "border-l-chart-4" },
          // { icon: "warning", label: "ยอดค้างชำระ", value: `฿${d.balanceDue.toLocaleString()}`, color: "text-destructive", bg: "bg-destructive/10", borderColor: "border-l-destructive" },
        ].map((m) => (
          <Card key={m.label} className={`card-shadow border-l-4 ${m.borderColor}`}>
```

- [ ] **Step 3: Verify the JSX below still references only `m.icon`/`m.bg`/`m.color`/`m.value`/`m.label`**

Run: `sed -n '38,58p' "src/app/(dashboard)/dashboard/page.tsx"`
Expected: no remaining reference to `m.border` or `m.borderDestructive` anywhere in the file.

Run: `grep -n "m\.border\b\|m\.borderDestructive" "src/app/(dashboard)/dashboard/page.tsx"`
Expected: no output (empty).

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/dashboard` at desktop and mobile widths.
Expected: 3 equally-sized metric cards, each with a distinct colored left border (olive/green/blue) matching its icon color; no empty 4th grid cell on desktop; stacks to 1 column on mobile.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/dashboard/page.tsx"
git commit -m "$(cat <<'EOF'
Recolor dashboard metric cards and fix mismatched 4-column grid

Each of the 3 active metric cards now has a distinct accent color
instead of two of them sharing a near-identical muted look. Also
fixes the grid to 3 columns to match the actual number of rendered
cards, closing the empty 4th-column gap on desktop.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Spacing outliers (help, settings, schedule)

**Files:**
- Modify: `src/app/(dashboard)/help/page.tsx`
- Modify: `src/app/(dashboard)/settings/page.tsx`
- Modify: `src/app/(dashboard)/schedule/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `help` and `settings` use the same container pattern as every other page (`p-4 md:p-6 pb-16 max-w-[1280px] mx-auto`); `schedule` uses the standard `pb-16` instead of a one-off `pb-24`.

- [ ] **Step 1: Fix `help/page.tsx` container**

Old (`src/app/(dashboard)/help/page.tsx`):
```
    <div className="flex flex-col min-h-full">
```
New:
```
    <div className="flex flex-col min-h-full p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
```

- [ ] **Step 2: Fix `settings/page.tsx` container**

Old (`src/app/(dashboard)/settings/page.tsx`):
```
    <div className="flex flex-col min-h-full">
```
New:
```
    <div className="flex flex-col min-h-full p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
```

- [ ] **Step 3: Fix `schedule/page.tsx` bottom padding**

Old (`src/app/(dashboard)/schedule/page.tsx`):
```
      <div className="p-4 md:p-6 pb-24 max-w-[1280px] mx-auto">
```
New:
```
      <div className="p-4 md:p-6 pb-16 max-w-[1280px] mx-auto">
```

- [ ] **Step 4: Verify**

Run: `grep -n "p-4 md:p-6 pb-16 max-w-\[1280px\] mx-auto" "src/app/(dashboard)/help/page.tsx" "src/app/(dashboard)/settings/page.tsx" "src/app/(dashboard)/schedule/page.tsx"`
Expected: 1 match in each of the three files.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `/help`, `/settings`, `/schedule`.
Expected: all three pages now have the same outer margins/max-width as `/dashboard`, `/cpd`, etc. — content no longer runs edge-to-edge or extends unusually far down.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(dashboard)/help/page.tsx" "src/app/(dashboard)/settings/page.tsx" "src/app/(dashboard)/schedule/page.tsx"
git commit -m "$(cat <<'EOF'
Normalize container spacing on help, settings, and schedule pages

These three pages had their own one-off container padding instead of
the p-4 md:p-6 pb-16 max-w-[1280px] mx-auto pattern used everywhere
else in the member dashboard.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Final verification sweep

**Files:** none (verification only)

**Interfaces:**
- Consumes: the end state of Tasks 1–7.
- Produces: a pass/fail confirmation that the redesign's constraints (spec: `docs/superpowers/specs/2026-07-20-member-dashboard-visual-redesign-design.md`) all hold.

- [ ] **Step 1: No glassmorphism left in scope**

Run: `grep -rn "glass-panel" "src/app/(dashboard)" src/components/layout/Sidebar.tsx src/components/layout/TopNav.tsx src/components/ui/card.tsx`
Expected: no output (empty).

- [ ] **Step 2: `AdminSidebar.tsx` still works (out-of-scope file untouched)**

Run: `grep -n "glass-panel-primary" src/components/layout/AdminSidebar.tsx`
Expected: 1 match — confirms the out-of-scope admin sidebar still references the (still-defined) CSS class.

- [ ] **Step 3: No hardcoded large radius left in scope**

Run: `grep -rn "rounded-xl\|rounded-2xl\|rounded-\[min" "src/app/(dashboard)" src/components/layout/PageHeader.tsx src/components/layout/TopNav.tsx src/components/ui/card.tsx`
Expected: no output (empty).

- [ ] **Step 4: No gradient header bands or banned hover effects left (excluding the preserved event banner and dead/commented code)**

Run: `grep -rn "from-primary/\[0.07\]" "src/app/(dashboard)"`
Expected: no output (empty).

Run: `grep -rn "hover:-translate-y-1\|hover:shadow-md\|hover:shadow-xl\b" "src/app/(dashboard)" --include="*.tsx" | grep -v "^.*dashboard/page.tsx:6[13]:" | grep -v "{/\*"`
Expected: no output (empty).

- [ ] **Step 5: Full type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Full visual pass**

Run: `npm run dev`. Open every page under `/dashboard`, `/students`, `/cpd`, `/pathway`, `/admission`, `/research`, `/programs`, `/registration`, `/finance`, `/requests`, `/news`, `/schedule`, `/settings`, `/help`, `/passport` at both desktop and mobile widths, in both light and dark mode.
Expected: consistent flush sidebar/top bar, `rounded-lg` corners everywhere, no gradients except the one preserved event banner, no lift-on-hover, consistent outer container spacing, brand color/font/nav structure all unchanged from before this plan.

- [ ] **Step 7: Report results**

No commit for this task — it's a verification pass. If any check in Steps 1–6 fails, go back to the relevant task, fix it there, and re-run this task's checks before considering the plan complete.
