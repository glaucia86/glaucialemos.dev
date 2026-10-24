import type { CSSProperties } from "react";
import type { EchoCopy } from "@/i18n/echo-base";
import { groupEras, yearOf, type CareerRole } from "@/lib/career";
import { formatExperiencePeriod } from "@/lib/home-curation";

const vars = (values: Record<string, string | number>) => values as CSSProperties;

// One markup, two layouts: parallel hyperspace lanes on desktop, an era-grouped list on mobile and without CSS.
export function CareerMap({ roles, copy, locale, source }: { roles: CareerRole[]; copy: EchoCopy["ops"]; locale: string; source: string }) {
  const min = Math.min(...roles.map(role => role.start));
  const max = Math.max(...roles.map(role => role.end)) + 1;
  const span = max - min;
  const lanes = Math.max(...roles.map(role => role.lane)) + 1;
  const eras = groupEras(roles);
  const years = Array.from({ length: yearOf(max - 1) - yearOf(min) }, (_, index) => yearOf(min) + index + 1);
  const ratio = (month: number) => ((month - min) / span).toFixed(5);

  return <div className="ops" data-ops data-focus="all" data-min={min} data-span={span} style={vars({ "--lanes": lanes, "--zf": 0, "--zs": 1 })}>
    <div className="ops-filter" role="group" aria-label={copy.filter} hidden>
      <button type="button" aria-pressed="true" data-era="all">{copy.all}</button>
      {[...eras].reverse().map(({ era }) => <button type="button" aria-pressed="false" data-era={era} key={era}>{copy.eras[era].name}</button>)}
    </div>
    <div className="ops-chart">
      <span className="snowcap" aria-hidden="true" />
      <div className="ops-axis" aria-hidden="true">
        {years.map(year => <span className="ops-tick" key={year} style={vars({ "--x": ratio(year * 12) })}>{year}</span>)}
        <span className="ops-tick ops-tick--now" style={vars({ "--x": 1 })}>{copy.now}</span>
      </div>
      <span className="ops-trail" aria-hidden="true"><span className="ops-trail__beam" /></span>
      <span className="ops-ship" aria-hidden="true">
        <svg viewBox="0 0 24 12" shapeRendering="crispEdges" focusable="false"><path fill="#c9bed4" d="M2 1h6v1H2zM2 10h6v1H2zM6 2h3v1H6zM6 9h3v1H6zM8 3h12v2h3v2h-3v2H8z" /><path fill="#ff4d5e" d="M2 1h2v1H2zM2 10h2v1H2zM12 5h5v2h-5z" /><path fill="#08a9fa" d="M0 5h2v2H0z" /></svg>
        <b className="ops-ship__year">{yearOf(min)}</b>
      </span>
      {eras.map(({ era, roles: items, from, to }) => <section className="ops-era" data-era={era} key={era} aria-labelledby={`era-${era}`} style={vars({ "--x": ratio(from), "--w": ((to + 1 - from) / span).toFixed(5) })}>
        <span className="ops-era__band" aria-hidden="true" />
        <h3 className="ops-era__title" id={`era-${era}`}>{copy.eras[era].name} <small>{yearOf(from)}–{yearOf(to)} · {items.length} {copy.roles}</small></h3>
        <p className="ops-era__summary">{copy.eras[era].summary}</p>
        <ol className="ops-roles">{items.map(role => <li className="ops-role" key={`${role.empresa}-${role.periodo}`} data-current={role.current || undefined} data-side={(role.start - min) / span > .55 ? "end" : "start"} data-open={role.lane >= lanes - 2 && lanes > 2 ? "up" : "down"}
          style={vars({ "--x": ratio(role.start), "--w": ((role.end + 1 - role.start) / span).toFixed(5), "--lane": role.lane })}>
          <span className="ops-role__bar" aria-hidden="true"><span className="ops-role__label">{role.empresa}</span></span>
          <div className="ops-role__brief">
            <p className="ops-role__period">{formatExperiencePeriod(role.periodo, locale)}{role.current && <b> · {copy.current}</b>}</p>
            <h4>{role.cargo}</h4>
            <p className="ops-role__company">{role.empresa}</p>
            <a href={role.fonte} target="_blank" rel="noopener noreferrer">{source}<span aria-hidden="true"> ↗</span></a>
          </div>
        </li>)}</ol>
      </section>)}
    </div>
  </div>;
}
