import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getArtigos } from "@/lib/data";
import { DUSK, TRANSLATIONS, WHISPERS, articlesByYear, daysBetween, echoes, libraryStats, newestArticle, oldestArticle, platformCounts, series, yearOf } from "@/lib/lumina-records";
import { NO_FILTERS, parseFilters, serializeFilters, shelve } from "@/lib/lumina-shelves";
import { EGGS, matchPhrase } from "@/lib/eggs";
import { SCENES, poseBox } from "@/lib/scenes";
import { lumina } from "@/i18n/lumina";
import { comlink } from "@/i18n/comlink";
import { CRYSTAL_LIFT, GLAUCIA_POSES, HOTSPOTS, PRINCE_POSES, SPOTS } from "@/components/content/LuminaScene";
import { PIXEL, createPrism } from "@/components/content/prism-engine";
import { createCrystalJump } from "@/components/content/crystal-jump";
import { START, aligned, turn } from "@/components/content/PrismGate";
import { articleAnchor } from "@/components/content/lumina-events";

const articles = getArtigos();
const scene = SCENES.lumina;
const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;

describe("registros de Lúmina", () => {
  it("calcula a primeira e a última página a partir dos dados", () => {
    const dates = articles.map((article) => article.data).sort();
    expect(oldestArticle().data).toBe(dates[0]);
    expect(newestArticle().data).toBe(dates.at(-1));
    const stats = libraryStats();
    expect(stats.records).toBe(articles.length);
    expect(stats.years).toBe(yearOf(stats.last) - yearOf(stats.first) + 1);
  });

  it("conta cada registro uma vez nos anéis e nas plataformas", () => {
    const years = articlesByYear();
    expect(years.reduce((sum, item) => sum + item.count, 0)).toBe(articles.length);
    expect(years.map((item) => item.year)).toEqual(years.map((_, index) => years[0].year + index));
    expect(platformCounts().reduce((sum, item) => sum + item.count, 0)).toBe(articles.length);
  });

  it("encontra os ecos pelo título, em ordem de publicação", () => {
    const found = echoes();
    expect(found.length).toBeGreaterThan(0);
    for (const { original, copies } of found) for (const copy of copies) {
      expect(copy.url).not.toBe(original.url);
      expect(daysBetween(original, copy)).toBeGreaterThanOrEqual(0);
    }
  });

  it("tem um sussurro por ano da biblioteca", () => {
    expect(WHISPERS.map(yearOf)).toEqual(articlesByYear().map((item) => item.year));
  });

  it("pares de tradução ligam dois idiomas diferentes", () => {
    for (const [a, b] of TRANSLATIONS) { expect(a.url).not.toBe(b.url); expect(a.idioma).not.toBe(b.idioma); }
    expect(TRANSLATIONS.length).toBeGreaterThanOrEqual(6);
  });

  it("séries ficam em ordem cronológica e a coleção do entardecer existe", () => {
    for (const { parts } of series) {
      expect(parts.length).toBeGreaterThan(1);
      expect(parts.map((part) => part.data)).toEqual([...parts.map((part) => part.data)].sort());
    }
    expect(DUSK).toHaveLength(3);
  });
});

describe("estantes de Lúmina", () => {
  const valid = { platforms: [...new Set(articles.map((article) => article.plataforma))], years: articlesByYear().map((item) => item.year) };

  it("lê filtros da URL e ignora valores desconhecidos", () => {
    expect(parseFilters("?plataforma=Medium&idioma=es&ano=2020&q=docker&ordem=antigos", valid)).toEqual({ platform: "Medium", language: "es", year: 2020, query: "docker", sort: "oldest" });
    expect(parseFilters("?plataforma=Orkut&idioma=fr&ano=1999", valid)).toEqual(NO_FILTERS);
  });

  it("escreve só o que mudou e preserva outros parâmetros", () => {
    expect(serializeFilters(NO_FILTERS, "?era=all")).toBe("?era=all");
    expect(serializeFilters({ ...NO_FILTERS, year: 2021, query: " vue " })).toBe("?ano=2021&q=vue");
  });

  it("filtra por plataforma, idioma, ano e busca sem acento, e ordena", () => {
    expect(shelve(articles, NO_FILTERS)).toHaveLength(articles.length);
    expect(shelve(articles, NO_FILTERS)[0].data).toBe(newestArticle().data);
    expect(shelve(articles, { ...NO_FILTERS, sort: "oldest" })[0].data).toBe(oldestArticle().data);
    const year = shelve(articles, { ...NO_FILTERS, year: 2019 });
    expect(year.length).toBe(articlesByYear().find((item) => item.year === 2019)!.count);
    expect(shelve(articles, { ...NO_FILTERS, query: "introducao docker" }).every((article) => /docker/i.test(article.titulo))).toBe(true);
    expect(shelve(articles, { ...NO_FILTERS, language: "es", platform: "Medium" }).every((article) => article.idioma === "es" && article.plataforma === "Medium")).toBe(true);
  });

  it("cada card tem uma âncora única", () => {
    expect(new Set(articles.map((article) => articleAnchor(article.url))).size).toBe(articles.length);
  });

  it("os prismas começam desalinhados e giram em quartos de volta", () => {
    expect(aligned(START)).toBe(false);
    expect(turn(3, 1)).toBe(0);
    expect(turn(0, -1)).toBe(3);
    expect(aligned([0, 0, 0])).toBe(true);
  });
});

describe("cena de Lúmina", () => {
  beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("tem todas as poses usadas no palco", () => {
    const { glaucia, prince } = scene.assets.actors as Record<string, Record<string, unknown>>;
    for (const pose of [...GLAUCIA_POSES, "blink"]) expect(glaucia[pose], pose).toBeDefined();
    for (const pose of PRINCE_POSES) expect(prince[pose], pose).toBeDefined();
  });

  it("personagens e hotspots ficam à direita do texto e dentro da placa", () => {
    for (const box of Object.values(HOTSPOTS)) {
      expect(box.left).toBeGreaterThan(56);
      expect(box.left + box.width).toBeLessThanOrEqual(100);
      expect(box.top + box.height).toBeLessThanOrEqual(100);
    }
    for (const pose of GLAUCIA_POSES) expect(poseBox(scene, "glaucia", pose).left).toBeGreaterThan(56);
  });

  it("o cristal sobe até a mão da Glaucia, sem sair da placa", () => {
    expect(CRYSTAL_LIFT.y).toBeLessThan(0);
    expect(SPOTS.finger.v).toBeGreaterThan(30);
    expect(SPOTS.finger.u).toBeGreaterThan(70);
  });

  it("usa canvas em baixa resolução, com pixels de verdade", () => {
    const back = canvas(); const front = canvas();
    const prism = createPrism({ back, front });
    expect(back.width).toBe(Math.round(1440 / PIXEL));
    prism.ripple({ u: .8, v: .6 }); prism.sparks({ u: .8, v: .6 }, 5); prism.scan({ u: .78, v: .72 }, { u: .73, v: .78 });
    expect(prism.load()).toEqual({ particles: 5, ripples: 3, scans: 1 });
    prism.stop();
    expect(prism.load()).toEqual({ particles: 0, ripples: 0, scans: 0 });
  });

  it("o salto de cristal aceita progresso fora do intervalo", () => {
    const jump = createCrystalJump(canvas());
    expect(() => { jump.set(-1); jump.set(.5); jump.set(2); }).not.toThrow();
    jump.destroy();
  });
});

describe("textos e segredos de Lúmina", () => {
  const ids = EGGS.filter((egg) => egg.page === "content").map((egg) => egg.id);
  const keys = (value: unknown): string[] => value && typeof value === "object" ? Object.entries(value).flatMap(([key, child]) => [key, ...keys(child).map((sub) => `${key}.${sub}`)]) : [];

  it("tem os mesmos textos nos três idiomas, sem promessas de gratuidade", () => {
    expect(keys(lumina.en)).toEqual(keys(lumina.pt));
    expect(keys(lumina.es)).toEqual(keys(lumina.pt));
    for (const copy of Object.values(lumina)) expect(JSON.stringify(copy)).not.toMatch(/gratuit|grátis|gratis|\bfree\b/i);
  });

  it("cada segredo tem nome, dica e frase nos três idiomas", () => {
    expect(ids).toEqual(["crystal-whisper", "first-page", "prism-align", "crystal-echo", "series-constellation", "library-dusk", "retro-tv"]);
    expect(matchPhrase("TV")).toBe("retro-tv");
    expect(matchPhrase("série")).toBe("series-constellation");
    for (const id of ids) for (const lang of ["pt", "en", "es"] as const) expect(comlink[lang].eggs[id].hint.length, `${lang} ${id}`).toBeGreaterThan(20);
    expect(matchPhrase("primeira página")).toBe("first-page");
    expect(matchPhrase("Entardecer")).toBe("library-dusk");
  });
});
