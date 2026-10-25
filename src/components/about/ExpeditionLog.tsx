import { CrystalBadges } from "./CrystalBadges";
import type { NiveoraCopy } from "@/i18n/niveora";
import { ChapterTag } from "@/components/home/Chapter";
import { NiveoraPortrait } from "./NiveoraPortrait";
import { PORTRAIT_CRACKS, iceShards } from "./ice-geometry";
import { PrinceFootprint } from "./BorrowedStar";
import { niveoraStories } from "@/i18n/niveora-stories";
import type { Locale } from "@/i18n/config";

// Ice block over the portrait. Shown only when JS can thaw it.
const SHARDS = iceShards(5, 6, 100, 130);
export function ExpeditionLog({ copy, tag, stats, locale }: { copy: NiveoraCopy["log"]; tag: [string, string]; stats: number[]; locale: Locale }) {
  const format = new Intl.NumberFormat(locale);
  return <section className="chapter chapter--log" id="diario" aria-labelledby="log-title">
    <div className="chapter__inner log-grid">
      <div className="holo-card log-card" data-tilt>
        <figure className="holo-card__frame log-card__frame">
          <span className="snowcap" aria-hidden="true" />
          <div className="log-card__portrait">
            <NiveoraPortrait label={copy.imageAlt} />
            <span className="holo-card__scan" aria-hidden="true" />
            <svg className="log-ice" viewBox="0 0 100 130" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs><linearGradient id="log-ice-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9f6ff" stopOpacity=".92" /><stop offset=".55" stopColor="#88cbe9" stopOpacity=".78" /><stop offset="1" stopColor="#3f6fa8" stopOpacity=".85" /></linearGradient></defs>
              <g className="log-ice__shards">{SHARDS.map((points, index) => <polygon key={index} points={points} fill="url(#log-ice-fill)" />)}</g>
              <path className="log-ice__cracks" d={PORTRAIT_CRACKS} />
            </svg>
          </div>
          <figcaption><span className="holo-card__name">Glaucia Lemos</span><span className="holo-card__class">{copy.card}</span></figcaption>
        </figure>
        <span className="holo-card__id" aria-hidden="true">{copy.id}</span>
      </div>
      <div className="log-copy">
        <ChapterTag code={tag[0]} label={tag[1]} />
        <h2 id="log-title" data-reveal="lines">{copy.title}</h2>
        <p data-reveal="up">{copy.intro}</p>
        <dl className="char-sheet" aria-label={copy.sheetLabel} data-reveal="stagger">
          {copy.sheet.map(([term, value]) => <div key={term}><dt>{term}</dt><dd data-scramble>{value}</dd></div>)}
        </dl>
        <dl className="log-stats" aria-label={copy.statsLabel}>
          {stats.map((value, index) => <div key={copy.stats[index]}>
            <dt>{copy.stats[index]}</dt>
            <dd><span data-count={value}>{format.format(value)}</span>{[0, 3, 4].includes(index) && "+"}</dd>
          </div>)}
        </dl>
        <p className="log-languages">{copy.languages}</p>
        <PrinceFootprint copy={niveoraStories[locale]} />
      </div>
    </div>
    <div className="chapter__inner badges">
      <h3 className="badges__title">{copy.badgesTitle}</h3>
      <p className="badges__intro">{copy.badgesIntro}</p>
      <CrystalBadges copy={copy} />
    </div>
  </section>;
}
