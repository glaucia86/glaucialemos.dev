import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { commercial, offers, speakingTopics } from '@/i18n/commercial';
import { serviceHref } from '@/lib/aurelia-controls';
import { PixelGlyph, type GlyphName } from './PixelGlyph';
import { CardGlow } from './CardGlow';

// Each format and topic has its own light; the glyph, label, beam and button take it.
export const OFFER_GLOW = { palestra: 'var(--energy-blue)', workshop: 'var(--energy-green)', mentoria: 'var(--energy-purple)' } as const;
export const TOPIC_GLOWS = ['var(--energy-blue)', 'var(--energy-green)', 'var(--energy-gold)', 'var(--energy-purple)', '#ff9e7a'] as const;
const pad = (index: number) => String(index + 1).padStart(2, '0');

// Formats and talk topics in plain words. On the Home it is chapter 5 (`tag` + chapter chrome); on Services it follows
// the hero. Same #formatos anchor in both.
export function OfferFormats({ lang, tag, className = '' }: { lang: Locale; tag?: ReactNode; className?: string }) {
  const copy = commercial[lang];
  return <section className={`credibility-formats ${className}`.trim()} id="formatos" aria-labelledby="formats-title">
    <CardGlow scope="#formatos" />
    <div className="chapter__inner">
      <header className="credibility-formats__heading">
        {tag}
        <p className="credibility-kicker">{copy.headline}</p>
        <h2 id="formats-title">{copy.formatsTitle}</h2>
        <p>{copy.formatsIntro}</p>
      </header>
      <div className="credibility-offers">{offers.map((offer, index) => {
        const item = offer.copy[lang];
        return <article className="credibility-offer" key={offer.subject} data-offer={offer.subject} data-glow-card style={{ '--glow': OFFER_GLOW[offer.subject], '--i': index } as CSSProperties}>
          <span className="credibility-offer__beam" aria-hidden="true" />
          <div className="credibility-offer__top">
            <PixelGlyph name={offer.subject} className="credibility-offer__glyph" />
            <p className="credibility-offer__label" aria-hidden="true">{pad(index)} / {pad(offers.length - 1)}</p>
          </div>
          <h3>{item.title}</h3>
          <dl><div><dt>{copy.audience}</dt><dd>{item.audience}</dd></div><div><dt>{copy.focus}</dt><dd>{item.focus}</dd></div></dl>
          <p>{item.description}</p>
          <Link className="credibility-offer__waitlist" href={`/${lang}/servicos#lista-de-espera`}>{getDictionary(lang).services.waitlist}</Link>
          <Link className="credibility-offer__cta" href={serviceHref(lang, offer.subject)}>{item.cta}<span aria-hidden="true">→</span></Link>
        </article>;
      })}</div>
      <div className="credibility-topics">
        <h3>{copy.topicsTitle}</h3>
        <p>{copy.topicsIntro}</p>
        <ol className="credibility-topics__grid">{speakingTopics.map((topic, index) => <li key={topic.id} className="credibility-topic" data-glow-card style={{ '--glow': TOPIC_GLOWS[index % TOPIC_GLOWS.length], '--i': index } as CSSProperties}>
          <span className="credibility-topic__head"><PixelGlyph name={topic.id as GlyphName} className="credibility-topic__glyph" /><span className="credibility-topic__number" aria-hidden="true">{pad(index)}</span></span>
          <strong>{topic.copy[lang].title}</strong>
          <span>{topic.copy[lang].detail}</span>
        </li>)}</ol>
        <Link className="button primary" href={serviceHref(lang, 'palestra')}>{copy.topicsCta}</Link>
      </div>
    </div>
  </section>;
}
