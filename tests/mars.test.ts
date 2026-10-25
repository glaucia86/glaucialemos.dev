import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIXEL, createDust } from "@/components/projects/dust-engine";
import { createDustJump } from "@/components/projects/dust-jump";
import { HOTSPOTS, SPOTS, GLAUCIA_POSES, PRINCE_POSES } from "@/components/projects/MarsScene";
import { SCENES, poseBox } from "@/lib/scenes";
import { CARD_2018, CARD_NOW, SWA_BUG, colonyLots, firstCommits, latestPush, newestRepo, oldestRepo, scanTargets } from "@/lib/mars-records";
import { REVALIDATE_SECONDS } from "@/lib/github";
import { marte } from "@/i18n/marte";
import { comlink } from "@/i18n/comlink";
import { EGGS } from "@/lib/eggs";
import type { Projeto } from "@/lib/types";

const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;
const mars = SCENES["mars-lab"];
type Box = { left: number; top: number; width: number; height: number };
const overlap = (a: Box, b: Box) => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

describe("motor de poeira de Marte", () => {
  beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("usa canvas em baixa resolução, com pixels de verdade", () => {
    const back = canvas(); const front = canvas();
    createDust({ back, front });
    expect(back.width).toBe(Math.round(1440 / PIXEL));
    expect(front.height).toBe(Math.round(810 / PIXEL));
  });

  it("avisa o início e o fim da rajada e não avança parado fora da tela", () => {
    let frame: FrameRequestCallback = () => {};
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { frame = callback; return 1; });
    const changes: boolean[] = [];
    const dust = createDust({ back: canvas(), front: canvas(), onGust: (on) => changes.push(on) });
    dust.gust(); dust.start();
    let now = 100;
    const advance = (ms: number) => { for (let t = 0; t < ms; t += 50) { now += 50; frame(now); } };
    advance(2800);
    expect(changes).toEqual([true]);
    dust.stop(); advance(10000);
    expect(changes).toEqual([true]);
    dust.start(); advance(3000);
    expect(changes).toEqual([true, false]);
    dust.destroy();
  });

  it("aceita varredura, poeira, faíscas e esporos sem erro", () => {
    const dust = createDust({ back: canvas(), front: canvas() });
    expect(dust.weather()).toMatchObject({ gust: 0 });
    expect(() => { dust.scan({ u: .8, v: .5 }, { u: .85, v: .6 }); dust.puff({ u: .7, v: .9 }); dust.sparks({ u: .9, v: .8 }); dust.spores({ u: .7, v: .9 }); dust.destroy(); }).not.toThrow();
  });

  it("o salto de poeira só desenha quando a rolagem muda", () => {
    const jump = createDustJump(canvas());
    expect(() => { jump.set(-1); jump.set(.5); jump.set(.9); jump.set(2); jump.destroy(); }).not.toThrow();
  });
});

describe("cena de Marte", () => {
  it("mantém Glaucia e Prince à direita do texto, com os pés no chão aprovado", () => {
    for (const pose of [...GLAUCIA_POSES, "blink"]) {
      const box = poseBox(mars, "glaucia", pose);
      expect(box.left, pose).toBeGreaterThan(56);
      expect(box.left + box.width, pose).toBeLessThanOrEqual(100);
      expect(box.top + box.height, pose).toBeCloseTo(mars.stages.glaucia.y, 3);
    }
    for (const pose of PRINCE_POSES) {
      const box = poseBox(mars, "prince", pose);
      expect(box.left, pose).toBeGreaterThan(56);
      expect(box.top + box.height, pose).toBeCloseTo(mars.stages.prince.y, 3);
      expect(box.height, pose).toBeLessThan(poseBox(mars, "glaucia", "idle").height / 2);
    }
    expect(poseBox(mars, "glaucia", "blink")).toEqual(poseBox(mars, "glaucia", "idle"));
  });

  it("normaliza a sheet de três quartos do Prince pela pose de perfil", () => {
    const side = poseBox(mars, "prince", "side"); const stand = poseBox(mars, "prince", "stand");
    expect(Math.abs(side.height - stand.height) * mars.assets.background.h / 100).toBeLessThanOrEqual(2);
    expect(Object.keys(mars.assets.actors.prince).filter((name) => name.startsWith("pose-"))).toEqual([]);
  });

  it("os pontos interativos ficam à direita do texto, dentro da placa e sem se sobrepor", () => {
    const entries = Object.entries(HOTSPOTS);
    expect(entries.map(([key]) => key)).toEqual(["glaucia", "rover", "prince", "console"]);
    for (const [key, box] of entries) {
      expect(box.left, key).toBeGreaterThan(55);
      expect(box.left + box.width, key).toBeLessThanOrEqual(100);
      expect(box.top + box.height, key).toBeLessThanOrEqual(100);
    }
    for (const [a, first] of entries) for (const [b, second] of entries) if (a < b) expect(overlap(first, second), `${a} × ${b}`).toBe(false);
    for (const [key, spot] of Object.entries(SPOTS)) { expect(spot.u, key).toBeGreaterThan(55); expect(spot.u, key).toBeLessThan(100); expect(spot.v, key).toBeLessThan(100); }
  });

  it("publica placa, poses, props, broto e bancada gerados pelo script", () => {
    const { background, actors, props, bench } = mars.assets as typeof mars.assets & { bench: Record<string, { src: string }> };
    for (const sprite of [background, ...Object.values(actors.glaucia), ...Object.values(actors.prince), ...Object.values(props), ...Object.values(bench)]) expect(fs.existsSync(`public${sprite.src}`), sprite.src).toBe(true);
    expect(props.sprout).toBeDefined();
    expect(Object.keys(bench).sort()).toEqual(["grid-3", "plate", "raw"]);
    expect(fs.statSync(`public${background.src}`).size).toBeLessThan(600_000);
  });
});

const repo = (nome: string, criado: string, atualizado: string, estrelas = 0): Projeto => ({ nome, url: `https://github.com/glaucia86/${nome}`, estrelas, linguagem: null, descricao: "", forks: 0, topicos: [], criado, atualizado });

describe("registros reais de Marte", () => {
  it("encontra o original mais antigo, o mais novo e o push mais recente", () => {
    const repos = [repo("b", "2016-05-01", "2020-01-01", 3), repo("a", "2014-02-01", "2026-09-01", 9), repo("c", "2026-01-22", "2026-03-01", 1), repo("sem-data", "", "")];
    expect(oldestRepo(repos).nome).toBe("a");
    expect(newestRepo(repos).nome).toBe("c");
    expect(latestPush(repos).nome).toBe("a");
    expect(scanTargets(repos, 2).map((item) => item.nome)).toEqual(["a", "b"]);
  });

  it("guarda o primeiro commit das bancadas no snapshot, com fonte", () => {
    for (const name of ["curso-typescript-zero-to-hero", "glaucia_lemos86", "glaucialemos.dev"]) {
      const record = firstCommits[name];
      expect(record, name).toBeDefined();
      expect(record.url).toMatch(new RegExp(`^https://github.com/glaucia86/${name.replace(".", "\\.")}/commit/${record.sha}$`));
      expect(record.commits).toBeGreaterThan(0);
    }
    expect(firstCommits["glaucialemos.dev"]).toMatchObject({ date: "2026-10-21", message: "chore: initial README and .gitignore" });
  });

  it("ergue a colônia proporcional aos repositórios de cada ano, sem inventar lotes", () => {
    const lots = colonyLots([{ year: 2014, count: 18 }, { year: 2015, count: 0 }, { year: 2019, count: 50 }, { year: 2024, count: 1 }]);
    expect(lots.map((lot) => lot.modules)).toEqual([3, 0, 7, 1]);
    expect(lots.map((lot) => lot.count)).toEqual([18, 0, 50, 1]);
  });

  it("lê o GitHub uma vez por dia no servidor, sem rota nova", () => {
    expect(REVALIDATE_SECONDS).toBe(86_400);
    expect(fs.readFileSync("src/app/[lang]/projetos/page.tsx", "utf8")).toMatch(/export const revalidate = 86400;/);
    expect(fs.existsSync("src/app/api")).toBe(false);
  });

  it("reproduz a correção do PR #555 e os cartões npx sem inventar dados", () => {
    expect(SWA_BUG.pr).toBe("https://github.com/Azure/static-web-apps-cli/pull/555");
    expect(SWA_BUG.parts.map((part) => [part.broken, part.fixed])).toEqual([["npm dev", "npm run dev"], [".", ".next"]]);
    expect(CARD_2018.find((line) => line.label === "Work")?.value).toBe("Regional Cloud Developer at Microsoft");
    expect(CARD_NOW.at(-1)?.value).toBe("npx glaucia_lemos86");
  });
});

describe("textos de Marte", () => {
  const keys = (value: unknown, prefix = ""): string[] => value && typeof value === "object" && !Array.isArray(value) ? Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`)) : [prefix];

  it("têm as mesmas chaves nos três idiomas, sem gratuito/free/gratis nem franquias", () => {
    expect(keys(marte.en)).toEqual(keys(marte.pt));
    expect(keys(marte.es)).toEqual(keys(marte.pt));
    const text = JSON.stringify(marte);
    expect(text).not.toMatch(/gratuit|\bfree\b|gratis|R2-D2|Tatooine|Jawa|Kenobi|Skywalker|droide/i);
  });

  it("todo segredo de Marte tem nome e dica no rádio estelar nos três idiomas", () => {
    const ids = EGGS.filter((egg) => egg.page === "projects").map((egg) => egg.id);
    expect(ids).toHaveLength(7);
    for (const lang of ["pt", "en", "es"] as const) for (const id of ids) {
      expect(comlink[lang].eggs[id]?.name, `${lang}/${id}`).toBeTruthy();
      expect(comlink[lang].eggs[id]?.hint, `${lang}/${id}`).toBeTruthy();
    }
    expect(marte.pt.credits.hint).toContain(String(ids.length));
  });
});
