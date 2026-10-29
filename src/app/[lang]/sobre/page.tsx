import "../../home.css";
import "../../niveora.css";
import "../../career-map.css";
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
import { observatory } from "@/components/home/ObservatoryScene";
import { NiveoraHotspots, NiveoraScene, niveoraScene } from "@/components/about/NiveoraScene";
import { NiveoraMotion } from "@/components/about/NiveoraMotion";
import { MemoryCapsule, type CapsuleRecord } from "@/components/about/MemoryCapsule";
import { ExpeditionLog } from "@/components/about/ExpeditionLog";
import { DiscoveryCount } from "@/components/about/DiscoveryCount";
import { CareerMap } from "@/components/about/CareerMap";
import { BorderlessAurora } from "@/components/about/BorderlessAurora";
import { auroraRecords } from "@/lib/aurora";
import { BetweenLines } from "@/components/about/BetweenLines";
import { BorrowedStar } from "@/components/about/BorrowedStar";
import { storySources } from "@/lib/niveora-stories";
import { curiousLetter, niveoraStories } from "@/i18n/niveora-stories";
import { AboutChoreography } from "@/components/about/AboutChoreography";
import { SnowDrift } from "@/components/about/SnowDrift";
import { FrozenCards } from "@/components/about/FrozenCards";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import type { NiveoraCopy } from "@/i18n/niveora";
import { bootScriptFor, NIVEORA_BOOT_KEY } from "@/lib/boot";
import { buildCareer, careerStats, type CareerRole } from "@/lib/career";
import { getCargos, getEventStats, getEventos } from "@/lib/data";
import { formatExperiencePeriod } from "@/lib/home-curation";
import { commercial } from "@/i18n/commercial";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 2592000;

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).about.metadata : {}; }

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}

const code = (index: number) => `✦ ${String(index + 1).padStart(2, "0")}`;

// The memory capsule's records: first role, first documented event, the Microsoft years and today, all from the data.
function capsuleRecords(roles: CareerRole[], microsoftYears: number, copy: NiveoraCopy["capsule"], locale: string): CapsuleRecord[] {
  const first = roles[roles.length - 1];
  const now = roles[0];
  const microsoft = roles.filter((role) => role.empresa === "Microsoft");
  const event = getEventos().reduce((oldest, item) => item.ano < oldest.ano ? item : oldest);
  const records: CapsuleRecord[] = [
    { label: copy.labels.first, title: first.cargo, detail: `${first.empresa} · ${formatExperiencePeriod(first.periodo, locale)}`, source: first.fonte },
    { label: copy.labels.event, title: event.nome, detail: [event.cidade, event.pais, event.ano].filter(Boolean).join(" · "), source: event.fonte },
  ];
  if (microsoft.length) records.push({ label: copy.labels.microsoft, title: copy.microsoftYears.replace("{n}", String(microsoftYears)), detail: [...new Set(microsoft.map((role) => role.cargo))].reverse().join(" → "), source: microsoft[0].fonte });
  records.push({ label: copy.labels.now, title: now.cargo, detail: `${now.empresa} · ${formatExperiencePeriod(now.periodo, locale)}`, source: now.fonte });
  return records;
}

export default async function About({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const n = d.niveora;
  const roles = buildCareer(getCargos());
  const career = careerStats(roles);
  const events = getEventStats();
  const [first, second] = splitTitle(d.about.title);
  const ticker = [...n.hud.ticker, ...n.hud.ticker];

  return <main id="main" className="home-page about-page" data-sound-world="niveora" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(NIVEORA_BOOT_KEY) }} />
    <BootSequence lines={n.boot.lines} granted={n.boot.granted} skip={n.boot.skip} label={n.boot.label} storageKey={NIVEORA_BOOT_KEY} brand={n.boot.brand} variant="niveora" armOnNavigation />
    <ReadingProgress variant="niveora" />

    {/* Chapter 1 — Nivéora */}
    <div className="niveora-hero-wrap">
      <NiveoraMotion labelledBy="about-title" labels={{ jump: n.chapters[1], touch: n.hud.touch, calm: n.hud.calm, status: n.status }}>
        <Image className="page-hero__image" src={niveoraScene.assets.background.src} alt={d.about.heroImageAlt} fill priority fetchPriority="high" sizes="100vw" />
        <NiveoraScene />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="hero-hud niveora-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{n.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{n.hud.location}</p>
          <p className="niveora-readout"><span>{n.hud.temp} <b data-temp>−32 °C</b></span><span>{n.hud.wind} <span className="niveora-wind"><i /><i /><i /><i /><i /></span></span></p>
          <p className="hud-hint">{n.hud.hint}</p>
        </div>
        <div className="page-hero__content niveora-copy">
          <ChapterTag code={code(0)} label={n.chapters[0]} />
          <h1 id="about-title">{first}{second && <><br /><span>{second}</span></>}</h1>
          <p className="page-hero__subtitle">{d.about.intro}</p>
          <p className="page-hero__extra">{d.about.mvp}</p>
          <div className="actions">
            <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`} aria-describedby="about-cta-note">{commercial[lang].cta}</Link>
            <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{d.about.secondaryCta} <span aria-hidden="true">↗</span></a>
          </div>
          <p className="cta-note" id="about-cta-note">{commercial[lang].ctaNote}</p>
        </div>
        <NiveoraHotspots labels={{ glaucia: n.hud.glaucia, prince: n.hud.prince, crystal: n.hud.crystal, station: n.hud.station, capsule: n.hud.capsule }} />
      </NiveoraMotion>
      <DiscoveryCount label={n.discoveries} />
      <MemoryCapsule copy={n.capsule} records={capsuleRecords(roles, career.microsoftYears, n.capsule, lang)} art={niveoraScene.assets.props["memory-capsule-open"].src} />
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{n.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{ticker.map((item, index) => <span key={index}>{item}<b>✦</b></span>)}</span></span>
        <span className="hero-bar__scroll">{n.hero.scroll}<i /></span>
      </div>
    </div>

    {/* Chapter 2 — Expedition log */}
    <ExpeditionLog copy={n.log} tag={[code(1), n.chapters[1]]} locale={lang} stats={[career.years, events.eventos, events.paises, 100000, career.microsoftYears]} />

    <ChapterJump code={code(2)} label={n.chapters[2]} />

    {/* Chapter 3 — Crossing map */}
    <section className="chapter chapter--ops" id="trajetoria" aria-labelledby="ops-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag code={code(2)} label={n.chapters[2]} /><h2 id="ops-title" data-reveal="lines">{n.map.title}</h2><p data-reveal="up">{n.map.intro}</p></div>
        </div>
        <CareerMap roles={roles} copy={n.map} locale={lang} source={d.common.source} ship={observatory.assets.props["spacecraft-far"].src} />
        <BetweenLines copy={niveoraStories[lang]} sources={storySources} />
      </div>
    </section>

    <BorderlessAurora locale={lang} records={auroraRecords} />

    {/* Chapter 4 — Expedition call */}
    <section className="chapter chapter--credits chapter--expedition" aria-labelledby="expedition-title">
      <div className="credits-sky expedition-sky" aria-hidden="true">
        <span className="expedition-ship" style={{ backgroundImage: `url(${observatory.assets.props["spacecraft-far"].src})` }}><span className="expedition-ship__engine" /></span>
        <span className="expedition-ground" />
      </div>
      <div className="chapter__inner credits">
        <BorrowedStar copy={niveoraStories[lang]} />
        <ChapterTag code={code(3)} label={n.chapters[3]} />
        <h2 id="expedition-title">{n.credits.title}</h2>
        <p>{n.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{n.credits.cta}</Link>
          <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{n.credits.secondary} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="expedition-hint">{n.credits.hint}</p>
        <p className="expedition-end">{n.credits.end}</p>
        <noscript><details className="story-letter-fallback"><summary>{curiousLetter[lang].title}</summary><p>{curiousLetter[lang].body}</p><p>{curiousLetter[lang].signature}</p></details></noscript>
      </div>
    </section>

    <FrozenCards copy={n.ice} />
    <SnowDrift />
    <HomeChoreography />
    <AboutChoreography />
  </main>;
}
