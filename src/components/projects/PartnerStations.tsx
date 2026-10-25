import { ChapterTag } from "@/components/home/Chapter";
import type { MarteCopy, Station } from "@/i18n/marte";
import type { Contribuicao } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { SWA_BUG } from "@/lib/mars-records";
import { LostBug } from "./LostBug";

const ORDER: Station[] = ["microsoft", "Azure-Samples", "MicrosoftDocs", "Azure", "nodejs", "community"];
const COLORS: Record<Station, string> = { microsoft: "#f3ae62", "Azure-Samples": "#42cfe0", MicrosoftDocs: "#9ff3ff", Azure: "#d27a43", nodejs: "#b6ff7a", community: "#ffd6a0" };
const stationOf = (repo: string): Station => { const owner = repo.split("/")[0] as Station; return ORDER.includes(owner) ? owner : "community"; };

type Props = { contributions: Contribuicao[]; prsByRepo: Record<string, number>; mergedPrs: number; copy: MarteCopy["stations"]; bug: MarteCopy["bug"]; tag: [string, string]; locale: Locale };

// A 9 × 9 pixel dome with an antenna, tinted per station.
function Dome() {
  return <svg className="station__dome" viewBox="0 0 9 9" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
    <path d="M4 0h1v2H4z" className="station__antenna" /><path d="M3 2h3v1h1v1h1v3H1V4h1V3h1z" className="station__glass" /><path d="M0 7h9v2H0z" className="station__base" /><path d="M4 4h1v1H4z" className="station__light" />
  </svg>;
}

// Chapter 4: open source with other teams, grouped by organisation as stations linked to the lab.
export function PartnerStations({ contributions, prsByRepo, mergedPrs, copy, bug, tag, locale }: Props) {
  const format = new Intl.NumberFormat(locale);
  const stations = ORDER.map((station) => ({ station, members: contributions.filter((item) => stationOf(item.repo) === station).sort((a, b) => b.estrelas - a.estrelas) })).filter(({ members }) => members.length);
  const repos = Object.keys(prsByRepo).length;

  return <section className="chapter chapter--stations" id="open-source" aria-labelledby="open-source-title">
    <div className="chapter__inner">
      <div className="chapter-head">
        <div>
          <ChapterTag code={tag[0]} label={tag[1]} />
          <h2 id="open-source-title" data-reveal="lines">{copy.title}</h2>
          <p data-reveal="up">{copy.intro}</p>
        </div>
        <p className="stations-score">
          <b>{copy.scoreboard.replace("{prs}", format.format(mergedPrs)).replace("{repos}", format.format(repos))}</b>
          <small>{copy.scoreboardNote}</small>
        </p>
      </div>
      <div className="stations">
        {stations.map(({ station, members }) => <section key={station} className="station" style={{ "--station": COLORS[station] } as React.CSSProperties} aria-labelledby={`station-${station}`}>
          <header className="station__head">
            <Dome />
            <div><h3 id={`station-${station}`}>{copy.names[station].name}</h3><p>{copy.names[station].motto}</p></div>
          </header>
          <ol className="station__list" data-reveal="stagger">
            {members.map((item) => <li key={item.repo} className="module" data-tilt>
              <p className="module__role"><span className="tag">{item.papel[locale]}</span></p>
              <h4><a href={item.url} target="_blank" rel="noopener noreferrer">{item.repo}<span aria-hidden="true"> ↗</span></a></h4>
              <p className="module__desc">{item.descricao[locale]}</p>
              <p className="module__meta">
                <span>★ {format.format(item.estrelas)} {copy.stars}</span>
                {prsByRepo[item.repo] ? <span>{copy.prs.replace("{n}", format.format(prsByRepo[item.repo]))}</span> : null}
                <a href={item.prs} target="_blank" rel="noopener noreferrer">{copy.prsLink} <span aria-hidden="true">↗</span></a>
              </p>
              {item.repo === SWA_BUG.repo && <LostBug copy={bug} />}
            </li>)}
          </ol>
        </section>)}
      </div>
    </div>
  </section>;
}
