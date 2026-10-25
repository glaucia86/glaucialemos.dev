// Pixel sprites drawn as SVG. Each character is one SVG pixel; "." is transparent.
export type Sprite = { rows: string[]; palette: Record<string, string> };

export function PixelSprite({ rows, palette, className }: Sprite & { className?: string }) {
  return <svg className={className} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" focusable="false" aria-hidden="true">
    {rows.flatMap((row, y) => [...row].map((pixel, x) => palette[pixel] ?
      <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={palette[pixel]} /> : null))}
  </svg>;
}

// Same output as a string, for sprites created on demand by client effects.
export function spriteMarkup({ rows, palette }: Sprite, className = "") {
  const pixels = rows.flatMap((row, y) => [...row].flatMap((pixel, x) => palette[pixel] ? [`<rect x="${x}" y="${y}" width="1" height="1" fill="${palette[pixel]}"/>`] : []));
  return `<svg class="${className}" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" focusable="false" aria-hidden="true">${pixels.join("")}</svg>`;
}
