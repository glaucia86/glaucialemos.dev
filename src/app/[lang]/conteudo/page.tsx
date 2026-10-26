import "../../home.css";
import "../../lumina.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { socialLinks } from "@/data/social";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BootSequence } from "@/components/home/BootSequence";
import { HudClock } from "@/components/home/HudClock";
import { HomeChoreography } from "@/components/home/HomeChoreography";
import { ChapterJump, ChapterTag } from "@/components/home/Chapter";
import { DiscoveryCount } from "@/components/about/DiscoveryCount";
import { LuminaHotspots, LuminaScene, luminaScene } from "@/components/content/LuminaScene";
import { LuminaMotion } from "@/components/content/LuminaMotion";
import { CrystalRings } from "@/components/content/CrystalRings";
import { LuminaShelves, type EchoOf } from "@/components/content/LuminaShelves";
import { PrismGate } from "@/components/content/PrismGate";
import { Collections } from "@/components/content/Collections";
import { LibraryDusk } from "@/components/content/LibraryDusk";
import { LuminaEggs } from "@/components/content/LuminaEggs";
import { RetroTV } from "@/components/content/RetroTV";
import { getLatestVideo } from "@/lib/youtube";
import { articleAnchor } from "@/components/content/lumina-events";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { bootScriptFor, LUMINA_BOOT_KEY } from "@/lib/boot";
import { getArtigos } from "@/lib/data";
import { DUSK, TRANSLATIONS, WHISPERS, articlesByYear, daysBetween, echoes, libraryStats, platformCounts, series } from "@/lib/lumina-records";
import { shelve, NO_FILTERS } from "@/lib/lumina-shelves";

type Props = { params: Promise<{ lang: string }> };

// The old TV reads the channel's feed once a day.
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).content.metadata : {}; }

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}
const code = (index: number) => `◆ ${String(index + 1).padStart(2, "0")}`;

export default async function Content({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const l = d.lumina;
  const locale = lang === "pt" ? "pt-BR" : lang;
  const format = new Intl.NumberFormat(locale);
  const articles = shelve(getArtigos(), NO_FILTERS);
  const stats = libraryStats();
  const video = await getLatestVideo();
  const [first, second] = splitTitle(l.hero.title);
  const fill = (text: string) => text.replace("{records}", format.format(stats.records)).replace("{first}", stats.first.data.slice(0, 4)).replace("{platforms}", format.format(stats.platforms));
  const readouts: [string, string, string] = [`${format.format(stats.records)} ${l.hero.readouts[0]}`, `${format.format(stats.platforms)} ${l.hero.readouts[1]}`, `${format.format(stats.languages)} ${l.hero.readouts[2]}`];
  const ticker = [...readouts, "TYPESCRIPT", "MCP", "RAG", "AZURE", "NODE.JS"];
  const lines = l.boot.lines.map(fill) as typeof l.boot.lines;
  const dates = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  // Every member of an echo group points to the others, with the gap in days.
  const echoMap: Record<string, EchoOf[]> = {};
  for (const { original, copies } of echoes()) {
    const group = [original, ...copies];
    for (const article of group) echoMap[article.url] = group.filter((other) => other.url !== article.url).map((other) => ({ url: other.url, plataforma: other.plataforma, data: other.data, days: daysBetween(article, other) }));
  }
  const { props } = luminaScene.assets;
  const gate = { closed: props["prismatic-gate-closed"], open: props["prismatic-gate-open"] };
  const last = stats.last;
  const statItems: [string, number][] = [[l.rings.stats.records, stats.records], [l.rings.stats.platforms, stats.platforms], [l.rings.stats.languages, stats.languages], [l.rings.stats.years, stats.years]];

  return <main id="main" className="home-page content-page" data-sound-world="lumina" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(LUMINA_BOOT_KEY) }} />
    <BootSequence lines={lines} granted={l.boot.granted} skip={l.boot.skip} label={l.boot.label} storageKey={LUMINA_BOOT_KEY} brand={l.boot.brand} variant="lumina" armOnNavigation />
    <ReadingProgress variant="lumina" />
    <span className="dusk-veil" aria-hidden="true" />

    {/* Chapter 1 — The Living Library */}
    <div className="lumina-hero-wrap">
      <LuminaMotion labelledBy="content-title" locale={locale} whispers={WHISPERS} first={stats.first}
        copy={{ status: l.status, readout: l.readout, languages: l.languages, jump: l.hero.jump, touch: l.hud.touch, readouts }}>
        <Image className="page-hero__image" src={luminaScene.assets.background.src} alt={d.content.heroImageAlt} fill priority fetchPriority="high" sizes="100vw" />
        <LuminaScene />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="hero-hud lumina-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{l.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{l.hud.location}</p>
          <p className="lumina-readout-hud"><span>{l.hud.light} <span className="lumina-light-meter"><i /><i /><i /><i /><i /></span></span></p>
          <p className="hud-hint">{l.hud.hint}</p>
        </div>
        <div className="page-hero__content lumina-copy">
          <ChapterTag code={code(0)} label={l.chapters[0]} />
          <h1 id="content-title">{first}{second && <><br /><span>{second}</span></>}</h1>
          <p className="page-hero__subtitle">{l.hero.intro}</p>
          <p className="page-hero__extra">{fill(l.hero.extra)}</p>
          <div className="actions">
            <a className="button primary" data-magnetic href="#artigos">{d.content.primaryCta}</a>
            <a className="hero-link" href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">{d.content.secondaryCta} <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <LuminaHotspots labels={{ glaucia: l.hud.glaucia, crystal: l.hud.crystal, prince: l.hud.prince, books: l.hud.books }} />
      </LuminaMotion>
      <DiscoveryCount label={l.discoveries} page="content" className="lumina-discoveries" />
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{l.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker, ...ticker].map((item, index) => <span key={index}>{item}<b>◆</b></span>)}</span></span>
        <span className="hero-bar__scroll">{l.hero.scroll}<i /></span>
      </div>
    </div>

    {/* Chapter 2 — Crystal rings */}
    <section className="chapter chapter--rings" id="aneis" aria-labelledby="rings-title">
      <div className="chapter__inner">
        <div className="chapter-head"><div>
          <ChapterTag code={code(1)} label={l.chapters[1]} />
          <h2 id="rings-title" data-reveal="lines">{l.rings.title}</h2>
          <p data-reveal="up">{l.rings.intro}</p>
        </div></div>
        <dl className="library-stats" aria-label={l.rings.statsLabel} data-reveal="stagger">
          {statItems.map(([label, value]) => <div key={label}><dt>{label}</dt><dd><span data-count={value}>{format.format(value)}</span></dd></div>)}
        </dl>
        <CrystalRings years={articlesByYear()} platforms={platformCounts()} copy={l.rings} locale={locale} />
      </div>
    </section>

    <ChapterJump code={code(2)} label={l.chapters[2]} />

    {/* Chapter 3 — Shelves */}
    <section className="chapter chapter--shelves" id="artigos" aria-labelledby="shelves-title">
      <div className="chapter__inner">
        <div className="chapter-head chapter-head--shelves">
          <div>
            <ChapterTag code={code(2)} label={l.chapters[2]} />
            <h2 id="shelves-title" data-reveal="lines">{l.shelves.title}</h2>
            <p data-reveal="up">{l.shelves.intro}</p>
          </div>
          <PrismGate pairs={TRANSLATIONS} copy={l.prism} languages={l.languages} locale={locale} gate={gate} />
        </div>
        <LuminaShelves articles={articles} echoes={echoMap} copy={l.shelves} languages={l.languages} locale={locale} />
      </div>
    </section>

    <ChapterJump code={code(3)} label={l.chapters[3]} />

    {/* Chapter 4 — Collections */}
    <section className="chapter chapter--collections" id="colecoes" aria-labelledby="collections-title">
      <div className="chapter__inner">
        <div className="chapter-head"><div>
          <ChapterTag code={code(3)} label={l.chapters[3]} />
          <h2 id="collections-title" data-reveal="lines">{l.collections.title}</h2>
          <p data-reveal="up">{l.collections.intro}</p>
        </div></div>
        <Collections series={series.map(({ id, parts }) => ({ id, parts }))} copy={l.collections} locale={locale} />
      </div>
    </section>

    {/* Chapter 5 — Next chapter */}
    <section className="chapter chapter--credits chapter--library" aria-labelledby="library-title">
      <div className="credits-sky library-sky" aria-hidden="true"><span className="library-arch library-arch--far" /><span className="library-arch library-arch--near" /></div>
      <div className="chapter__inner credits">
        <ChapterTag code={code(4)} label={l.chapters[4]} />
        <h2 id="library-title" data-reveal="lines">{l.credits.title}</h2>
        <p data-reveal="up">{l.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{l.credits.cta}</Link>
          <a className="hero-link" href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">{l.credits.secondary} <span aria-hidden="true">↗</span></a>
        </div>
        <RetroTV video={video} copy={l.tv} locale={locale} />
        <div className="last-page">
          <p className="last-page__kicker">{l.credits.last}</p>
          <p className="last-page__title"><a href={last.url} target="_blank" rel="noopener noreferrer">{last.titulo}<span aria-hidden="true"> ↗</span></a></p>
          <p className="last-page__meta">{last.plataforma} · <time dateTime={last.data}>{dates.format(new Date(`${last.data}T00:00:00Z`))}</time> · <a href={`#${articleAnchor(last.url)}`}>{l.readout.shelf}</a></p>
          <p className="last-page__note">{l.credits.lastNote}</p>
        </div>
        <LibraryDusk shelf={DUSK} copy={l.dusk} languages={l.languages} locale={locale} />
        <p className="library-hint">{l.credits.hint}</p>
        <p className="library-end">{l.credits.end}</p>
      </div>
    </section>

    <LuminaEggs />
    <HomeChoreography />
  </main>;
}
