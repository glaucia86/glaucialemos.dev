# Mobile eggs pass four implementation plan

**Goal:** Finish the mobile radio, touch activation and anonymous discovery experience.
**Spec:** `/workspace/audit/spec.md` and the user's pass four additions.
**Architecture:** Keep desktop Comlink intact. A mobile-only native modal sheet lists session-shuffled hints and sends a reveal event to the existing panorama owner. Egg effects remain with their existing owners.
**Constraints:** No dependencies, commits, server or browser execution. Use `MOBILE_EGG_QUERY`, preserve gates and puzzle mechanics, and keep discovery history out of the sheet.

- [ ] (a) Add `MobileComlinkSheet.tsx`, session order helper, reveal event and styles. Verify current-world coverage, stable order, dismissal/focus and pan without activation. Hide epilogue Scan.
- [ ] (c) Read every audited owner and mount. Repair mobile reduced-motion listeners and touch input gaps; preserve existing `emitEgg` paths and gates.
- [ ] (b) Sweep counters, status messages and persistent marks, retaining active puzzle mechanics. Record exceptions and caveats.
- [ ] Add `tests/mobile-eggs.browser.mjs` and register the suite. Cover all DOM hotspots, CDP panorama drags/holds, gates, sheet, anonymous UI, no overflow and no leftover feedback at 390×844.
- [ ] Run typecheck, Vitest, lint and build. Review diff and report browser validation as pending parent execution.

Review focus: breakpoint transitions with a modal open; storage denial/reload shuffle; reduced motion; held-pointer cancellation; gating and route changes while effects are active.
