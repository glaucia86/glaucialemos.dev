import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { publishedPhotos } from '@/data/prova-social';

export function Portrait({ lang }: { lang: Locale }) {
  const portrait = publishedPhotos().find(photo => photo.kind === 'portrait');
  if (!portrait) return null;
  return <figure className="credibility-portrait">
    <Image {...portrait.image} alt={portrait.alt[lang]} priority sizes="(max-width: 600px) 84px, 120px" />
  </figure>;
}
