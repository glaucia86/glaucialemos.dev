import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MOBILE_HOTSPOTS, type MobileWorld } from "../src/lib/mobile-eggs";
import { MobileEggLayer } from "../src/components/mobile/MobileEggLayer";

const media = vi.hoisted(() => ({ mobile: false }));
vi.mock("@/lib/use-motion", () => ({ useMediaQuery: () => media.mobile, useMotionEnabled: () => false }));

vi.mock("next/navigation", () => ({ useParams: () => ({ lang: "pt" }) }));

describe("mobile egg layer server boundary", () => {
  it.each(Object.keys(MOBILE_HOTSPOTS) as MobileWorld[])("renders nothing for %s before client media matching", world => {
    expect(renderToStaticMarkup(<MobileEggLayer world={world} projection="cover" />)).toBe("");
  });
});


describe("mobile frame controls", () => {
  it("keeps the finale CTA in its scene instead of adding an armed duplicate", () => {
    media.mobile = true;
    try {
      const html = renderToStaticMarkup(<MobileEggLayer world="epilogue" projection="beyond-orbit" />);
      expect(html).not.toContain('data-egg="last-light"');
      expect(html).not.toContain('class="mobile-eggs__hot"');
      expect(html).not.toContain('class="mobile-eggs__scan"');
      expect(html).toContain('aria-label="Rádio estelar"');
      expect(html).toContain('class="mobile-eggs__icon"');
    } finally { media.mobile = false; }
  });

  it("exposes both anonymous rescue targets on the red-tide projection", () => {
    media.mobile = true;
    try {
      const html = renderToStaticMarkup(<MobileEggLayer world="notfound" projection="red-tide" />);
      expect(html).toContain('data-projection="red-tide"');
      expect(html.match(/class="mobile-eggs__hot"/g)).toHaveLength(2);
      expect(html).toContain('data-egg="signal-recovered"');
      expect(html).toContain('data-egg="paw-rescue"');
      expect(html.match(/aria-label="[^"]*\d[^"]*"/g)).toBeNull();
    } finally { media.mobile = false; }
  });
});
