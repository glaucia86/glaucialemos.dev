import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { experience, venueSources } from '@/data/prova-social';
import { commercial } from '@/i18n/commercial';
import { getEventos } from '@/lib/data';

// Above the fold on Services: companies (logos) and the events where Glaucia spoke (names, each with its source).
export function ProfessionalExperience({ lang }: { lang: Locale }) {
  const copy = commercial[lang];
  return <>
    <div className="credibility-experience" role="group" aria-label={copy.experience}>
      <p className="credibility-kicker">{copy.experience}</p>
      <ul>{experience.map(item => <li key={item.company}>
        <a href={item.source} title={`${item.company} · ${item.context[lang]}`}>
          {item.logo ? <Image src={item.logo.src} alt="" width={40} height={40} sizes="40px" /> : <span className="credibility-experience__initials" aria-hidden="true">{item.company.slice(0, 2).toUpperCase()}</span>}
          <span>{item.company}<span className="sr-only"> · {item.context[lang]}</span></span>
        </a>
      </li>)}</ul>
    </div>
    <div className="credibility-venues credibility-experience" role="group" aria-label={copy.venues}>
      <p className="credibility-kicker">{copy.venues}</p>
      <ul>{venueSources(getEventos()).map(venue => <li key={venue.name}><a href={venue.source} target="_blank" rel="noopener noreferrer">{venue.name}<span className="sr-only"> ({venue.year})</span></a></li>)}</ul>
    </div>
  </>;
}
