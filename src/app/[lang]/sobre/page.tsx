import "../../home.css";
import "../../about.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { socialLinks } from "@/data/social";
import { SceneMotion } from "@/components/SceneMotion";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BootSequence } from "@/components/home/BootSequence";
import { HudClock } from "@/components/home/HudClock";
import { HomeChoreography } from "@/components/home/HomeChoreography";
import { ChapterJump, ChapterTag, numerals } from "@/components/home/Chapter";
import { EchoBaseScene } from "@/components/about/EchoBaseScene";
import { CareerMap } from "@/components/about/CareerMap";
import { AboutChoreography } from "@/components/about/AboutChoreography";
import { RebelDossier } from "@/components/about/RebelDossier";
import { EchoEggs } from "@/components/about/EchoEggs";
import { LeiaActor } from "@/components/about/LeiaActor";
import { PixelSprite, TRANSPORT } from "@/components/about/sprites";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { bootScriptFor, ECHO_BOOT_KEY } from "@/lib/boot";
import { buildCareer, careerStats } from "@/lib/career";
import { getCargos, getEventStats } from "@/lib/data";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 2592000;

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).about.metadata : {}; }

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}

export default async function About({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const e = d.echo;
  const roles = buildCareer(getCargos());
  const career = careerStats(roles);
  const events = getEventStats();
  const [first, second] = splitTitle(d.about.title);
  const ticker = [...e.hud.ticker, ...e.hud.ticker];
  const tx = (index: number) => `TX.${numerals[index]}`;

  return <main id="main" className="home-page about-page" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(ECHO_BOOT_KEY) }} />
    <BootSequence lines={e.boot.lines} granted={e.boot.granted} skip={e.boot.skip} label={e.boot.label} storageKey={ECHO_BOOT_KEY} brand="// ECHO BASE UPLINK" variant="echo" armOnNavigation />
    <ReadingProgress />

    {/* Transmission I — Echo Base */}
    <div className="echo-hero-wrap">
      <section className="page-hero echo-hero" aria-labelledby="about-title" data-echo-hero>
        <Image className="page-hero__image" src="/pixel/sobre-leia.jpg" alt={d.about.heroImageAlt} fill priority sizes="100vw" />
        <SceneMotion scene="hoth"><EchoBaseScene /></SceneMotion>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="echo-frost" aria-hidden="true" />
        <div className="hero-hud echo-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{e.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{e.hud.location}</p>
          <p className="echo-hud__readout"><span>{e.hud.temp} <b data-temp>−32 °C</b></span><span>{e.hud.shield} <span className="echo-shield" data-shield><i /><i /><i /><i /><i /></span></span></p>
          <p className="hud-hint">{e.hud.hint}</p>
        </div>
        <p className="echo-touch-hint" aria-hidden="true"><span />{e.hud.touch}</p>
        <div className="page-hero__content echo-copy">
          <ChapterTag code={tx(0)} label={e.transmissions[0]} />
          <h1 id="about-title">{first}{second && <span>{second}</span>}</h1>
          <p className="page-hero__subtitle">{d.about.intro}</p>
          <p className="page-hero__extra">{d.about.mvp}</p>
          <div className="actions">
            <a className="button primary" data-magnetic href="#trajetoria">{d.about.primaryCta}</a>
            <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{d.about.secondaryCta} <span aria-hidden="true">↗</span></a>
            <button type="button" className="echo-ion-button" hidden><span className="echo-ion-button__icon" aria-hidden="true" />{e.hero.ion}</button>
          </div>
          <p className="sr-only" role="status" data-ion-status data-done={e.hero.ionDone} />
        </div>
      </section>
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{e.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{ticker.map((item, index) => <span key={index}>{item}<b>✦</b></span>)}</span></span>
        <span className="hero-bar__scroll">{e.hero.scroll}<i /></span>
      </div>
    </div>

    <ChapterJump code={tx(1)} label={e.transmissions[1]} />

    {/* Transmission II — Rebel dossier */}
    <RebelDossier copy={e.dossier} threepio={e.threepio} tag={[tx(1), e.transmissions[1]]} locale={lang} stats={[career.years, events.eventos, events.paises, 100000, career.microsoftYears]} />

    <ChapterJump code={tx(2)} label={e.transmissions[2]} />

    {/* Transmission III — Operations map */}
    <section className="chapter chapter--ops" id="trajetoria" aria-labelledby="ops-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag code={tx(2)} label={e.transmissions[2]} /><h2 id="ops-title" data-reveal="lines">{e.ops.title}</h2><p data-reveal="up">{e.ops.intro}</p></div>
        </div>
        <CareerMap roles={roles} copy={e.ops} locale={lang} source={d.common.source} />
      </div>
    </section>

    {/* Transmission IV — Recruitment */}
    <section className="chapter chapter--credits chapter--recruit" aria-labelledby="recruit-title">
      <div className="credits-sky recruit-sky" aria-hidden="true">
        <span className="recruit-transport"><PixelSprite {...TRANSPORT} /><span className="recruit-transport__engine" /></span>
        <span className="recruit-cover recruit-cover--a" /><span className="recruit-cover recruit-cover--b" />
        <span className="recruit-ground" />
      </div>
      <div className="chapter__inner credits">
        <ChapterTag code={tx(3)} label={e.transmissions[3]} />
        <h2 id="recruit-title" data-reveal="lines">{e.credits.title}</h2>
        <p data-reveal="up">{e.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{e.credits.cta}</Link>
          <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{e.credits.secondary} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="recruit-hint">{e.credits.hint}</p>
        <p className="recruit-end">{e.credits.end}</p>
      </div>
    </section>

    <EchoEggs copy={e.eggs} />
    <LeiaActor />
    <HomeChoreography />
    <AboutChoreography />
  </main>;
}
