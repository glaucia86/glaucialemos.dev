import { ChapterTag } from "@/components/home/Chapter";
import type { MarteCopy } from "@/i18n/marte";
import type { GithubStats, Projeto } from "@/lib/types";
import { languageColor } from "./languages";
import { RetroTerminal, type RetroArt } from "./RetroTerminal";
import { ColonyGrowth } from "./ColonyGrowth";

type Sprite = { src: string; w: number; h: number };
type Props = {
  stats: GithubStats; copy: Pick<MarteCopy, "memory" | "colony" | "sprout" | "retro">; newest?: Projeto; sproutArt: string; career: string;
  prince: { stand: Sprite; sniff: Sprite }; retroArt: RetroArt; tag: [string, string]; locale: string; live: boolean; year: number; readAt: Date;
};

// Chapter 2: the lab's telemetry, read from GitHub on the server (once a day), with the old terminal and the colony.
export function LabTelemetry({ stats, copy, newest, sproutArt, career, prince, retroArt, tag, locale, live, year, readAt }: Props) {
  const { memory } = copy;
  const format = new Intl.NumberFormat(locale);
  const reading = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(readAt);
  const items: [string, number][] = [
    [memory.stats.originals, stats.originals], [memory.stats.stars, stats.stars], [memory.stats.mergedPrs, stats.mergedPrs], [memory.stats.followers, stats.followers],
    [memory.stats.forks, stats.forks], [memory.stats.publicRepos, stats.publicRepos], [memory.stats.gists, stats.gists], [memory.stats.years, year - stats.since],
  ];
  const languages = stats.languages.map((item) => ({ ...item, label: item.name === "other" ? memory.other : item.name, color: item.name === "other" ? "#5b5f6e" : languageColor(item.name) }));
  const languageTotal = languages.reduce((sum, item) => sum + item.count, 0) || 1;

  return <section className="chapter chapter--telemetry" id="telemetria" aria-labelledby="telemetry-title">
    <div className="chapter__inner">
      <div className="chapter-head">
        <div>
          <ChapterTag code={tag[0]} label={tag[1]} />
          <h2 id="telemetry-title" data-reveal="lines">{memory.title}</h2>
          <p data-reveal="up">{memory.intro}</p>
          {live ? <p className="telemetry-reading"><span aria-hidden="true" />{memory.readAt.replace("{date}", reading)}</p> : <p className="telemetry-offline">{memory.offline}</p>}
        </div>
      </div>
      <div className="telemetry-grid">
        <dl className="telemetry-stats" aria-label={memory.statsLabel} data-reveal="stagger">
          {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd><span data-count={value}>{format.format(value)}</span></dd></div>)}
        </dl>
        <div className="telemetry-side">
          <figure className="samples">
            <figcaption><b>{memory.samples}</b><span>{memory.samplesNote}</span></figcaption>
            <div className="samples__bar" aria-hidden="true">{languages.map((item) => <i key={item.name} style={{ flexGrow: item.count, background: item.color }} />)}</div>
            <ul className="samples__list">{languages.map((item) => <li key={item.name} style={{ "--sample": item.color } as React.CSSProperties}>
              <span className="sample-gem" aria-hidden="true" />{item.label}<b>{format.format(item.count)}</b><span className="sr-only"> ({Math.round(item.count / languageTotal * 100)}%)</span>
            </li>)}</ul>
          </figure>
          <RetroTerminal copy={copy.retro} career={career} prince={prince} art={retroArt} />
        </div>
      </div>
      <ColonyGrowth years={stats.years} copy={copy.colony} sprout={copy.sprout} newest={newest && { nome: newest.nome, url: newest.url, criado: newest.criado, linguagem: newest.linguagem }} sproutArt={sproutArt} locale={locale} />
    </div>
  </section>;
}
