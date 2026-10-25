import type { CSSProperties } from "react";
import type { MarteCopy } from "@/i18n/marte";
import { CARD_2018, CARD_NOW, SITE_REPO, type FirstCommit } from "@/lib/mars-records";
import { BenchDetails } from "./BenchDetails";
import { BeforeAfter } from "./BeforeAfter";

type Sprite = { src: string; w: number; h: number };
const day = (locale: string, iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
const work = (lines: typeof CARD_2018) => lines.find((line) => line.label === "Work")?.value ?? "";

function FirstCommitLine({ record, copy, locale }: { record: FirstCommit; copy: MarteCopy["bench"]; locale: string }) {
  return <li><b>{copy.firstCommit}</b><span><time dateTime={record.date}>{day(locale, record.date)}</time> · <code>{record.message}</code> <a href={record.url} target="_blank" rel="noopener noreferrer">{copy.source} <span aria-hidden="true">↗</span></a></span></li>;
}

// The casing of a workbench in the archive: the real first commit next to today's numbers (and, for the npx card, the
// 2018 card next to today's, with the start of the career from the experience data).
export function RepoBench({ record, stars, pushed, copy, locale, primary, card }: {
  record: FirstCommit; stars: string; pushed: string; copy: MarteCopy["bench"]; locale: string; primary?: boolean; card?: string;
}) {
  return <BenchDetails summary={copy.open} primary={primary}>
    <p className="bench__title">{copy.title}</p>
    <ol className="bench__log">
      <FirstCommitLine record={record} copy={copy} locale={locale} />
      <li><b>{copy.today}</b><span>★ {stars} · {copy.lastPush} {day(locale, pushed)} · {copy.commits.replace("{n}", new Intl.NumberFormat(locale).format(record.commits))}</span></li>
    </ol>
    {card && <div className="bench__card">
      <p className="bench__subtitle">{copy.card.title}</p>
      <dl><div><dt>{copy.card.then}</dt><dd>{work(CARD_2018)}</dd></div><div><dt>{copy.card.now}</dt><dd>{work(CARD_NOW)}</dd></div></dl>
      <p>{card}</p>
    </div>}
  </BenchDetails>;
}

// This very page as a workbench: three stations (Grok, cut-out, plate pixel) and a before/after on the real Mars plate,
// with the rejected 3 × 3 version one click away.
export function SiteBench({ record, copy, locale, art, box }: {
  record?: FirstCommit; copy: MarteCopy["bench"]; locale: string; box: CSSProperties;
  art: { plate: Sprite; raw: Sprite; rejected: Sprite; approved: Sprite };
}) {
  const site = copy.site;
  return <article className="site-bench" aria-labelledby="site-bench-title">
    <header className="site-bench__head">
      <p className="site-bench__kicker"><span className="sample-gem" aria-hidden="true" />{site.name}</p>
      <h3 id="site-bench-title">{site.title}</h3>
      <p>{site.summary} {site.intro}</p>
    </header>
    <div className="site-bench__body">
      <ol className="site-bench__stations">
        {site.stations.map(([title, text], index) => <li key={title}><b><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{title}</b><span>{text}</span></li>)}
      </ol>
      <BeforeAfter copy={site} plate={art.plate} raw={art.raw} approved={art.approved} rejected={art.rejected} box={box} />
    </div>
    <p className="site-bench__decision">{site.decision}</p>
    {record && <p className="site-bench__commit"><b>{copy.firstCommit}</b> <time dateTime={record.date}>{day(locale, record.date)}</time> · <code>{record.message}</code> · <a href={SITE_REPO.url} target="_blank" rel="noopener noreferrer">{site.name} <span aria-hidden="true">↗</span></a> · <a href={record.url} target="_blank" rel="noopener noreferrer">{copy.source} <span aria-hidden="true">↗</span></a></p>}
  </article>;
}
