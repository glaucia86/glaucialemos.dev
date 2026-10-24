import Image from "next/image";
import type { EchoCopy } from "@/i18n/echo-base";
import { ChapterTag } from "@/components/home/Chapter";
import { PixelSprite, medal } from "./sprites";
import { PORTRAIT_CRACKS, iceShards } from "./ice-geometry";
import { Threepio } from "./Threepio";

// Ice block over the portrait. Shown only when JS can thaw it.
const SHARDS = iceShards(5, 6, 100, 130);

const ribbons = [["#08a9fa", "#ffd166"], ["#7cf29a", "#121826"], ["#c58bff", "#08a9fa"], ["#ff6b4a", "#ffd166"]];

export function RebelDossier({ copy, threepio, tag, stats, locale }: { copy: EchoCopy["dossier"]; threepio: EchoCopy["threepio"]; tag: [string, string]; stats: number[]; locale: string }) {
  const format = new Intl.NumberFormat(locale);
  return <section className="chapter chapter--dossier" id="dossie" aria-labelledby="dossier-title">
    <div className="chapter__inner dossier-grid">
      <div className="holo-card dossier-card" data-tilt>
        <figure className="holo-card__frame dossier-card__frame">
          <span className="snowcap" aria-hidden="true" />
          <div className="dossier-card__portrait">
            <Image src="/pixel/jedi-glaucia.jpg" alt={copy.imageAlt} width={720} height={960} sizes="(max-width: 900px) 85vw, 34vw" />
            <span className="holo-card__scan" aria-hidden="true" />
            <span className="dossier-card__grid" aria-hidden="true" />
            <svg className="dossier-ice" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs><linearGradient id="dossier-ice-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9f6ff" stopOpacity=".92" /><stop offset=".55" stopColor="#9fdcff" stopOpacity=".78" /><stop offset="1" stopColor="#4c8fc7" stopOpacity=".85" /></linearGradient></defs>
              <g className="dossier-ice__shards">{SHARDS.map((points, index) => <polygon key={index} points={points} fill="url(#dossier-ice-fill)" />)}</g>
              <path className="dossier-ice__cracks" d={PORTRAIT_CRACKS} />
            </svg>
          </div>
          <figcaption><span className="holo-card__name">Glaucia Lemos</span><span className="holo-card__class">{copy.card}</span></figcaption>
        </figure>
        <span className="holo-card__id" aria-hidden="true">{copy.id}</span>
      </div>
      <div className="dossier-copy">
        <ChapterTag code={tag[0]} label={tag[1]} />
        <h2 id="dossier-title" data-reveal="lines">{copy.title}</h2>
        <p data-reveal="up">{copy.intro}</p>
        <dl className="char-sheet" aria-label={copy.sheetLabel} data-reveal="stagger">
          {copy.sheet.map(([term, value]) => <div key={term}><dt>{term}</dt><dd data-scramble>{value}</dd></div>)}
        </dl>
        <dl className="dossier-stats" aria-label={copy.statsLabel}>
          {stats.map((value, index) => <div key={copy.stats[index]}>
            <dt>{copy.stats[index]}</dt>
            <dd><span data-count={value}>{format.format(value)}</span>{[0, 3, 4].includes(index) && "+"}</dd>
          </div>)}
        </dl>
        <div className="dossier-odds">
          <button type="button" className="dossier-odds__toggle" aria-controls="dossier-odds-quote">{copy.odds} <b>{copy.oddsValue}</b></button>
          <p className="dossier-odds__quote" id="dossier-odds-quote">“{copy.oddsQuote}” <span>{copy.oddsSign}</span></p>
        </div>
      </div>
    </div>
    <div className="chapter__inner medals">
      <h3 className="medals__title">{copy.medalsTitle}</h3>
      <p className="medals__intro">{copy.medalsIntro}</p>
      <ul className="medal-list" data-reveal="stagger">{copy.medals.map(({ name, note }, index) => <li key={name}>
        <button type="button" className="medal" aria-pressed="false" title={copy.flip}>
          <span className="snowcap" aria-hidden="true" />
          <span className="medal__inner">
            <span className="medal__face medal__face--front"><PixelSprite className="medal__icon" {...medal(ribbons[index][0], ribbons[index][1])} /><b>{name}</b></span>
            <span className="medal__face medal__face--back"><b>{name}</b><span>{note}</span></span>
          </span>
        </button>
      </li>)}</ul>
      <Threepio copy={threepio} languages={copy.protocols} />
    </div>
  </section>;
}
