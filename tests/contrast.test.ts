import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const tokenFile = path.join(process.cwd(), "src/app/tokens.css");
const css = fs.readFileSync(tokenFile, "utf8");
const tokens = new Map([...css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)]
  .map(([, key, value]) => [key, value.trim()]));

function readColor(name: string, backdrop?: string): string {
  let value = tokens.get(name);
  const visited = new Set<string>();
  while (value?.startsWith("var(")) {
    if (visited.has(value)) throw new Error(`Referência circular: ${name}`);
    visited.add(value);
    value = tokens.get(value.slice(4, -1));
  }
  const mix = value?.match(/^color-mix\(in srgb, var\((--[\w-]+)\) (\d+)%, transparent\)$/);
  if (mix) {
    if (!backdrop) throw new Error(`Fundo obrigatório para token translúcido: ${name}`);
    const foreground = readColor(mix[1]);
    const alpha = Number(mix[2]) / 100;
    return "#" + [1, 3, 5].map((offset) => {
      const front = parseInt(foreground.slice(offset, offset + 2), 16);
      const back = parseInt(backdrop.slice(offset, offset + 2), 16);
      return Math.round(front * alpha + back * (1 - alpha)).toString(16).padStart(2, "0");
    }).join("");
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

// Every foreground used on panels must also work on the brightest solid state.
const panelForegrounds = ["--text-body", "--text-heading", "--text-muted", "--link", "--link-hover"];
const panelSurfaces = ["--surface-space", "--surface-light", "--surface-soft", "--surface-raised", "--surface-active", "--surface-tag"];
const pairs: [string, string, string, number][] = [
  ...panelSurfaces.flatMap((surface) => panelForegrounds.map((foreground): [string, string, string, number] =>
    [`${foreground} / ${surface}`, foreground, surface, 4.5])),
  ["hero e 404 / escuro", "--text-inverse", "--surface-dark", 4.5],
  ["hero secundário / escuro", "--text-inverse-muted", "--surface-dark", 4.5],
  ["header e footer / marca escura", "--text-inverse-muted", "--color-brand-dark", 4.5],
  ["accent / escuro", "--accent-light", "--surface-dark", 4.5],
  ["estatísticas / marca escura", "--color-accent-secondary", "--color-brand-dark", 4.5],
  ["CTA / accent", "--text-on-accent", "--color-accent", 4.5],
  ["filtro selecionado / primary", "--text-inverse", "--color-primary", 4.5],
  ["success / painel", "--color-success-text", "--surface-soft", 4.5],
  ["warning / formulário", "--color-warning-text", "--surface-soft", 4.5],
  ["danger / painel", "--color-danger-text", "--surface-soft", 4.5],
  ["info / painel", "--color-info-text", "--surface-soft", 4.5],
  ["foco / painel ativo", "--focus", "--surface-active", 3],
  ["foco inverso / header", "--focus-inverse", "--color-brand-dark", 3],
  ["borda de controle / painel ativo", "--border-control", "--surface-active", 3],
];

describe("contraste WCAG dos tokens da marca", () => {
  it("calibra o cálculo com os extremos WCAG", () => {
    expect(contrast("#000000", "#ffffff")).toBe(21);
    expect(contrast("#5a3d7e", "#5a3d7e")).toBe(1);
  });

  // White is a conservative upper bound for anything beneath a translucent
  // card (including overlapping stars). Check both gradient ends + scanlines.
  it.each(["--surface-card-start", "--surface-card-end"])("texto sobre %s composto", (surface) => {
    const panel = readColor(surface, readColor("--color-white"));
    const texturedPanel = readColor("--texture-ink", panel);
    for (const foreground of panelForegrounds) {
      expect(contrast(readColor(foreground), texturedPanel), foreground).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("texto sobre nebulosa e estrelas sobrepostas", () => {
    let background = readColor("--surface-space");
    for (const layer of ["--nebula-wine", "--nebula-purple", "--star-color", "--star-color", "--star-color"]) {
      background = readColor(layer, background);
    }
    for (const foreground of panelForegrounds) {
      expect(contrast(readColor(foreground), background), foreground).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(pairs)("%s", (label, foreground, background, minimum) => {
    const ratio = contrast(readColor(foreground), readColor(background));
    console.log(`${label}: ${ratio.toFixed(2)}:1 (mínimo ${minimum}:1)`);
    expect(ratio).toBeGreaterThanOrEqual(minimum);
  });
});
