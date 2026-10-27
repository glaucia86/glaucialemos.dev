import type { CSSProperties } from "react";
import type { AtlasCopy } from "@/i18n/atlas";
import type { Evento } from "@/lib/types";
import type { Format } from "@/lib/atlas-records";
import { LOG_ID } from "./atlas-events";
import { PrinceAntenna } from "./PrinceAntenna";

type Year = { year: number; presencial: number; remoto: number };
type Props = {
  years: Year[]; path: string; copy: AtlasCopy["signals"]; formats: AtlasCopy["formats"]; languages: AtlasCopy["languages"];
  types: Record<Evento["tipo"], string>; byLanguage: Record<Evento["idioma"], number>; byType: Record<Evento["tipo"], number>; byFormat: Record<Format, number>;
  radars: { small: string; large: string }; prince: string; firstSignal: { nome: string; ano: number; fonte: string }; princeCopy: AtlasCopy["prince"];
};

// Chapter 4: signals and lights. One column per year (gold in person, cyan remote) that opens the year in the logbook,
// and three meters (language, type, format) drawn as signal bars. Plain links: it works without JavaScript.
export function SignalDeck({ years, path, copy, formats, languages, types, byLanguage, byType, byFormat, radars, prince, firstSignal, princeCopy }: Props) {
  const top = Math.max(...years.map((year) => year.presencial + year.remoto));
  const meter = (title: string, rows: [string, number, string][]) => {
    const max = Math.max(...rows.map(([, value]) => value));
    return <figure className="signal-meter">
      <figcaption>{title}</figcaption>
      <ul>{rows.map(([label, value, tone]) => <li key={label} style={{ "--w": value / max, "--tone": tone } as CSSProperties}>
        <span>{label}</span><i aria-hidden="true" /><b>{value}</b>
      </li>)}</ul>
    </figure>;
  };
  return <div className="signals">
    <figure className="signal-timeline" data-reveal="up">
      <figcaption><span>{copy.timeline}</span><small>{copy.legend}</small></figcaption>
      <ol style={{ "--years": years.length } as CSSProperties}>
        {years.map(({ year, presencial, remoto }, index) => <li key={year} style={{ "--i": index } as CSSProperties}>
          <a href={`${path}?ano=${year}#${LOG_ID}`} data-log-year={year} aria-label={`${copy.yearItem.replace("{year}", String(year)).replace("{p}", String(presencial)).replace("{r}", String(remoto))}. ${copy.filterYear.replace("{year}", String(year))}`}>
            <span className="signal-timeline__count" aria-hidden="true">{presencial + remoto}</span>
            <span className="signal-timeline__bar" aria-hidden="true">
              <i className="signal-timeline__remote" style={{ "--h": remoto / top } as CSSProperties} />
              <i className="signal-timeline__present" style={{ "--h": presencial / top } as CSSProperties} />
            </span>
            <span className="signal-timeline__year" aria-hidden="true">{year}</span>
          </a>
        </li>)}
      </ol>
    </figure>
    <div className="signal-meters" data-reveal="stagger">
      <PrinceAntenna radar={radars.large} prince={prince} first={firstSignal} copy={princeCopy} />
      {meter(copy.formats, (["presencial", "remoto"] as const).map((key) => [formats[key], byFormat[key], key === "presencial" ? "var(--atlas-gold)" : "var(--atlas-cyan)"]))}
      {meter(copy.languages, (["pt-BR", "en", "es"] as const).map((key) => [languages[key], byLanguage[key], "var(--atlas-teal)"]))}
      {meter(copy.types, (["palestra", "workshop", "organizacao"] as const).map((key) => [types[key], byType[key], "var(--atlas-ice)"]))}
    </div>
  </div>;
}
