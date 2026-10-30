import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { beyondOrbit } from "@/i18n/beyond-orbit";
import { BeyondOrbitScene } from "@/components/epilogue/BeyondOrbitScene";
import { BeyondOrbitEpisode } from "@/components/epilogue/BeyondOrbitEpisode";
import { EpilogueVoyage } from "@/components/epilogue/EpilogueVoyage";
import "../../beyond-orbit.css";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = beyondOrbit[lang];
  return { title: copy.title, description: copy.body, robots: { index: false, follow: false } };
}

export default async function BeyondOrbit({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = beyondOrbit[lang];
  return <main id="main" className="beyond-orbit" data-sound-world="epilogue">
    <section className="beyond-orbit__hero" aria-labelledby="epilogue-title">
      <div className="beyond-orbit__copy">
        <p className="beyond-orbit__chapter">{copy.chapter}</p>
        <p className="beyond-orbit__eyebrow">{copy.eyebrow}</p>
        <h1 id="epilogue-title">{copy.title}</h1>
        <p className="beyond-orbit__intro">{copy.intro}</p>
        <p className="beyond-orbit__body">{copy.body}</p>
        <p className="beyond-orbit__coords" aria-hidden="true">{copy.coordinates}</p>
        {/* The narrated episode, on the left of the image like the 404's; with motion it appears once the last light has played. */}
        <div className="beyond-orbit__episode-slot"><BeyondOrbitEpisode copy={copy.episode} lang={lang} /></div>
      </div>
      <BeyondOrbitScene copy={copy} />
    </section>
    <EpilogueVoyage copy={copy} lang={lang} />
    <nav className="beyond-orbit__return" aria-label={copy.back}>
      <Link href={`/${lang}`}>{copy.back}</Link>
      <Link href={`/${lang}#mapa`}>{copy.explore}</Link>
    </nav>
  </main>;
}
