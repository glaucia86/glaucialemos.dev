import "../home.css";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RagDemo } from "@/components/RagDemo";
import { EventMap } from "@/components/EventMap";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BootSequence } from "@/components/home/BootSequence";
import { DagobahScene } from "@/components/home/DagobahScene";
import { HeroMotion } from "@/components/home/HeroMotion";
import { HudClock } from "@/components/home/HudClock";
import { HomeChoreography } from "@/components/home/HomeChoreography";
import { MissionIcon } from "@/components/home/MissionIcon";
import { curateMilestones, homeServiceSubjects, formatExperiencePeriod, featuredContribution, HOME_ARCHIVE_SIZE } from "@/lib/home-curation";
import { bootScript } from "@/lib/boot";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getEventStats, getServicos, getCargos, getEventos } from "@/lib/data";
import { getContribuicoesComEstrelas, getTopRepos } from "@/lib/github";
import { socialLinks } from "@/data/social";

export const revalidate = 2592000;

const sabers = ["var(--energy-blue)", "var(--energy-green)", "var(--energy-purple)", "var(--energy-gold)"];
const numerals = ["I", "II", "III", "IV", "V"];

function ChapterTag({ index, label }: { index: number; label: string }) {
  return <p className="chapter-tag"><span className="chapter-tag__ep" aria-hidden="true">EP.{numerals[index]}</span>{label}</p>;
}

function ChapterJump({ label, index }: { label: string; index: number }) {
  return <div className="chapter-jump" aria-hidden="true" data-jump>
    <span className="chapter-jump__streaks">{Array.from({ length: 9 }, (_, streak) => <i key={streak} />)}</span>
    <span className="chapter-jump__label">EP.{numerals[index]} <b>{label}</b></span>
  </div>;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const h = d.holonet;
  const stats = getEventStats();
  const projects = await getTopRepos(HOME_ARCHIVE_SIZE);
  const featured = (await getContribuicoesComEstrelas()).find(contribution => contribution.repo === featuredContribution);
  const milestones = curateMilestones(getCargos());
  const format = new Intl.NumberFormat(lang);
  const languages = Object.values(stats.idiomas).filter(Boolean).length;
  const bootLines = h.boot.lines.map(line => line.replace("{events}", format.format(stats.eventos)).replace("{countries}", format.format(stats.paises)));
  const ticker = [...h.hud.ticker, ...h.hud.ticker];

  return <main id="main" className="home-page" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScript }} />
    <BootSequence lines={bootLines} granted={h.boot.granted} skip={h.boot.skip} label={h.boot.label} />
    <ReadingProgress />

    {/* Episode I — Dagobah */}
    <div className="home-hero">
      <HeroMotion jumpLabel={h.episodes[1]} forceLabel={h.hud.force} labelledBy="hero-title">
        <Image className="page-hero__image" src="/pixel/dagobah-background.webp" alt={d.home.heroImageAlt} fill priority fetchPriority="high" sizes="100vw" />
        <DagobahScene />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="hero-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{h.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{h.hud.location}</p>
          <p className="hud-signal">{h.hud.signal}<span className="hud-bars"><i /><i /><i /><i /><i /></span></p>
          <p className="hud-hint">{h.hud.push}</p>
        </div>
        <div className="page-hero__content hero-copy">
          <ChapterTag index={0} label={h.episodes[0]} />
          <h1 id="hero-title" className="hero-name" aria-label="Glaucia Lemos"><span className="hero-name__line" aria-hidden="true">Glaucia</span><span className="hero-name__line hero-name__line--alt" aria-hidden="true">Lemos</span></h1>
          <p className="hero-role">{d.home.eyebrow}</p>
          <p className="page-hero__subtitle">{d.home.value}</p>
          <div className="actions">
            <Link className="button primary" data-magnetic href={`/${lang}/servicos`}>{d.home.primaryCta}</Link>
            <Link className="hero-link" href="#projetos">{d.home.secondaryCta} <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
      </HeroMotion>
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{d.home.sceneCaption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{ticker.map((item, index) => <span key={index}>{item}<b>✦</b></span>)}</span></span>
        <span className="hero-bar__scroll">{h.hud.scroll}<i /></span>
      </div>
    </div>

    {/* Episode II — The Jedi */}
    <section className="chapter chapter--jedi" id="jedi" aria-labelledby="jedi-title">
      <div className="chapter__inner jedi-grid">
        <div className="holo-card" data-tilt>
          <figure className="holo-card__frame portrait-frame">
            <div className="portrait-viewport"><div className="portrait-image-plane">
              <Image src="/pixel/jedi-glaucia.jpg" alt={d.home.aboutImageAlt} width={720} height={960} sizes="(max-width: 900px) 85vw, 34vw" />
              <svg className="jedi-blade" viewBox="0 0 864 1152" aria-hidden="true" focusable="false">
                <path className="jedi-blade__halo" d="M211 583 130 123" />
                <path className="jedi-blade__edge" d="M211 583 130 123" />
                <path className="jedi-blade__core" d="M211 583 130 123" />
              </svg>
              <svg className="jedi-bolts" viewBox="0 0 864 1152" aria-hidden="true" focusable="false" />
            </div></div>
            <span className="holo-card__sheen" aria-hidden="true" />
            <span className="holo-card__scan" aria-hidden="true" />
            <figcaption><span className="holo-card__name">Glaucia Lemos</span><span className="holo-card__class">{h.jedi.card}</span></figcaption>
          </figure>
          <span className="holo-card__id" aria-hidden="true">ID · GL-0001 · PRINCIPAL SWE · AI LEAD · MVP</span>
          <button type="button" className="jedi-deflect" hidden><span className="jedi-deflect__icon" aria-hidden="true" />{h.jedi.deflect}</button>
        </div>
        <div className="jedi-copy">
          <ChapterTag index={1} label={h.episodes[1]} />
          <h2 id="jedi-title" data-reveal="lines">{h.jedi.title}</h2>
          <p data-reveal="up">{d.journey.intro}</p>
          <dl className="char-sheet" aria-label={h.jedi.sheetLabel} data-reveal="stagger">
            {h.jedi.sheet.map(([term, value]) => <div key={term}><dt>{term}</dt><dd data-scramble>{value}</dd></div>)}
          </dl>
          <Link className="text-link trajectory-link" href={`/${lang}/sobre`}>{d.home.aboutLink}<span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="chapter__inner route" data-route>
        <h3 className="route__title">{h.jedi.route}</h3>
        <svg className="route__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path className="route__track" d="M0 20H1000" />
          <path className="route__trail" d="M0 20H1000" />
        </svg>
        <ol className="route__stops">{milestones.map((milestone, index) => <li key={milestone.cargo + milestone.empresa} className="route__stop">
          <span className="route__planet" aria-hidden="true" style={{ "--planet": sabers[index] } as CSSProperties} />
          <span className="route__period">{formatExperiencePeriod(milestone.periodo, lang)}</span>
          <h4>{d.journey.milestones[index]}</h4>
          <p>{milestone.empresa} · <a href={milestone.fonte}>{d.common.source}<span aria-hidden="true"> ↗</span></a></p>
        </li>)}</ol>
      </div>
    </section>

    <ChapterJump index={2} label={h.episodes[2]} />

    {/* Episode III — The holocron */}
    <section className="chapter chapter--holocron" id="projetos" aria-labelledby="holocron-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag index={2} label={h.episodes[2]} /><h2 id="holocron-title" data-reveal="lines">{d.journey.demo.title}</h2></div>
          <Link className="text-link" href={`/${lang}/projetos`}>{d.home.projectsLink}<span aria-hidden="true">↗</span></Link>
        </div>
        <div className="holocron-grid">
          <RagDemo copy={d.journey.demo} terminal={h.holocron} />
          {featured && <article className="holocron holocron--featured" data-tilt data-reveal="up">
            <svg className="holocron-cube" viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
              <path fill="#9fdcff" d="M7 1h2v1h2v1h2v1h1v1h-2v1h-2v1H8V6H6V5H4V4H2V3h2V2h3z" />
              <path fill="#08a9fa" d="M2 4h2v1h2v1h2v8H7v-1H5v-1H3v-1H2z" />
              <path fill="#0a5f8f" d="M8 7h2V6h2V5h2v7h-1v1h-2v1H8z" />
              <path className="holocron-cube__glow" fill="#efffff" d="M7 3h2v1H7zM4 7h1v3H4zM11 8h1v3h-1z" />
            </svg>
            <p className="holocron__label">{h.holocron.featured} · {featured.papel[lang]}</p>
            <h3>{d.home.projectsTitle}</h3>
            <p>{d.journey.demo.explanation}</p>
            <p className="holocron__repo" data-scramble-hover>{featured.repo}</p>
            <p className="holocron__stars"><span aria-hidden="true">★</span> <span data-count={featured.estrelas}>{format.format(featured.estrelas)}</span> {d.common.stars}</p>
            <a className="button primary" data-magnetic href={featured.url}>{d.journey.demo.cta}<span aria-hidden="true">↗</span></a>
          </article>}
        </div>
        <p className="holocron-archive">{h.holocron.archive}</p>
        <div className="holocron-list" data-reveal="stagger">{projects.map((project, index) => <article className="holocron" key={project.nome} data-tilt>
          <span className="holocron__index" aria-hidden="true">0{index + 2}</span>
          <h3><a href={project.url} data-scramble-hover>{project.nome}</a><span aria-hidden="true"> ↗</span></h3>
          <p>{d.journey.projects[project.nome] ?? project.descricao}</p>
          <p className="holocron__stars"><span aria-hidden="true">★</span> <span data-count={project.estrelas}>{format.format(project.estrelas)}</span> {d.common.stars}</p>
        </article>)}</div>
      </div>
    </section>

    <ChapterJump index={3} label={h.episodes[3]} />

    {/* Episode IV — The galactic map */}
    <section className="chapter chapter--galaxy" id="mapa" aria-labelledby="galaxy-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag index={3} label={h.episodes[3]} /><h2 id="galaxy-title" data-reveal="lines">{h.galaxy.title}</h2><p data-reveal="up">{d.journey.map.intro}</p></div>
          <dl className="galaxy-stats">{[stats.eventos, stats.paises, languages].map((value, index) => <div key={index}><dt>{d.events.labels[index]}</dt><dd data-count={value}>{format.format(value)}</dd></div>)}</dl>
        </div>
        <p className="history-label">{d.journey.map.history}</p>
        <EventMap events={getEventos().map(({ nome, ano, cidade, pais, lat, lon, idioma, fonte }) => ({ nome, ano, cidade, pais, lat, lon, idioma, fonte }))} locale={lang} copy={d.journey.map} source={d.common.source} galaxy={h.galaxy} />
        <div className="galaxy-actions"><Link className="text-link" href={`/${lang}/eventos`}>{d.journey.map.all}<span aria-hidden="true">↗</span></Link><Link className="button primary" data-magnetic href={`/${lang}/servicos?assunto=palestra#contato`}>{d.events.primaryCta}</Link></div>
      </div>
    </section>

    <ChapterJump index={4} label={h.episodes[4]} />

    {/* Episode V — Your mission */}
    <section className="chapter chapter--missions" id="missoes" aria-labelledby="missions-title">
      <div className="chapter__inner">
        <div className="chapter-head chapter-head--center">
          <div><ChapterTag index={4} label={h.episodes[4]} /><h2 id="missions-title" data-reveal="lines">{h.missions.title}</h2><p data-reveal="up">{h.missions.intro}</p></div>
        </div>
        <div className="missions" data-reveal="stagger">{getServicos().map((service, index) => <article className="mission" key={service.id} style={{ "--saber": sabers[index] } as CSSProperties}>
          <span className="mission__saber" aria-hidden="true" />
          <MissionIcon kind={homeServiceSubjects[service.id]} />
          <p className="mission__label">{h.missions.labels[index]}</p>
          <h3>{service.titulo[lang]}</h3>
          <p>{service.descricao[lang]}</p>
          <Link className="mission__cta" href={`/${lang}/servicos?assunto=${homeServiceSubjects[service.id]}#contato`}>{d.journey.closing.actions[index]}<span aria-hidden="true"> →</span></Link>
        </article>)}</div>
      </div>
    </section>

    {/* Credits */}
    <section className="chapter chapter--credits" aria-labelledby="credits-title">
      <div className="credits-sky" aria-hidden="true">
        <svg className="xwing" viewBox="0 0 24 12" shapeRendering="crispEdges" focusable="false"><path fill="#c9bed4" d="M2 1h6v1H2zM2 10h6v1H2zM6 2h3v1H6zM6 9h3v1H6zM8 3h12v2h3v2h-3v2H8z" /><path fill="#ff4d5e" d="M2 1h2v1H2zM2 10h2v1H2zM12 5h5v2h-5z" /><path fill="#08a9fa" d="M0 5h2v2H0z" /></svg>
      </div>
      <div className="chapter__inner credits">
        <p className="chapter-tag"><span className="chapter-tag__ep" aria-hidden="true">END</span>{h.credits.end}</p>
        <h2 id="credits-title" data-reveal="lines">{h.credits.title}</h2>
        <p data-reveal="up">{h.credits.body}</p>
        <div className="actions"><Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{h.credits.cta}</Link><a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{h.credits.secondary} <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>
    <HomeChoreography />
  </main>;
}
