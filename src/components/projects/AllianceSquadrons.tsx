import { ChapterTag } from "@/components/home/Chapter";
import { PixelSprite } from "@/components/about/sprites";
import type { Squad, TatooineCopy } from "@/i18n/tatooine";
import type { Contribuicao } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { xwing } from "./sprites";

const ORDER: Squad[] = ["microsoft", "Azure-Samples", "MicrosoftDocs", "Azure", "nodejs", "community"];
const COLORS: Record<Squad, string> = { microsoft: "#ff4d5e", "Azure-Samples": "#ffd166", MicrosoftDocs: "#4cc3ff", Azure: "#7cf29a", nodejs: "#c58bff", community: "#d8c7a4" };
const squadOf = (repo: string): Squad => { const owner = repo.split("/")[0] as Squad; return ORDER.includes(owner) ? owner : "community"; };

type Props = { contributions: Contribuicao[]; prsByRepo: Record<string, number>; mergedPrs: number; copy: TatooineCopy["alliance"]; tag: [string, string]; locale: Locale };

// Transmission IV: open source inside Microsoft (and friends), flown as Rebel squadrons.
export function AllianceSquadrons({ contributions, prsByRepo, mergedPrs, copy, tag, locale }: Props) {
  const format = new Intl.NumberFormat(locale);
  const squads = ORDER.map((squad) => ({ squad, members: contributions.filter((item) => squadOf(item.repo) === squad).sort((a, b) => b.estrelas - a.estrelas) })).filter(({ members }) => members.length);
  const repos = Object.keys(prsByRepo).length;

  return <section className="chapter chapter--alliance" id="open-source" aria-labelledby="open-source-title">
    <div className="chapter__inner">
      <div className="chapter-head">
        <div>
          <ChapterTag code={tag[0]} label={tag[1]} />
          <h2 id="open-source-title" data-reveal="lines">{copy.title}</h2>
          <p data-reveal="up">{copy.intro}</p>
        </div>
        <p className="alliance-score">
          <b>{copy.scoreboard.replace("{prs}", format.format(mergedPrs)).replace("{repos}", format.format(repos))}</b>
          <small>{copy.scoreboardNote}</small>
        </p>
      </div>
      <div className="squadrons">
        {squads.map(({ squad, members }) => <section key={squad} className="squadron" style={{ "--squad": COLORS[squad] } as React.CSSProperties} aria-labelledby={`squad-${squad}`}>
          <header className="squadron__head">
            <PixelSprite className="squadron__insignia" {...xwing(COLORS[squad])} />
            <div><h3 id={`squad-${squad}`}>{copy.squads[squad].name}</h3><p>{copy.squads[squad].motto}</p></div>
          </header>
          <ol className="squadron__list" data-reveal="stagger">
            {members.map((item, index) => <li key={item.repo} className="pilot" data-tilt>
              <p className="pilot__callsign"><span>{copy.squads[squad].callsign} {index + 1}</span><span className="tag">{item.papel[locale]}</span></p>
              <h4><a href={item.url} target="_blank" rel="noopener noreferrer">{item.repo}<span aria-hidden="true"> ↗</span></a></h4>
              <p className="pilot__desc">{item.descricao[locale]}</p>
              <p className="pilot__meta">
                <span>★ {format.format(item.estrelas)} {copy.stars}</span>
                {prsByRepo[item.repo] ? <span>{copy.prs.replace("{n}", format.format(prsByRepo[item.repo]))}</span> : null}
                <a href={item.prs} target="_blank" rel="noopener noreferrer">{copy.prsLink} <span aria-hidden="true">↗</span></a>
              </p>
            </li>)}
          </ol>
        </section>)}
      </div>
    </div>
  </section>;
}
