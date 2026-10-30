# Mobile eggs — pass four

Source review and implementation: 2026-10-30. Contract: `/workspace/audit/spec.md`; baseline owner inventory: `test-results/egg-audit.md`.

## Changes

1. **Mobile radio:** `MobileComlinkSheet` uses a native modal for top-layer placement, focus containment and Escape, with explicit focus wrapping/return, backdrop dismissal and a downward header swipe. It uses `sheetTitle` and current-world hints only. Session storage saves a shuffled list of ids; the component never reads discoveries. Selecting a hint closes the sheet, scrolls to the art frame, calls the existing panorama geometry and highlights the target for 1.6 seconds without a tooltip or `egg:play`. The epilogue keeps the existing star and radio, with no Scan. Desktop retains its original Comlink dialog.
2. **Touch owners:** kept the existing event architecture and page mounts. Added static mobile reduced-motion outcomes to ObservatoryMotion and SnowDrift, enabled the static star-map modal on mobile with reduced motion, and made DeepNight's flashlight follow touch drags. `bringIntoView` targets the mobile art frame when an owner requests its entire hero, avoiding a scroll into the extended copy below the scene. Normal mobile triggers continue to use the original owner effects.
3. **Anonymous feedback:** mobile discovery badges, page totals, launch meter/countdown, transmission progress/world marks, numeric selfie metadata, meteor years and series totals are hidden or omitted. Mobile Comlink does not render desktop feedback, replay/reset controls or its discovery toast. Narrative hero statuses remain visible and expire with reduced motion too. Completed service beds/series reset, and Nivéora does not restore its capsule/tracks from discovery history on mobile. The epilogue's discovery constellation is hidden on mobile.

## Owner coverage

All fifty ids were followed from the catalog and mobile table to their mounted owner and event handler. This is a source audit; the new browser suite has not been executed here.

| World | Ids | Mounted effect owners / result |
| --- | --- | --- |
| Home | `focus-lens`, `dog-signal`, `hangar-check`, `dark-sky`, `wish`, `launch-charge` | ObservatoryMotion; CareerTelescope owns the telescope dialog. The mobile reduced-motion branch now handles all six. `dark-sky` switches the lanterns; launch uses the hotspot hold, with the old generic hero hold disabled on mobile. |
| Home | `meteor-shower`, `star-map` | MeteorShower in the Home page; SiteChrome globally. Direct event plays the shower / opens the map; mobile reduced motion shows a static map. |
| Sobre | `paw-tracks`, `memory-capsule`, `whiteout`, `aurora-prism` | NiveoraMotion, with MemoryCapsule/FrozenCards for the corresponding interactions. Existing normal and reduced-motion handlers remain playable. |
| Sobre | `snowdrift`, `between-lines`, `borrowed-star`, `deep-night` | SnowDrift, BetweenLines, BorrowedStar and global SiteChrome → DeepNight. Snow can be requested directly instead of waiting for inactivity; reduced motion has a temporary narrative. DeepNight has a touch flashlight and an explicit exit. |
| Projetos | `rover-scan`, `sample-cache` | MarsMotion; the readout opens the selected real record. |
| Projetos | `terminal-launch`, `first-sprout`, `before-pretty`, `lost-bug`, `dust-fall`, `lost-commit` | RetroTerminal, ColonyGrowth, BenchDetails/BeforeAfter, PartnerStations → LostBug, DustPanel, LostCommit. `lost-bug` opens the circuit; discovery still requires solving it. |
| Conteúdo | `crystal-whisper`, `first-page` | LuminaMotion and its article readout. |
| Conteúdo | `prism-align`, `crystal-echo`, `series-constellation`, `library-dusk`, `retro-tv`, `curious-letter` | PrismGate, LuminaShelves, Collections, LibraryDusk, RetroTV and global Comlink. Letter gate still uses `remainingDiscoveries`; a locked hotspot shows only the nonnumeric hint. |
| Eventos | `constellation-route`, `dog-navigation`, `runaway-satellite` | AtlasMotion. Direct event invokes the existing story/readout; tablet/desktop triggers remain intact. |
| Eventos | `orbital-trail`, `paw-stamp`, `prince-antenna`, `orbital-selfie` | AtlasGlobe, PrinceAntenna, OrbitalSelfie. Selfie uses the hotspot hold; generic hero hold is disabled on mobile. |
| Serviços | `garden-bloom`, `beacon-relay` | AureliaMotion; beacon leads to the contact heading and never submits or writes the form. |
| Serviços | `pollination`, `seed-vault`, `greenhouse-dusk`, `ring-alignment` | ServiceGarden, PlanetEclipse, OrbitGyroscope. Event paths already existed; completion feedback now clears on mobile where applicable. |
| Serviços | `epilogue-signal`, `proposal-harvest` | EpilogueTransmission mounts EpilogueSignal once eligible; ProposalHarvest is mounted on Serviços. The mobile hotspot directly emits the harvest event, so pointerenter ordering is not required. No bypass of the epilogue gate. |
| Localized 404 | `signal-recovered`, `paw-rescue` | RedTide; existing mobile recovery/reset behavior retained. |
| Epilogue | `last-light` | BeyondOrbitMotion, through the existing single-tap star. Its sheet hint pans/highlights the star; no duplicate hidden hotspot or Scan. |

## Numbers deliberately retained

Puzzle mechanics remain: gyroscope positions/alignment count; prism orientations; Atlas manual orbit odometer/percentage; ordered series crystal positions; ice hit feedback; comparison and light sliders. An active LostBug circuit retains its code and historical PR reference. None are discovery totals.

Ordinary portfolio content and records reached through an egg retain factual dates, repository stars, article/event titles and historical source identifiers. These are not rewritten as anonymous hints or discovery notifications. This includes record dialogs/readouts such as the recovered commit and article/repository cards. The numeric browser assertions intentionally target the mobile discovery UI, hints, sheet and notifications, not all page content or active puzzle/record panels.

## Remaining caveats

- Browser verification is pending the parent run. No server or Chromium was started in this pass. Safe areas, overlap/hit testing, actual focus return, animation timing, WebGL and video playback need that run.
- As allowed by the spec: `pollination` lights the beds without launching the swarm; `borrowed-star` opens the note without the fetch animation; `orbital-trail` opens the year card, but its focus tween can replace the full whirl.
- Existing busy guards may ignore an event while an owner's story is already playing. The browser suite reloads between independent owner checks rather than requiring concurrent story playback.
- Dynamic-data assumptions remain: ColonyGrowth needs a newest repository; LostBug mounts with the SWA CLI contribution; archive/story lookups need their curated records. The checked-in datasets satisfy those conditions. Missing WebGL falls back to cards; external video availability/autoplay rules remain external constraints.
- If session storage is denied, an in-memory hint-order cache survives route remounts; a full reload starts a new order. With session storage available, order survives reloads too.
- Root `/` 404 has a different shell from localized 404. Requested coverage is `/pt/rota-inexistente`, which includes SiteChrome and the radio.

## Verification

- `npm run typecheck`: passed after the build. An earlier concurrent attempt raced Next's regeneration of `.next/types`; the sequential rerun passed.
- `npm test`: 57 files, 718 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed, including `ƒ Middleware`.
- `node --check tests/mobile-eggs.browser.mjs`: passed. Browser execution remains pending.

The parent can run against its existing server:

```sh
BASE_URL=http://127.0.0.1:3100 node tests/run-browser.mjs mobile-eggs
```

The suite is registered in the default browser runner. It uses 390×844, `hasTouch`/`isMobile`, DOM hotspot inventory, CDP drags and holds, first/second tap assertions, seeded/unseeded gates, all eight routes, anonymous UI/accessibility labels, overflow and cleared feedback, sheet dismissal/focus/session order, reduced motion and desktop dialog checks. It writes `test-results/mobile-eggs.json` with per-case results and activated ids. No commit was created by this agent.
