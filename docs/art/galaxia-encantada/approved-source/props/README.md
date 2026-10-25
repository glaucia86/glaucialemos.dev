# Galáxia Encantada — Props individually extracted

**51** isolated transparent PNG sprite files, organized by scenario, extracted from the seven existing GE-PROP sheets without redrawing the source pixel art.

- `earth-observatory/` — Observatory (7 assets)
- `niveora/` — Snow world (11 assets)
- `mars-lab/` — Mars (8 assets)
- `lumina/` — Living library (7 assets)
- `earth-orbit/` — Orbital atlas (6 assets)
- `aurelia/` — Hanging gardens (6 assets)
- `red-tide/` — Lost coordinates (6 assets)

## Use with Next.js
Copy scene directories to `public/galaxia/props/`. Paths are listed in `manifest.json` and use original dimensions; scale in CSS according to the scene stage and hero layout. In pixel-art mode use `image-rendering: pixelated;` and set `pointer-events: none;` on purely decorative sprites.

## Important visual QA
This pack **only separates** the sprites already generated. It does not redraw occluded geometry, reconstruct missing physical parts, guarantee 100% perfect object silhouettes or resolve accidental background/particle overlaps from the original atlas. Review object edges on light/dark backgrounds and correct the input atlas manually if a production-critical sprite is affected. Events, labels, project metadata, and globe data belong to HTML/WebGL, not to raster sprites.
