import "../../home.css";
import "../../tatooine.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { socialLinks } from "@/data/social";
import { HeroScene } from "@/components/HeroScene";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BootSequence } from "@/components/home/BootSequence";
import { HudClock } from "@/components/home/HudClock";
import { HomeChoreography } from "@/components/home/HomeChoreography";
import { ChapterJump, ChapterTag, numerals } from "@/components/home/Chapter";
import { PixelSprite } from "@/components/about/sprites";
import { R2Telemetry } from "@/components/projects/R2Telemetry";
import { RepoArchive, type ArchiveRepo } from "@/components/projects/RepoArchive";
import { AllianceSquadrons } from "@/components/projects/AllianceSquadrons";
import { TatooineEggs } from "@/components/projects/TatooineEggs";
import { languageColor } from "@/components/projects/languages";
import { JAWA, SANDCRAWLER } from "@/components/projects/sprites";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { bootScriptFor, R2_BOOT_KEY } from "@/lib/boot";
import { getAllRepos, getContribuicoesComEstrelas, getGithubTelemetry, GITHUB_USER } from "@/lib/github";
import { categorize } from "@/lib/repos";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 2592000;
const ARCHIVE_SIZE = 30;
const GITHUB = `https://github.com/${GITHUB_USER}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> { const { lang } = await params; return isLocale(lang) ? getDictionary(lang).projects.metadata : {}; }

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const at = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, at).join(" "), words.slice(at).join(" ")];
}

export default async function Projects({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const t = d.tatooine;
  const archive = await getAllRepos();
  const [stats, contributions] = await Promise.all([getGithubTelemetry(archive), getContribuicoesComEstrelas()]);
  const format = new Intl.NumberFormat(lang);
  const repos: ArchiveRepo[] = archive.repos.slice(0, ARCHIVE_SIZE).map((repo) => ({
    nome: repo.nome, url: repo.url, estrelas: repo.estrelas, forks: repo.forks, linguagem: repo.linguagem, topicos: repo.topicos,
    atualizado: repo.atualizado, descricao: d.journey.projects[repo.nome] ?? repo.descricao, categorias: categorize(repo),
  }));
  const [relic, ...rest] = repos;
  const [first, second] = splitTitle(t.hero.title);
  const tx = (index: number) => `TX.${numerals[index]}`;
  const tag = (index: number): [string, string] => [tx(index), t.transmissions[index]];
  const ticker = [`${format.format(stats.originals)} ${t.memory.stats.originals}`, `${format.format(stats.stars)} ${t.memory.stats.stars}`, `${format.format(stats.mergedPrs)} ${t.memory.stats.mergedPrs}`, "TYPESCRIPT", "MCP", "RAG", "AZURE", `${format.format(stats.followers)} ${t.memory.stats.followers}`];

  return <main id="main" className="home-page projects-page" tabIndex={-1}>
    <script dangerouslySetInnerHTML={{ __html: bootScriptFor(R2_BOOT_KEY) }} />
    <BootSequence lines={t.boot.lines} granted={t.boot.granted} skip={t.boot.skip} label={t.boot.label} storageKey={R2_BOOT_KEY} brand="// ASTROMECH UPLINK" variant="astromech" armOnNavigation />
    <ReadingProgress />

    {/* Transmission I — Tatooine */}
    <div className="tatooine-hero-wrap">
      <section className="page-hero tatooine-hero" aria-labelledby="projects-title" data-tatooine-hero>
        <Image className="page-hero__image" src="/pixel/projetos-r2d2.jpg" alt={d.projects.heroImageAlt} fill priority sizes="100vw" />
        <HeroScene image="/pixel/projetos-r2d2.jpg" />
        <div className="tatooine-dusk" aria-hidden="true" />
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="tatooine-layer">
          <div className="tatooine-plane">
            <span className="tatooine-crawler"><PixelSprite {...SANDCRAWLER} /><button type="button" className="tatooine-hot tatooine-hot--crawler" aria-label={t.hero.sandcrawler} hidden /></span>
            <span className="tatooine-beam" aria-hidden="true" />
            <span className="tatooine-jawas" aria-hidden="true"><PixelSprite {...JAWA} /><PixelSprite {...JAWA} /></span>
            <span className="tatooine-arcs" aria-hidden="true"><i /><i /><i /></span>
            <button type="button" className="tatooine-hot tatooine-hot--sun-a" aria-label={t.hero.suns[0]} hidden />
            <button type="button" className="tatooine-hot tatooine-hot--sun-b" aria-label={t.hero.suns[1]} hidden />
            <button type="button" className="tatooine-hot tatooine-hot--r2" aria-label={t.hero.r2} hidden />
          </div>
        </div>
        <div className="hero-hud tatooine-hud" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" /><span className="hud-corner hud-corner--tr" /><span className="hud-corner hud-corner--bl" /><span className="hud-corner hud-corner--br" />
          <p className="hud-top"><span className="hud-rec" />{t.hud.channel}<span className="hud-sep">/</span><HudClock /></p>
          <p className="hud-location">{t.hud.location}</p>
          <p className="tatooine-hud__readout"><span>{t.hud.temp} <b>54 °C</b></span><span>{t.hud.suns} <b>2</b></span></p>
          <p className="hud-hint">{t.hud.hint}</p>
        </div>
        <p className="tatooine-touch-hint" aria-hidden="true"><span />{t.hud.touch}</p>
        <div className="page-hero__content tatooine-copy">
          <ChapterTag code={tx(0)} label={t.transmissions[0]} />
          <h1 id="projects-title">{first}{second && <span>{second}</span>}</h1>
          <p className="page-hero__subtitle">{t.hero.intro}</p>
          <p className="page-hero__extra">{t.hero.extra}</p>
          <div className="actions">
            <a className="button primary" data-magnetic href={GITHUB} target="_blank" rel="noopener noreferrer">{d.projects.primaryCta}</a>
            <a className="hero-link" href="#projetos">{d.projects.secondaryCta} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
      <div className="hero-bar" aria-hidden="true">
        <span className="hero-bar__caption"><span className="pixel-mark" />{t.hero.caption}</span>
        <span className="hero-bar__ticker"><span className="hero-bar__track">{[...ticker, ...ticker].map((item, index) => <span key={index}>{item}<b>✦</b></span>)}</span></span>
        <span className="hero-bar__scroll">{t.hero.scroll}<i /></span>
      </div>
    </div>

    <ChapterJump code={tx(1)} label={t.transmissions[1]} />

    {/* Transmission II — Memory bank */}
    <R2Telemetry stats={stats} copy={t.memory} prompt={t.eggs.npx.prompt} tag={tag(1)} locale={lang} live={archive.live} year={new Date().getFullYear()} />

    <ChapterJump code={tx(2)} label={t.transmissions[2]} />

    {/* Transmission III — Mos Espa market */}
    <section className="chapter chapter--market" id="projetos" aria-labelledby="archive-title">
      <div className="chapter__inner">
        <div className="chapter-head">
          <div><ChapterTag code={tx(2)} label={t.transmissions[2]} /><h2 id="archive-title" data-reveal="lines">{t.archive.title}</h2><p data-reveal="up">{t.archive.intro}</p></div>
        </div>
        {relic && <article className="relic" data-tilt style={{ "--crystal": languageColor(relic.linguagem) } as React.CSSProperties}>
          <p className="relic__label">{t.archive.featured}</p>
          <h3><a href={relic.url} target="_blank" rel="noopener noreferrer">{relic.nome}</a></h3>
          <p>{relic.descricao}</p>
          <p className="relic__stats"><span>★ {format.format(relic.estrelas)} {t.archive.stars}</span><span>⑂ {format.format(relic.forks)} {t.archive.forks}</span><span className="relic__lang"><span className="crystal" aria-hidden="true" />{relic.linguagem ?? "—"}</span></p>
          <a className="button primary" href={relic.url} target="_blank" rel="noopener noreferrer">{t.archive.featuredCta} <span aria-hidden="true">↗</span></a>
          <span className="relic__glow" aria-hidden="true" />
        </article>}
        <RepoArchive repos={rest} copy={t.archive} eggs={t.eggs} locale={lang} githubUrl={`${GITHUB}?tab=repositories`} />
      </div>
    </section>

    <ChapterJump code={tx(3)} label={t.transmissions[3]} />

    {/* Transmission IV — Microsoft Squadron */}
    <AllianceSquadrons contributions={contributions} prsByRepo={stats.prsByRepo} mergedPrs={stats.mergedPrs} copy={t.alliance} tag={tag(3)} locale={lang} />

    {/* Transmission V — Binary sunset */}
    <section className="chapter chapter--credits chapter--sunset" aria-labelledby="sunset-title">
      <div className="credits-sky sunset-sky" aria-hidden="true">
        <span className="sunset-sun sunset-sun--a" /><span className="sunset-sun sunset-sun--b" />
        <span className="sunset-dune sunset-dune--far" /><span className="sunset-dune sunset-dune--near" />
        <span className="sunset-vaporator sunset-vaporator--a" /><span className="sunset-vaporator sunset-vaporator--b" />
      </div>
      <div className="chapter__inner credits">
        <ChapterTag code={tx(4)} label={t.transmissions[4]} />
        <h2 id="sunset-title" data-reveal="lines">{t.credits.title}</h2>
        <p data-reveal="up">{t.credits.body}</p>
        <div className="actions">
          <Link className="button primary" data-magnetic href={`/${lang}/servicos#contato`}>{t.credits.cta}</Link>
          <a className="hero-link" href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">{t.credits.secondary} <span aria-hidden="true">↗</span></a>
        </div>
        <p className="recruit-hint">{t.credits.hint}</p>
        <p className="recruit-end">{t.credits.end}</p>
      </div>
    </section>

    <TatooineEggs copy={t.eggs} />
    <HomeChoreography />
  </main>;
}
