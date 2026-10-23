# Home event map

`public/maps/world-land.svg` is generated from Natural Earth **1:110m land**, in the public domain. It is served locally; the home does not call a mapping service.

- [Upstream GeoJSON](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)
- [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/)
- Regenerate: `python scripts/build-home-map.py path/to/ne_110m_land.geojson`

The script retains the source geometry and rounds the projected coordinates to 0.1 SVG unit. Land and events both use equirectangular projection: `x = (longitude + 180) * 2`, `y = (90 - latitude) * 2`, on a 720 × 360 viewBox. This is a schematic overview, not a navigation map. Event coordinates come exclusively from `src/data/eventos.json`. Events without both coordinates are listed separately; no position is inferred from their name or country.

The SVG is a static, natively lazy-loaded image below the point overlay, so the geography is not included in the React JavaScript bundle or repeated in the server-rendered markup. Its colors are generated from the existing brand tokens. It does not compete with the hero for initial network bandwidth.
