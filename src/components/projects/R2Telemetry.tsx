import { ChapterTag } from "@/components/home/Chapter";
import type { TatooineCopy } from "@/i18n/tatooine";
import type { GithubStats } from "@/lib/types";
import { PixelSprite } from "@/components/about/sprites";
import { languageColor } from "./languages";
import { BB8, THUMB } from "./sprites";

const DUNE_HEIGHT = 60;
const BLOCK = 4;

type Props = { stats: GithubStats; copy: TatooineCopy["memory"]; prompt: string; tag: [string, string]; locale: string; live: boolean; year: number };

// Transmission II: the memory bank. Server-rendered; counters, the terminal and BB-8 hydrate through the page choreography.
export function R2Telemetry({ stats, copy, prompt, tag, locale, live, year }: Props) {
  const format = new Intl.NumberFormat(locale);
  const items: [string, number][] = [
    [copy.stats.originals, stats.originals], [copy.stats.stars, stats.stars], [copy.stats.mergedPrs, stats.mergedPrs], [copy.stats.followers, stats.followers],
    [copy.stats.forks, stats.forks], [copy.stats.publicRepos, stats.publicRepos], [copy.stats.gists, stats.gists], [copy.stats.years, year - stats.since],
  ];
  const languages = stats.languages.map((item) => ({ ...item, label: item.name === "other" ? copy.other : item.name, color: item.name === "other" ? "#5b5f6e" : languageColor(item.name) }));
  const languageTotal = languages.reduce((sum, item) => sum + item.count, 0) || 1;
  const peak = Math.max(1, ...stats.years.map((item) => item.count));
  const width = stats.years.length * 10;

  return <section className="chapter chapter--memory" id="memoria" aria-labelledby="memory-title">
    <div className="chapter__inner">
      <div className="chapter-head">
        <div>
          <ChapterTag code={tag[0]} label={tag[1]} />
          <h2 id="memory-title" data-reveal="lines">{copy.title}</h2>
          <p data-reveal="up">{copy.intro}</p>
          {!live && <p className="memory-offline">{copy.offline}</p>}
        </div>
      </div>
      <div className="memory-grid">
        <dl className="memory-stats" aria-label={copy.statsLabel} data-reveal="stagger">
          {items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd><span data-count={value}>{format.format(value)}</span></dd></div>)}
        </dl>
        <div className="memory-side">
          <figure className="crystals">
            <figcaption><b>{copy.crystals}</b><span>{copy.crystalsNote}</span></figcaption>
            <div className="crystals__bar" aria-hidden="true">{languages.map((item) => <i key={item.name} style={{ flexGrow: item.count, background: item.color }} />)}</div>
            <ul className="crystals__list" data-languages>{languages.map((item) => <li key={item.name} style={{ "--crystal": item.color } as React.CSSProperties}>
              <span className="crystal" aria-hidden="true" />{item.label}<b>{format.format(item.count)}</b><span className="sr-only"> ({Math.round(item.count / languageTotal * 100)}%)</span>
            </li>)}</ul>
          </figure>
          <button type="button" className="r2-terminal" data-npx hidden aria-label={prompt}>
            <span className="r2-terminal__title">{copy.terminal}</span>
            <code><span aria-hidden="true">$</span> <span className="r2-terminal__typed" /><span className="r2-terminal__cursor" aria-hidden="true" /></code>
            <small>{copy.terminalHint}</small>
          </button>
        </div>
      </div>
      <figure className="dunes" data-dunes>
        <figcaption><b>{copy.dunes}</b><span>{copy.dunesNote}</span></figcaption>
        <div className="dunes__stage">
          <svg className="dunes__chart" viewBox={`0 0 ${width} ${DUNE_HEIGHT}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
            {stats.years.map(({ year: column, count }, index) => {
              const blocks = Math.max(count ? 1 : 0, Math.round(count / peak * (DUNE_HEIGHT / BLOCK)));
              return <g key={column} className="dunes__column">
                {Array.from({ length: blocks }, (_, block) => <rect key={block} x={index * 10} y={DUNE_HEIGHT - (block + 1) * BLOCK} width="10" height={BLOCK} className={block === blocks - 1 ? "dunes__crest" : block % 3 === 0 ? "dunes__shade" : "dunes__sand"} />)}
              </g>;
            })}
          </svg>
          <span className="dunes__rider" aria-hidden="true"><PixelSprite className="dunes__bb8" {...BB8} /><PixelSprite className="dunes__thumb" {...THUMB} /></span>
        </div>
        <ol className="dunes__years" style={{ gridTemplateColumns: `repeat(${stats.years.length}, minmax(0, 1fr))` }}>
          {stats.years.map(({ year: column, count }) => <li key={column} title={copy.dunesItem.replace("{year}", String(column)).replace("{n}", format.format(count))}>
            <span aria-hidden="true">{String(column).slice(2)}</span><span className="sr-only">{copy.dunesItem.replace("{year}", String(column)).replace("{n}", format.format(count))}</span>
          </li>)}
        </ol>
      </figure>
    </div>
  </section>;
}
