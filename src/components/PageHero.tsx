import Link from "next/link";
import { SpatialScene, type SpatialSceneLabels } from "./SpatialScene";
import { getDictionary } from "@/i18n/dictionaries";

type PageHeroProps = {
  sceneLabels?: SpatialSceneLabels;
  eyebrow: string;
  title: string;
  subtitle: React.ReactNode;
  image: string;
  imageAlt: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  extra?: React.ReactNode;
  strongOverlay?: boolean;
};

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  const splitAt = Math.max(1, Math.ceil(words.length / 2));
  return [words.slice(0, splitAt).join(" "), words.slice(splitAt).join(" ")];
}

export function PageHero({ sceneLabels = getDictionary("pt").motion, eyebrow, title, subtitle, image, imageAlt, primary, secondary, extra, strongOverlay = false }: PageHeroProps) {
  const [firstLine, secondLine] = splitTitle(title);
  const primaryExternal = primary.href.startsWith("https://");
  const secondaryExternal = secondary?.href.startsWith("https://");

  return <section className={`page-hero${strongOverlay ? " page-hero--strong" : ""}`}>
    <SpatialScene image={image} imageAlt={imageAlt} labels={sceneLabels} />
    <div className="page-hero__content">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{firstLine}{secondLine && <span>{secondLine}</span>}</h1>
      <p className="page-hero__subtitle">{subtitle}</p>
      {extra}
      <div className="actions">
        <Link
          className="button primary"
          href={primary.href}
          target={primaryExternal ? "_blank" : undefined}
          rel={primaryExternal ? "noopener noreferrer" : undefined}
        >{primary.label}</Link>
        {secondary && <Link
          className="hero-link"
          href={secondary.href}
          target={secondaryExternal ? "_blank" : undefined}
          rel={secondaryExternal ? "noopener noreferrer" : undefined}
        >{secondary.label} <span aria-hidden="true">→</span></Link>}
      </div>
    </div>
  </section>;
}
