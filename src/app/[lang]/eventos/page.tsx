import "../../home.css";
import "../../atlas.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BootSequence } from "@/components/home/BootSequence";
import { HudClock } from "@/components/home/HudClock";
import { HomeChoreography } from "@/components/home/HomeChoreography";
import { ChapterJump, ChapterTag } from "@/components/home/Chapter";
import { DiscoveryCount } from "@/components/about/DiscoveryCount";
import { AtlasHotspots, AtlasScene, atlasScene } from "@/components/events/AtlasScene";
import { AtlasMotion } from "@/components/events/AtlasMotion";
import AtlasGlobe, { type Orbit } from "@/components/events/AtlasGlobe";
import { EventLog } from "@/components/events/EventLog";
import { SignalDeck } from "@/components/events/SignalDeck";
import { AtlasEggs } from "@/components/events/AtlasEggs";
import { AtlasVoyage } from "@/components/events/AtlasVoyage";
import { boxStyle, poseBox } from "@/lib/scenes";
import { OrbitalSunrise } from "@/components/events/OrbitalSunrise";
import { LUMA_PROFILE, getUpcomingConnections } from "@/lib/luma";
import { LOG_ID } from "@/components/events/atlas-events";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { bootScriptFor, ATLAS_BOOT_KEY } from "@/lib/boot";
import { atlasEvents, byYear, cities, constellationOrder, countriesSplit, orbitOf, orbitYears, presenceStats, visorQueue, type AtlasEvent } from "@/lib/atlas-records";
import { parseFilters } from "@/lib/atlas-filters";

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? getDictionary(lang).events.metadata : {};
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}
const code = (index: number) => `◇ ${String(index + 1).padStart(2, "0")}`;
const place = (event: AtlasEvent) => [event.cidade, event.pais].filter(Boolean).join(event.formato === "presencial" ? ", " : " · ");

export default async function Events({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const a = d.atlas;
  const locale = lang === "pt" ? "pt-BR" : lang;
  const format = new Intl.NumberFormat(locale);
  const path = `/${lang}/eventos`;
  const events = atlasEvents();
  const stats = presenceStats(events);
  const places = cities(events);
  const years = orbitYears(events);
  const timeline = byYear(events);
  const countries = countriesSplit(events);
  const filters = parseFilters(await searchParams, years);
  const [first, second] = splitTitle(a.hero.title);
  const fill = (text: string) => text.replace("{events}", format.format(stats.eventos)).replace("{inPerson}", format.format(stats.presenciais)).replace("{cities}", format.format(stats.cidades)).replace("{remote}", format.format(stats.remotos));
  const readouts: [string, string, string] = [`${format.format(stats.eventos)} ${a.hero.readouts[0]}`, `${format.format(stats.cidades)} ${a.hero.readouts[1]}`, `${format.format(stats.remotos)} ${a.hero.readouts[2]}`];
  const ticker = [...readouts, `${format.format(stats.paisesPresenca)} ${a.stats.paisesPresenca}`, "PT · EN · ES", a.chapters[0].toUpperCase()];
  const lines = a.boot.lines.map(fill) as typeof a.boot.lines;
  // One marker per in-person city, larger where more gatherings happened. Remote events never become markers.
  const markers = places.map((city) => ({ location: [city.lat, city.lon] as [number, number], size: city.count >= 10 ? .04 : city.count >= 3 ? .032 : .024 }));
  const entry = (event: AtlasEvent) => ({ id: event.id, nome: event.nome, place: place(event), fonte: event.fonte });
  const orbits: Orbit[] = years.map((year) => { const o = orbitOf(year, events); return { year, cities: o.cities.map(({ lat, lon, count }) => ({ lat, lon, count })), presencial: o.presencial.map(entry), remoto: o.remoto.map(entry) }; });
  const visorEvents = events.map(({ id, nome, ano, cidade, pais, lat, lon, idioma, tipo, fonte, formato }) => ({ id, nome, ano, cidade, pais, lat, lon, idioma, tipo, fonte, formato }));
  const logEvents = events.map(({ id, nome, ano, cidade, pais, idioma, tipo, fonte, formato, order }) => ({ id, nome, ano, cidade, pais, idioma, tipo, fonte, formato, order }));
  const stars = constellationOrder(events).map(({ cidade, pais, lat, lon, first: year }) => ({ cidade, pais, lat, lon, first: year }));
  const count = <K extends string>(key: (event: AtlasEvent) => K, keys: readonly K[]) => Object.fromEntries(keys.map((k) => [k, events.filter((event) => key(event) === k).length])) as Record<K, number>;
  const { props } = atlasScene.assets;
  const upcoming = (await getUpcomingConnections()).slice(0, 4);
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });
  // prince-antenna decodes the oldest remote participation; paw-stamp marks the city with the most in-person gatherings.
  const firstRemote = [...events].filter((event) => event.formato === "remoto").sort((x, y) => x.order - y.order).map(({ nome, ano, fonte }) => ({ nome, ano, fonte }))[0];
  const base = [...places].sort((x, y) => y.count - x.count)[0];
  const statItems: [string, number][] = [[a.stats.eventos, stats.eventos], [a.stats.presenciais, stats.presenciais], [a.stats.remotos, stats.remotos], [a.stats.cidades, stats.cidades], [a.stats.paisesPresenca, stats.paisesPresenca], [a.stats.paisesRepresentados, stats.paisesRepresentados], [a.stats.idiomas, stats.idiomas]];

  return <main id="main" className="home-page events-page" data-sound-world="atlas" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(ATLAS_BOOT_KEY) }} />
    <BootSequence lines={lines} granted={a.boot.granted} skip={a.boot.skip} label={a.boot.label} storageKey={ATLAS_BOOT_KEY} brand={a.boot.brand} variant="atlas" armOnNavigation />
    <ReadingProgress variant="atlas" />

    {/* Chapter 1 — The navigation room */}
    <div className="atlas-hero-wrap">
      <AtlasMotion labelledBy="events-title" locale={locale} types={d.events.types} events={visorEvents} queue={visorQueue(events)} stars={stars} markers={markers}
        copy={{ status: a.status, readout: a.readout, formats: a.formats, languages: a.languages, prince: a.prince, tablet: a.tablet, dock: a.dock, touch: a.hud.touch }}
        yearMarkers={years.map((year) => ({ year, markers: orbitOf(year, events).cities.map((city) => ({ location: [city.lat, city.lon] as [number, number], size: city.count >= 10 ? .04 : city.count >= 3 ? .032 : .024 })) }))}>
        <Image className="page-hero__image" src={atlasScene.assets.background.src} alt={d.events.heroImageAlt} fill priority fetchPriority="high" sizes="100vw" />
        <AtlasScene holoLabel={a.hero.holo} />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="hero-hud atlas-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{a.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{a.hud.location}</p>
          <p className="atlas-signal-hud"><span>{a.hud.signal} <span className="atlas-signal-meter"><i /><i /><i /><i /><i /></span></span></p>
          <p className="hud-hint">{a.hud.hint}</p>
        </div>
        <div className="page-hero__content atlas-copy">
          <ChapterTag code={code(0)} label={a.chapters[0]} />
          <h1 id="events-title">{first}{second && <><br /><span>{second}</span></>}</h1>
          <p className="page-hero__subtitle">{a.hero.intro}</p>
          <p className="page-hero__extra">{fill(a.hero.extra)}</p>
          <div className="actions">
            <Link className="button primary" data-magnetic href={`/${lang}/servicos?assunto=palestra#contato`}>{d.events.primaryCta}</Link>
            <a className="hero-link" href={`#${LOG_ID}`}>{d.events.secondaryCta} <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <AtlasHotspots labels={{ glaucia: a.hud.glaucia, holo: a.hud.holo, prince: a.hud.prince, orb: a.hud.orb }} satellite={a.prince.satellite} />
      </AtlasMotion>
      <DiscoveryCount label={a.discoveries} page="events" className="atlas-discoveries" />
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{a.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker, ...ticker].map((item, index) => <span key={index}>{item}<b>◇</b></span>)}</span></span>
        <span className="hero-bar__scroll">{a.hero.scroll}<i /></span>
      </div>
    </div>

    {/* The camera voyage: from the navigation room, through the window, around the real globe, into the Atlas */}
    <AtlasVoyage plate={atlasScene.assets.background.src} copy={a.voyage} locale={locale}
      crew={[{ src: atlasScene.assets.actors.glaucia.hip.src, style: boxStyle(poseBox(atlasScene, "glaucia", "hip")) }, { src: atlasScene.assets.actors.prince.front.src, style: boxStyle(poseBox(atlasScene, "prince", "front")) }]}
      cities={places.map(({ lat, lon, first: year, count: n }) => ({ lat, lon, first: year, count: n }))}
      years={timeline.map(({ year }) => ({ year, names: orbitOf(year, events).presencial.map((event) => event.nome), cities: places.filter((city) => city.first <= year).length, remote: timeline.filter((row) => row.year <= year).reduce((sum, row) => sum + row.remoto, 0) }))} />

    {/* Chapter 2 — The globe */}
    <section className="chapter chapter--atlas" id="atlas" aria-labelledby="atlas-title">
      <div className="chapter__inner">
        <div className="chapter-head"><div>
          <ChapterTag code={code(1)} label={a.chapters[1]} />
          <h2 id="atlas-title" data-reveal="lines">{a.globe.title}</h2>
          <p data-reveal="up">{a.globe.intro}</p>
        </div></div>
        <div className="atlas-board">
          <div className="atlas-board__globe">
            <AtlasGlobe markers={markers} orbits={orbits} labels={a.globe} readout={a.readout} pedestal={{ off: props["globe-pedestal-off"].src, on: props["globe-pedestal-activated"].src }}
              base={{ cidade: base.cidade, lat: base.lat, lon: base.lon, count: base.count }} prince={atlasScene.assets.actors.prince.listen.src} princeCopy={a.prince} path={path} />
            <ul className="atlas-legend">
              <li data-kind="city"><i aria-hidden="true" />{a.globe.legendCity}</li>
              <li data-kind="signal"><i aria-hidden="true" />{a.globe.legendSignal}</li>
            </ul>
          </div>
          <div className="atlas-board__data">
            <dl className="atlas-stats" aria-label={a.stats.label} data-reveal="stagger">
              {statItems.map(([label, value]) => <div key={label}><dt>{label}</dt><dd><span data-count={value}>{format.format(value)}</span></dd></div>)}
            </dl>
            <div className="atlas-countries">
              <h3>{a.countries.title}</h3>
              <p className="atlas-countries__label" data-kind="city">{a.countries.present}</p>
              <ul>{countries.present.map((country) => <li key={country} data-kind="city">{country}</li>)}</ul>
              <p className="atlas-countries__label" data-kind="signal">{a.countries.remoteOnly}</p>
              <ul>{countries.remoteOnly.map((country) => <li key={country} data-kind="signal">{country}</li>)}</ul>
              <details><summary>{a.countries.summary}</summary><p>{a.countries.note}</p><p>{a.countries.mapNote}</p></details>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ChapterJump code={code(2)} label={a.chapters[2]} />

    {/* Chapter 3 — Logbook */}
    <section className="chapter chapter--log" id={LOG_ID} aria-labelledby="log-title">
      <div className="chapter__inner">
        <div className="chapter-head"><div>
          <ChapterTag code={code(2)} label={a.chapters[2]} />
          <h2 id="log-title" data-reveal="lines">{a.log.title}</h2>
          <p data-reveal="up">{a.log.intro}</p>
        </div></div>
        <EventLog events={logEvents} initial={filters} path={path} copy={a.log} formats={a.formats} languages={a.languages} types={d.events.types} locale={locale} />
        <p className="log__note">{d.events.note}</p>
      </div>
    </section>

    <ChapterJump code={code(3)} label={a.chapters[3]} />

    {/* Chapter 4 — Signals */}
    <section className="chapter chapter--signals" id="sinais" aria-labelledby="signals-title">
      <div className="chapter__inner">
        <div className="chapter-head"><div>
          <ChapterTag code={code(3)} label={a.chapters[3]} />
          <h2 id="signals-title" data-reveal="lines">{a.signals.title}</h2>
          <p data-reveal="up">{a.signals.intro}</p>
        </div></div>
        <SignalDeck years={timeline} path={path} copy={a.signals} formats={a.formats} languages={a.languages} types={d.events.types}
          byLanguage={count((event) => event.idioma, ["pt-BR", "en", "es"] as const)} byType={count((event) => event.tipo, ["palestra", "workshop", "organizacao"] as const)} byFormat={count((event) => event.formato, ["presencial", "remoto"] as const)}
          radars={{ small: props["radar-dish-small"].src, large: props["radar-dish-large"].src }} prince={atlasScene.assets.actors.prince.listen.src}
          firstSignal={firstRemote} princeCopy={a.prince} />
      </div>
    </section>

    {/* Chapter 5 — Next connection */}
    <section className="chapter chapter--credits chapter--orbit" aria-labelledby="orbit-title">
      <div className="credits-sky orbit-sky" aria-hidden="true"><OrbitalSunrise /></div>
      {/* Glaucia seen from behind (approved GE-GL-05 "back" pose) watches the orbital sunrise in silhouette. */}
      <span className="orbit-watchers" aria-hidden="true"><i style={{ backgroundImage: `url(${atlasScene.assets.actors.glaucia.back.src})` }} /></span>
      <div className="chapter__inner credits">
        <ChapterTag code={code(4)} label={a.chapters[4]} />
        <h2 id="orbit-title" data-reveal="lines">{a.credits.title}</h2>
        <p data-reveal="up">{a.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos?assunto=palestra#contato`}>{a.credits.cta}</Link>
          <Link className="hero-link" href={`/${lang}/servicos#contato`}>{a.credits.secondary} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="orbit-upcoming">
          <h3>{a.upcoming.title}</h3>
          {upcoming.length ? <ul>{upcoming.map((event) => <li key={event.id} data-format={event.format}>
            <time dateTime={event.start}>{dates.format(new Date(event.start))}</time>
            <a href={event.url} target="_blank" rel="noopener noreferrer">{event.name}<span aria-hidden="true"> ↗</span></a>
            <small>{event.format === "presencial" ? [event.city, event.country].filter(Boolean).join(", ") : a.formats.remoto}</small>
          </li>)}</ul> : <p>{a.upcoming.empty}</p>}
          <a className="orbit-upcoming__profile" href={LUMA_PROFILE} target="_blank" rel="noopener noreferrer">{a.upcoming.profile} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="orbit-note">{a.credits.audience}</p>
        <p className="orbit-hint">{a.credits.hint}</p>
        <p className="orbit-end">{a.credits.end}</p>
      </div>
    </section>

    <AtlasEggs />
    <HomeChoreography />
  </main>;
}
