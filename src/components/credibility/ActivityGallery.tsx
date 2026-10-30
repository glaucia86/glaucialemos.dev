import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { publishedPhotos, talkVideos } from '@/data/prova-social';
import { commercial } from '@/i18n/commercial';
import { TalkVideo } from './TalkVideo';

// Photos and recorded talks side by side: the visitor can watch a full talk right here.
export function ActivityGallery({ lang }: { lang: Locale }) {
  const activities = publishedPhotos().filter(photo => photo.kind === 'activity');
  if (!activities.length && !talkVideos.length) return null;
  const copy = commercial[lang];
  return <section className="credibility-gallery" aria-labelledby="activity-title">
    <div className="chapter__inner">
      <h2 id="activity-title">{copy.galleryTitle}</h2><p>{copy.galleryIntro}</p>
      <div className="credibility-gallery__photos">
        {activities.map(photo => <figure key={photo.id}>
          <Image {...photo.image} alt={photo.alt[lang]} sizes="(max-width: 700px) 100vw, 640px" />
          <figcaption>{photo.caption[lang]}</figcaption>
        </figure>)}
        {talkVideos.map(video => <TalkVideo key={video.id} video={video} copy={copy.video} />)}
      </div>
    </div>
  </section>;
}
