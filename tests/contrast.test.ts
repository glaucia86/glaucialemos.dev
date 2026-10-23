import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const tokenFile = path.join(process.cwd(), "src/app/tokens.css");
const css = fs.readFileSync(tokenFile, "utf8");
const tokens = new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)]
  .map(([, key, value]) => [key, value.trim()]));

function readColor(name: string): string {
  let value = tokens.get(name);
  const visited = new Set<string>();
  while (value?.startsWith("var(")) {
    if (visited.has(value)) throw new Error(`Referência circular: ${name}`);
    visited.add(value);
    value = tokens.get(value.slice(4, -1));
  }
  expect(value ?? "", `Token de cor ausente ou não hexadecimal: ${name}`).toMatch(/^#[\da-f]{6}$/i);
  return value!;
}

function luminance(hex: string): number {
  const channels = hex.slice(1).match(/../g)!.map((channel) => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const light = luminance(foreground);
  const dark = luminance(background);
  return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
}

// Changing a semantic token to a low-contrast shade must fail its real usage pair.
const pairs = [
  ['demo keywords / dark', '--color-primary-300', '--surface-dark', 4.5],
  ['demo types / dark', '--color-accent-300', '--surface-dark', 4.5],
  ['map source / dark', '--color-accent-200', '--surface-dark', 4.5],
  ['selected country / light purple', '--color-primary-950', '--color-primary-200', 4.5],
  ["texto / claro", "--text-body", "--surface-light", 4.5],
  ["texto secundário / suave", "--text-muted", "--surface-soft", 4.5],
  ["título / claro", "--text-heading", "--surface-light", 4.5],
  ["hero / escuro", "--text-inverse", "--surface-dark", 4.5],
  ["hero secundário / escuro", "--text-inverse-muted", "--surface-dark", 4.5],
  ["header secundário / marca escura", "--text-inverse-muted", "--color-brand-dark", 4.5],
  ["título accent grande / escuro", "--accent-light", "--surface-dark", 3],
  ["CTA / accent", "--text-on-accent", "--color-accent", 4.5],
  ["link primary / claro", "--link", "--surface-light", 4.5],
  ["link primary / suave", "--link", "--surface-soft", 4.5],
  ["link secondary / claro", "--link-hover", "--surface-light", 4.5],
  ["link secondary / suave", "--link-hover", "--surface-soft", 4.5],
  ["link / tag", "--link", "--tag-surface", 4.5],
  ["título / elevado", "--text-heading", "--surface-raised", 4.5],
  ["texto secundário / elevado", "--text-muted", "--surface-raised", 4.5],
  ["energia azul / espaço", "--energy-blue", "--surface-dark", 4.5],
  ["energia verde / espaço", "--energy-green", "--surface-dark", 4.5],
  ["energia vermelha / espaço", "--energy-red", "--surface-dark", 4.5],
  ["energia roxa / espaço", "--energy-purple", "--surface-dark", 4.5],
  ["foco / claro", "--focus", "--surface-light", 3],
  ["seleção / primary", "--text-inverse", "--color-primary", 4.5],
  ["success / claro", "--color-success-text", "--surface-light", 4.5],
  ["warning / suave", "--color-warning-text", "--surface-soft", 4.5],
  ["danger / claro", "--color-danger-text", "--surface-light", 4.5],
  ["info / claro", "--color-info-text", "--surface-light", 4.5],
] as const;

describe("contraste WCAG dos tokens da marca", () => {
  it("calibra o cálculo com os extremos WCAG", () => {
    expect(contrast("#000000", "#ffffff")).toBe(21);
    expect(contrast("#5a3d7e", "#5a3d7e")).toBe(1);
  });

  it.each(pairs)("%s", (label, foreground, background, minimum) => {
    const ratio = contrast(readColor(foreground), readColor(background));
    console.log(`${label}: ${ratio.toFixed(2)}:1 (mínimo ${minimum}:1)`);
    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});
