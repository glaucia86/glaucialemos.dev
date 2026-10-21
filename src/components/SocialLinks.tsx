import type { ReactNode } from "react";
import { socialLinks, type SocialNetwork } from "@/data/social";
import type { Dictionary } from "@/i18n/dictionaries/pt";

const icons: Record<SocialNetwork, ReactNode> = {
  youtube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></>,
  x: <><path d="m4 3 12 18h4L8 3Z" /><path d="m20 3-7 8M11 13l-7 8" /></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7m4 0v-7m0 3a3 3 0 0 1 6 0v4" /><circle cx="7" cy="7" r=".75" fill="currentColor" stroke="none" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>,
};

export function SocialLinks({ labels }: { labels: Dictionary["footer"]["socialLabels"] }) {
  return <div className="socials">
    {Object.entries(socialLinks).map(([network, href]) => {
      const name = network as SocialNetwork;
      return <a key={name} href={href} aria-label={labels[name]} target="_blank" rel="noopener noreferrer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          {icons[name]}
        </svg>
      </a>;
    })}
  </div>;
}
