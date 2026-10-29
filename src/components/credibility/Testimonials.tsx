import type { Locale } from '@/i18n/config';
import { commercial } from '@/i18n/commercial';
import { testimonialCopy } from '@/i18n/testimonial';
import { testimonials as approved, type Testimonial } from '@/data/prova-social';
import { TestimonialForm } from './TestimonialForm';

// Approved testimonials (static cards, no third-party embeds) and the form to send a new one. With no approved
// testimonial yet, only the invitation and the form are shown: never an empty grid.
export function Testimonials({ lang, enabled, siteKey, items = approved }: { lang: Locale; enabled: boolean; siteKey: string; items?: readonly Testimonial[] }) {
  const copy = commercial[lang].testimonials;
  return <section className="credibility-testimonials" id="depoimentos" aria-labelledby="testimonials-title">
    <div className="chapter__inner">
      <h2 id="testimonials-title">{items.length ? copy.title : testimonialCopy[lang].title}</h2>
      <p>{items.length ? copy.intro : testimonialCopy[lang].intro}</p>
      {items.length > 0 && <ul className="credibility-testimonials__list">{items.map(item => <li key={`${item.name}-${item.received}`}>
        <blockquote lang={item.lang}><p>“{item.quote}”</p></blockquote>
        <p className="credibility-testimonials__who">{item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.name}</a> : item.name}<span>{item.role} · {testimonialCopy[lang].contexts[item.context]}</span></p>
      </li>)}</ul>}
      <TestimonialForm lang={lang} enabled={enabled} siteKey={siteKey} heading={items.length > 0} />
    </div>
  </section>;
}
