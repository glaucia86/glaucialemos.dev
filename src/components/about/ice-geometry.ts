// Ice shards over the frozen portrait: a jittered grid split into triangles, in a viewBox of `width` × `height`.
const jitter = (x: number, y: number) => ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 + 1) % 1 - .5;

export function iceShards(cols: number, rows: number, width: number, height: number) {
  const point = (x: number, y: number) => [
    x * width / cols + (x % cols ? jitter(x, y) * width / cols * .6 : 0),
    y * height / rows + (y % rows ? jitter(y, x) * height / rows * .6 : 0),
  ].map((value) => value.toFixed(1)).join(",");
  return Array.from({ length: cols * rows }, (_, index) => {
    const x = index % cols; const y = Math.floor(index / cols);
    const [a, b, c, d] = [point(x, y), point(x + 1, y), point(x + 1, y + 1), point(x, y + 1)];
    return (x + y) % 2 ? [`${a} ${b} ${c}`, `${a} ${c} ${d}`] : [`${a} ${b} ${d}`, `${b} ${c} ${d}`];
  }).flat();
}

export const PORTRAIT_CRACKS = "M50 0 47 22 56 38 44 61 52 84 46 130M47 22 18 30 0 26M56 38 82 44 100 40M44 61 20 72 6 96M52 84 78 92 100 118";
