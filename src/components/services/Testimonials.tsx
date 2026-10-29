import type { Locale } from '@/i18n/config';
import type { Depoimento } from '@/lib/types';
import { ChapterTag } from '@/components/home/Chapter';

export function Testimonials({ items, lang, label, code }: { items: Depoimento[]; lang: Locale; label: string; code: string }) {
  if (items.length === 0) return null;
  return <section className="chapter chapter--testimonials" id="depoimentos" aria-labelledby="testimonials-title"><div className="chapter__inner">
    <div className="chapter-head"><div><ChapterTag code={code} label={label} /><h2 id="testimonials-title">{label}</h2></div></div>
    <div className="aurelia-testimonials">{items.map(item => <figure key={item.id}>
      <blockquote cite={item.url}><p>{item.texto[lang]}</p></blockquote>
      <figcaption>
        <strong>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.nome}</a> : item.nome}</strong>
        <span>{item.cargo}{item.empresa ? ` · ${item.empresa}` : ''}</span>
      </figcaption>
    </figure>)}</div>
  </div></section>;
}
