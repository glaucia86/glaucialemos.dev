# Do primeiro pixel ao próximo palco

Source: user-supplied implementation plan, 2026-10-22.

- Preserve the existing uncommitted Dagobah, portrait, motion and editorial work.
- Work on the existing feature branch; no publication or external services.
- Shared interfaces: localized journey copy → home/demo/map; curated repository names → GitHub data; subject messages → contact form; event schema → country grouping and projection.
- Ruling: use the supplied plan as the specification; no separate specification exists. Keep the current working tree because it contains the artwork and motion work the user explicitly requests preserving.
- Validation: capture a production baseline before edits; verify behavior, responsive layouts, no-JS, motion preferences, lint, types, suite and build.

## Progress

- Inspected the home, dictionaries, project/event/experience schemas and contact behavior.
- Implemented all five chapters in PT/EN/ES, keeping the existing hero scene, portrait light and motion preferences.
- Curated projects by repository identity, independently of star ranking. TypeScript remains the lead; AI JavaScript and RepoCheckAI follow as editorial rows.
- Added a two-state teaching example with explicit static-example disclosure and explanations of type checking versus JavaScript concatenation.
- Added country selection, chronological event lists, localized language labels, source links, and an unlocated group. All 105 records remain available without JavaScript.
- Added workshop and mentoring subject messages, preserving speaking invitations, unknown-subject behavior, disabled-form notice and LinkedIn.
- Localized the existing source periods rather than inventing dates.

## Findings resolved

- Contact tests first failed for the missing workshop/mentoring prefills, then passed in all three languages.
- Browser test first failed because the demo was absent. Subsequent testing caught a React hydration mismatch: SVG `title` children must be a single string. Fixed and verified without browser errors.
- Independent read-only review caught a mismatch between hand-drawn land and coordinate projection. Replaced it with locally served Natural Earth geometry in the same projection. A browser check now verifies São Paulo lies on the land path. Provenance and regeneration are in `home-map.md`.
- Initial performance trial: median LCP 784 ms and CLS 0.0979. Made the map image natively lazy, reused the language formatter, prioritized the hero image and removed unnecessary event fields from client props.
- Layout-shift diagnostics identified the hero's secondary CTA wrapping after the font loaded at 390 px. Stacked the mobile actions to stabilize that layout.
- Removed an unnecessary post-hydration state change. `noscript` rules expose both examples and all country lists without JavaScript; their override uses `!important` inside Tailwind's `base` layer because layered important rules outrank unlayered important rules. The no-JavaScript browser test caught and verified this cascade detail.
- Final performance gate: **612 → 652 ms LCP (+6.5%)**, CLS **0.00000664**, under the plan's +10% / 0.1 limits. Three cold browser contexts, same production server conditions, 390×844, CPU 4×, 40 ms latency, 10 Mbps. This is a local laboratory comparison, not field data. JSON evidence is in `performance-journey-before.json` and `performance-journey-after.json`; the first intermediate trial is also retained.

## Verification

- Production build: all 21 static pages generated, no errors.
- Unit tests: 72 passing, including contact subjects, dictionary parity, curation, source dates, coordinate handling, sorting and color contrast.
- Lint and TypeScript: passing.
- Browser journey coverage: 320, 390, 768, 1280 and 1920 px × PT/EN/ES; demo, every country, unlocated records, source links, subject prefills, reduced motion and no-JavaScript content.
- Existing browser suites: editorial layout, hero CTAs, scenes, Jedi alignment, progress and motion behavior.
- axe WCAG A/AA: no detected violations at 320 and 1280 px × PT/EN/ES. Axe flags some contrast checks as needing review because of layered backgrounds; brand contrast tests cover the relevant pairs, including all new code/map colors (8.75:1 or greater). Buttons have visible keyboard focus and targets of at least 44 px.
- Visual artifacts: `docs/screenshots/journey/`.

## Delivery scope

Kept the existing branch and local changes. No commit, merge or publication was requested. The implementation and evidence stay in the working tree. Review with actual visitors and the subjective “wow” assessment remain human validation tasks; no claims about conversion or perceived impact are inferred from automated checks.
