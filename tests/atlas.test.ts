import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEventos } from "@/lib/data";
import { anglesOf, atlasEvents, byYear, cities, constellationOrder, countriesSplit, formatOf, orbitOf, orbitYears, presenceStats, visorQueue } from "@/lib/atlas-records";
import { NO_FILTERS, filterEvents, isFiltered, parseFilters, serializeFilters } from "@/lib/atlas-filters";
import { EGGS, matchPhrase } from "@/lib/eggs";
import { SCENES, poseBox } from "@/lib/scenes";
import { atlas } from "@/i18n/atlas";
import { comlink } from "@/i18n/comlink";
import { GLAUCIA_POSES, HOLO, HOTSPOTS, PEDESTAL, PRINCE_POSES, SPOTS } from "@/components/events/AtlasScene";
import { PIXEL, VIEW, createOrbit, inSky, limb, project } from "@/components/events/orbit-engine";
import { ACTS, createVoyagePixels, viewAt, yearAt } from "@/components/events/voyage-engine";

const events = atlasEvents();
const years = orbitYears();
const scene = SCENES["earth-orbit"];
const canvas = () => ({ clientWidth: 1440, clientHeight: 810, width: 0, height: 0, getContext: () => null }) as unknown as HTMLCanvasElement;

describe("registros do Atlas — regra factual", () => {
  it("deriva o formato da cidade: remoto nunca tem coordenadas, presencial sempre tem", () => {
    for (const event of events) {
      if (event.formato === "remoto") expect([event.cidade, event.lat, event.lon]).toEqual(["Online", null, null]);
      else expect(event.lat !== null && event.lon !== null).toBe(true);
    }
    expect(formatOf({ cidade: "Online" })).toBe("remoto");
    expect(formatOf({ cidade: "Toronto" })).toBe("presencial");
  });

  it("trata as conferências virtuais corrigidas como remotas", () => {
    for (const nome of ["CloudOuest Virtual Conference", "Reactor Brasil - Webinar"]) expect(events.find((event) => event.nome === nome)?.formato).toBe("remoto");
  });

  it("conta presença sem transformar participação remota em país visitado", () => {
    expect(presenceStats()).toEqual({ eventos: 135, presenciais: 80, remotos: 55, cidades: 20, paisesPresenca: 7, paisesRepresentados: 9, idiomas: 3 });
    const { present, remoteOnly } = countriesSplit();
    expect(remoteOnly).toEqual(["África do Sul", "França"]);
    expect(present).not.toContain("França");
    expect(present).not.toContain("África do Sul");
    expect(cities().some((city) => city.cidade === "Paris" || city.cidade === "Online")).toBe(false);
  });

  it("gera ids únicos e uma ordem cronológica completa", () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
    expect(new Set(events.map((event) => event.order)).size).toBe(events.length);
    const sorted = [...events].sort((a, b) => a.order - b.order);
    for (let i = 1; i < sorted.length; i++) expect(sorted[i].ano).toBeGreaterThanOrEqual(sorted[i - 1].ano);
    const source = getEventos();
    events.forEach((event, index) => expect(Object.fromEntries(Object.keys(source[index]).map((key) => [key, event[key as keyof typeof event]]))).toEqual(source[index]));
  });

  it("soma cada evento uma vez por ano, inclusive anos só remotos", () => {
    const rows = byYear();
    expect(rows.reduce((sum, row) => sum + row.presencial + row.remoto, 0)).toBe(135);
    expect(rows.find((row) => row.year === 2021)).toEqual({ year: 2021, presencial: 0, remoto: 9 });
    expect(rows.find((row) => row.year === 2020)).toEqual({ year: 2020, presencial: 12, remoto: 12 });
  });

  it("fecha a órbita de um ano com as cidades e os sinais daquele ano", () => {
    expect(years[0]).toBe(Math.max(...events.map((event) => event.ano)));
    const orbit = orbitOf(2021);
    expect(orbit.cities).toEqual([]);
    expect(orbit.remoto).toHaveLength(9);
    const busy = orbitOf(2019);
    expect(busy.presencial.length + busy.remoto.length).toBe(33);
    expect(busy.cities.reduce((sum, city) => sum + city.count, 0)).toBe(busy.presencial.length);
  });

  it("liga a constelação pela primeira presença, sem mover coordenadas", () => {
    const order = constellationOrder();
    expect(order).toHaveLength(20);
    for (let i = 1; i < order.length; i++) expect(order[i].first).toBeGreaterThanOrEqual(order[i - 1].first);
    for (const city of order) {
      const source = getEventos().find((event) => event.cidade === city.cidade && event.lat !== null)!;
      expect([city.lat, city.lon]).toEqual([source.lat, source.lon]);
    }
  });

  it("o visor passa por todos os eventos, uma vez cada, sempre na mesma ordem", () => {
    const queue = visorQueue();
    expect(new Set(queue).size).toBe(events.length);
    expect(visorQueue()).toEqual(queue);
  });

  it("orienta o globo para uma coordenada", () => {
    const [phi, theta] = anglesOf(0, 90);
    expect(phi).toBeCloseTo(Math.PI);
    expect(theta).toBe(0);
  });
});

describe("filtros do diário de bordo", () => {
  it("lê a URL e o objeto searchParams do servidor, ignorando valores inválidos", () => {
    expect(parseFilters("?ano=2019&formato=remoto&tipo=workshop&idioma=en&q=%20azure%20", years)).toEqual({ year: 2019, format: "remoto", type: "workshop", language: "en", query: "azure" });
    expect(parseFilters({ ano: ["1999"], formato: "viagem", tipo: undefined }, years)).toEqual(NO_FILTERS);
  });

  it("escreve só o que difere do padrão e preserva o resto", () => {
    expect(serializeFilters({ ...NO_FILTERS, format: "presencial" }, "?x=1&ano=2019")).toBe("?x=1&formato=presencial");
    expect(serializeFilters(NO_FILTERS)).toBe("");
    expect(isFiltered(NO_FILTERS)).toBe(false);
  });

  it("filtra por formato, ano, tipo, idioma e busca sem acento", () => {
    expect(filterEvents(events, { ...NO_FILTERS, format: "remoto" })).toHaveLength(55);
    expect(filterEvents(events, { ...NO_FILTERS, year: 2026 })).toHaveLength(7);
    expect(filterEvents(events, { ...NO_FILTERS, query: "sao paulo" }).every((event) => event.cidade === "São Paulo")).toBe(true);
    expect(filterEvents(events, { ...NO_FILTERS, query: "no-such-event-zz" })).toEqual([]);
  });
});

describe("cena do Atlas", () => {
  beforeEach(() => { vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} }); vi.stubGlobal("cancelAnimationFrame", () => {}); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("usa só poses aprovadas que existem nas folhas", () => {
    const { glaucia, prince } = scene.assets.actors as Record<string, Record<string, unknown>>;
    for (const pose of GLAUCIA_POSES) expect(glaucia[pose], pose).toBeDefined();
    for (const pose of [...PRINCE_POSES, "face-idle", "face-tongue", "face-joy"]) expect(prince[pose], pose).toBeDefined();
    for (const prop of ["globe-pedestal-off", "globe-pedestal-activated", "orb-navigation-idle", "orb-navigation-active", "radar-dish-small", "radar-dish-large"]) expect(scene.assets.props[prop as keyof typeof scene.assets.props], prop).toBeDefined();
  });

  it("composição I: Prince e Glaucia à direita do holograma, de frente; hotspots dentro da placa", () => {
    for (const box of Object.values(HOTSPOTS)) {
      expect(box.left).toBeGreaterThan(50);
      expect(box.left + box.width).toBeLessThanOrEqual(100);
      expect(box.top + box.height).toBeLessThanOrEqual(100);
    }
    const glaucia = poseBox(scene, "glaucia", "idle"); const prince = poseBox(scene, "prince", "front-bare");
    expect(prince.left).toBeGreaterThan(PEDESTAL.x);
    expect(glaucia.left).toBeGreaterThan(prince.left + prince.width / 2);
    // Acting, Prince turns his side view, which looks left: toward the hologram.
    expect(SPOTS.nose.u).toBeLessThan(prince.left + prince.width);
    expect(HOLO.left + HOLO.width / 2).toBe(PEDESTAL.x);
    expect(HOLO.top + HOLO.height).toBeLessThan(PEDESTAL.y);
    expect(SPOTS.holo.u).toBeCloseTo(PEDESTAL.x);
  });

  it("estrelas só no céu da janela, acima da curva da Terra", () => {
    expect(limb(.41)).toBeCloseTo(.49, 2);
    expect(limb(1)).toBeCloseTo(.17, 2);
    expect(inSky({ u: .8, v: .1 })).toBe(true);
    expect(inSky({ u: .8, v: .5 })).toBe(false);
    expect(inSky({ u: .3, v: .1 })).toBe(false);
  });

  it("a constelação mostra todas as cidades presenciais, sem mover coordenadas", () => {
    for (const city of constellationOrder()) {
      const { x, y } = project(city.lat, city.lon);
      expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(1);
    }
    expect(project(0, VIEW.lon0)).toEqual({ x: 0, y: (VIEW.lat1 - 0) / (VIEW.lat1 - VIEW.lat0) });
  });

  it("a viagem percorre Brasil → Américas → Atenas → Rio e acende do primeiro ao último ano", () => {
    expect(viewAt(0)).toEqual({ lat: -15, lon: -50 });
    expect(viewAt(1)).toEqual({ lat: -23, lon: -43 });
    expect(viewAt(.78)).toEqual({ lat: 38, lon: 24 });
    expect(yearAt(0, 2017, 2026)).toBe(2017);
    expect(yearAt(1, 2017, 2026)).toBe(2026);
    for (const [a, b] of Object.values(ACTS)) expect(b).toBeGreaterThan(a);
  });

  it("os motores em pixel usam canvas de baixa resolução e aceitam progresso fora do intervalo", () => {
    const back = canvas(); const front = canvas();
    const orbit = createOrbit({ back, front });
    expect(back.width).toBe(Math.round(1440 / PIXEL));
    expect(() => { orbit.ring({ u: .7, v: .6 }, 2); orbit.sparks({ u: .7, v: .6 }); orbit.beam({ u: .6, v: .66 }, { u: .75, v: .58 }); orbit.constellation({ u0: .6, v0: .3, u1: .9, v1: .7 }, constellationOrder(), 1000); orbit.clearConstellation(); }).not.toThrow();
    orbit.destroy();
    const voyage = createVoyagePixels(canvas());
    expect(() => { voyage.set(-1, 0); voyage.set(.25, 0); voyage.set(.6, 40); voyage.set(.9, 55); voyage.set(2, 55); }).not.toThrow();
    voyage.destroy();
  });
});

describe("textos e segredos do Atlas", () => {
  const ids = EGGS.filter((egg) => egg.page === "events").map((egg) => egg.id);
  const keys = (value: unknown): string[] => value && typeof value === "object" ? Object.entries(value).flatMap(([key, child]) => [key, ...keys(child).map((sub) => `${key}.${sub}`)]) : [];

  it("tem os mesmos textos nos três idiomas e nunca chama participação remota de viagem", () => {
    expect(keys(atlas.en)).toEqual(keys(atlas.pt));
    expect(keys(atlas.es)).toEqual(keys(atlas.pt));
    for (const copy of Object.values(atlas)) {
      expect(JSON.stringify(copy)).not.toMatch(/gratuit|grátis|gratis|\bfree\b|Grogu|Twitch/i);
      expect(copy.readout.constellationNote.length).toBeGreaterThan(40);
    }
    expect(atlas.pt.readout.constellationNote).toMatch(/não rotas de viagem/);
    expect(atlas.en.readout.constellationNote).toMatch(/not travel routes/);
    expect(atlas.es.readout.constellationNote).toMatch(/no rutas de viaje/);
  });

  it("os três segredos têm nome, dica e frase nos três idiomas", () => {
    expect(ids).toEqual(["orbital-trail", "constellation-route", "dog-navigation", "prince-antenna", "paw-stamp", "runaway-satellite"]);
    for (const id of ids) for (const lang of ["pt", "en", "es"] as const) expect(comlink[lang].eggs[id].hint.length, `${lang} ${id}`).toBeGreaterThan(20);
    expect(matchPhrase("órbita")).toBe("orbital-trail");
    expect(matchPhrase("Constelação")).toBe("constellation-route");
    expect(matchPhrase("visor")).toBe("dog-navigation");
  });
});
