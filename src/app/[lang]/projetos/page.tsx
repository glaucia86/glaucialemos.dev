import "../../home.css";
import "../../marte.css";
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
import { MarsHotspots, MarsScene, marsScene } from "@/components/projects/MarsScene";
import { MarsMotion, type ReadingRepo } from "@/components/projects/MarsMotion";
import { LabTelemetry } from "@/components/projects/LabTelemetry";
import { RepoArchive, type ArchiveRepo } from "@/components/projects/RepoArchive";
import { RepoBench, SiteBench } from "@/components/projects/Bench";
import { PartnerStations } from "@/components/projects/PartnerStations";
import { DustPanel } from "@/components/projects/DustPanel";
import { MarsEggs } from "@/components/projects/MarsEggs";
import { languageColor } from "@/components/projects/languages";
import { repoAnchor } from "@/components/projects/repo-events";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { bootScriptFor, MARTE_BOOT_KEY } from "@/lib/boot";
import { buildCareer } from "@/lib/career";
import { getCargos } from "@/lib/data";
import { getAllRepos, getContribuicoesComEstrelas, getGithubTelemetry, GITHUB_USER } from "@/lib/github";
import { formatExperiencePeriod } from "@/lib/home-curation";
import { CARD_REPO, firstCommits, latestPush, newestRepo, oldestRepo, scanTargets, SITE_REPO } from "@/lib/mars-records";
import { categorize } from "@/lib/repos";
import { boxStyle, poseBox } from "@/lib/scenes";
import type { Projeto } from "@/lib/types";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;
const ARCHIVE_SIZE = 30;
const GITHUB = `https://github.com/${GITHUB_USER}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).projects.metadata : {}; }

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}

const code = (index: number) => `◆ ${String(index + 1).padStart(2, "0")}`;
const reading = (repo: Projeto): ReadingRepo => ({ nome: repo.nome, url: repo.url, estrelas: repo.estrelas, linguagem: repo.linguagem, criado: repo.criado });

export default async function Projects({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const m = d.marte;
  const archive = await getAllRepos();
  const [stats, contributions] = await Promise.all([getGithubTelemetry(archive), getContribuicoesComEstrelas()]);
  const format = new Intl.NumberFormat(lang);
  const repos: ArchiveRepo[] = archive.repos.slice(0, ARCHIVE_SIZE).map((repo) => ({
    nome: repo.nome, url: repo.url, estrelas: repo.estrelas, forks: repo.forks, linguagem: repo.linguagem, topicos: repo.topicos,
    atualizado: repo.atualizado, descricao: d.journey.projects[repo.nome] ?? repo.descricao, categorias: categorize(repo),
  }));
  const [featured, ...rest] = repos;
  const [first, second] = splitTitle(m.hero.title);
  const tag = (index: number): [string, string] => [code(index), m.chapters[index]];
  const ticker = [`${format.format(stats.originals)} ${m.memory.stats.originals}`, `${format.format(stats.stars)} ${m.memory.stats.stars}`, `${format.format(stats.mergedPrs)} ${m.memory.stats.mergedPrs}`, "TYPESCRIPT", "MCP", "RAG", "AZURE", `${format.format(stats.followers)} ${m.memory.stats.followers}`];
  const readouts: [string, string, string] = [`${format.format(stats.originals)} ${m.hero.readouts[0]}`, `★ ${format.format(stats.stars)} ${m.hero.readouts[1]}`, `${format.format(stats.mergedPrs)} ${m.hero.readouts[2]}`];

  // The career begins before the 2018 npx card: the earliest role in the experience data.
  const roles = buildCareer(getCargos());
  const start = roles.reduce((oldest, role) => role.start < oldest.start ? role : oldest);
  const career = m.bench.card.career.replace("{start}", formatExperiencePeriod(start.periodo, lang).split("–")[0].trim()).replace("{role}", start.cargo).replace("{company}", start.empresa);

  const bench = (repo: ArchiveRepo, primary = false) => {
    const record = firstCommits[repo.nome];
    return record && <RepoBench record={record} stars={format.format(repo.estrelas)} pushed={repo.atualizado} copy={m.bench} locale={lang} primary={primary} card={repo.nome === CARD_REPO ? career : undefined} />;
  };
  const benches = Object.fromEntries(rest.filter((repo) => firstCommits[repo.nome]).map((repo) => [repo.nome, bench(repo)]));
  type Sprite = { src: string; w: number; h: number; px?: number[] };
  const { actors, props, bench: benchArt } = marsScene.assets as typeof marsScene.assets & { bench: { raw: Sprite; plate: Sprite & { crop: number[] }; "grid-3": Sprite } };
  const shown = (sprite: Sprite) => ({ src: sprite.src, w: sprite.px?.[0] ?? sprite.w, h: sprite.px?.[1] ?? sprite.h });
  const siteArt = { plate: benchArt.plate, raw: benchArt.raw, rejected: benchArt["grid-3"], approved: shown(actors.glaucia.idle) };
  // Glaucia's idle box on the plate, re-expressed inside the plate window used by the before/after.
  const [cropLeft, cropTop, cropRight, cropBottom] = benchArt.plate.crop;
  const idleBox = poseBox(marsScene, "glaucia", "idle");
  const benchBox = boxStyle({
    left: (idleBox.left - cropLeft) / (cropRight - cropLeft) * 100, top: (idleBox.top - cropTop) / (cropBottom - cropTop) * 100,
    width: idleBox.width / (cropRight - cropLeft) * 100, height: idleBox.height / (cropBottom - cropTop) * 100,
  });
  const oldest = oldestRepo(archive.repos);
  const pushed = latestPush(archive.repos);

  return <main id="main" className="home-page projects-page" data-sound-world="mars" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(MARTE_BOOT_KEY) }} />
    <BootSequence lines={m.boot.lines} granted={m.boot.granted} skip={m.boot.skip} label={m.boot.label} storageKey={MARTE_BOOT_KEY} brand={m.boot.brand} variant="mars" armOnNavigation />
    <ReadingProgress variant="mars" />

    {/* Chapter 1 — Valley of Inventions */}
    <div className="mars-hero-wrap">
      <MarsMotion labelledBy="projects-title" locale={lang} scans={scanTargets(archive.repos).map(reading)} oldest={reading(oldest)}
        copy={{ status: m.status, readout: m.readout, jump: m.hero.jump, touch: m.hud.touch, readouts }}>
        <Image className="page-hero__image" src={marsScene.assets.background.src} alt={d.projects.heroImageAlt} fill priority fetchPriority="high" sizes="100vw" />
        <MarsScene />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="hero-hud mars-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{m.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{m.hud.location}</p>
          <p className="mars-readout-hud"><span>{m.hud.temp} <b>−63 °C</b></span><span>{m.hud.dust} <span className="mars-dust-meter"><i /><i /><i /><i /><i /></span></span></p>
          <p className="hud-hint">{m.hud.hint}</p>
        </div>
        <div className="page-hero__content mars-copy">
          <ChapterTag code={code(0)} label={m.chapters[0]} />
          <h1 id="projects-title">{first}{second && <><br /><span>{second}</span></>}</h1>
          <p className="page-hero__subtitle">{m.hero.intro}</p>
          <p className="page-hero__extra">{m.hero.extra}</p>
          <div className="actions">
            <a className="button primary" data-magnetic href={GITHUB} target="_blank" rel="noopener noreferrer">{d.projects.primaryCta}</a>
            <a className="hero-link" href="#projetos">{d.projects.secondaryCta} <span aria-hidden="true">→</span></a>
          </div>
        </div>
        <MarsHotspots labels={{ glaucia: m.hud.glaucia, rover: m.hud.rover, prince: m.hud.prince, console: m.hud.console }} />
      </MarsMotion>
      <DiscoveryCount label={m.discoveries} page="projects" className="mars-discoveries" />
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{m.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker, ...ticker].map((item, index) => <span key={index}>{item}<b>◆</b></span>)}</span></span>
        <span className="hero-bar__scroll">{m.hero.scroll}<i /></span>
      </div>
    </div>

    {/* Chapter 2 — Lab telemetry */}
    <LabTelemetry stats={stats} copy={m} newest={newestRepo(archive.repos)} sproutArt={marsScene.assets.props.sprout.src} career={career}
      prince={{ stand: shown(actors.prince.stand), sniff: shown(actors.prince.sniff) }} tag={tag(1)}
      retroArt={{ computerOff: shown(props["retro-computer-off"]), computerOn: shown(props["retro-computer-on"]), floppyFlat: shown(props["floppy-flat"]), floppyUpright: shown(props["floppy-upright"]) }} locale={lang} live={archive.live} year={new Date().getFullYear()} readAt={new Date()} />

    <ChapterJump code={code(2)} label={m.chapters[2]} />

    {/* Chapter 3 — Archive of inventions */}
    <section className="chapter chapter--archive" id="projetos" aria-labelledby="archive-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag code={code(2)} label={m.chapters[2]} /><h2 id="archive-title" data-reveal="lines">{m.archive.title}</h2><p data-reveal="up">{m.archive.intro}</p></div>
        </div>
        {featured && <article className="invention" id={repoAnchor(featured.nome)} data-bench={firstCommits[featured.nome] ? "true" : undefined} style={{ "--sample": languageColor(featured.linguagem) } as React.CSSProperties}>
          <p className="invention__label">{m.archive.featured}</p>
          <h3><a href={featured.url} target="_blank" rel="noopener noreferrer">{featured.nome}</a></h3>
          <p>{featured.descricao}</p>
          <p className="invention__stats"><span>★ {format.format(featured.estrelas)} {m.archive.stars}</span><span>⑂ {format.format(featured.forks)} {m.archive.forks}</span><span className="invention__lang"><span className="sample-gem" aria-hidden="true" />{featured.linguagem ?? "—"}</span></p>
          <a className="button primary" href={featured.url} target="_blank" rel="noopener noreferrer">{m.archive.featuredCta} <span aria-hidden="true">↗</span></a>
          {bench(featured, true)}
        </article>}
        <RepoArchive repos={rest} copy={m.archive} locale={lang} githubUrl={`${GITHUB}?tab=repositories`} benches={benches}>
          <SiteBench record={firstCommits[SITE_REPO.nome]} copy={m.bench} locale={lang} art={siteArt} box={benchBox} />
        </RepoArchive>
      </div>
    </section>

    <ChapterJump code={code(3)} label={m.chapters[3]} />

    {/* Chapter 4 — Partner stations */}
    <PartnerStations contributions={contributions} prsByRepo={stats.prsByRepo} mergedPrs={stats.mergedPrs} copy={m.stations} bug={m.bug} tag={tag(3)} locale={lang} />

    {/* Chapter 5 — Next mission */}
    <section className="chapter chapter--credits chapter--mission" aria-labelledby="mission-title">
      <div className="credits-sky mission-sky" aria-hidden="true"><span className="mission-ridge mission-ridge--far" /><span className="mission-ridge mission-ridge--near" /></div>
      <div className="chapter__inner credits">
        <ChapterTag code={code(4)} label={m.chapters[4]} />
        <h2 id="mission-title" data-reveal="lines">{m.credits.title}</h2>
        <p data-reveal="up">{m.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{m.credits.cta}</Link>
          <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{m.credits.secondary} <span aria-hidden="true">↗</span></a>
        </div>
        {pushed && <DustPanel copy={m.dust} repo={{ nome: pushed.nome, url: pushed.url, atualizado: pushed.atualizado, linguagem: pushed.linguagem }} locale={lang} />}
        <p className="mission-hint">{m.credits.hint}</p>
        <p className="mission-end">{m.credits.end}</p>
      </div>
    </section>

    <MarsEggs />
    <HomeChoreography />
  </main>;
}
